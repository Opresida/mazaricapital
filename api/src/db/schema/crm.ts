import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, users, memberships } from './organization';
import { operations } from './operations';
import { leads } from './capital';
import { outcomeKind, dialerCampaignStatus, meetingMode, meetingStatus } from './enums';

// ── CRM TELEMARKETING (esteira de ligações) ────────────────────────────
// O consultor vive no NOSSO sistema; o discador (3C Plus) é o motor de
// discagem por trás. Toda ligação volta via webhook e vira call_attempt
// tabulado aqui — o funil, a métrica e a comissão nunca saem do nosso banco.

// Plano de tabulação: os nomes são da Presidência (configurável); o kind
// classifica para métricas (taxa de contato, conversão, descarte).
export const callOutcomes = pgTable(
  'call_outcomes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(), // ex.: "Atendeu — interessado", "Caixa postal"
    kind: outcomeKind('kind').notNull(),
    requiresCallback: boolean('requires_callback').notNull().default(false),
    isDnc: boolean('is_dnc').notNull().default(false), // tabulação "não perturbe" alimenta a dnc_entries
    active: boolean('active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('call_outcomes_uq').on(t.organizationId, t.name)],
);

// Campanha de discagem (espelho da campanha na 3C via external_id).
// Não confundir com `campaigns` (metas/premiações do Performance Engine).
export const dialerCampaigns = pgTable(
  'dialer_campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    status: dialerCampaignStatus('status').notNull().default('rascunho'),
    externalId: text('external_id'), // id da campanha no discador (3C)
    operationId: uuid('operation_id').references(() => operations.id), // oportunidade ofertada
    scriptId: uuid('script_id'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('dialer_campaigns_org_idx').on(t.organizationId, t.status),
    index('dialer_campaigns_external_idx').on(t.externalId),
  ],
);

// Leads carregados na campanha (mapeamento nosso ↔ discador).
export const dialerCampaignLeads = pgTable(
  'dialer_campaign_leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => dialerCampaigns.id),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id),
    externalId: text('external_id'), // id do registro no discador
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('dialer_campaign_leads_uq').on(t.campaignId, t.leadId),
    index('dialer_campaign_leads_lead_idx').on(t.leadId),
  ],
);

// Cada ligação (via discador ou clique-liga) vira uma tentativa tabulada.
// Alimentada pelo webhook do discador + tabulação do consultor na tela.
export const callAttempts = pgTable(
  'call_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id),
    campaignId: uuid('campaign_id').references(() => dialerCampaigns.id),
    byMembershipId: uuid('by_membership_id').references(() => memberships.id), // consultor que atendeu a ligação conectada
    dialerCallId: text('dialer_call_id'), // id da chamada no discador (idempotência do webhook)
    phone: text('phone'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    durationSec: integer('duration_sec'),
    outcomeId: uuid('outcome_id').references(() => callOutcomes.id),
    recordingUrl: text('recording_url'), // gravação (link do discador ou cópia no nosso S3)
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('call_attempts_lead_idx').on(t.leadId, t.startedAt),
    index('call_attempts_membership_idx').on(t.byMembershipId, t.startedAt),
    uniqueIndex('call_attempts_dialer_uq').on(t.dialerCallId),
  ],
);

// Lista "não ligar" da organização: pedidos do cliente, Não Me Perturbe,
// Procon. Checada ANTES de subir lead para qualquer campanha.
export const dncEntries = pgTable(
  'dnc_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    phone: text('phone').notNull(),
    reason: text('reason').notNull(), // pedido do titular, lista Procon, tabulação DNC…
    sourceAttemptId: uuid('source_attempt_id').references(() => callAttempts.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('dnc_entries_uq').on(t.organizationId, t.phone)],
);

// ── Reunião de apresentação ────────────────────────────────────────────
// Passo obrigatório do funil após a conversão no telefone: reunião
// (presencial ou Meet) para explicar a estrutura MAZARI. O stage do lead
// continua 'prospect' até formalizar participação — a reunião é a
// atividade que faz essa ponte. Remarcação gera NOVO registro (histórico
// de no-show é métrica de funil).
export const leadMeetings = pgTable(
  'lead_meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id),
    hostMembershipId: uuid('host_membership_id')
      .notNull()
      .references(() => memberships.id), // quem apresenta (normalmente o dono do lead)
    operationId: uuid('operation_id').references(() => operations.id), // oportunidade a apresentar
    mode: meetingMode('mode').notNull(),
    status: meetingStatus('status').notNull().default('agendada'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    location: text('location'), // endereço (presencial) ou link (Meet)
    heldAt: timestamp('held_at', { withTimezone: true }),
    notes: text('notes'), // resultado da reunião
    rescheduledFromId: uuid('rescheduled_from_id'), // reunião anterior (remarcação)
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('lead_meetings_lead_idx').on(t.leadId),
    index('lead_meetings_host_idx').on(t.hostMembershipId, t.scheduledAt),
    index('lead_meetings_status_idx').on(t.organizationId, t.status, t.scheduledAt),
  ],
);

// Roteiro na tela do consultor, versionado por campanha.
export const callScripts = pgTable(
  'call_scripts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    version: integer('version').notNull().default(1),
    body: text('body').notNull(), // markdown com objeções e respostas
    active: boolean('active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('call_scripts_uq').on(t.organizationId, t.name, t.version)],
);
