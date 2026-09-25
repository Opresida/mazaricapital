import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, units, users, memberships, teams } from './organization';
import { campaignStatus, goalAudience, prizeStatus, awardStatus } from './enums';

// ── Campanhas e metas ──────────────────────────────────────────────────
// Base de cálculo: capital confirmado (a mesma da comissão).
// Mudanças durante a campanha ficam auditadas.

export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    description: text('description'),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    status: campaignStatus('status').notNull().default('rascunho'),
    eligibilityRules: jsonb('eligibility_rules'),
    settledAt: timestamp('settled_at', { withTimezone: true }), // apuração
    settledBy: uuid('settled_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('campaigns_org_idx').on(t.organizationId)],
);

// Níveis da campanha (Nível 1 · 50 mil → Prêmio A …).
export const goalLevels = pgTable(
  'goal_levels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id),
    level: integer('level').notNull(),
    targetAmount: numeric('target_amount', { precision: 14, scale: 2 }).notNull(),
    prizeId: uuid('prize_id').references(() => prizes.id),
    audience: goalAudience('audience').notNull(),
  },
  (t) => [uniqueIndex('goal_levels_uq').on(t.campaignId, t.audience, t.level)],
);

// Meta atribuída: a um consultor (membership), a uma equipe ou a uma unidade.
export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id),
    audience: goalAudience('audience').notNull(),
    membershipId: uuid('membership_id').references(() => memberships.id),
    teamId: uuid('team_id').references(() => teams.id),
    unitId: uuid('unit_id').references(() => units.id),
    targetAmount: numeric('target_amount', { precision: 14, scale: 2 }).notNull(),
    // Progresso é DERIVADO de capital confirmado no período; este campo é
    // materializado na apuração (nunca editado à mão).
    settledAmount: numeric('settled_amount', { precision: 14, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('goals_campaign_idx').on(t.campaignId)],
);

// ── Catálogo de prêmios ────────────────────────────────────────────────

export const prizes = pgTable(
  'prizes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    description: text('description'),
    imageKey: text('image_key'),
    referenceValue: numeric('reference_value', { precision: 14, scale: 2 }),
    quantity: integer('quantity'),
    rules: text('rules'),
    status: prizeStatus('status').notNull().default('ativo'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('prizes_org_idx').on(t.organizationId)],
);

// Conquista: registrada na apuração; entrega registrada depois.
export const prizeAwards = pgTable(
  'prize_awards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id),
    goalLevelId: uuid('goal_level_id')
      .notNull()
      .references(() => goalLevels.id),
    prizeId: uuid('prize_id')
      .notNull()
      .references(() => prizes.id),
    beneficiaryMembershipId: uuid('beneficiary_membership_id')
      .notNull()
      .references(() => memberships.id),
    status: awardStatus('status').notNull().default('conquistado'),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    deliveredBy: uuid('delivered_by').references(() => users.id),
    deliveryNotes: text('delivery_notes'),
  },
  (t) => [index('prize_awards_beneficiary_idx').on(t.beneficiaryMembershipId)],
);
