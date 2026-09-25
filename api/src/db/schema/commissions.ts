import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, users, memberships } from './organization';
import { operations } from './operations';
import { participations, contributions } from './capital';
import {
  memberRole,
  commissionRuleStatus,
  commissionEventStatus,
  ledgerEntryType,
} from './enums';

// ── Regras de comissão (VERSIONADAS) ───────────────────────────────────
// Comissão não é um % no cadastro do usuário: é uma regra com vigência,
// público, base de cálculo e status. Só ativa após aprovação jurídica e
// administrativa. Mudança de regra NÃO recalcula comissões adquiridas.
//
// A regra é a COMBINAÇÃO (audience_role × seller_role): quem recebe ×
// quem vendeu. Supervisor e diretor também vendem; a Presidência define
// % distintos por cenário. Combinações previstas:
//   (consultor,  consultor)  → produção própria do consultor
//   (supervisor, consultor)  → override de equipe
//   (supervisor, supervisor) → produção própria do supervisor
//   (diretor,    consultor)  → override de unidade
//   (diretor,    supervisor) → override sobre venda direta do supervisor
//   (diretor,    diretor)    → produção própria do diretor — a comissão é
//                              TODA dele; não existe override acima (a
//                              Presidência já recebe pelo capital da operação)

export const commissionRules = pgTable(
  'commission_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    code: text('code').notNull(), // ex.: REGRA-001
    version: text('version').notNull(), // ex.: v1, v2…
    audienceRole: memberRole('audience_role').notNull(), // quem recebe
    sellerRole: memberRole('seller_role').notNull(), // quem originou a venda
    // Base de cálculo: sempre capital confirmado.
    percent: numeric('percent', { precision: 6, scale: 3 }).notNull(),
    validFrom: date('valid_from').notNull(),
    validTo: date('valid_to'),
    status: commissionRuleStatus('status').notNull().default('rascunho'),
    legalApprovedBy: uuid('legal_approved_by').references(() => users.id),
    legalApprovedAt: timestamp('legal_approved_at', { withTimezone: true }),
    adminApprovedBy: uuid('admin_approved_by').references(() => users.id),
    adminApprovedAt: timestamp('admin_approved_at', { withTimezone: true }),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('commission_rules_org_code_version_uq').on(t.organizationId, t.code, t.version),
    index('commission_rules_status_idx').on(t.status),
  ],
);

// ── Evento de comissão ─────────────────────────────────────────────────
// Nasce SOMENTE com capital confirmado (participação/aporte confirmado).
// Percentual e regra ficam congelados no evento (snapshot).
// Estados: pendente → disponivel → em_saque → pago.

export const commissionEvents = pgTable(
  'commission_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => commissionRules.id),
    beneficiaryMembershipId: uuid('beneficiary_membership_id')
      .notNull()
      .references(() => memberships.id),
    beneficiaryRole: memberRole('beneficiary_role').notNull(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    participationId: uuid('participation_id')
      .notNull()
      .references(() => participations.id),
    contributionId: uuid('contribution_id').references(() => contributions.id),
    origin: text('origin').notNull(), // producao | equipe | unidade
    // Snapshot de quem vendeu (consultor ou supervisor) — facilita extrato
    // e conferência da regra aplicada sem join na participação.
    sellerRole: memberRole('seller_role').notNull(),
    baseAmount: numeric('base_amount', { precision: 14, scale: 2 }).notNull(),
    percentSnapshot: numeric('percent_snapshot', { precision: 6, scale: 3 }).notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    status: commissionEventStatus('status').notNull().default('pendente'),
    availableAt: timestamp('available_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('commission_events_beneficiary_idx').on(t.beneficiaryMembershipId),
    index('commission_events_operation_idx').on(t.operationId),
    index('commission_events_status_idx').on(t.status),
  ],
);

// ── Extrato (ledger) — APPEND-ONLY ─────────────────────────────────────
// Nada é editado nem apagado. Correção entra como AJUSTE com motivo.
// Saldo de cada pessoa = soma dos lançamentos.

export const commissionLedger = pgTable(
  'commission_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => memberships.id),
    entryType: ledgerEntryType('entry_type').notNull(),
    eventId: uuid('event_id').references(() => commissionEvents.id),
    paymentId: uuid('payment_id'), // preenchido em saques
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(), // negativo em saques
    reason: text('reason'), // OBRIGATÓRIO (na aplicação) quando entry_type = ajuste
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('commission_ledger_membership_idx').on(t.membershipId),
    index('commission_ledger_event_idx').on(t.eventId),
  ],
);
