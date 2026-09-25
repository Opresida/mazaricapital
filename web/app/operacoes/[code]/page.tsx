'use client';
import Shell from '@/components/Shell';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { operations, mh003Result, mh003Participants, mh001Diary, fmtBRL, fmtBRL2 } from '@/lib/mock';
import { fmtCompactBRL } from '@/lib/format';
import { useDataMode } from '@/lib/data-mode';

// Abas conforme Mapa de Telas · módulo 02 (12 abas).
const TABS = [
  'Visão geral', 'Imóvel', '3D / Tour', 'Documentos', 'Financeiro', 'Obra',
  'Cronograma', 'Atualizações', 'Participantes', 'Venda', 'Resultado', 'Histórico',
] as const;

const DOCS = [
  { name: 'Matrícula do imóvel', cat: 'Imóvel', v: 'v2', date: '12/08/2026' },
  { name: 'Orçamento da obra', cat: 'Orçamento', v: 'v3', date: '02/09/2026' },
  { name: 'Contrato da operação', cat: 'Contratos', v: 'v1', date: '15/08/2026' },
  { name: 'Relatório de medição', cat: 'Engenharia', v: 'v1', date: '30/09/2026' },
];

const STAGES = ['Aquisição', 'Projeto', 'Fundação', 'Estrutura', 'Acabamento', 'Venda'];

