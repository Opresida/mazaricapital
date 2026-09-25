'use client';
import Shell, { MazariLoading } from '@/components/Shell';
import CrmNav from '@/components/CrmNav';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDataMode } from '@/lib/data-mode';
import { api, getAuth } from '@/lib/api';
import { demoLeadDetail } from '@/lib/mock';

const STAGE_LABEL: Record<string, string> = {
  lead: 'Lead', prospect: 'Prospect', participante: 'Participante', capital_confirmado: 'Capital confirmado',
};
const KIND_CHIP: Record<string, string> = {
  conversao: 'ok', contato_efetivo: 'muted', sem_contato: 'muted', descarte: 'neg',
};
const fmtDT = (v: string | Date) =>
  new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { mode } = useDataMode();
  const demo = mode === 'demo';
  const [data, setData] = useState<any>(null);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [ops, setOps] = useState<any[]>([]);
  const [state, setState] = useState<'ok' | 'login' | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Tabulação
  const [outcomeId, setOutcomeId] = useState('');
  const [tabNotes, setTabNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [callbackAt, setCallbackAt] = useState('');
  const [busy, setBusy] = useState(false);

  // Reunião
  const [mtMode, setMtMode] = useState<'video' | 'presencial'>('video');
  const [mtWhen, setMtWhen] = useState('');
  const [mtWhere, setMtWhere] = useState('');
  const [mtBusy, setMtBusy] = useState(false);

  const load = useCallback(() => {
    if (demo) { setData(demoLeadDetail); setState('ok'); return; }
    if (!getAuth()) { setState('login'); return; }
    Promise.all([api<any>(`/crm/leads/${id}`), api<any[]>('/crm/outcomes'), api<any[]>('/crm/operation-options')])
      .then(([d, o, opts]) => { setData(d); setOutcomes(o.filter((x) => x.active)); setOps(opts); setState('ok'); })
      .catch((e) => { if (e?.status === 401) setState('login'); else { setError(e?.message); setState('ok'); } });
  }, [demo, id]);
  useEffect(load, [load]);

  const selOutcome = outcomes.find((o) => o.id === outcomeId);

  async function tabulate() {
    setBusy(true); setError(null); setFlash(null);
    try {
      const r = await api<any>(`/crm/leads/${id}/attempts`, {
        method: 'POST',
        body: JSON.stringify({
          outcomeId,
          notes: tabNotes || undefined,
          durationSec: duration ? Number(duration) : undefined,
          nextCallbackAt: callbackAt ? new Date(callbackAt).toISOString() : undefined,
        }),
      });
      setOutcomeId(''); setTabNotes(''); setDuration(''); setCallbackAt('');
      setFlash(
        r.effects.dnc
          ? 'Tabulado — telefone entrou na lista "não ligar".'
          : r.effects.nextCallbackAt
            ? 'Tabulado — retorno agendado.'
            : r.effects.stage === 'prospect'
              ? 'Tabulado — lead avançou para Prospect!'
              : 'Ligação tabulada.',
      );
      load();
    } catch (e: any) { setError(e?.message ?? 'Falha na tabulação.'); }
    finally { setBusy(false); }
  }

  async function scheduleMeeting() {
    setMtBusy(true); setError(null); setFlash(null);
    try {
      await api<any>(`/crm/leads/${id}/meetings`, {
        method: 'POST',
        body: JSON.stringify({ mode: mtMode, scheduledAt: new Date(mtWhen).toISOString(), location: mtWhere || undefined }),
      });
      setMtWhen(''); setMtWhere('');
      setFlash('Reunião agendada!');
      load();
    } catch (e: any) { setError(e?.message ?? 'Falha ao agendar.'); }
    finally { setMtBusy(false); }
  }

  async function closeMeeting(mid: string, status: string) {
    setError(null);
    let rescheduleTo: string | undefined;
    if (status === 'nao_compareceu' || status === 'cancelada') {
      const v = window.prompt('Remarcar para (deixe vazio para não remarcar) — formato AAAA-MM-DD HH:MM', '');
      if (v?.trim()) rescheduleTo = new Date(v.replace(' ', 'T')).toISOString();
    }
    try {
      await api<any>(`/crm/meetings/${mid}`, { method: 'PATCH', body: JSON.stringify({ status, rescheduleTo }) });
      setFlash(status === 'realizada' ? 'Reunião realizada — estrutura apresentada!' : 'Reunião atualizada.');
      load();
    } catch (e: any) { setError(e?.message ?? 'Falha ao atualizar reunião.'); }
  }

  if (state === 'loading') return <Shell title="CRM" crumb="CRM / Leads"><div className="card"><MazariLoading /></div></Shell>;
  if (state === 'login') {
    return (
      <Shell title="CRM" crumb="CRM / Leads">
        <div className="card empty">
          <div className="title">Modo real exige login</div>
          <Link href="/login" className="btn primary" style={{ display: 'inline-block' }}>Fazer login</Link>
        </div>
      </Shell>
    );
  }
  if (!data?.lead) {
    return (
      <Shell title="CRM" crumb="CRM / Leads">
        <div className="card empty"><div className="title">Lead não encontrado</div>{error && <p className="muted">{error}</p>}</div>
      </Shell>
    );
  }

  const { lead, attempts, meetings } = data;
  const openMeetings = meetings.filter((m: any) => m.status === 'agendada' || m.status === 'remarcada');

  return (
    <Shell title="CRM" crumb={`CRM / Leads / ${lead.name}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="label accent">Ficha do lead</span>
          <h1 className="h-page">{lead.name}</h1>
          <div className="muted small">
            {[lead.companyName, lead.cnpj, lead.city && `${lead.city}${lead.uf ? '/' + lead.uf : ''}`, lead.phone, lead.email]
              .filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!demo && (
            <select
              value={lead.operationId ?? ''}
              onChange={async (e) => {
                try {
                  await api(`/crm/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ operationId: e.target.value }) });
                  setFlash(e.target.value ? 'Lead vinculado à oportunidade.' : 'Vínculo removido.');
                  load();
                } catch (err: any) { setError(err?.message ?? 'Falha ao vincular.'); }
              }}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--text)', padding: '7px 10px', fontSize: 12.5 }}
              title="Oportunidade vinculada — a captação deste lead aponta para ela"
            >
              <option value="">sem oportunidade</option>
              {ops.map((o) => <option key={o.id} value={o.id}>{o.code}</option>)}
            </select>
          )}
          <span className="chip muted" style={{ fontSize: 13 }}>{STAGE_LABEL[lead.stage] ?? lead.stage}</span>
        </div>
      </div>
      <CrmNav />

      {flash && <div className="chip ok" style={{ alignSelf: 'flex-start' }}>{flash}</div>}
      {error && <div className="chip neg" style={{ alignSelf: 'flex-start' }}>{error}</div>}
      {demo && (
        <div className="card" style={{ borderColor: 'rgba(232,196,104,.4)', padding: 12 }}>
          <span className="chip projection">DEMO</span>
          <span className="small muted" style={{ marginLeft: 10 }}>Tabulação e agendamento operam no modo REAL.</span>
        </div>
      )}

      <div className="grid12">
        {/* Tabulação (span 7) */}
        <div className="span7 card">
          <span className="label accent" style={{ display: 'block', marginBottom: 14 }}>Tabular ligação</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {(demo ? demoOutcomes : outcomes).map((o: any) => (
              <button
                key={o.id}
                className={`btn small ${outcomeId === o.id ? 'primary' : 'secondary'}`}
                disabled={demo}
                onClick={() => setOutcomeId(o.id)}
              >
                {o.name}
              </button>
            ))}
          </div>
          {selOutcome?.requiresCallback && (
            <div className="field" style={{ marginBottom: 12, maxWidth: 280 }}>
              <label>Retorno agendado para *</label>
              <input type="datetime-local" value={callbackAt} onChange={(e) => setCallbackAt(e.target.value)} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div className="field" style={{ flex: 2, minWidth: 220 }}>
              <label>Observações da ligação</label>
              <input value={tabNotes} onChange={(e) => setTabNotes(e.target.value)} disabled={demo} />
            </div>
            <div className="field" style={{ width: 130 }}>
              <label>Duração (seg)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} disabled={demo} />
            </div>
          </div>
          <button className="btn primary" disabled={demo || !outcomeId || busy || (selOutcome?.requiresCallback && !callbackAt)} onClick={tabulate}>
            {busy ? 'Registrando…' : 'Registrar tabulação'}
          </button>
          {selOutcome?.isDnc && (
            <span className="small" style={{ color: 'var(--neg)', marginLeft: 12 }}>
              Esta tabulação coloca o telefone na lista "não ligar".
            </span>
          )}
        </div>

        {/* Reunião (span 5) */}
        <div className="span5 card">
          <span className="label accent" style={{ display: 'block', marginBottom: 14 }}>Agendar reunião de apresentação</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className={`btn small ${mtMode === 'video' ? 'primary' : 'secondary'}`} disabled={demo} onClick={() => setMtMode('video')}>Meet / vídeo</button>
            <button className={`btn small ${mtMode === 'presencial' ? 'primary' : 'secondary'}`} disabled={demo} onClick={() => setMtMode('presencial')}>Presencial</button>
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Data e hora *</label>
            <input type="datetime-local" value={mtWhen} onChange={(e) => setMtWhen(e.target.value)} disabled={demo} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>{mtMode === 'video' ? 'Link da chamada' : 'Endereço'}</label>
            <input value={mtWhere} onChange={(e) => setMtWhere(e.target.value)} disabled={demo} placeholder={mtMode === 'video' ? 'https://meet.google.com/…' : 'Av. …, Manaus'} />
          </div>
          <button className="btn primary" disabled={demo || !mtWhen || mtBusy} onClick={scheduleMeeting}>
            {mtBusy ? 'Agendando…' : 'Agendar'}
          </button>
          <p className="small muted-3" style={{ margin: '12px 0 0' }}>Ao agendar, o lead avança para Prospect. A reunião apresenta a estrutura MAZARI.</p>
        </div>

        {/* Reuniões abertas (span 12) */}
        {openMeetings.length > 0 && (
          <div className="span12 card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 20px' }}><span className="label">Reuniões abertas</span></div>
            <table className="table">
              <tbody>
                {openMeetings.map((m: any) => (
                  <tr key={m.id}>
                    <td>{m.mode === 'video' ? 'Meet / vídeo' : 'Presencial'}</td>
                    <td>{fmtDT(m.scheduledAt)}</td>
                    <td className="muted">{m.location ?? '—'}</td>
                    <td><span className="chip warn">{m.status.toUpperCase()}</span></td>
                    <td className="num" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn small primary" disabled={demo} onClick={() => closeMeeting(m.id, 'realizada')} style={{ marginRight: 6 }}>Realizada</button>
                      <button className="btn small secondary" disabled={demo} onClick={() => closeMeeting(m.id, 'nao_compareceu')} style={{ marginRight: 6 }}>Não compareceu</button>
                      <button className="btn small secondary" disabled={demo} onClick={() => closeMeeting(m.id, 'cancelada')}>Cancelar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Timeline (span 12) */}
        <div className="span12 card">
          <h2 className="h-section" style={{ marginBottom: 8 }}>Linha do tempo</h2>
          {[...meetings.map((m: any) => ({
              at: m.scheduledAt, kind: 'meeting',
              text: `Reunião ${m.mode === 'video' ? 'por vídeo' : 'presencial'} — ${m.status}${m.notes ? ` · ${m.notes}` : ''}`,
              chip: m.status === 'realizada' ? 'ok' : m.status === 'nao_compareceu' ? 'neg' : 'warn',
            })),
            ...attempts.map((a: any) => ({
              at: a.startedAt, kind: 'call',
              text: `Ligação — ${a.outcome ?? 'sem tabulação'}${a.durationSec ? ` · ${a.durationSec}s` : ''}${a.notes ? ` · ${a.notes}` : ''}`,
              chip: KIND_CHIP[a.outcomeKind] ?? 'muted',
            }))]
            .sort((a, b) => +new Date(b.at) - +new Date(a.at))
            .map((ev, i) => (
              <div className="feed-item" key={i}>
                <span className="dot" style={{ background: ev.kind === 'meeting' ? 'var(--warn)' : 'var(--accent)' }} />
                <span>{ev.text}</span>
                <time>{fmtDT(ev.at)}</time>
              </div>
            ))}
          {attempts.length === 0 && meetings.length === 0 && <p className="muted">Nenhuma atividade ainda — primeira ligação define o rumo.</p>}
          {lead.notes && <p className="small muted" style={{ marginTop: 12 }}>Notas: {lead.notes}</p>}
        </div>
      </div>
    </Shell>
  );
}

// Tabulações exibidas no modo demo (espelho do seed real).
const demoOutcomes = [
  { id: 'd1', name: 'Atendeu — interessado' },
  { id: 'd2', name: 'Atendeu — retorno agendado' },
  { id: 'd3', name: 'Atendeu — sem interesse' },
  { id: 'd4', name: 'Atendeu — fora do perfil' },
  { id: 'd5', name: 'Não atendeu / caixa postal' },
  { id: 'd6', name: 'Número inválido' },
  { id: 'd7', name: 'Pediu para não ligar' },
];
