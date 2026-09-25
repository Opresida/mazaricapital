'use client';
import Shell from '@/components/Shell';
import Link from 'next/link';
import { useDataMode } from '@/lib/data-mode';
import { operations, fmtBRL } from '@/lib/mock';

// Mapa de Telas · módulo 02: o "prontuário" de cada ativo pós-captação.
export default function OperacoesPage() {
  const { mode } = useDataMode();
  return (
    <Shell title="Operações" crumb="Operações">
      <div>
        <span className="label accent">Operation Engine · Execução</span>
        <h1 className="h-page">Operações</h1>
      </div>
      {mode === 'real' ? (
        <div className="card empty">
          <div className="title">Nenhuma operação real cadastrada</div>
          <p>O módulo de Operações da API é a próxima fase. Alterne para DEMO para navegar no prontuário completo.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Operação</th><th>Etapa</th><th>Estrutura</th><th>Avanço físico</th><th>Avanço financeiro</th><th className="num">Capital</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.code}>
                  <td>
                    <Link href={`/operacoes/${o.code}`}>{o.code}</Link>
                    <div className="small muted-3">{o.city}</div>
                  </td>
                  <td>{o.stage}</td>
                  <td><span className="chip muted">SPE</span></td>
                  <td style={{ minWidth: 120 }}>
                    <div className="bar" style={{ marginBottom: 4 }}><span style={{ width: `${o.physicalPct}%` }} /></div>
                    <span className="small muted">{o.physicalPct}%</span>
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <div className="bar" style={{ marginBottom: 4 }}><span style={{ width: `${o.financialPct}%` }} /></div>
                    <span className="small muted">{o.financialPct}%</span>
                  </td>
                  <td className="num">{fmtBRL(o.capitalNeeded)}</td>
                  <td><span className={`chip ${o.statusChip}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}
