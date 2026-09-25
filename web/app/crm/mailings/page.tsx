'use client';
import Shell from '@/components/Shell';
import CrmNav from '@/components/CrmNav';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDataMode } from '@/lib/data-mode';
import { api, getAuth } from '@/lib/api';

// Import de mailing B2B: uma linha por lead, campos separados por ponto-e-vírgula.
// nome;telefone;empresa;cnpj;cidade;uf
export default function MailingsPage() {
  const { mode } = useDataMode();
  const demo = mode === 'demo';
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [lgpd, setLgpd] = useState('Legítimo interesse — prospecção B2B');
  const [raw, setRaw] = useState('');
  const [ops, setOps] = useState<any[]>([]);
  const [operationId, setOperationId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (demo || !getAuth()) return;
    api<any[]>('/crm/operation-options').then(setOps).catch(() => {});
  }, [demo]);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<{ imported: number; skippedDnc: number; skippedInvalid: number } | null>(null);

  const parsed = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [nome, phone, companyName, cnpj, city, uf] = l.split(';').map((s) => s?.trim());
      return { name: nome, phone: phone || undefined, companyName: companyName || undefined, cnpj: cnpj || undefined, city: city || undefined, uf: uf || undefined };
    });

  async function submit() {
    setBusy(true); setError(null); setReport(null);
    try {
      if (!getAuth()) throw new Error('Faça login para importar (modo REAL).');
      const batch = await api<any>('/crm/batches', {
        method: 'POST',
        body: JSON.stringify({ name, source: source || undefined, lgpdBasis: lgpd || undefined }),
      });
      const r = await api<{ imported: number; skippedDnc: number; skippedInvalid: number }>(
        `/crm/batches/${batch.id}/leads`,
        { method: 'POST', body: JSON.stringify({ leads: parsed, operationId: operationId || undefined }) },
      );
      setReport(r);
      setRaw('');
    } catch (e: any) { setError(e?.message ?? 'Falha no import.'); }
    finally { setBusy(false); }
  }

  return (
    <Shell title="CRM" crumb="CRM / Mailings">
      <div>
        <span className="label accent">Telemarketing B2B</span>
        <h1 className="h-page">Importar mailing</h1>
      </div>
      <CrmNav />

      {demo && (
        <div className="card" style={{ borderColor: 'rgba(232,196,104,.4)', padding: 12 }}>
          <span className="chip projection">DEMO</span>
          <span className="small muted" style={{ marginLeft: 10 }}>Importação funciona no modo REAL (Presidência/Diretor).</span>
        </div>
      )}

      <div className="grid12">
        <div className="span7 card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="field"><label>Nome do mailing *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lista B2B Manaus — out/2026" disabled={demo} /></div>
            <div className="field"><label>Fornecedor / origem da lista</label><input value={source} onChange={(e) => setSource(e.target.value)} disabled={demo} /></div>
          </div>
          <div className="field"><label>Base legal (LGPD)</label><input value={lgpd} onChange={(e) => setLgpd(e.target.value)} disabled={demo} /></div>
          <div className="field">
            <label>Vincular o lote a uma oportunidade (opcional)</label>
            <select value={operationId} onChange={(e) => setOperationId(e.target.value)} disabled={demo}>
              <option value="">— sem vínculo —</option>
              {ops.map((o) => <option key={o.id} value={o.id}>{o.code} · {o.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Leads — um por linha: nome;telefone;empresa;cnpj;cidade;uf</label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              disabled={demo}
              placeholder={'João Pereira;(92) 9 8888-0000;Pereira Comércio;12.345.678/0001-00;Manaus;AM\nAna Souza;(92) 9 7777-0000;Souza Log;;Manaus;AM'}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 10, color: 'var(--text)', padding: 12, fontFamily: 'var(--font-mono)', fontSize: 12.5, resize: 'vertical' }}
            />
          </div>
          {error && <div className="chip neg" style={{ alignSelf: 'flex-start' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn primary" disabled={demo || busy || !name.trim() || parsed.length === 0} onClick={submit}>
              {busy ? 'Importando…' : `Importar ${parsed.length} lead${parsed.length === 1 ? '' : 's'}`}
            </button>
            <span className="small muted-3">máx. 5.000 por importação · telefones na lista "não ligar" são barrados na porta</span>
          </div>
          {report && (
            <div className="card accent" style={{ padding: 14 }}>
              <span className="label accent" style={{ display: 'block', marginBottom: 8 }}>Relatório da importação</span>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                <span><strong>{report.imported}</strong> importados</span>
                <span className="muted"><strong>{report.skippedDnc}</strong> barrados por DNC</span>
                <span className="muted"><strong>{report.skippedInvalid}</strong> inválidos (sem nome)</span>
              </div>
              <Link href="/crm/leads" className="small" style={{ display: 'inline-block', marginTop: 8 }}>Ver leads importados →</Link>
            </div>
          )}
        </div>

        <div className="span5 card" style={{ alignSelf: 'start' }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>Como funciona</span>
          <div className="small muted" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span>1 · O mailing fica registrado com origem e base legal — cada lista vira um lote rastreável.</span>
            <span>2 · Telefones da lista "não ligar" (DNC) são recusados automaticamente, com relatório.</span>
            <span>3 · Os leads entram no canal <strong>Telemarketing</strong> e caem na fila da esteira.</span>
            <span>4 · A conversão por mailing mede a qualidade de cada lista comprada — pare de pagar por lista ruim.</span>
            <span>5 · Com a 3C Plus contratada, o lote sobe como campanha no discador via API.</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}
