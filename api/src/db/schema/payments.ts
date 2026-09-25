import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { organizations, users } from './organization';
import { operations } from './operations';
import { paymentType, paymentStatus, bankAccountType } from './enums';

// ── Contas de destino ──────────────────────────────────────────────────
// Conta/PIX validado NO NOME do beneficiário antes de qualquer pagamento.

export const bankAccounts = pgTable(
  'bank_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: bankAccountType('type').notNull(),
    // PIX: chave; conta: banco/agência/conta serializados.
    pixKey: text('pix_key'),
    bankCode: text('bank_code'),
    branch: text('branch'),
    accountNumber: text('account_number'),
    holderName: text('holder_name').notNull(),
    holderDocument: text('holder_document').notNull(), // CPF/CNPJ
    nameValidated: boolean('name_validated').notNull().default(false),
    validatedAt: timestamp('validated_at', { withTimezone: true }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('bank_accounts_user_idx').on(t.userId)],
);

// ── Central de pagamentos ──────────────────────────────────────────────
// Saques de comissão e distribuições de resultado.
// Dupla aprovação acima do limite (quem aprova ≠ quem paga).
// Status só vira "pago" com comprovante anexado.

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    type: paymentType('type').notNull(),
    status: paymentStatus('status').notNull().default('solicitado'),
    beneficiaryUserId: uuid('beneficiary_user_id')
      .notNull()
      .references(() => users.id),
    bankAccountId: uuid('bank_account_id')
      .notNull()
      .references(() => bankAccounts.id),
    operationId: uuid('operation_id').references(() => operations.id),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    priority: integer('priority').notNull().default(0),
    dueDate: timestamp('due_date', { withTimezone: true }),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
    // Dupla aprovação: segunda assinatura exigida acima do limite da org.
    approvedBy1: uuid('approved_by_1').references(() => users.id),
    approvedAt1: timestamp('approved_at_1', { withTimezone: true }),
    approvedBy2: uuid('approved_by_2').references(() => users.id),
    approvedAt2: timestamp('approved_at_2', { withTimezone: true }),
    refusedBy: uuid('refused_by').references(() => users.id),
    refusalReason: text('refusal_reason'),
    paidBy: uuid('paid_by').references(() => users.id),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    receiptStorageKey: text('receipt_storage_key'), // obrigatório p/ status pago
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('payments_org_status_idx').on(t.organizationId, t.status),
    index('payments_beneficiary_idx').on(t.beneficiaryUserId),
  ],
);
