'use client';

/**
 * MAZARI CAPITAL — Tela de login com animação "Fundação" (1b), executada uma única vez ao abrir.
 * Uso: app/login/page.tsx →  export default function Page() { return <MazariLogin onLogin={...} /> }
 * Sem dependências. Fontes: --font-space-grotesk e --font-inter via next/font (ou "Space Grotesk"/"Inter").
 */

import { FormEvent, useEffect, useRef, useState } from 'react';

type Props = {
  /** Sua autenticação (NextAuth, API própria etc.). Lance um Error com mensagem para exibir. */
  onLogin?: (data: { email: string; password: string; remember: boolean }) => Promise<void>;
  forgotHref?: string;
  firstAccessHref?: string;
};

const C = { bg: '#020A12', panel: '#06131D', ink: '#F5F7FA', ink2: '#91A4B4', ink3: '#5E7282', green: '#52FF9D', green2: '#20D98A', line: 'rgba(255,255,255,.08)', red: '#E5736B' };
const DISPLAY = 'var(--font-space-grotesk), "Space Grotesk", system-ui, sans-serif';
const BODY = 'var(--font-inter), Inter, system-ui, sans-serif';
const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, monospace';

const DURATION = 3.0;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const doorT = (s: number) => `translate(30 46) scale(${s}) translate(-30 -46)`;

function FoundationLogo() {
  const door = useRef<SVGRectElement>(null);
  const ring = useRef<SVGRectElement>(null);
  const l1 = useRef<SVGLineElement>(null);
  const l2 = useRef<SVGLineElement>(null);
  const d1 = useRef<SVGLineElement>(null);
  const d2 = useRef<SVGLineElement>(null);
  const poly = useRef<SVGPolylineElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLDivElement>(null);
  const [showTag, setShowTag] = useState(false);

  useEffect(() => {
    const apply = (t: number) => {
      door.current?.setAttribute('transform', doorT(easeBack(seg(t, 0, 0.5))));
      const r = seg(t, 0.45, 1.2);
      ring.current?.setAttribute('opacity', String(r > 0 && r < 1 ? (1 - r) * 0.7 : 0));
      ring.current?.setAttribute('transform', doorT(1 + r * 2.2));
      const lg = easeInOut(seg(t, 0.5, 1.2));
      l1.current?.setAttribute('stroke-dashoffset', String(44 * (1 - lg)));
      l2.current?.setAttribute('stroke-dashoffset', String(44 * (1 - lg)));
      const dg = easeInOut(seg(t, 1.1, 1.7));
      d1.current?.setAttribute('stroke-dashoffset', String(32.6 * (1 - dg)));
      d2.current?.setAttribute('stroke-dashoffset', String(32.6 * (1 - dg)));
      const done = t >= 1.7;
      poly.current?.setAttribute('opacity', done ? '1' : '0');
      [l1, l2, d1, d2].forEach((r) => r.current?.setAttribute('opacity', done ? '0' : '1'));
      if (word.current) word.current.style.clipPath = `inset(0 ${(1 - easeInOut(seg(t, 1.6, 2.4))) * 100}% 0 0)`;
      if (cap.current) cap.current.style.clipPath = `inset(0 0 0 ${(1 - easeInOut(seg(t, 2.1, 2.9))) * 100}%)`;
      if (t > 2.4) setShowTag(true);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { apply(DURATION); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      apply(Math.min(t, DURATION));
      if (t < DURATION) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stroke = { stroke: C.ink, strokeWidth: 7 } as const;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '40px 0' }}>
        <svg viewBox="0 0 60 56" style={{ width: 'clamp(80px, 8vw, 112px)', height: 'auto', overflow: 'visible' }} aria-hidden="true">
          <rect ref={ring} x={26} y={40} width={8} height={12} fill="none" stroke={C.green} strokeWidth={1} opacity={0} />
          <line ref={l1} x1={6} y1={52} x2={6} y2={8} {...stroke} strokeLinecap="square" strokeDasharray={44} strokeDashoffset={44} />
          <line ref={l2} x1={54} y1={52} x2={54} y2={8} {...stroke} strokeLinecap="square" strokeDasharray={44} strokeDashoffset={44} />
          <line ref={d1} x1={6} y1={8} x2={30} y2={30} {...stroke} strokeDasharray={32.6} strokeDashoffset={32.6} />
          <line ref={d2} x1={54} y1={8} x2={30} y2={30} {...stroke} strokeDasharray={32.6} strokeDashoffset={32.6} />
          <polyline ref={poly} points="6,52 6,8 30,30 54,8 54,52" fill="none" {...stroke} opacity={0} />
          <rect ref={door} x={26} y={40} width={8} height={12} fill={C.green} transform={doorT(0)} />
        </svg>
        <div aria-label="MAZARI CAPITAL">
          <div ref={cap} style={{ fontFamily: DISPLAY, fontSize: 14, letterSpacing: '.62em', color: C.ink2, textAlign: 'right', marginBottom: 10, clipPath: 'inset(0 0 0 100%)' }}>CAPITAL</div>
          <div ref={word} style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(34px, 3.6vw, 46px)', letterSpacing: '.22em', lineHeight: 1, clipPath: 'inset(0 100% 0 0)' }}>MAZARI</div>
        </div>
      </div>
      <div style={{ opacity: showTag ? 1 : 0, transform: showTag ? 'none' : 'translateY(10px)', transition: 'opacity .8s, transform .8s' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 24, lineHeight: 1.3, marginBottom: 10, maxWidth: 420 }}>Construindo patrimônio com ativos reais.</div>
        <div style={{ fontSize: 14, color: C.ink2 }}>Operações, documentos e resultados em um único ambiente.</div>
      </div>
    </>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.ink2 }}>{label}{right}</span>
      {children}
    </label>
  );
}

