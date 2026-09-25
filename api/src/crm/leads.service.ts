import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, ilike, inArray, isNotNull, isNull, lte, or, sql } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import {
  leads,
  leadBatches,
  callAttempts,
  callOutcomes,
  dncEntries,
  leadMeetings,
} from '../db/schema';
import { AuditService } from '../audit/audit.service';
import type { CrmScope } from './crm-scope.service';

const LEAD_STAGES = ['lead', 'prospect', 'participante', 'capital_confirmado'] as const;

export interface CreateLeadInput {
  name: string;
  phone?: string;
  email?: string;
  companyName?: string;
  cnpj?: string;
  city?: string;
  uf?: string;
  notes?: string;
  sourceId?: string;
  referrerId?: string;
  operationId?: string;
  ownerMembershipId?: string; // presidência/diretor podem atribuir; senão, o próprio
}

@Injectable()
export class LeadsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  private scopeFilter(scope: CrmScope) {
    return scope.visibleOwnerIds === 'all'
      ? undefined
      : inArray(leads.ownerMembershipId, scope.visibleOwnerIds);
  }

  async list(
    scope: CrmScope,
    q: { stage?: string; sourceId?: string; batchId?: string; search?: string; page?: number; limit?: number },
  ) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 25));
    const where = and(
      eq(leads.organizationId, scope.organizationId),
      this.scopeFilter(scope),
      q.stage ? eq(leads.stage, q.stage as (typeof LEAD_STAGES)[number]) : undefined,
      q.sourceId ? eq(leads.sourceId, q.sourceId) : undefined,
      q.batchId ? eq(leads.batchId, q.batchId) : undefined,
      q.search
        ? or(ilike(leads.name, `%${q.search}%`), ilike(leads.companyName, `%${q.search}%`), ilike(leads.phone, `%${q.search}%`))
        : undefined,
    );
    const rows = await this.db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.updatedAt))
      .limit(limit)
      .offset((page - 1) * limit);
    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(leads)
      .where(where);
    return { rows, total, page, limit };
  }

  // Kanban: contagem + primeiros cards por etapa, no mesmo escopo RBAC.
  async board(scope: CrmScope) {
    const columns = [] as Array<{ stage: string; total: number; leads: unknown[] }>;
    for (const stage of LEAD_STAGES) {
      const where = and(
        eq(leads.organizationId, scope.organizationId),
        this.scopeFilter(scope),
        eq(leads.stage, stage),
      );
      const [{ total }] = await this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(leads)
        .where(where);
      const cards = await this.db.select().from(leads).where(where).orderBy(desc(leads.updatedAt)).limit(20);
      columns.push({ stage, total, leads: cards });
    }
    return { columns };
  }

  // Esteira: retornos vencidos primeiro, depois leads frescos do escopo
  // PRÓPRIO (a fila é pessoal), fora DNC e sem estourar tentativas/semana.
  async queue(scope: CrmScope, maxAttemptsPerWeek = 4) {
    const own = inArray(leads.ownerMembershipId, scope.ownMembershipIds);
    const base = and(
      eq(leads.organizationId, scope.organizationId),
      own,
      inArray(leads.stage, ['lead', 'prospect']),
    );

    const callbacks = await this.db
      .select()
      .from(leads)
      .where(and(base, isNotNull(leads.nextCallbackAt), lte(leads.nextCallbackAt, new Date())))
      .orderBy(leads.nextCallbackAt)
      .limit(30);

    const fresh = await this.db
      .select()
      .from(leads)
      .where(and(base, isNull(leads.nextCallbackAt)))
      .orderBy(leads.createdAt)
      .limit(60);

    const candidates = [...callbacks, ...fresh];
    if (candidates.length === 0) return { queue: [] };

    // Filtros de proteção: DNC e limite semanal de tentativas.
    const ids = candidates.map((l) => l.id);
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const counts = await this.db
      .select({ leadId: callAttempts.leadId, n: sql<number>`count(*)::int` })
      .from(callAttempts)
      .where(and(inArray(callAttempts.leadId, ids), gte(callAttempts.startedAt, weekAgo)))
      .groupBy(callAttempts.leadId);
    const attemptsByLead = new Map(counts.map((c) => [c.leadId, c.n]));

    const phones = candidates.map((l) => l.phone).filter((p): p is string => !!p);
    const dnc = phones.length
      ? await this.db
          .select({ phone: dncEntries.phone })
          .from(dncEntries)
          .where(and(eq(dncEntries.organizationId, scope.organizationId), inArray(dncEntries.phone, phones)))
      : [];
    const dncSet = new Set(dnc.map((d) => d.phone));

    const queue = candidates
      .filter((l) => !(l.phone && dncSet.has(l.phone)))
      .filter((l) => (attemptsByLead.get(l.id) ?? 0) < maxAttemptsPerWeek)
      .slice(0, 30);
    return { queue };
  }

  async detail(scope: CrmScope, id: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.organizationId, scope.organizationId)));
    if (!lead) throw new NotFoundException('Lead não encontrado.');
    if (scope.visibleOwnerIds !== 'all' && !scope.visibleOwnerIds.includes(lead.ownerMembershipId)) {
      throw new NotFoundException('Lead não encontrado.'); // não vaza existência fora do escopo
    }
    // Timeline: ligações + reuniões (conceito de atividade unificada).
    const attempts = await this.db
      .select({
        id: callAttempts.id,
        startedAt: callAttempts.startedAt,
        durationSec: callAttempts.durationSec,
        notes: callAttempts.notes,
        recordingUrl: callAttempts.recordingUrl,
        outcome: callOutcomes.name,
        outcomeKind: callOutcomes.kind,
      })
      .from(callAttempts)
      .leftJoin(callOutcomes, eq(callAttempts.outcomeId, callOutcomes.id))
      .where(eq(callAttempts.leadId, id))
      .orderBy(desc(callAttempts.startedAt));
    const meetings = await this.db
      .select()
      .from(leadMeetings)
      .where(eq(leadMeetings.leadId, id))
      .orderBy(desc(leadMeetings.scheduledAt));
    return { lead, attempts, meetings };
  }

  async create(scope: CrmScope, input: CreateLeadInput, actorUserId: string) {
    if (!input?.name?.trim()) throw new BadRequestException('Nome do lead é obrigatório.');
    let owner = input.ownerMembershipId ?? scope.primaryMembershipId;
    if (owner !== scope.primaryMembershipId && scope.visibleOwnerIds !== 'all') {
      if (!scope.visibleOwnerIds.includes(owner)) {
        throw new BadRequestException('Você não pode atribuir lead a esse membro.');
      }
    }
    // DNC: não cadastra telefone bloqueado.
    if (input.phone) {
      const [blocked] = await this.db
        .select()
        .from(dncEntries)
        .where(and(eq(dncEntries.organizationId, scope.organizationId), eq(dncEntries.phone, input.phone)));
      if (blocked) throw new BadRequestException('Telefone está na lista "não ligar" (DNC).');
    }
    const [created] = await this.db
      .insert(leads)
      .values({
        organizationId: scope.organizationId,
        ownerMembershipId: owner,
        name: input.name.trim(),
        phone: input.phone,
        email: input.email,
        companyName: input.companyName,
        cnpj: input.cnpj,
        city: input.city,
        uf: input.uf,
        notes: input.notes,
        sourceId: input.sourceId,
        referrerId: input.referrerId,
        operationId: input.operationId,
      })
      .returning();
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.lead.create',
      entityType: 'lead',
      entityId: created.id,
      after: { name: created.name, owner },
    });
    return created;
  }

  async update(scope: CrmScope, id: string, patch: Partial<CreateLeadInput> & { stage?: string }, actorUserId: string) {
    const { lead } = await this.detail(scope, id);
    if (patch.stage && !LEAD_STAGES.includes(patch.stage as any)) {
      throw new BadRequestException('Etapa inválida.');
    }
    // participante/capital_confirmado nascem do módulo de capital, não do CRM.
    if (patch.stage === 'participante' || patch.stage === 'capital_confirmado') {
      throw new BadRequestException('Esta etapa é definida pela formalização (módulo de capital), não manualmente.');
    }
    const [updated] = await this.db
      .update(leads)
      .set({
        name: patch.name ?? lead.name,
        phone: patch.phone ?? lead.phone,
        email: patch.email ?? lead.email,
        companyName: patch.companyName ?? lead.companyName,
        cnpj: patch.cnpj ?? lead.cnpj,
        city: patch.city ?? lead.city,
        uf: patch.uf ?? lead.uf,
        notes: patch.notes ?? lead.notes,
        sourceId: patch.sourceId ?? lead.sourceId,
        referrerId: patch.referrerId ?? lead.referrerId,
        // '' limpa o vínculo; undefined mantém; uuid vincula.
        operationId: patch.operationId === undefined ? lead.operationId : patch.operationId || null,
        stage: (patch.stage as any) ?? lead.stage,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.lead.update',
      entityType: 'lead',
      entityId: id,
      before: { stage: lead.stage, operationId: lead.operationId },
      after: { stage: updated.stage, operationId: updated.operationId },
    });
    return updated;
  }

  // Tabulação: o coração da esteira. Registra a ligação e aplica os efeitos
  // da tabulação (callback / DNC / avanço de etapa) na MESMA transação.
  async tabulate(
    scope: CrmScope,
    leadId: string,
    input: { outcomeId: string; notes?: string; durationSec?: number; nextCallbackAt?: string; dialerCallId?: string; recordingUrl?: string },
    actorUserId: string,
  ) {
    const { lead } = await this.detail(scope, leadId);
    const [outcome] = await this.db
      .select()
      .from(callOutcomes)
      .where(and(eq(callOutcomes.id, input.outcomeId), eq(callOutcomes.organizationId, scope.organizationId)));
    if (!outcome || !outcome.active) throw new BadRequestException('Tabulação inválida.');
    if (outcome.requiresCallback && !input.nextCallbackAt) {
      throw new BadRequestException(`A tabulação "${outcome.name}" exige agendar o retorno.`);
    }

    return this.db.transaction(async (tx) => {
      const [attempt] = await tx
        .insert(callAttempts)
        .values({
          organizationId: scope.organizationId,
          leadId,
          byMembershipId: scope.primaryMembershipId,
          phone: lead.phone,
          startedAt: new Date(),
          endedAt: new Date(),
          durationSec: input.durationSec,
          outcomeId: outcome.id,
          notes: input.notes,
          dialerCallId: input.dialerCallId,
          recordingUrl: input.recordingUrl,
        })
        .returning();

      const leadPatch: Record<string, unknown> = { updatedAt: new Date() };
      if (outcome.requiresCallback && input.nextCallbackAt) {
        leadPatch.nextCallbackAt = new Date(input.nextCallbackAt);
      } else {
        leadPatch.nextCallbackAt = null;
      }
      if (outcome.kind === 'conversao' && lead.stage === 'lead') {
        leadPatch.stage = 'prospect';
      }
      await tx.update(leads).set(leadPatch).where(eq(leads.id, leadId));

      if (outcome.isDnc && lead.phone) {
        await tx
          .insert(dncEntries)
          .values({
            organizationId: scope.organizationId,
            phone: lead.phone,
            reason: `Tabulação: ${outcome.name}`,
            sourceAttemptId: attempt.id,
            createdBy: actorUserId,
          })
          .onConflictDoNothing();
      }

      await this.audit.logIn(tx, {
        organizationId: scope.organizationId,
        actorUserId,
        action: 'crm.attempt.create',
        entityType: 'call_attempt',
        entityId: attempt.id,
        after: { leadId, outcome: outcome.name, kind: outcome.kind },
      });
      return { attempt, effects: { stage: leadPatch.stage ?? lead.stage, dnc: !!outcome.isDnc, nextCallbackAt: leadPatch.nextCallbackAt } };
    });
  }
}
