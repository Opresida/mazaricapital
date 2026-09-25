'use client';
import Shell from '@/components/Shell';
import { useDataMode } from '@/lib/data-mode';
import { kpis, feed, operations, fmtBRL } from '@/lib/mock';
import { fmtCompactBRL } from '@/lib/format';
import { api, getAuth } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function DemoCommandCenter() {
  return (
    <>
      <div className="grid kpis">
        <div className="card kpi">
          <span className="label">Capital em operações</span>
          <div className="value">{fmtCompactBRL(kpis.capitalInOperations)}</div>
          <div className="delta">confirmado nas operações ativas</div>
        </div>
        <div className="card kpi">
          <span className="label">Capital originado</span>
          <div className="value">{fmtCompactBRL(kpis.capitalOriginated)}</div>
          <div className="delta">histórico total</div>
        </div>
        <div className="card kpi">
          <span className="label">Operações</span>
          <div className="value">{kpis.operations.total}</div>
          <div className="delta">
            {kpis.operations.captacao} captação · {kpis.operations.execucao} execução · {kpis.operations.encerradas} encerrada
          </div>
        </div>
        <div className="card kpi">
          <span className="label">Cotistas</span>
          <div className="value">{kpis.participants}</div>
          <div className="delta">
            {kpis.team.consultores} consultores · {kpis.team.supervisores} supervisores
          </div>
        </div>
        <div className="card kpi">
          <span className="label">Distribuições pagas</span>
          <div className="value">{fmtCompactBRL(kpis.distributionsPaid)}</div>
          <div className="delta">MH-003 · 6 participantes</div>
        </div>
        <div className="card kpi">
          <span className="label">Comissões</span>
          <div className="value muted-3">a definir</div>
          <div className="delta pending">aguardando percentuais da Presidência</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 12 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <h2 className="h-section">Operações</h2>
            <Link href="/oportunidades" className="small">Ver todas</Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Operação</th><th>Etapa</th><th>Captação</th><th className="num">Capital</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.code}>
                  <td>
                    <Link href={`/oportunidades/${o.code}`}>{o.code}</Link>
                    <div className="small muted-3">{o.city}</div>
                  </td>
                  <td>{o.stage}</td>
                  <td style={{ minWidth: 140 }}>
                    <div className="bar" style={{ marginBottom: 4 }}>
                      <span style={{ width: `${Math.round((o.capitalConfirmed / o.capitalNeeded) * 100)}%` }} />
                    </div>
                    <span className="small muted">{Math.round((o.capitalConfirmed / o.capitalNeeded) * 100)}%</span>
                  </td>
                  <td className="num">{fmtBRL(o.capitalNeeded)}</td>
                  <td><span className={`chip ${o.statusChip}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2 className="h-section" style={{ marginBottom: 8 }}>Feed MAZARI</h2>
          {feed.map((f, i) => (
            <div className="feed-item" key={i}>
              <span className="dot" />
              <span>{f.text}</span>
              <time>{f.time}</time>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RealCommandCenter() {
  const [me, setMe] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!getAuth()) {
      setErr('login');
      return;
    }
    api('/auth/me').then(setMe).catch(() => setErr('login'));
  }, []);

  if (err === 'login') {
    return (
      <div className="card empty">
        <div className="title">Modo real exige login</div>
        <p>Entre com suas credenciais para conectar na API.</p>
        <Link href="/login" className="btn primary" style={{ display: 'inline-block' }}>Fazer login</Link>
      </div>
    );
  }
  return (
    <>
      {me && (
        <div className="card accent">
          <span className="label accent">Conectado à API</span>
          <div style={{ marginTop: 8 }}>
            {me.name} · {me.email} — {me.memberships?.map((m: any) => m.role).join(', ')}
          </div>
        </div>
      )}
      <div className="card empty">
        <div className="title">Indicadores reais em construção</div>
        <p>
          As operações reais ainda não foram cadastradas — este painel ganhará números conforme os módulos
          entrarem no ar. O CRM já está vivo: veja a fila real na aba CRM.
        </p>
      </div>
    </>
  );
}

export default function CommandCenter() {
  const { mode } = useDataMode();
  return (
    <Shell title="Command Center">
      <h1 className="h-page">Command Center</h1>
      {mode === 'demo' ? <DemoCommandCenter /> : <RealCommandCenter />}
    </Shell>
  );
}
