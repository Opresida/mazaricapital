import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from './schema';

// Seed idempotente: pode rodar quantas vezes quiser — só cria o que falta.
// Conteúdo: decisões já aprovadas pela Presidência (Humberto), nada inventado.

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // ── Organização ──────────────────────────────────────────────────────
  await db
    .insert(schema.organizations)
    .values({ name: 'MAZARI CAPITAL', slug: 'mazari-capital' })
    .onConflictDoNothing();
  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, 'mazari-capital'));

  // ── Unidade Manaus ───────────────────────────────────────────────────
  await db
    .insert(schema.units)
    .values({ organizationId: org.id, name: 'Unidade Manaus', slug: 'manaus', city: 'Manaus', uf: 'AM' })
    .onConflictDoNothing();

  // ── Usuário da Presidência ───────────────────────────────────────────
  const email = 'humbertodeassuncao@gmail.com';
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  let tempPassword: string | null = null;
  if (existing.length === 0) {
    tempPassword = randomBytes(9).toString('base64url'); // senha temporária forte
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await db.insert(schema.users).values({ email, name: 'Humberto', passwordHash });
  }
  const [president] = await db.select().from(schema.users).where(eq(schema.users.email, email));

  await db
    .insert(schema.memberships)
    .values({
      organizationId: org.id,
      userId: president.id,
      role: 'presidente',
      status: 'ativo',
      activatedAt: new Date(),
    })
    .onConflictDoNothing();

  // ── Plano de contas ──────────────────────────────────────────────────
  const obraCategories = [
    'Aquisição', 'Documentação', 'Projetos', 'Materiais', 'Mão de obra',
    'Fornecedores', 'Impostos', 'Comercialização', 'Despesas', 'Contingências',
  ];
  const corporativas = [
    'Água', 'Luz', 'Telefone', 'Internet', 'Aluguel', 'Salários', 'Marketing', 'Gastos internos',
  ];
  await db
    .insert(schema.expenseCategories)
    .values([
      ...obraCategories.map((name) => ({ organizationId: org.id, kind: 'obra' as const, name })),
      ...corporativas.map((name) => ({ organizationId: org.id, kind: 'corporativa' as const, name })),
    ])
    .onConflictDoNothing();

  // ── Tabulações (aprovadas 2026-09-26; Presidência pode criar outras) ─
  const outcomes: Array<[string, 'conversao' | 'contato_efetivo' | 'sem_contato' | 'descarte', boolean, boolean]> = [
    ['Atendeu — interessado', 'conversao', false, false],
    ['Atendeu — retorno agendado', 'contato_efetivo', true, false],
    ['Atendeu — sem interesse', 'contato_efetivo', false, false],
    ['Atendeu — fora do perfil', 'descarte', false, false],
    ['Não atendeu / caixa postal', 'sem_contato', false, false],
    ['Número inválido', 'descarte', false, false],
    ['Pediu para não ligar', 'descarte', false, true],
  ];
  await db
    .insert(schema.callOutcomes)
    .values(
      outcomes.map(([name, kind, requiresCallback, isDnc], i) => ({
        organizationId: org.id, name, kind, requiresCallback, isDnc, sortOrder: i + 1,
      })),
    )
    .onConflictDoNothing();

  // ── Canais de entrada ────────────────────────────────────────────────
  const sources = ['Telemarketing', 'Influencer', 'Relacionamento próximo', 'Indicação de cliente', 'Evento'];
  await db
    .insert(schema.leadSources)
    .values(sources.map((name, i) => ({ organizationId: org.id, name, sortOrder: i + 1 })))
    .onConflictDoNothing();

  // ── Parâmetros decididos ─────────────────────────────────────────────
  const settings: Array<[string, unknown]> = [
    ['profit_split_default', { participantsPct: 75, mazariPct: 25 }],
    ['crm_max_attempts_per_week', { value: 4 }],
  ];
  for (const [key, value] of settings) {
    await db
      .insert(schema.orgSettings)
      .values({ organizationId: org.id, key, value, updatedBy: president.id })
      .onConflictDoNothing();
  }

  // ── Resumo ───────────────────────────────────────────────────────────
  const count = async (table: any, where?: any) =>
    (await db.select().from(table).where(where ?? undefined)).length;
  console.log('── SEED OK ──');
  console.log('org:', org.name, '| unidades:', await count(schema.units));
  console.log('categorias de custo:', await count(schema.expenseCategories));
  console.log('tabulações:', await count(schema.callOutcomes));
  console.log('canais:', await count(schema.leadSources));
  console.log('parâmetros:', await count(schema.orgSettings));
  if (tempPassword) {
    console.log('SENHA_TEMPORARIA_PRESIDENCIA=' + tempPassword);
  } else {
    console.log('usuário presidência já existia — senha mantida');
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
