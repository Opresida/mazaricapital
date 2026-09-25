// Formatação monetária pt-BR.
// Regra (decisão 2026-09-26, alinhada à Base UI que já usa "R$ 1,62 mi"):
// - KPIs e destaques: COMPACTO — "R$ 950 mil", "R$ 1,25 mi"
// - Tabelas, extratos e memória de cálculo: SEMPRE o valor completo
export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const fmtBRL2 = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const trimPt = (s: string) => s.replace('.', ',').replace(/,?0+$/, '');

export function fmtCompactBRL(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `R$ ${trimPt((v / 1_000_000).toFixed(2))} mi`;
  if (abs >= 1_000) return `R$ ${trimPt((v / 1_000).toFixed(1))} mil`;
  return fmtBRL(v);
}
