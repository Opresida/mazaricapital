'use client';
import Shell, { MazariLoading } from '@/components/Shell';
import CrmNav from '@/components/CrmNav';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDataMode } from '@/lib/data-mode';
import { api, getAuth } from '@/lib/api';
import { crmQueue } from '@/lib/mock';

const STAGES = [
  ['', 'Todas as etapas'],
  ['lead', 'Lead'],
  ['prospect', 'Prospect'],
  ['participante', 'Participante'],
  ['capital_confirmado', 'Capital confirmado'],
] as const;

const STAGE_LABEL: Record<string, string> = {
  lead: 'Lead', prospect: 'Prospect', participante: 'Participante', capital_confirmado: 'Capital confirmado',
};

export default function LeadsListPage() {
  const { mode } = useDataMode();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stage, setStage] = useState('');
  const [search, setSearch] = useState('');
  const [state, setState] = useState<'ok' | 'login' | 'loading'>('loading');
  const limit = 25;

  useEffect(() => {
    if (mode === 'demo') {
      setRows(crmQueue);
      setTotal(crmQueue.length);
      setState('ok');
      return;
    }
    if (!getAuth()) { setState('login'); return; }
    setState('loading');
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (stage) q.set('stage', stage);
    if (search) q.set('search', search);
    api<{ rows: any[]; total: number }>(`/crm/leads?${q}`)
      .then((d) => { setRows(d.rows); setTotal(d.total); setState('ok'); })
      .catch(() => setState('login'));
  }, [mode, page, stage, search]);

  return (
    <Shell title="CRM" crumb="CRM / Leads">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="label accent">Sales Engine</span>
          <h1 className="h-page">Leads</h1>
        </div>
        <Link href="/crm/leads/novo">
          <button className="btn primary" disabled={mode === 'demo'} title={mode === 'demo' ? 'Disponível no modo REAL' : ''}>
            Novo lead
          </button>
        </Link>
      </div>
      <CrmNav />

      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 14 }}>
        <select className="field-inline" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', padding: '8px 12px', fontSize: 13 }}>
          {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input
          placeholder="Buscar por nome, empresa ou telefone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 220, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', padding: '8px 12px', fontSize: 13 }}
        />
        <span className="small muted-3" style={{ alignSelf: 'center' }}>{total} lead{total === 1 ? '' : 's'}</span>
      </div>

      {state === 'loading' && mode === 'real' ? (
        <div className="card"><MazariLoading /></div>
      ) : state === 'login' && mode === 'real' ? (
        <div className="card empty">
          <div className="title">Modo real exige login</div>
          <Link href="/login" className="btn primary" style={{ display: 'inline-block' }}>Fazer login</Link>
        </div>
      ) : rows.length === 0 ? (
        <div className="card empty">
          <div className="title">Nenhum lead encontrado</div>
          <p>Cadastre um lead ou importe um mailing para começar.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr><th>Lead</th><th>Contato</th><th>Cidade</th><th>Etapa</th><th>Retorno</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>
                    {l.name}
                    {l.companyName && <div className="small muted-3">{l.companyName}</div>}
                  </td>
                  <td>{l.phone ?? l.email ?? '—'}</td>
                  <td className="muted">{l.city ?? '—'}{l.uf ? `/${l.uf}` : ''}</td>
                  <td><span className="chip muted">{STAGE_LABEL[l.stage] ?? l.stage}</span></td>
                  <td className="small muted">
                    {l.nextCallbackAt
                      ? new Date(l.nextCallbackAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="num">
                    {mode === 'demo' ? (
                      <Link href={`/crm/leads/${l.id}`} className="btn small secondary" style={{ display: 'inline-block' }}>Abrir</Link>
                    ) : (
                      <Link href={`/crm/leads/${l.id}`} className="btn small secondary" style={{ display: 'inline-block' }}>Abrir</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mode === 'real' && total > limit && (
            <div style={{ display: 'flex', gap: 8, padding: 14, justifyContent: 'flex-end', alignItems: 'center' }}>
              <button className="btn small secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
              <span className="small muted">{page} / {Math.ceil(total / limit)}</span>
              <button className="btn small secondary" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)}>›</button>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
