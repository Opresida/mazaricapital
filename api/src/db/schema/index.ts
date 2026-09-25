// Schema MAZARI CAPITAL — organizado pelos 4 motores + plataforma.
// Sales Engine ........ organization.ts (org, unidades, usuários, vínculos, equipes)
// Operation Engine .... operations.ts (operações, ativos, veículos, data room, obra, venda, resultado)
// Capital Engine ...... capital.ts (leads, participações, aportes, distribuições)
// Performance Engine .. commissions.ts + performance.ts (comissões, metas, campanhas, prêmios)
// Controladoria ....... finance.ts (plano de contas, custos corporativos ≠ custos de obra)
// Central de pagamentos payments.ts
// Plataforma .......... platform.ts (notificações, feed, auditoria, parâmetros)

export * from './enums';
export * from './organization';
export * from './finance';
export * from './operations';
export * from './capital';
export * from './crm';
export * from './commissions';
export * from './performance';
export * from './payments';
export * from './platform';