export default function MazariLogin({ onLogin, forgotHref = '/recuperar-senha', firstAccessHref = '/contato' }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', height: 48, padding: name === 'password' ? '0 76px 0 14px' : '0 14px',
    background: C.panel, border: `1px solid ${focus === name ? C.green : 'rgba(255,255,255,.1)'}`, borderRadius: 10,
    color: C.ink, fontFamily: BODY, fontSize: 15, outline: 'none', transition: 'border-color .2s',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Informe um e-mail válido.');
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.');
    setLoading(true);
    try { await onLogin?.({ email, password, remember }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.'); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', background: C.bg, color: C.ink, fontFamily: BODY }}>
      <section style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, minHeight: 420,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px)',
        backgroundSize: '56px 56px', borderRight: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', color: C.ink2 }}>PLATAFORMA MAZARI</div>
        <FoundationLogo />
      </section>

      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', color: C.green, marginBottom: 14 }}>ACESSO SEGURO</div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 34, letterSpacing: '-.02em', margin: '0 0 8px' }}>Entrar na plataforma</h1>
          <p style={{ margin: '0 0 32px', fontSize: 14.5, color: C.ink2, lineHeight: 1.55 }}>Use o e-mail cadastrado. O seu perfil define o ambiente que você acessa.</p>

          <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="E-mail">
              <input type="email" autoComplete="email" placeholder="voce@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} style={inputStyle('email')} />
            </Field>
            <Field label="Senha" right={<a href={forgotHref} style={{ color: C.green, textDecoration: 'none' }}>Esqueci minha senha</a>}>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} style={inputStyle('password')} />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ position: 'absolute', right: 8, top: 8, height: 32, padding: '0 10px', background: 'transparent', border: 'none', color: C.ink2, fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', cursor: 'pointer' }}>
                  {showPw ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: C.ink2, cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.green }} />
              Manter conectado neste dispositivo
            </label>
            {error && (
              <div role="alert" style={{ padding: '12px 14px', border: '1px solid rgba(229,115,107,.4)', background: 'rgba(229,115,107,.08)', borderRadius: 10, fontSize: 13.5, color: '#F2B1AB' }}>{error}</div>
            )}
            <button type="submit" disabled={loading}
              style={{ height: 50, marginTop: 4, background: C.green, border: 'none', borderRadius: 10, color: C.bg, fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, letterSpacing: '.04em', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'background .2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.green2)} onMouseLeave={(e) => (e.currentTarget.style.background = C.green)}>
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${C.line}`, fontSize: 13.5, color: C.ink2 }}>
            Primeiro acesso? <a href={firstAccessHref} style={{ color: C.green, textDecoration: 'none' }}>Fale com o seu consultor</a>
          </div>
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', color: C.ink3 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
            CONEXÃO CRIPTOGRAFADA · ACESSOS AUDITADOS
          </div>
        </div>
      </section>
    </main>
  );
}
