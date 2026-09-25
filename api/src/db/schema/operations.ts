import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, units, users } from './organization';
import { expenseCategories } from './finance';
import {
  operationStatus,
  vehicleType,
  documentCategory,
  documentStatus,
  documentPermission,
  budgetStatus,
  stageStatus,
  saleStatus,
  proposalStatus,
  resultStatus,
} from './enums';

// ── Ativo (imóvel) ─────────────────────────────────────────────────────

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    type: text('type').notNull(), // terreno, casa, apartamento…
    registryNumber: text('registry_number'), // matrícula
    address: text('address'),
    city: text('city'),
    uf: text('uf'),
    description: text('description'),
    images: jsonb('images').$type<string[]>(),
    model3dUrl: text('model_3d_url'),
    tourUrl: text('tour_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('assets_org_idx').on(t.organizationId)],
);

// ── Veículo jurídico (SPE/SCP/outra) ───────────────────────────────────
// Agnóstico ao veículo: a tecnologia não pré-determina conclusão jurídica.

export const vehicles = pgTable(
  'vehicles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    type: vehicleType('type').notNull(),
    name: text('name').notNull(),
    cnpj: text('cnpj'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('vehicles_org_idx').on(t.organizationId)],
);

// ── Operação (núcleo do sistema) ───────────────────────────────────────
// Cada operação é individualizada: ativo, orçamento, documentação,
// estrutura jurídica, participantes, capital, cronograma, execução,
// venda, resultado, distribuição e histórico próprios.

export const operations = pgTable(
  'operations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    code: text('code').notNull(), // ex.: MH-001
    name: text('name').notNull(),
    status: operationStatus('status').notNull().default('rascunho'),
    assetId: uuid('asset_id').references(() => assets.id),
    vehicleId: uuid('vehicle_id').references(() => vehicles.id),
    responsibleUserId: uuid('responsible_user_id').references(() => users.id),
    description: text('description'),
    // Capital: necessário × comprometido × confirmado — só o confirmado
    // conta como captação e produção (derivados de participations).
    capitalNeeded: numeric('capital_needed', { precision: 14, scale: 2 }).notNull(),
    quotaTotal: integer('quota_total').notNull(),
    quotaValue: numeric('quota_value', { precision: 14, scale: 2 }).notNull(),
    // Divisão do lucro registrada POR OPERAÇÃO (referência 75/25).
    profitSplitParticipantsPct: numeric('profit_split_participants_pct', {
      precision: 5,
      scale: 2,
    }).notNull(),
    profitSplitMazariPct: numeric('profit_split_mazari_pct', {
      precision: 5,
      scale: 2,
    }).notNull(),
    plannedStartDate: date('planned_start_date'),
    plannedEndDate: date('planned_end_date'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    approvedBy: uuid('approved_by').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('operations_org_code_uq').on(t.organizationId, t.code),
    index('operations_status_idx').on(t.status),
  ],
);

// Unidades autorizadas a enxergar a oportunidade (definido pela Presidência).
export const operationUnits = pgTable(
  'operation_units',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => units.id),
    authorizedAt: timestamp('authorized_at', { withTimezone: true }).notNull().defaultNow(),
    authorizedBy: uuid('authorized_by').references(() => users.id),
  },
  (t) => [uniqueIndex('operation_units_uq').on(t.operationId, t.unitId)],
);

// ── Data Room ──────────────────────────────────────────────────────────
// Documento: versão, data, responsável, status, permissão, histórico.
// Storage privado; acesso via URL temporária.

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    operationId: uuid('operation_id').references(() => operations.id),
    category: documentCategory('category').notNull(),
    name: text('name').notNull(),
    status: documentStatus('status').notNull().default('pendente'),
    permission: documentPermission('permission').notNull().default('presidencia'),
    currentVersion: integer('current_version').notNull().default(1),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('documents_operation_idx').on(t.operationId),
    index('documents_org_idx').on(t.organizationId),
  ],
);

export const documentVersions = pgTable(
  'document_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id),
    version: integer('version').notNull(),
    storageKey: text('storage_key').notNull(),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
    notes: text('notes'),
  },
  (t) => [uniqueIndex('document_versions_uq').on(t.documentId, t.version)],
);

// ── Orçamento (versionado: previsto × realizado por etapa) ─────────────

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    version: integer('version').notNull(),
    status: budgetStatus('status').notNull().default('rascunho'),
    totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('budgets_operation_version_uq').on(t.operationId, t.version)],
);

export const budgetItems = pgTable(
  'budget_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id),
    stageId: uuid('stage_id').references(() => constructionStages.id),
    // Plano de contas kind='obra' — mesma chave do realizado (expenses),
    // fechando previsto × realizado por categoria.
    categoryId: uuid('category_id')
      .notNull()
      .references(() => expenseCategories.id),
    description: text('description'),
    plannedAmount: numeric('planned_amount', { precision: 14, scale: 2 }).notNull(),
  },
  (t) => [index('budget_items_budget_idx').on(t.budgetId)],
);

