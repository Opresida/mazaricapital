import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, units, users, memberships, participants, teams } from './organization';
import { operations, results } from './operations';
import {
  leadStage,
  participationStatus,
  distributionStatus,
  memberRole,
  referrerKind,
} from './enums';

// ── CRM / pipeline ─────────────────────────────────────────────────────
// lead → prospect → participante → capital confirmado.
// Cadastro NÃO é produção: nada gera comissão/meta antes da confirmação.
// O dono do lead pode ser CONSULTOR, SUPERVISOR ou DIRETOR (todos vendem).
// Captação majoritária: telemarketing ativo B2B via discador (3C Plus).

// Canal de entrada do lead — configurável pela Presidência.
// Seed inicial: Telemarketing, Influencer, Relacionamento próximo,
// Indicação de cliente, Evento. Telemarketing é UM canal; os demais
// pulam a esteira de ligações e vão direto à reunião individual.
export const leadSources = pgTable(
  'lead_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    active: boolean('active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('lead_sources_uq').on(t.organizationId, t.name)],
);

// Quem indicou: o influencer específico, o cotista que indicou, o contato
// de relacionamento. Permite medir conversão POR INDICADOR (qual influencer
// traz lead que vira capital confirmado). Atribuição apenas — qualquer
// remuneração de indicador é decisão comercial da Presidência, fora daqui.
export const leadReferrers = pgTable(
  'lead_referrers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    kind: referrerKind('kind').notNull(),
    // Quando o indicador é um cotista da casa:
    participantId: uuid('participant_id').references(() => participants.id),
    phone: text('phone'),
    email: text('email'),
    notes: text('notes'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('lead_referrers_org_idx').on(t.organizationId, t.kind),
    uniqueIndex('lead_referrers_uq').on(t.organizationId, t.name, t.kind),
  ],
);

// Mailing importado (lista B2B): origem rastreada para LGPD e para medir
// a qualidade de cada lista comprada/gerada.
export const leadBatches = pgTable(
  'lead_batches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    source: text('source'), // fornecedor da lista, evento, indicação…
    lgpdBasis: text('lgpd_basis'), // base legal do tratamento
    importedBy: uuid('imported_by').references(() => users.id),
    leadCount: integer('lead_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('lead_batches_org_idx').on(t.organizationId)],
);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    ownerMembershipId: uuid('owner_membership_id')
      .notNull()
      .references(() => memberships.id),
    operationId: uuid('operation_id').references(() => operations.id),
    // Canal de entrada + quem indicou (batch só existe no canal telemarketing).
    sourceId: uuid('source_id').references(() => leadSources.id),
    referrerId: uuid('referrer_id').references(() => leadReferrers.id),
    batchId: uuid('batch_id').references(() => leadBatches.id),
    stage: leadStage('stage').notNull().default('lead'),
    name: text('name').notNull(),
    // B2B: empresa é um dado de primeira classe.
    companyName: text('company_name'),
    cnpj: text('cnpj'),
    city: text('city'),
    uf: text('uf'),
    phone: text('phone'),
    email: text('email'),
    notes: text('notes'),
    // Esteira de ligações: próximo retorno agendado alimenta a fila.
    nextCallbackAt: timestamp('next_callback_at', { withTimezone: true }),
    // Link de compartilhamento rastreado (consultor → lead).
    shareToken: text('share_token'),
    participantId: uuid('participant_id').references(() => participants.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('leads_owner_idx').on(t.ownerMembershipId),
    index('leads_operation_idx').on(t.operationId),
    index('leads_callback_idx').on(t.ownerMembershipId, t.nextCallbackAt),
    index('leads_batch_idx').on(t.batchId),
    index('leads_source_idx').on(t.sourceId),
    index('leads_referrer_idx').on(t.referrerId),
  ],
);

// ── Participação (cotas de uma operação) ───────────────────────────────
// Reserva temporária durante a documentação; só a CONFIRMADA conta.
// Na confirmação, a cadeia de atribuição é CONGELADA (snapshot) —
// transferências futuras não mudam comissões já adquiridas.

export const participations = pgTable(
  'participations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id),
    status: participationStatus('status').notNull().default('reservada'),
    quotas: integer('quotas').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    reservedUntil: timestamp('reserved_until', { withTimezone: true }),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    contractDocumentId: uuid('contract_document_id'),
    // Snapshot da atribuição no momento da confirmação.
    // O VENDEDOR pode ser consultor, supervisor OU diretor (seller_role).
    // Vendedor supervisor → supervisor_membership_id null (override vai
    // direto ao diretor). Vendedor diretor → supervisor e director null
    // (comissão toda do vendedor; nada sobe para a Presidência).
    sellerMembershipId: uuid('seller_membership_id').references(() => memberships.id),
    sellerRole: memberRole('seller_role'),
    supervisorMembershipId: uuid('supervisor_membership_id').references(() => memberships.id),
    directorMembershipId: uuid('director_membership_id').references(() => memberships.id),
    teamId: uuid('team_id').references(() => teams.id),
    unitId: uuid('unit_id').references(() => units.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('participations_operation_idx').on(t.operationId),
    index('participations_participant_idx').on(t.participantId),
    index('participations_status_idx').on(t.status),
  ],
);

// Aporte: o capital efetivamente confirmado, com comprovante.
export const contributions = pgTable(
  'contributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    participationId: uuid('participation_id')
      .notNull()
      .references(() => participations.id),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    confirmedBy: uuid('confirmed_by').references(() => users.id),
    receiptStorageKey: text('receipt_storage_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('contributions_participation_idx').on(t.participationId)],
);

// ── Distribuição de resultado ──────────────────────────────────────────
// Só após apuração aprovada; cálculo individual por cota, com memória.

export const distributions = pgTable(
  'distributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    resultId: uuid('result_id')
      .notNull()
      .references(() => results.id),
    status: distributionStatus('status').notNull().default('calculada'),
    totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('distributions_operation_idx').on(t.operationId)],
);

export const distributionItems = pgTable(
  'distribution_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    distributionId: uuid('distribution_id')
      .notNull()
      .references(() => distributions.id),
    participationId: uuid('participation_id')
      .notNull()
      .references(() => participations.id),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    calculationMemo: jsonb('calculation_memo').notNull(),
    // Vinculado a payments quando o pagamento é executado.
    paymentId: uuid('payment_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('distribution_items_uq').on(t.distributionId, t.participationId),
    index('distribution_items_participation_idx').on(t.participationId),
  ],
);
