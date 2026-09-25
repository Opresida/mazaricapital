import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  date,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { memberRole, memberStatus } from './enums';

// ── Organização e unidades ─────────────────────────────────────────────
// Isolamento multi-tenant: toda tabela raiz carrega organization_id.

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const units = pgTable(
  'units',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    city: text('city'),
    uf: text('uf'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('units_org_slug_uq').on(t.organizationId, t.slug)],
);

// ── Usuários (identidade de autenticação) ──────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  cpf: text('cpf'),
  phone: text('phone'),
  avatarKey: text('avatar_key'),
  mfaSecret: text('mfa_secret'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  active: boolean('active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// LGPD: consentimentos com concessão e revogação datadas.
export const userConsents = pgTable(
  'user_consents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    consentType: text('consent_type').notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => [index('user_consents_user_idx').on(t.userId)],
);

// ── Vínculos comerciais (papel de cada pessoa na estrutura) ────────────
// Árvore: Unidade → Diretor → Supervisor (team) → Consultor → Cotista.
// Um usuário pode ter vínculos diferentes em organizações diferentes.

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    unitId: uuid('unit_id').references(() => units.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: memberRole('role').notNull(),
    status: memberStatus('status').notNull().default('convidado'),
    // Consultor pertence a um team (supervisor); ver teams abaixo.
    teamId: uuid('team_id').references((): AnyPgColumn => teams.id),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    terminatedAt: timestamp('terminated_at', { withTimezone: true }),
    termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('memberships_org_idx').on(t.organizationId),
    index('memberships_unit_idx').on(t.unitId),
    index('memberships_user_idx').on(t.userId),
    uniqueIndex('memberships_org_user_role_uq').on(t.organizationId, t.userId, t.role),
  ],
);

// Equipe: um supervisor conduz consultores dentro de uma unidade.
export const teams = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => units.id),
    supervisorMembershipId: uuid('supervisor_membership_id')
      .notNull()
      .references((): AnyPgColumn => memberships.id),
    name: text('name'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('teams_unit_idx').on(t.unitId)],
);

// Transferências (consultor de equipe, cotista de consultor, etc.):
// vigência + motivo. NÃO alteram comissões já adquiridas.
export const membershipTransfers = pgTable(
  'membership_transfers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => memberships.id),
    fromUnitId: uuid('from_unit_id').references(() => units.id),
    toUnitId: uuid('to_unit_id').references(() => units.id),
    fromTeamId: uuid('from_team_id').references(() => teams.id),
    toTeamId: uuid('to_team_id').references(() => teams.id),
    effectiveDate: date('effective_date').notNull(),
    reason: text('reason').notNull(),
    approvedBy: uuid('approved_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('membership_transfers_membership_idx').on(t.membershipId)],
);

// ── Cotista/participante (perfil de investimento) ──────────────────────
// Todo cotista tem consultor de origem — atribuição rastreável que
// alimenta o motor de comissões.

export const participants = pgTable(
  'participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    originConsultantMembershipId: uuid('origin_consultant_membership_id').references(
      () => memberships.id,
    ),
    documentData: jsonb('document_data'),
    kycApprovedAt: timestamp('kyc_approved_at', { withTimezone: true }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('participants_org_user_uq').on(t.organizationId, t.userId),
    index('participants_origin_idx').on(t.originConsultantMembershipId),
  ],
);
