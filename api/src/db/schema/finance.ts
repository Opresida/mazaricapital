import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organizations, units, users } from './organization';
import { expenseKind, corporateExpenseStatus } from './enums';

// ── Plano de contas (categorias de custo) ──────────────────────────────
// Gerido pela Presidência. kind separa os dois mundos:
//   'obra'        → categorias de custo de operação (aquisição, materiais,
//                   mão de obra, impostos, contingências…)
//   'corporativa' → categorias da empresa (água, luz, telefone, aluguel,
//                   internet, salários, marketing, gastos internos…)
// A aplicação garante que cada lançamento usa categoria do kind certo.

export const expenseCategories = pgTable(
  'expense_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    kind: expenseKind('kind').notNull(),
    name: text('name').notNull(),
    active: boolean('active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('expense_categories_uq').on(t.organizationId, t.kind, t.name)],
);

// ── Custos corporativos (a empresa, NUNCA a obra) ──────────────────────
// Este lançamento NÃO tem operation_id de propósito: custo da empresa
// jamais entra no financeiro de uma operação (e vice-versa — o custo de
// obra vive em `expenses`, sempre amarrado a uma operação).
// unit_id null = custo da sede/organização; preenchido = custo da unidade.

export const corporateExpenses = pgTable(
  'corporate_expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    unitId: uuid('unit_id').references(() => units.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => expenseCategories.id),
    description: text('description').notNull(),
    supplier: text('supplier'),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    expenseDate: date('expense_date').notNull(), // competência
    dueDate: date('due_date'),
    status: corporateExpenseStatus('status').notNull().default('a_pagar'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    paidBy: uuid('paid_by').references(() => users.id),
    receiptStorageKey: text('receipt_storage_key'), // obrigatório (na aplicação) p/ status paga
    recurring: boolean('recurring').notNull().default(false), // água, luz, telefone…
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('corporate_expenses_org_status_idx').on(t.organizationId, t.status),
    index('corporate_expenses_org_date_idx').on(t.organizationId, t.expenseDate),
    index('corporate_expenses_unit_idx').on(t.unitId),
  ],
);
