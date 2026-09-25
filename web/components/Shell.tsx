'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDataMode } from '@/lib/data-mode';
import { getAuth, setAuth } from '@/lib/api';
import { useEffect, useState, type ReactNode } from 'react';
import { Icon, IC } from './icons';

// Menu do MAZARI COMMAND conforme o Mapa de Telas (10 módulos, com ícones
// oficiais). O item CRM é uma ponte temporária: pertence ao portal SALES,
// mas fica acessível aqui até os portais se separarem por perfil.
const MENU: Array<{ href: string; label: string; icon: keyof typeof IC; soon?: boolean; bridge?: boolean }> = [
  { href: '/', label: 'Command Center', icon: 'dashboard' },
  { href: '/oportunidades', label: 'Oportunidades', icon: 'target' },
  { href: '/operacoes', label: 'Operações', icon: 'building' },
  { href: '/estrutura', label: 'Estrutura', icon: 'org', soon: true },
  { href: '/comissoes', label: 'Comissões', icon: 'percent', soon: true },
  { href: '/pagamentos', label: 'Pagamentos', icon: 'wallet', soon: true },
  { href: '/metas', label: 'Metas e prêmios', icon: 'trophy', soon: true },
  { href: '/feed', label: 'Feed', icon: 'activity' },
  { href: '/auditoria', label: 'Auditoria', icon: 'shield', soon: true },
  { href: '/configuracoes', label: 'Configurações', icon: 'sliders', soon: true },
  { href: '/crm', label: 'CRM · Sales', icon: 'funnel', bridge: true },
];

function LogoM() {
  return (
    <svg width="26" height="24" viewBox="0 0 60 56">
      <polyline points="6,52 6,8 30,30 54,8 54,52" fill="none" stroke="#F5F7FA" strokeWidth="7" />
      <rect x="26" y="40" width="8" height="12" fill="#52FF9D" />
    </svg>
  );
}

export function ModeToggle() {
  const { mode, setMode } = useDataMode();
  return (
    <div className="mode-toggle" title="DEMO: dados ilustrativos · REAL: API viva">
      <button className={mode === 'demo' ? 'on-demo' : ''} onClick={() => setMode('demo')}>
        DEMO
      </button>
      <button className={mode === 'real' ? 'on-real' : ''} onClick={() => setMode('real')}>
        REAL
      </button>
    </div>
  );
}

export function MazariLoading() {
  return (
    <div className="mz-loading" role="status" aria-label="Carregando">
      {'MAZARI'.split('').map((ch, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>{ch}</span>
      ))}
      <div className="label" style={{ marginTop: 10 }}>CARREGANDO</div>
    </div>
  );
}

export default function Shell({ title, crumb, children }: { title: string; crumb?: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useDataMode();
  const [userName, setUserName] = useState<string | null>(null);
  useEffect(() => {
    setUserName(getAuth()?.user?.name ?? null);
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">
          <LogoM />
          <span className="mono">MAZARI · COMMAND</span>
        </div>
        {MENU.map((m) => {
          const active = pathname === m.href || (m.href !== '/' && pathname.startsWith(m.href));
          return (
            <Link key={m.href} href={m.href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon name={m.icon} />
              {m.label}
              {m.soon && <span className="soon">EM BREVE</span>}
              {m.bridge && <span className="soon">SALES</span>}
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        {userName ? (
          <button
            className="nav-item"
            onClick={() => {
              setAuth(null);
              router.push('/login');
            }}
          >
            <span className="avatar">{userName.slice(0, 2).toUpperCase()}</span>
            {userName} · sair
          </button>
        ) : (
          <Link href="/login" className="nav-item">
            Entrar (modo real)
          </Link>
        )}
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="crumb">{crumb ?? title}</span>
          {mode === 'demo' && <span className="chip projection">DEMO · VALORES ILUSTRATIVOS</span>}
          <span className="spacer" />
          <div className="searchbox" title="Busca global — ativa junto com os módulos">
            <input placeholder="Buscar operação, pessoa, documento…" disabled />
            <kbd>⌘K</kbd>
          </div>
          <ModeToggle />
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
