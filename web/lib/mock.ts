// Dados DEMO — 100% ILUSTRATIVOS, espelhando o formato do modo REAL.
// A história é uma cadeia coerente: MH-002 em captação → MH-001 em execução
// → MH-003 vendida, apurada e distribuída (75% cotistas / 25% MAZARI,
// impostos 10% — mesmos parâmetros ilustrativos do site aprovado).
// Percentuais de comissão: aguardando definição da Presidência.

export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const fmtBRL2 = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface MockOperation {
  code: string;
  name: string;
  city: string;
  status: string;
  statusChip: 'ok' | 'warn' | 'muted';
  stage: string;
  capitalNeeded: number;
  capitalConfirmed: number;
  quotaTotal: number;
  quotaValue: number;
  quotasConfirmed: number;
  physicalPct: number;
  financialPct: number;
  splitParticipants: number;
  splitMazari: number;
}

export const operations: MockOperation[] = [
  {
    code: 'MH-002', name: 'Mazari House 002', city: 'Manaus/AM',
    status: 'Em captação', statusChip: 'ok', stage: 'Projeto',
    capitalNeeded: 600_000, capitalConfirmed: 270_000,
    quotaTotal: 20, quotaValue: 30_000, quotasConfirmed: 9,
    physicalPct: 0, financialPct: 4, splitParticipants: 75, splitMazari: 25,
  },
  {
    code: 'MH-001', name: 'Mazari House 001', city: 'Manaus/AM',
    status: 'Em execução', statusChip: 'ok', stage: 'Fundação',
    capitalNeeded: 850_000, capitalConfirmed: 680_000,
    quotaTotal: 20, quotaValue: 42_500, quotasConfirmed: 16,
    physicalPct: 18, financialPct: 22, splitParticipants: 75, splitMazari: 25,
  },
  {
    code: 'MH-003', name: 'Mazari House 003', city: 'Manaus/AM',
    status: 'Encerrada', statusChip: 'muted', stage: 'Distribuição concluída',
    capitalNeeded: 300_000, capitalConfirmed: 300_000,
    quotaTotal: 10, quotaValue: 30_000, quotasConfirmed: 10,
    physicalPct: 100, financialPct: 100, splitParticipants: 75, splitMazari: 25,
  },
];

// Resultado da MH-003 (memória de cálculo — cadeia completa até a distribuição)
export const mh003Result = {
  revenue: 520_000,
  costs: 300_000,
  taxes: 52_000, // 10% do bruto (parâmetro ilustrativo do site)
  expenses: 20_000,
  reserves: 10_000,
  net: 138_000,
  participantsShare: 103_500, // 75%
  mazariShare: 34_500, // 25%
  perQuota: 10_350, // 103.500 ÷ 10 cotas
};

export const mh003Participants = [
  { name: 'A. Ribeiro', quotas: 2, invested: 60_000, received: 20_700 },
  { name: 'C. Menezes', quotas: 2, invested: 60_000, received: 20_700 },
  { name: 'F. Duarte', quotas: 2, invested: 60_000, received: 20_700 },
  { name: 'J. Practicava', quotas: 1, invested: 30_000, received: 10_350 },
  { name: 'M. Sales', quotas: 2, invested: 60_000, received: 20_700 },
  { name: 'R. Antunes', quotas: 1, invested: 30_000, received: 10_350 },
];

export const mh001Diary = [
  { date: '30/09/2026', title: 'Estrutura em andamento', tags: 'FOTOS · MEDIÇÃO' },
  { date: '23/09/2026', title: 'Fundação iniciada', tags: 'FOTOS · RELATÓRIO' },
];

export const kpis = {
  capitalInOperations: 950_000, // confirmado nas ativas (680k + 270k)
  capitalOriginated: 1_250_000, // histórico (inclui MH-003)
  operations: { total: 3, captacao: 1, execucao: 1, encerradas: 1 },
  participants: 21,
  team: { diretores: 1, supervisores: 2, consultores: 10 },
  distributionsPaid: 103_500,
  commissions: null as number | null, // aguardando % da Presidência
};

export const feed = [
  { text: 'MH-001 · Estrutura em andamento — 12 fotos e medição publicadas', time: 'há 2 h' },
  { text: 'MH-002 · Aporte confirmado: 1 cota (R$ 30.000)', time: 'há 5 h' },
  { text: 'Consultor atingiu 80% da meta de setembro', time: 'ontem' },
  { text: 'MH-003 · Distribuição paga a 6 participantes (comprovantes anexados)', time: 'há 2 dias' },
  { text: 'Novo documento no Data Room da MH-001: Relatório de medição v1', time: 'há 3 dias' },
];

// CRM — mesma forma da resposta real de GET /crm/queue e /crm/board
export const crmQueue = [
  { id: 'demo-1', name: 'Distribuidora Rio Negro Ltda', companyName: 'Distribuidora Rio Negro', phone: '(92) 9 8888-1234', stage: 'prospect', nextCallbackAt: 'hoje 14:00', city: 'Manaus' },
  { id: 'demo-2', name: 'Grupo Solimões Alimentos', companyName: 'Grupo Solimões', phone: '(92) 9 8888-5678', stage: 'lead', nextCallbackAt: null, city: 'Manaus' },
  { id: 'demo-3', name: 'TransAmazon Logística', companyName: 'TransAmazon', phone: '(92) 9 8888-9012', stage: 'lead', nextCallbackAt: null, city: 'Manaus' },
  { id: 'demo-4', name: 'Farma Norte', companyName: 'Farma Norte', phone: '(92) 9 8888-3456', stage: 'prospect', nextCallbackAt: 'hoje 16:30', city: 'Manaus' },
];

// Ficha demo (mesma forma de GET /crm/leads/:id)
export const demoLeadDetail = {
  lead: {
    id: 'demo-1', name: 'Distribuidora Rio Negro Ltda', companyName: 'Distribuidora Rio Negro',
    cnpj: '12.345.678/0001-00', city: 'Manaus', uf: 'AM', phone: '(92) 9 8888-1234',
    email: 'contato@rionegro.com.br', stage: 'prospect', notes: 'Decisor: sócio-diretor. Interesse em 2 cotas.',
    nextCallbackAt: null, createdAt: '2026-09-20T14:00:00Z',
  },
  attempts: [
    { id: 'a2', startedAt: '2026-09-24T17:10:00Z', durationSec: 260, outcome: 'Atendeu — interessado', outcomeKind: 'conversao', notes: 'Quer conhecer a MH-002', recordingUrl: null },
    { id: 'a1', startedAt: '2026-09-22T15:30:00Z', durationSec: 40, outcome: 'Não atendeu / caixa postal', outcomeKind: 'sem_contato', notes: null, recordingUrl: null },
  ],
  meetings: [
    { id: 'm1', mode: 'video', status: 'agendada', scheduledAt: '2026-09-29T14:00:00Z', location: 'https://meet.google.com/demo', notes: null },
  ],
};

export const crmBoard = [
  { stage: 'lead', total: 38 },
  { stage: 'prospect', total: 11 },
  { stage: 'participante', total: 4 },
  { stage: 'capital_confirmado', total: 3 },
];
