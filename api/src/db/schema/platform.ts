import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, units, users } from './organization';
import { operations } from './operations';
import { feedEventType } from './enums';

// ── Notificações (push/in-app) ─────────────────────────────────────────

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: text('type').notNull(), // obra, comissao, pagamento, meta, documento…
    title: text('title').notNull(),
    body: text('body'),
    payload: jsonb('payload'),
    readAt: timestamp('read_at', { withTimezone: true }),
    pushSentAt: timestamp('push_sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notifications_user_idx').on(t.userId, t.readAt)],
);

// ── Feed MAZARI ────────────────────────────────────────────────────────
// Eventos gerados automaticamente pelo sistema — NÃO editáveis.
// A visibilidade é filtrada por permissão na leitura (org/unidade/operação).
// Comunicados da Presidência podem ser fixados no topo.

export const feedEvents = pgTable(
  'feed_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    unitId: uuid('unit_id').references(() => units.id),
    operationId: uuid('operation_id').references(() => operations.id),
    type: feedEventType('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    payload: jsonb('payload'),
    // Comunicado: único tipo com autor humano; demais são do sistema.
    authoredBy: uuid('authored_by').references(() => users.id),
    pinned: boolean('pinned').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('feed_events_org_idx').on(t.organizationId, t.createdAt),
    index('feed_events_operation_idx').on(t.operationId),
  ],
);

// ── Auditoria — APPEND-ONLY ────────────────────────────────────────────
// Quem, o quê, quando, onde, valor anterior, novo valor, motivo.
// Nada é apagado ou editado. Obrigatório para: comissões, pagamentos,
// metas, premiações, alterações financeiras, documentos, hierarquia,
// permissões e operações.

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    actorUserId: uuid('actor_user_id').references(() => users.id),
    action: text('action').notNull(), // ex.: commission_rule.update
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    before: jsonb('before'),
    after: jsonb('after'),
    reason: text('reason'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_logs_org_created_idx').on(t.organizationId, t.createdAt),
    index('audit_logs_entity_idx').on(t.entityType, t.entityId),
    index('audit_logs_actor_idx').on(t.actorUserId),
  ],
);

// ── Parâmetros da organização ──────────────────────────────────────────
// Divisão padrão do lucro, impostos estimados, limites de aprovação etc.
// Toda alteração passa pelo audit log.

export const orgSettings = pgTable(
  'org_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    key: text('key').notNull(), // ex.: profit_split_default, payment_dual_approval_limit
    value: jsonb('value').notNull(),
    updatedBy: uuid('updated_by').references(() => users.id),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('org_settings_uq').on(t.organizationId, t.key)],
);

// Modelos de contrato e termos, com versão.
export const contractTemplates = pgTable(
  'contract_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    version: integer('version').notNull(),
    storageKey: text('storage_key').notNull(),
    active: boolean('active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('contract_templates_uq').on(t.organizationId, t.name, t.version)],
);
