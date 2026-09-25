import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { callOutcomes, leadSources, leadReferrers, leadBatches, dncEntries, leads, operations } from '../db/schema';
import { AuditService } from '../audit/audit.service';
import type { CrmScope } from './crm-scope.service';

const OUTCOME_KINDS = ['contato_efetivo', 'sem_contato', 'descarte', 'conversao'] as const;
const REFERRER_KINDS = ['influencer', 'relacionamento', 'cliente', 'parceiro', 'outro'] as const;

// Catálogos do CRM: tabulações, canais, indicadores, mailings e DNC.
@Injectable()
export class CatalogService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  // ── Tabulações (Presidência cria/edita) ──────────────────────────────
  listOutcomes(scope: CrmScope) {
    return this.db
      .select()
      .from(callOutcomes)
      .where(eq(callOutcomes.organizationId, scope.organizationId))
      .orderBy(callOutcomes.sortOrder);
  }

  async createOutcome(
    scope: CrmScope,
    input: { name: string; kind: string; requiresCallback?: boolean; isDnc?: boolean; sortOrder?: number },
    actorUserId: string,
  ) {
    if (!input?.name?.trim()) throw new BadRequestException('Nome é obrigatório.');
    if (!OUTCOME_KINDS.includes(input.kind as any)) {
      throw new BadRequestException(`Tipo deve ser um de: ${OUTCOME_KINDS.join(', ')}.`);
    }
    const [created] = await this.db
      .insert(callOutcomes)
      .values({
        organizationId: scope.organizationId,
        name: input.name.trim(),
        kind: input.kind as (typeof OUTCOME_KINDS)[number],
        requiresCallback: !!input.requiresCallback,
        isDnc: !!input.isDnc,
        sortOrder: input.sortOrder ?? 99,
      })
      .returning();
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.outcome.create',
      entityType: 'call_outcome',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateOutcome(
    scope: CrmScope,
    id: string,
    patch: { name?: string; active?: boolean; requiresCallback?: boolean; isDnc?: boolean; sortOrder?: number },
    actorUserId: string,
  ) {
    const [existing] = await this.db
      .select()
      .from(callOutcomes)
      .where(and(eq(callOutcomes.id, id), eq(callOutcomes.organizationId, scope.organizationId)));
    if (!existing) throw new NotFoundException('Tabulação não encontrada.');
    const [updated] = await this.db
      .update(callOutcomes)
      .set({
        name: patch.name ?? existing.name,
        active: patch.active ?? existing.active,
        requiresCallback: patch.requiresCallback ?? existing.requiresCallback,
        isDnc: patch.isDnc ?? existing.isDnc,
        sortOrder: patch.sortOrder ?? existing.sortOrder,
      })
      .where(eq(callOutcomes.id, id))
      .returning();
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.outcome.update',
      entityType: 'call_outcome',
      entityId: id,
      before: existing,
      after: updated,
    });
    return updated;
  }

  // ── Canais de entrada ────────────────────────────────────────────────
  listSources(scope: CrmScope) {
    return this.db
      .select()
      .from(leadSources)
      .where(eq(leadSources.organizationId, scope.organizationId))
      .orderBy(leadSources.sortOrder);
  }

  async createSource(scope: CrmScope, input: { name: string; sortOrder?: number }, actorUserId: string) {
    if (!input?.name?.trim()) throw new BadRequestException('Nome é obrigatório.');
    const [created] = await this.db
      .insert(leadSources)
      .values({
        organizationId: scope.organizationId,
        name: input.name.trim(),
        sortOrder: input.sortOrder ?? 99,
        createdBy: actorUserId,
      })
      .returning();
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.source.create',
      entityType: 'lead_source',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  // ── Indicadores (influencer, cotista, networking) ────────────────────
  listReferrers(scope: CrmScope) {
    return this.db
      .select()
      .from(leadReferrers)
      .where(eq(leadReferrers.organizationId, scope.organizationId))
      .orderBy(leadReferrers.name);
  }

  async createReferrer(
    scope: CrmScope,
    input: { name: string; kind: string; participantId?: string; phone?: string; email?: string; notes?: string },
    actorUserId: string,
  ) {
    if (!input?.name?.trim()) throw new BadRequestException('Nome é obrigatório.');
    if (!REFERRER_KINDS.includes(input.kind as any)) {
      throw new BadRequestException(`Tipo deve ser um de: ${REFERRER_KINDS.join(', ')}.`);
    }
    const [created] = await this.db
      .insert(leadReferrers)
      .values({
        organizationId: scope.organizationId,
        name: input.name.trim(),
        kind: input.kind as (typeof REFERRER_KINDS)[number],
        participantId: input.participantId,
        phone: input.phone,
        email: input.email,
        notes: input.notes,
      })
      .returning();
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.referrer.create',
      entityType: 'lead_referrer',
      entityId: created.id,
      after: { name: created.name, kind: created.kind },
    });
    return created;
  }

  // ── Oportunidades para vínculo (o lead "sobe" para uma oportunidade) ─
  listOperationOptions(scope: CrmScope) {
    return this.db
      .select({ id: operations.id, code: operations.code, name: operations.name, status: operations.status })
      .from(operations)
      .where(eq(operations.organizationId, scope.organizationId))
      .orderBy(operations.code);
  }

  // ── Mailings (import em lote com filtro DNC) ─────────────────────────
  async createBatch(
    scope: CrmScope,
    input: { name: string; source?: string; lgpdBasis?: string },
    actorUserId: string,
  ) {
    if (!input?.name?.trim()) throw new BadRequestException('Nome do mailing é obrigatório.');
    const [created] = await this.db
      .insert(leadBatches)
      .values({
        organizationId: scope.organizationId,
        name: input.name.trim(),
        source: input.source,
        lgpdBasis: input.lgpdBasis,
        importedBy: actorUserId,
      })
      .returning();
    return created;
  }

  async importLeads(
    scope: CrmScope,
    batchId: string,
    rows: Array<{ name: string; phone?: string; companyName?: string; cnpj?: string; city?: string; uf?: string; email?: string }>,
    ownerMembershipId: string,
    actorUserId: string,
    operationId?: string, // vincula o lote inteiro a uma oportunidade
  ) {
    const [batch] = await this.db
      .select()
      .from(leadBatches)
      .where(and(eq(leadBatches.id, batchId), eq(leadBatches.organizationId, scope.organizationId)));
    if (!batch) throw new NotFoundException('Mailing não encontrado.');
    if (!Array.isArray(rows) || rows.length === 0) throw new BadRequestException('Lista de leads vazia.');
    if (rows.length > 5000) throw new BadRequestException('Máximo de 5.000 leads por chamada.');

    // Canal padrão do import: Telemarketing.
    const [telemarketing] = await this.db
      .select()
      .from(leadSources)
      .where(and(eq(leadSources.organizationId, scope.organizationId), eq(leadSources.name, 'Telemarketing')));

    const phones = rows.map((r) => r.phone).filter((p): p is string => !!p);
    const blocked = phones.length
      ? await this.db
          .select({ phone: dncEntries.phone })
          .from(dncEntries)
          .where(and(eq(dncEntries.organizationId, scope.organizationId), inArray(dncEntries.phone, phones)))
      : [];
    const dncSet = new Set(blocked.map((b) => b.phone));

    const valid = rows.filter((r) => r.name?.trim() && !(r.phone && dncSet.has(r.phone)));
    const skippedDnc = rows.filter((r) => r.phone && dncSet.has(r.phone)).length;
    const skippedInvalid = rows.length - valid.length - skippedDnc;

    if (valid.length > 0) {
      await this.db.insert(leads).values(
        valid.map((r) => ({
          organizationId: scope.organizationId,
          ownerMembershipId,
          batchId,
          operationId: operationId || undefined,
          sourceId: telemarketing?.id,
          name: r.name.trim(),
          phone: r.phone,
          email: r.email,
          companyName: r.companyName,
          cnpj: r.cnpj,
          city: r.city,
          uf: r.uf,
        })),
      );
    }
    await this.db.update(leadBatches).set({ leadCount: (batch.leadCount ?? 0) + valid.length }).where(eq(leadBatches.id, batchId));
    await this.audit.log({
      organizationId: scope.organizationId,
      actorUserId,
      action: 'crm.batch.import',
      entityType: 'lead_batch',
      entityId: batchId,
      after: { imported: valid.length, skippedDnc, skippedInvalid },
    });
    return { imported: valid.length, skippedDnc, skippedInvalid };
  }

  // ── DNC ──────────────────────────────────────────────────────────────
  listDnc(scope: CrmScope) {
    return this.db
      .select()
      .from(dncEntries)
      .where(eq(dncEntries.organizationId, scope.organizationId))
      .orderBy(dncEntries.createdAt);
  }

  async addDnc(scope: CrmScope, input: { phone: string; reason: string }, actorUserId: string) {
    if (!input?.phone?.trim() || !input?.reason?.trim()) {
      throw new BadRequestException('Telefone e motivo são obrigatórios.');
    }
    const [created] = await this.db
      .insert(dncEntries)
      .values({
        organizationId: scope.organizationId,
        phone: input.phone.trim(),
        reason: input.reason.trim(),
        createdBy: actorUserId,
      })
      .onConflictDoNothing()
      .returning();
    if (created) {
      await this.audit.log({
        organizationId: scope.organizationId,
        actorUserId,
        action: 'crm.dnc.add',
        entityType: 'dnc_entry',
        entityId: created.id,
        after: { phone: created.phone, reason: created.reason },
      });
    }
    return created ?? { alreadyExists: true };
  }
}
