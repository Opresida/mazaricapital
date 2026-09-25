import { Inject, Injectable } from '@nestjs/common';
import { DB, type Db } from '../db/db.module';
import { auditLogs } from '../db/schema';

export interface AuditEntry {
  organizationId: string;
  actorUserId?: string | null;
  action: string; // ex.: auth.login, commission_rule.update
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// Append-only por contrato: este serviço só INSERE. Nunca haverá update
// ou delete de audit_logs em lugar nenhum da aplicação.
@Injectable()
export class AuditService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.db.insert(auditLogs).values({
      organizationId: entry.organizationId,
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      reason: entry.reason ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  }

  // Versão transacional: usada quando a mutação sensível e o registro de
  // auditoria precisam viver na MESMA transação (regra inegociável nº 9).
  async logIn(tx: Pick<Db, 'insert'>, entry: AuditEntry): Promise<void> {
    await tx.insert(auditLogs).values({
      organizationId: entry.organizationId,
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      reason: entry.reason ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  }
}
