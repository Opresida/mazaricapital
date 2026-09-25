import { pgEnum } from 'drizzle-orm/pg-core';

// ── Estrutura comercial ────────────────────────────────────────────────
export const memberRole = pgEnum('member_role', [
  'presidente',
  'diretor',
  'supervisor',
  'consultor',
  'cotista',
]);

export const memberStatus = pgEnum('member_status', [
  'convidado',
  'ativo',
  'suspenso',
  'desligado',
]);

// ── Operações ──────────────────────────────────────────────────────────
// Publicação: rascunho → em_analise → aprovada → publicada → captacao_encerrada
// Ciclo de vida: em_execucao → em_venda → venda_concluida → encerrada
export const operationStatus = pgEnum('operation_status', [
  'rascunho',
  'em_analise',
  'aprovada',
  'publicada',
  'captacao_pausada',
  'captacao_encerrada',
  'em_execucao',
  'em_venda',
  'venda_concluida',
  'encerrada',
  'cancelada',
]);

export const vehicleType = pgEnum('vehicle_type', ['spe', 'scp', 'outra']);

export const documentCategory = pgEnum('document_category', [
  'societario',
  'juridico',
  'imovel',
  'engenharia',
  'orcamento',
  'fornecedores',
  'financeiro',
  'contratos',
  'tributario',
  'comercial',
  'relatorios',
]);

export const documentStatus = pgEnum('document_status', [
  'pendente',
  'aprovado',
  'recusado',
  'arquivado',
]);

// Quem pode ver o documento no Data Room
export const documentPermission = pgEnum('document_permission', [
  'presidencia',
  'diretoria',
  'equipe_comercial',
  'participantes',
]);

export const budgetStatus = pgEnum('budget_status', [
  'rascunho',
  'em_aprovacao',
  'aprovado',
  'substituido',
]);

export const stageStatus = pgEnum('stage_status', [
  'pendente',
  'em_andamento',
  'concluida',
]);

export const saleStatus = pgEnum('sale_status', [
  'preparacao',
  'em_venda',
  'proposta_aceita',
  'concluida',
]);

export const proposalStatus = pgEnum('proposal_status', [
  'recebida',
  'em_negociacao',
  'aceita',
  'recusada',
]);

export const resultStatus = pgEnum('result_status', [
  'rascunho',
  'em_aprovacao',
  'aprovada',
]);

// ── Capital ────────────────────────────────────────────────────────────
// Pipeline comercial: cadastro NÃO é produção — só capital confirmado conta.
export const leadStage = pgEnum('lead_stage', [
  'lead',
  'prospect',
  'participante',
  'capital_confirmado',
]);

export const participationStatus = pgEnum('participation_status', [
  'reservada',
  'em_documentacao',
  'confirmada',
  'cancelada',
  'encerrada',
]);

export const distributionStatus = pgEnum('distribution_status', [
  'calculada',
  'aprovada',
  'paga',
]);

// ── Comissões ──────────────────────────────────────────────────────────
export const commissionRuleStatus = pgEnum('commission_rule_status', [
  'rascunho',
  'em_aprovacao',
  'ativa',
  'encerrada',
]);

export const commissionEventStatus = pgEnum('commission_event_status', [
  'pendente',
  'disponivel',
  'em_saque',
  'pago',
]);

export const ledgerEntryType = pgEnum('ledger_entry_type', [
  'credito',
  'ajuste',
  'saque',
]);

// ── Controladoria de custos ────────────────────────────────────────────
// Separação DEFINITIVA: custo corporativo (água, luz, telefone, gastos
// internos) nunca se mistura com custo de obra (financeiro por operação).
export const expenseKind = pgEnum('expense_kind', ['obra', 'corporativa']);

export const corporateExpenseStatus = pgEnum('corporate_expense_status', [
  'a_pagar',
  'paga',
  'cancelada',
]);

// ── Pagamentos ─────────────────────────────────────────────────────────
export const paymentType = pgEnum('payment_type', [
  'saque_comissao',
  'distribuicao',
]);

export const paymentStatus = pgEnum('payment_status', [
  'solicitado',
  'em_analise',
  'aprovado',
  'recusado',
  'pago',
]);

export const bankAccountType = pgEnum('bank_account_type', [
  'pix',
  'conta_bancaria',
]);

// ── Performance ────────────────────────────────────────────────────────
export const campaignStatus = pgEnum('campaign_status', [
  'rascunho',
  'ativa',
  'apurada',
  'encerrada',
]);

export const goalAudience = pgEnum('goal_audience', [
  'consultor',
  'equipe',
  'unidade',
]);

export const prizeStatus = pgEnum('prize_status', ['ativo', 'inativo']);

export const awardStatus = pgEnum('award_status', ['conquistado', 'entregue']);

// ── CRM / telemarketing ────────────────────────────────────────────────
// Classificação da tabulação, usada nas métricas (taxa de contato,
// conversão, descarte) independente do nome que a Presidência der.
export const outcomeKind = pgEnum('outcome_kind', [
  'contato_efetivo', // falou com o decisor
  'sem_contato', // não atendeu, caixa postal, ocupado
  'descarte', // número inválido, não perturbe, fora do perfil
  'conversao', // virou interesse real / avançou no funil
]);

export const dialerCampaignStatus = pgEnum('dialer_campaign_status', [
  'rascunho',
  'ativa',
  'pausada',
  'encerrada',
]);

// Quem indicou o lead (classificação p/ métricas; o cadastro é livre).
export const referrerKind = pgEnum('referrer_kind', [
  'influencer',
  'relacionamento', // networking próximo do consultor/diretor
  'cliente', // cotista que indica
  'parceiro',
  'outro',
]);

// Reunião de apresentação da estrutura (pós-conversão no telefone).
export const meetingMode = pgEnum('meeting_mode', ['presencial', 'video']);

export const meetingStatus = pgEnum('meeting_status', [
  'agendada',
  'remarcada',
  'realizada',
  'nao_compareceu',
  'cancelada',
]);

// ── Plataforma ─────────────────────────────────────────────────────────
export const feedEventType = pgEnum('feed_event_type', [
  'operacao',
  'documento',
  'fotos',
  'meta',
  'comissao',
  'pagamento',
  'comunicado',
]);
