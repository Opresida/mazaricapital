'use client';
import Shell, { MazariLoading } from '@/components/Shell';
import CrmNav from '@/components/CrmNav';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useDataMode } from '@/lib/data-mode';
import { api, getAuth } from '@/lib/api';
import { demoLeadDetail } from '@/lib/mock';

const fmtDT = (v: string) =>
  new Date(v).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function AgendaPage() {
  const { mode } = useDataMode();
  const demo = mode === 'demo';
  const [rows, setRows] = useState<any[]>([]);
  const [mine, setMine] = useState(true);
  const [state, setState] = useState<'ok' | 'login' | 'loading'>('loading');
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (demo) {
      setRows(demoLeadDetail.meetings.map((m) => ({ ...m, leadId: 'demo-1', leadName: demoLeadDetail.lead.name })));
      setState('ok');
      return;
    }
    if (!getAuth()) { setState('login'); return; }
    setState('loading');
    api<{ rows: any[] }>(`/crm/meetings?mine=${mine}`)
      .then((d) => { setRows(d.rows); setState('ok'); })
      .catch(() => setState('login'));
  }, [demo, mine]);
  useEffect(load, [load]);

  async function closeMeeting(mid: string, status: string) {
    setError(null);
    let rescheduleTo: string | undefined;
    if (status === 'nao_compareceu' || status === 'cancelada') {
      const v = window.prompt('Remarcar para (deixe vazio para não remarcar) — formato AAAA-MM-DD HH:MM', '');
      if (v?.trim()) rescheduleTo = new Date(v.replace(' ', 'T')).toISOString();
    }
    try {
      await api<any>(`/crm/meetings/${mid}`, { method: 'PATCH', body: JSON.stringify({ status, rescheduleTo }) });
      setFlash('Agenda atualizada.');
      load();
    } catch (e: any) { setError(e?.message ?? 'Falha ao atualizar.'); }
  }

  return (
    <Shell title="CRM" crumb="CRM / Agenda">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="label accent">Reuniões de apresentação</span>
          <h1 className="h-page">Agenda</h1>
        </div>
        {!demo && (
          <div className="mode-toggle">
            <button className={mine ? 'on-real' : ''} onClick={() => setMine(true)}>MINHAS</button>
            <button className={!mine ? 'on-real' : ''} onClick={() => setMine(false)}>DO MEU ESCOPO</button>
          </div>
        )}
      </div>
      <CrmNav />
      {flash && <div className="chip ok" style={{ alignSelf: 'flex-start' }}>{flash}</div>}
      {error && <div className="chip neg" style={{ alignSelf: 'flex-start' }}>{error}</div>}

      {state === 'loading' && !demo ? (
        <div className="card"><MazariLoading /></div>
      ) : state === 'login' && !demo ? (
        <div className="card empty">
          <div className="title">Modo real exige login</div>
          <Link href="/login" className="btn primary" style={{ display: 'inline-block' }}>Fazer login</Link>
        </div>
      ) : rows.length === 0 ? (
        <div className="card empty">
          <div className="title">Nenhuma reunião aberta</div>
          <p>Agende pela ficha do lead: tabulou "interessado", marca a apresentação na hora.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr><th>Quando</th><th>Lead</th><th>Modo</th><th>Local / link</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDT(m.scheduledAt)}</td>
                  <td>
                    <Link href={`/crm/leads/${m.leadId}`}>{m.leadName ?? 'abrir ficha'}</Link>
                  </td>
                  <td>{m.mode === 'video' ? 'Meet / vídeo' : 'Presencial'}</td>
                  <td className="muted small">{m.location ?? '—'}</td>
                  <td><span className="chip warn">{String(m.status).toUpperCase()}</span></td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn small primary" disabled={demo} onClick={() => closeMeeting(m.id, 'realizada')} style={{ marginRight: 6 }}>Realizada</button>
                    <button className="btn small secondary" disabled={demo} onClick={() => closeMeeting(m.id, 'nao_compareceu')}>No-show</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