// Lançamento financeiro DE OBRA: SEMPRE com comprovante, categoria do
// plano de contas kind='obra' e amarrado a uma operação. Custo da empresa
// (água, luz, telefone…) NUNCA entra aqui — vive em corporate_expenses.
export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    stageId: uuid('stage_id').references(() => constructionStages.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => expenseCategories.id),
    description: text('description').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    expenseDate: date('expense_date').notNull(),
    receiptStorageKey: text('receipt_storage_key').notNull(),
    supplier: text('supplier'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('expenses_operation_idx').on(t.operationId)],
);

// ── Obra ───────────────────────────────────────────────────────────────

export const constructionStages = pgTable(
  'construction_stages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    name: text('name').notNull(), // Aquisição, Projeto, Fundação, Estrutura, Acabamento, Venda
    sortOrder: integer('sort_order').notNull(),
    status: stageStatus('status').notNull().default('pendente'),
    plannedStart: date('planned_start'),
    plannedEnd: date('planned_end'),
    actualStart: date('actual_start'),
    actualEnd: date('actual_end'),
    physicalPct: numeric('physical_pct', { precision: 5, scale: 2 }).notNull().default('0'),
    financialPct: numeric('financial_pct', { precision: 5, scale: 2 }).notNull().default('0'),
    responsibleUserId: uuid('responsible_user_id').references(() => users.id),
    // Mudança de prazo registrada com motivo (também vai ao audit log).
    rescheduleReason: text('reschedule_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('construction_stages_operation_idx').on(t.operationId)],
);

// Diário da operação: histórico permanente com fotos, medições e autor.
export const constructionUpdates = pgTable(
  'construction_updates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    stageId: uuid('stage_id').references(() => constructionStages.id),
    title: text('title').notNull(),
    body: text('body'),
    publishedBy: uuid('published_by')
      .notNull()
      .references(() => users.id),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('construction_updates_operation_idx').on(t.operationId)],
);

export const updateMedia = pgTable(
  'update_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    updateId: uuid('update_id')
      .notNull()
      .references(() => constructionUpdates.id),
    kind: text('kind').notNull(), // foto, video, medicao, relatorio
    storageKey: text('storage_key').notNull(),
    caption: text('caption'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('update_media_update_idx').on(t.updateId)],
);

// ── Venda ──────────────────────────────────────────────────────────────

export const sales = pgTable(
  'sales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    status: saleStatus('status').notNull().default('preparacao'),
    listPrice: numeric('list_price', { precision: 14, scale: 2 }),
    finalPrice: numeric('final_price', { precision: 14, scale: 2 }),
    buyerName: text('buyer_name'),
    brokerName: text('broker_name'),
    saleCosts: numeric('sale_costs', { precision: 14, scale: 2 }),
    concludedAt: timestamp('concluded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('sales_operation_uq').on(t.operationId)],
);

export const saleProposals = pgTable(
  'sale_proposals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    saleId: uuid('sale_id')
      .notNull()
      .references(() => sales.id),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    proposerName: text('proposer_name'),
    status: proposalStatus('status').notNull().default('recebida'),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    notes: text('notes'),
  },
  (t) => [index('sale_proposals_sale_idx').on(t.saleId)],
);

// ── Resultado (apuração) ───────────────────────────────────────────────
// RECEITA − CUSTOS − TRIBUTOS − DESPESAS − RESERVAS = RESULTADO.
// Só existe depois da venda. Memória de cálculo obrigatória.
// O sistema NUNCA apresenta projeção como resultado realizado.

export const results = pgTable(
  'results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operationId: uuid('operation_id')
      .notNull()
      .references(() => operations.id),
    status: resultStatus('status').notNull().default('rascunho'),
    revenue: numeric('revenue', { precision: 14, scale: 2 }).notNull(),
    costs: numeric('costs', { precision: 14, scale: 2 }).notNull(),
    taxes: numeric('taxes', { precision: 14, scale: 2 }).notNull(),
    expensesTotal: numeric('expenses_total', { precision: 14, scale: 2 }).notNull(),
    reserves: numeric('reserves', { precision: 14, scale: 2 }).notNull(),
    netResult: numeric('net_result', { precision: 14, scale: 2 }).notNull(),
    participantsShare: numeric('participants_share', { precision: 14, scale: 2 }).notNull(),
    mazariShare: numeric('mazari_share', { precision: 14, scale: 2 }).notNull(),
    calculationMemo: jsonb('calculation_memo').notNull(), // memória de cálculo
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('results_operation_uq').on(t.operationId)],
);
