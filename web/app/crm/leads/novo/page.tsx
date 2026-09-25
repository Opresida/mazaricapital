'use client';
import Shell from '@/components/Shell';
import CrmNav from '@/components/CrmNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDataMode } from '@/lib/data-mode';
import { api, getAuth } from '@/lib/api';

export default function NovoLeadPage() {
  const { mode } = useDataMode();
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [ops, setOps] = useState<any[]>([]);
  const [f, setF] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const demo = mode === 'demo';

  useEffect(() => {
    if (demo || !getAuth()) return;
    api<any[]>('/crm/sources').then(setSources).catch(() => {});
    api<any[]>('/crm/referrers').then(setReferrers).catch(() => {});
    api<any[]>('/crm/operation-options').then(setOps).catch(() => {});
  }, [demo]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api<any>('/crm/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: f.name, companyName: f.companyName || undefined, cnpj: f.cnpj || undefined,
          city: f.city || undefined, uf: f.uf || undefined, phone: f.phone || undefined,
          email: f.email || undefined, notes: f.notes || undefined,
          sourceId: f.sourceId || undefined, referrerId: f.referrerId || undefined,
          operationId: f.operationId || undefined,
        }),
      });
      router.push(`/crm/leads/${created.id}`);
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao criar lead.');
      setBusy(false);
    }
  }

  return (
    <Shell title="CRM" crumb="CRM / Leads / Novo">
      <div>
        <span className="label accent">Sales Engine</span>
        <h1 className="h-page">Novo lead</h1>
      </div>
      <CrmNav />
      {demo && (
        <div className="card" style={{ borderColor: 'rgba(232,196,104,.4)' }}>
          <span className="chip projection">DEMO</span>
          <span className="small muted" style={{ marginLeft: 10 }}>Cadastro funciona no modo REAL (alterne no topo e faça login).</span>
        </div>
      )}
      <form onSubmit={submit} className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, maxWidth: 900 }}>
        <div className="field"><label>Nome do contato *</label><input required value={f.name ?? ''} onChange={set('name')} disabled={demo} /></div>
        <div className="field"><label>Empresa</label><input value={f.companyName ?? ''} onChange={set('companyName')} disabled={demo} /></div>
        <div className="field"><label>CNPJ</label><input value={f.cnpj ?? ''} onChange={set('cnpj')} placeholder="00.000.000/0000-00" disabled={demo} /></div>
        <div className="field"><label>Telefone</label><input value={f.phone ?? ''} onChange={set('phone')} placeholder="(92) 9 0000-0000" disabled={demo} /></div>
        <div className="field"><label>E-mail</label><input type="email" value={f.email ?? ''} onChange={set('email')} disabled={demo} /></div>
        <div className="field"><label>Cidade</label><input value={f.city ?? ''} onChange={set('city')} disabled={demo} /></div>
        <div className="field"><label>UF</label><input value={f.uf ?? ''} onChange={set('uf')} maxLength={2} placeholder="AM" disabled={demo} /></div>
        <div className="field">
          <label>Canal de origem</label>
          <select value={f.sourceId ?? ''} onChange={set('sourceId')} disabled={demo}>
            <option value="">— selecionar —</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Quem indicou (opcional)</label>
          <select value={f.referrerId ?? ''} onChange={set('referrerId')} disabled={demo}>
            <option value="">— nenhum —</option>
            {referrers.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.kind}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Oportunidade (opcional)</label>
          <select value={f.operationId ?? ''} onChange={set('operationId')} disabled={demo}>
            <option value="">— sem vínculo —</option>
            {ops.map((o) => <option key={o.id} value={o.id}>{o.code} · {o.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Observações</label>
          <input value={f.notes ?? ''} onChange={set('notes')} disabled={demo} />
        </div>
        {error && <div className="chip neg" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>{error}</div>}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button className="btn primary" type="submit" disabled={demo || busy}>{busy ? 'Salvando…' : 'Cadastrar lead'}</button>
          <Link href="/crm/leads"><button className="btn secondary" type="button">Cancelar</button></Link>
        </div>
        <p className="small muted-3" style={{ gridColumn: '1 / -1', margin: 0 }}>
          Telefone na lista "não ligar" (DNC) é recusado automaticamente. O dono do lead é você; Presidência e gestores podem atribuir a outro membro.
        </p>
      </form>
    </Shell>
  );
}
