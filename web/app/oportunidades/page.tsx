'use client';
import Shell from '@/components/Shell';
import Link from 'next/link';
import { useDataMode } from '@/lib/data-mode';
import { operations, fmtBRL } from '@/lib/mock';
import { fmtCompactBRL } from '@/lib/format';

// Layout conforme Mapa de Telas · módulo 01:
// [12] busca/filtros · [12] KPIs · [8] grade de cards · [4] funil + checklist
export default function OportunidadesPage() {
  const { mode } = useDataMode();
  const emCaptacao = operations.filter((o) => o.status === 'Em captação');
  const capitalDisponivel = emCaptacao.reduce((s, o) => s + (o.capitalNeeded - o.capitalConfirmed), 0);
  const cotasRestantes = emCaptacao.reduce((s, o) => s + (o.quotaTotal - o.quotasConfirmed), 0);

  return (
    <Shell title="Oportunidades" crumb="Oportunidades">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="label accent">Operation Engine · Captação</span>
          <h1 className="h-page">Oportunidades</h1>
        </div>
        <button className="btn primary" disabled title="Cadastro em 6 passos — próxima fase">
          Nova oportunidade
        </button>
      </div>

      {mode === 'real' ? (
        <div className="card empty">
          <div className="title">Nenhuma oportunidade real cadastrada</div>
          <p>O módulo de Oportunidades da API é a próxima fase. Alterne para DEMO para ver a experiência completa.</p>
        </div>
      ) : (
        <>
          {/* Filtros (span 12) */}
          <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 14 }}>
            {['Todas', 'Em captação', 'Em execução', 'Encerradas'].map((f, i) => (
              <button key={f} className={`btn small ${i === 0 ? 'primary' : 'secondary'}`}>{f}</button>
            ))}
            <span className="spacer" style={{ flex: 1 }} />
            <span className="small muted-3" style={{ alignSelf: 'center' }}>Unidade Manaus · tipo: residencial</span>
          </div>

          {/* KPIs (span 12) */}
          <div className="grid kpis">
            <div className="card kpi"><span className="label">Abertas</span><div className="value">{emCaptacao.length}</div></div>
            <div className="card kpi"><span className="label">Em captação</span><div className="value">{fmtCompactBRL(emCaptacao.reduce((s, o) => s + o.capitalNeeded, 0))}</div></div>
            <div className="card kpi"><span className="label">Capital disponível</span><div className="value">{fmtCompactBRL(capitalDisponivel)}</div></div>
            <div className="card kpi"><span className="label">Cotas restantes</span><div className="value">{cotasRestantes}</div></div>
          </div>

          <div className="grid12">
            {/* Grade de cards (span 8) */}
            <div className="span8 grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', alignContent: 'start' }}>
              {operations.map((o) => {
                const pct = Math.round((o.capitalConfirmed / o.capitalNeeded) * 100);
                return (
                  <Link key={o.code} href={`/operacoes/${o.code}`} className="card" style={{ color: 'inherit', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ height: 110, borderRadius: 8, background: 'linear-gradient(135deg, #091923, #0d2231)', display: 'grid', placeItems: 'center' }}>
                      <span className="label">FOTO DO IMÓVEL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: 16 }}>{o.code}</div>
                        <div className="small muted">{o.city} · {o.stage}</div>
                      </div>
                      <span className={`chip ${o.statusChip}`}>{o.status}</span>
                    </div>
                    <div>
                      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                      <div className="small muted-3" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{o.quotasConfirmed}/{o.quotaTotal} cotas · {fmtBRL(o.quotaValue)}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Funil de captação + checklist (span 4) */}
            <div className="span4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="card">
                <span className="label accent" style={{ display: 'block', marginBottom: 12 }}>Funil de captação · MH-002</span>
                {[
                  ['Leads apresentados', 34, 100],
                  ['Reuniões realizadas', 14, 41],
                  ['Reservas de cota', 11, 32],
                  ['Capital confirmado', 9, 26],
                ].map(([label, n, pct]) => (
                  <div key={label as string} style={{ marginBottom: 10 }}>
                    <div className="small" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="muted">{label}</span><span>{n}</span>
                    </div>
                    <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="card">
                <span className="label" style={{ display: 'block', marginBottom: 12 }}>Checklist de publicação</span>
                {[
                  ['Matrícula do imóvel', true],
                  ['Orçamento aprovado', true],
                  ['Cronograma', true],
                  ['Estrutura jurídica (SPE/SCP)', true],
                  ['Contrato modelo', true],
                ].map(([item, done]) => (
                  <div key={item as string} className="small" style={{ display: 'flex', gap: 8, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ color: done ? 'var(--accent)' : 'var(--text-3)' }}>{done ? '✓' : '○'}</span>
                    <span className={done ? '' : 'muted-3'}>{item}</span>
                  </div>
                ))}
                <p className="small muted-3" style={{ margin: '10px 0 0' }}>Só publica com checklist completo.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
