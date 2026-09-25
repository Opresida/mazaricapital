'use client';
import Shell, { MazariLoading } from '@/components/Shell';
import CrmNav from '@/components/CrmNav';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDataMode } from '@/lib/data-mode';
import { api, getAuth } from '@/lib/api';
import { crmQueue, crmBoard } from '@/lib/mock';

const STAGE_LABEL: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  participante: 'Participante',
  capital_confirmado: 'Capital confirmado',
};

type View = 'esteira' | 'kanban';

export default function CrmPage() {
  const { mode } = useDataMode();
  const [view, setView] = useState<View>('esteira');
  const [queue, setQueue] = useState<any[]>([]);
  const [board, setBoard] = useState<Array<{ stage: string; total: number }>>([]);
  const [state, setState] = useState<'ok' | 'login' | 'loading'>('loading');

  useEffect(() => {
    try {
      const v = localStorage.getItem('mzc.crmView');
      if (v === 'kanban' || v === 'esteira') setView(v);
    } catch {}
  }, []);
  const switchView = (v: View) => {
    setView(v);
    try { localStorage.setItem('mzc.crmView', v); } catch {}
  };

  useEffect(() => {
    if (mode === 'demo') {
      setQueue(crmQueue);
      setBoard(crmBoard);
      setState('ok');
      return;
    }
    if (!getAuth()) {
      setState('login');
      return;
    }
    setState('loading');
    Promise.all([api<{ queue: any[] }>('/crm/queue'), api<{ columns: any[] }>('/crm/board')])
      .then(([q, b]) => {
        setQueue(q.queue);
        setBoard(b.columns.map((c) => ({ stage: c.stage, total: c.total })));
        setState('ok');
      })
      .catch(() => setState('login'));
  }, [mode]);

  return (
    <Shell title="CRM" crumb="CRM · esteira de ligações">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="label accent">Sales Engine</span>
          <h1 className="h-page">CRM</h1>
        </div>
        <div className="mode-toggle">
          <button className={view === 'esteira' ? 'on-real' : ''} onClick={() => switchView('esteira')}>ESTEIRA</button>
          <button className={view === 'kanban' ? 'on-real' : ''} onClick={() => switchView('kanban')}>KANBAN</button>
        </div>
      </div>
      <CrmNav />

      {state === 'loading' && mode === 'real' ? (
        <div className="card"><MazariLoading /></div>
      ) : state === 'login' && mode === 'real' ? (
        <div className="card empty">
          <div className="title">Modo real exige login</div>
          <p>A fila real vem da API viva (/crm/queue). Entre para conectar.</p>
          <Link href="/login" className="btn primary" style={{ display: 'inline-block' }}>Fazer login</Link>
        </div>
      ) : view === 'esteira' ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <h2 className="h-section">Fila do dia</h2>
            <span className="small muted">retornos vencidos primeiro · sem DNC · máx. 4 tentativas/semana</span>
          </div>
          {queue.length === 0 ? (
            <div className="empty">
              <div className="title">Fila vazia</div>
              <p>{mode === 'real' ? 'Nenhum lead real na fila ainda — importe um mailing ou cadastre um lead.' : 'Sem leads na demonstração.'}</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Lead</th><th>Telefone</th><th>Etapa</th><th>Retorno agendado</th><th></th></tr>
              </thead>
              <tbody>
                {queue.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.name}
                      {l.companyName && <div className="small muted-3">{l.companyName}{l.city ? ` · ${l.city}` : ''}</div>}
                    </td>
                    <td>{l.phone ?? '—'}</td>
                    <td><span className="chip muted">{STAGE_LABEL[l.stage] ?? l.stage}</span></td>
                    <td>
                      {l.nextCallbackAt
                        ? <span className="chip warn">{typeof l.nextCallbackAt === 'string' && l.nextCallbackAt.includes('T')
                            ? new Date(l.nextCallbackAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : l.nextCallbackAt}</span>
                        : <span className="muted-3 small">—</span>}
                    </td>
                    <td className="num">
                      <Link href={`/crm/leads/${l.id}`} className="btn small primary" style={{ display: 'inline-block' }}>
                        Ligar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {board.map((c) => (
            <div className="card kpi" key={c.stage}>
              <span className="label">{STAGE_LABEL[c.stage] ?? c.stage}</span>
              <div className="value">{c.total}</div>
              <div className="small muted-3">
                {c.stage === 'capital_confirmado' ? 'única etapa que vira produção' : 'no seu escopo'}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
