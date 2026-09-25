import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, getTableColumns, inArray } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module';
import { leadMeetings, leads } from '../db/schema';
import { AuditService } from '../audit/audit.service';
import type { CrmScope } from './crm-scope.service';

const MODES = ['presencial', 'video'] as const;
const CLOSE_STATUSES = ['realizada', 'nao_compareceu', 'cancelada'] as const;

@Injectable()
export class MeetingsService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  private async getVisibleLead(scope: CrmScope, leadId: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.organizationId, scope.organizationId)));
    if (!lead) throw new NotFoundException('Lead não encontrado.');
    if (scope.visibleOwnerIds !== 'all' && !scope.visibleOwnerIds.includes(lead.ownerMembershipId)) {
      throw new NotFoundException('Lead não encontrado.');
    }
    return lead;
  }

  // Agenda a reunião de apresentação da estrutura. Lead avança p/ prospect.
  async schedule(
    scope: CrmScope,
    leadId: string,
    input: { mode: string; scheduledAt: string; location?: string; operationId?: string; hostMembershipId?: string },
    actorUserId: string,
  ) {
    const lead = await this.getVisibleLead(scope, leadId);
    if (!MODES.includes(input.mode as any)) throw new BadRequestException('Modo deve ser presencial ou video.');
    const when = new Date(input.scheduledAt);
    if (!input.scheduledAt || isNaN(when.getTime())) throw new BadRequestException('Data/hora inválida.');

    return this.db.transaction(async (tx) => {
      const [meeting] = await tx
        .insert(leadMeetings)
        .values({
          organizationId: scope.organizationId,
          leadId,
          hostMembershipId: input.hostMembershipId ?? lead.ownerMembershipId,
          operationId: input.operationId ?? lead.operationId,
          mode: input.mode as (typeof MODES)[number],
          scheduledAt: when,
          location: input.location,
          createdBy: actorUserId,
        })
        .returning();
      if (lead.stage === 'lead') {
        await tx.update(leads).set({ stage: 'prospect', updatedAt: new Date() }).where(eq(leads.id, leadId));
      }
      await this.audit.logIn(tx, {
        organizationId: scope.organizationId,
        actorUserId,
        action: 'crm.meeting.create',
        entityType: 'lead_meeting',
        entityId: meeting.id,
        after: { leadId, mode: meeting.mode, scheduledAt: meeting.scheduledAt },
      });
      return meeting;
    });
  }

  // Fecha o ciclo da reunião. Remarcação = novo registro ligado ao anterior.
  async close(
    scope: CrmScope,
    meetingId: string,
    input: { status: string; notes?: string; rescheduleTo?: string },
    actorUserId: string,
  ) {
    const [meeting] = await this.db.select().from(leadMeetings).where(eq(leadMeetings.id, meetingId));
    if (!meeting || meeting.organizationId !== scope.organizationId) {
      throw new NotFoundException('Reunião não encontrada.');
    }
    await this.getVisibleLead(scope, meeting.leadId);
    if (!CLOSE_STATUSES.includes(input.status as any)) {
      throw new BadRequestException('Status deve ser realizada, nao_compareceu ou cancelada.');
    }
    if (meeting.status !== 'agendada' && meeting.status !== 'remarcada') {
      throw new BadRequestException('Esta reunião já foi encerrada.');
    }

    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(leadMeetings)
        .set({
          status: input.status as (typeof CLOSE_STATUSES)[number],
          heldAt: input.status === 'realizada' ? new Date() : null,
          notes: input.notes ?? meeting.notes,
          updatedAt: new Date(),
        })
        .where(eq(leadMeetings.id, meetingId))
        .returning();

      let rescheduled = null;
      if (input.rescheduleTo) {
        const when = new Date(input.rescheduleTo);
        if (isNaN(when.getTime())) throw new BadRequestException('Data de remarcação inválida.');
        [rescheduled] = await tx
          .insert(leadMeetings)
          .values({
            organizationId: scope.organizationId,
            leadId: meeting.leadId,
            hostMembershipId: meeting.hostMembershipId,
            operationId: meeting.operationId,
            mode: meeting.mode,
            status: 'remarcada',
            scheduledAt: when,
            location: meeting.location,
            rescheduledFromId: meeting.id,
            createdBy: actorUserId,
          })
          .returning();
      }

      await this.audit.logIn(tx, {
        organizationId: scope.organizationId,
        actorUserId,
        action: 'crm.meeting.close',
        entityType: 'lead_meeting',
        entityId: meetingId,
        before: { status: meeting.status },
        after: { status: input.status, rescheduledTo: rescheduled?.id ?? null },
      });
      return { meeting: updated, rescheduled };
    });
  }

  // Agenda do usuário (ou do escopo, para gestores).
  async agenda(scope: CrmScope, onlyMine: boolean) {
    const visible =
      scope.visibleOwnerIds === 'all'
        ? undefined
        : inArray(leadMeetings.hostMembershipId, onlyMine ? scope.ownMembershipIds : scope.visibleOwnerIds);
    const rows = await this.db
      .select({ ...getTableColumns(leadMeetings), leadName: leads.name })
      .from(leadMeetings)
      .leftJoin(leads, eq(leadMeetings.leadId, leads.id))
      .where(
        and(
          eq(leadMeetings.organizationId, scope.organizationId),
          onlyMine && scope.visibleOwnerIds === 'all'
            ? inArray(leadMeetings.hostMembershipId, scope.ownMembershipIds)
            : visible,
          inArray(leadMeetings.status, ['agendada', 'remarcada']),
        ),
      )
      .orderBy(leadMeetings.scheduledAt)
      .limit(100);
    return { rows };
  }
}
