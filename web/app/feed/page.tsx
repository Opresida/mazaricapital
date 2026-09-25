'use client';
import Shell from '@/components/Shell';
import { useDataMode } from '@/lib/data-mode';
import { feed } from '@/lib/mock';

// Mapa de Telas · módulo 07: filtros (3) · linha do tempo (6) · fixados (3).
const TYPES = ['Tudo', 'Operação', 'Documento', 'Meta', 'Comissão', 'Pagamento', 'Comunicado'];

export default function FeedPage() {
  const { mode } = useDataMode();
  return (
    <Shell title="Feed" crumb="Feed MAZARI">
      <div>
        <span className="label accent">Linha do tempo da organização</span>
        <h1 className="h-page">Feed MAZARI</h1>
      </div>
      {mode === 'real' ? (
        <div className="card empty">
          <div className="title">Feed real em construção</div>
          <p>Os eventos serão gerados automaticamente pelo sistema (não editáveis), filtrados por permissão.</p>
        </div>
      ) : (
        <div className="grid12">
          <div className="span3 card" style={{ alignSelf: 'start' }}>
            <span className="label" style={{ display: 'block', marginBottom: 10 }}>Filtrar por tipo</span>
            {TYPES.map((t, i) => (
              <button key={t} className={`nav-item ${i === 0 ? 'active' : ''}`} style={{ padding: '7px 10px' }}>{t}</button>
            ))}
          </div>
          <div className="span6 card">
            <h2 className="h-section" style={{ marginBottom: 8 }}>Acontecimentos</h2>
            {feed.map((f, i) => (
              <div className="feed-item" key={i}>
                <span className="dot" />
                <span>{f.text}</span>
                <time>{f.time}</time>
              </div>
            ))}
          </div>
          <div className="span3 card" style={{ alignSelf: 'start', borderColor: 'var(--accent-border)' }}>
            <span className="label accent" style={{ display: 'block', marginBottom: 10 }}>Fixado pela Presidência</span>
            <p className="small" style={{ margin: 0 }}>
              Campanha de outubro começa dia 01/10. Metas e premiações serão publicadas aqui no Feed.
            </p>
          </div>
        </div>
      )}
    </Shell>
  );
}