export default function OperationDetail() {
  const { code } = useParams<{ code: string }>();
  const { mode } = useDataMode();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Visão geral');
  const op = operations.find((o) => o.code === code?.toUpperCase());

  if (mode === 'real' || !op) {
    return (
      <Shell title="Operação" crumb={`Operações / ${code}`}>
        <div className="card empty">
          <div className="title">{mode === 'real' ? 'Sem dados reais para esta operação' : 'Operação não encontrada'}</div>
          <p>Alterne para DEMO para navegar na experiência completa.</p>
        </div>
      </Shell>
    );
  }

  const pct = Math.round((op.capitalConfirmed / op.capitalNeeded) * 100);
  const isClosed = op.code === 'MH-003';
  const stageIdx = isClosed ? 6 : STAGES.indexOf(op.stage);

  const Placeholder = ({ text }: { text: string }) => (
    <div className="card empty">
      <div className="title">Em construção nesta fase</div>
      <p style={{ maxWidth: 520, margin: '0 auto' }}>{text}</p>
    </div>
  );

  return (
    <Shell title={op.code} crumb={`Operações / ${op.code} / ${tab}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="label accent">{op.name}</span>
          <h1 className="h-page">{op.code}</h1>
          <div className="muted small">
            {op.city} · SPE própria · Etapa: {op.stage} · Divisão do lucro: {op.splitParticipants}% cotistas / {op.splitMazari}% MAZARI
          </div>
        </div>
        <span className={`chip ${op.statusChip}`}>{op.status}</span>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Visão geral' && (
        <div className="grid kpis">
          <div className="card kpi"><span className="label">Capital da operação</span><div className="value">{fmtCompactBRL(op.capitalNeeded)}</div></div>
          <div className="card kpi">
            <span className="label">Capital confirmado</span>
            <div className="value">{fmtCompactBRL(op.capitalConfirmed)}</div>
            <div className="delta">{pct}% · {op.quotasConfirmed}/{op.quotaTotal} cotas</div>
          </div>
          <div className="card kpi">
            <span className="label">Avanço físico</span>
            <div className="value">{op.physicalPct}%</div>
            <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${op.physicalPct}%` }} /></div>
          </div>
          <div className="card kpi">
            <span className="label">Avanço financeiro</span>
            <div className="value">{op.financialPct}%</div>
            <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${op.financialPct}%` }} /></div>
          </div>
        </div>
      )}

      {tab === 'Imóvel' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 12 }}>Ativo</h2>
          <table className="table">
            <tbody>
              <tr><td>Tipo</td><td className="num">Residencial unifamiliar · MAZARI HOUSE</td></tr>
              <tr><td>Localização</td><td className="num">{op.city}</td></tr>
              <tr><td>Matrícula</td><td className="num">nº 00.000 (v2 no Data Room)</td></tr>
              <tr><td>Tecnologia construtiva</td><td className="num">MONOLEV (ilustrativo)</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === '3D / Tour' && (
        <div className="card">
          <div style={{ height: 220, borderRadius: 8, background: 'linear-gradient(135deg, #091923, #0d2231)', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
            <span className="label">MODELO 3D · TOUR VIRTUAL (Three.js — fase seguinte)</span>
          </div>
          <p className="small muted-3" style={{ margin: 0 }}>
            Modelos preliminares são ferramenta de concepção/comercialização — não substituem projeto executivo,
            estrutural, instalações, aprovação ou responsabilidade técnica profissional.
          </p>
        </div>
      )}

      {tab === 'Documentos' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px' }}><h2 className="h-section">Data Room</h2></div>
          <table className="table">
            <thead><tr><th>Documento</th><th>Categoria</th><th>Versão</th><th>Data</th><th></th></tr></thead>
            <tbody>
              {DOCS.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td className="muted">{d.cat}</td>
                  <td><span className="chip muted">{d.v}</span></td>
                  <td className="muted">{d.date}</td>
                  <td className="num"><button className="btn small secondary" disabled title="URL temporária — com o módulo real">Abrir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted-3" style={{ padding: '12px 20px' }}>Armazenamento privado · acesso por URL temporária conforme permissão.</p>
        </div>
      )}

      {tab === 'Financeiro' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 12 }}>Captação por cota</h2>
          <table className="table">
            <tbody>
              <tr><td>Total de cotas</td><td className="num">{op.quotaTotal}</td></tr>
              <tr><td>Valor da cota</td><td className="num">{fmtBRL(op.quotaValue)}</td></tr>
              <tr><td>Cotas confirmadas</td><td className="num">{op.quotasConfirmed}</td></tr>
              <tr><td>Capital confirmado</td><td className="num">{fmtBRL(op.capitalConfirmed)}</td></tr>
              <tr><td>Disponível</td><td className="num">{fmtBRL(op.capitalNeeded - op.capitalConfirmed)}</td></tr>
            </tbody>
          </table>
          <p className="small muted-3" style={{ marginBottom: 0 }}>
            Orçamento previsto × realizado por categoria entra com o módulo Operações da API (lançamentos exigem comprovante).
          </p>
        </div>
      )}

      {tab === 'Obra' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 12 }}>Diário da operação</h2>
          {op.code === 'MH-001' ? (
            mh001Diary.map((d, i) => (
              <div className="feed-item" key={i}>
                <span className="dot" />
                <div>
                  <div>{d.title}</div>
                  <div className="small muted-3">{d.date} · {d.tags}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">{isClosed ? 'Obra concluída — histórico completo preservado.' : 'Obra ainda não iniciada (etapa de projeto).'}</p>
          )}
        </div>
      )}

      {tab === 'Cronograma' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 16 }}>Etapas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STAGES.map((s, i) => {
              const done = i < stageIdx;
              const current = i === stageIdx && !isClosed;
              return (
                <div key={s} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', flex: 'none',
                    background: done || isClosed ? 'var(--accent)' : current ? 'var(--warn)' : 'var(--surface-2)',
                    border: '1px solid ' + (done || isClosed ? 'var(--accent)' : current ? 'var(--warn)' : 'var(--border-2)'),
                  }} />
                  <span style={{ flex: 1 }} className={done || current || isClosed ? '' : 'muted-3'}>{s}</span>
                  {current && <span className="chip warn">EM ANDAMENTO</span>}
                  {(done || isClosed) && <span className="chip ok">CONCLUÍDA</span>}
                </div>
              );
            })}
          </div>
          <p className="small muted-3" style={{ margin: '12px 0 0' }}>Mudança de prazo é registrada com motivo e vai para a auditoria.</p>
        </div>
      )}

      {tab === 'Atualizações' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 8 }}>Linha do tempo</h2>
          {(op.code === 'MH-001'
            ? [
                { t: 'Estrutura em andamento — 12 fotos e medição', d: '30/09/2026' },
                { t: 'Novo documento: Relatório de medição v1', d: '30/09/2026' },
                { t: 'Fundação iniciada — fotos e relatório', d: '23/09/2026' },
                { t: 'Captação: 16/20 cotas confirmadas', d: '18/09/2026' },
              ]
            : isClosed
              ? [
                  { t: 'Distribuição paga a 6 participantes', d: '12/09/2026' },
                  { t: 'Apuração aprovada — memória de cálculo publicada', d: '05/09/2026' },
                  { t: 'Venda concluída', d: '28/08/2026' },
                ]
              : [{ t: 'Oportunidade publicada para a Unidade Manaus', d: '10/09/2026' }]
          ).map((u, i) => (
            <div className="feed-item" key={i}>
              <span className="dot" />
              <span>{u.t}</span>
              <time>{u.d}</time>
            </div>
          ))}
        </div>
      )}

      {tab === 'Participantes' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px' }}><h2 className="h-section">Participantes</h2></div>
          {isClosed ? (
            <table className="table">
              <thead>
                <tr><th>Participante</th><th className="num">Cotas</th><th className="num">Aporte</th><th className="num">Distribuição recebida</th></tr>
              </thead>
              <tbody>
                {mh003Participants.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td className="num">{p.quotas}</td>
                    <td className="num">{fmtBRL(p.invested)}</td>
                    <td className="num">{fmtBRL2(p.received)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted" style={{ padding: '0 20px 20px' }}>{op.quotasConfirmed} cotas confirmadas — detalhe individual entra com o módulo de Capital.</p>
          )}
        </div>
      )}

      {tab === 'Venda' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 12 }}>Venda</h2>
          {isClosed ? (
            <table className="table">
              <tbody>
                <tr><td>Status</td><td className="num"><span className="chip muted">VENDA CONCLUÍDA</span></td></tr>
                <tr><td>Valor da venda (VGV)</td><td className="num">{fmtBRL(mh003Result.revenue)}</td></tr>
                <tr><td>Comprador</td><td className="num">Pessoa física · contrato no Data Room</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="muted">A operação ainda não entrou em venda. Preço, propostas, visitas e comprador aparecem aqui.</p>
          )}
        </div>
      )}

      {tab === 'Resultado' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {isClosed ? (
            <>
              <div className="card">
                <h2 className="h-section" style={{ marginBottom: 12 }}>Memória de cálculo</h2>
                <table className="table">
                  <tbody>
                    <tr><td>Receita da venda</td><td className="num">{fmtBRL(mh003Result.revenue)}</td></tr>
                    <tr><td>(−) Custos</td><td className="num">− {fmtBRL(mh003Result.costs)}</td></tr>
                    <tr><td>(−) Tributos</td><td className="num">− {fmtBRL(mh003Result.taxes)}</td></tr>
                    <tr><td>(−) Despesas</td><td className="num">− {fmtBRL(mh003Result.expenses)}</td></tr>
                    <tr><td>(−) Reservas</td><td className="num">− {fmtBRL(mh003Result.reserves)}</td></tr>
                    <tr>
                      <td style={{ fontFamily: 'var(--font-title)' }}>Resultado da operação</td>
                      <td className="num" style={{ fontFamily: 'var(--font-title)', fontSize: 16 }}>{fmtBRL(mh003Result.net)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="card accent">
                <h2 className="h-section" style={{ marginBottom: 12 }}>Distribuição</h2>
                <table className="table">
                  <tbody>
                    <tr><td>Cotistas ({op.splitParticipants}%)</td><td className="num">{fmtBRL(mh003Result.participantsShare)}</td></tr>
                    <tr><td>MAZARI ({op.splitMazari}%)</td><td className="num">{fmtBRL(mh003Result.mazariShare)}</td></tr>
                    <tr><td>Por cota ({op.quotaTotal} cotas)</td><td className="num">{fmtBRL2(mh003Result.perQuota)}</td></tr>
                    <tr><td>Status</td><td className="num"><span className="chip ok">PAGA · comprovantes anexados</span></td></tr>
                  </tbody>
                </table>
                <p className="small muted-3" style={{ marginBottom: 0 }}>
                  Distribuição liberada somente após apuração aprovada. Cada participante acessa sua memória de cálculo.
                </p>
              </div>
            </>
          ) : (
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                O resultado só existe depois da venda. Qualquer estimativa antes disso aparece como{' '}
                <span className="chip projection">PROJEÇÃO</span> — nunca como resultado realizado.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'Histórico' && (
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 8 }}>Registro de auditoria da operação</h2>
          {[
            { who: 'PR', what: 'publicou a oportunidade para a Unidade Manaus', when: '10/09/2026 09:12' },
            { who: 'PR', what: 'aprovou orçamento v3', when: '02/09/2026 15:40' },
            { who: 'DR', what: 'publicou atualização de obra (Fundação iniciada)', when: '23/09/2026 17:05' },
          ].map((h, i) => (
            <div className="feed-item" key={i}>
              <span className="avatar" style={{ width: 24, height: 24 }}>{h.who}</span>
              <span><strong>{h.who === 'PR' ? 'Presidência' : 'Diretor'}</strong> {h.what}</span>
              <time>{h.when}</time>
            </div>
          ))}
          <p className="small muted-3" style={{ margin: '10px 0 0' }}>Somente inclusão: nada é apagado ou editado.</p>
        </div>
      )}
    </Shell>
  );
}
