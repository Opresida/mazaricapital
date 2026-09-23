'use client';

/**
 * MAZARI CAPITAL — Intro do logo (variação 2c "Sinal → Fundação")
 * Uso (app/layout.tsx ou app/page.tsx):
 *   import MazariIntro from '@/components/MazariIntro';
 *   <body> <MazariIntro /> {children} </body>
 *
 * - Toca uma vez por sessão (sessionStorage). Clique ou Esc pula.
 * - Respeita prefers-reduced-motion (não exibe).
 * - Sem dependências. Fonte: defina --font-space-grotesk via next/font ou carregue "Space Grotesk".
 */

import { useEffect, useRef, useState } from 'react';

type Props = {
  /** Mostrar só na primeira visita da sessão. Default: true */
  oncePerSession?: boolean;
  /** Multiplicador de velocidade. Default: 1 */
  speed?: number;
  /** Chamado quando a intro termina/sai. */
  onDone?: () => void;
};

const STORAGE_KEY = 'mazari-intro-seen';
const BG = '#020A12';
const INK = '#F5F7FA';
const INK_2 = '#91A4B4';
const GREEN = '#52FF9D';
const FONT = 'var(--font-space-grotesk), "Space Grotesk", system-ui, sans-serif';

const PTS: [number, number][] = [[6, 52], [6, 8], [30, 30], [54, 8], [54, 52]];
const SEGS = PTS.slice(1).map((p, i) => Math.hypot(p[0] - PTS[i][0], p[1] - PTS[i][1]));
const LEN = SEGS.reduce((a, b) => a + b, 0);

const DURATION = 3.3; // s
const HOLD = 0.7; // s parado no final antes de sair
const FADE_MS = 600;

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

function pointAt(s: number): [number, number] {
  for (let i = 0; i < SEGS.length; i++) {
    if (s <= SEGS[i]) {
      const f = s / SEGS[i];
      return [PTS[i][0] + (PTS[i + 1][0] - PTS[i][0]) * f, PTS[i][1] + (PTS[i + 1][1] - PTS[i][1]) * f];
    }
    s -= SEGS[i];
  }
  return PTS[PTS.length - 1];
}

const doorTransform = (s: number) => `translate(30 46) scale(${s}) translate(-30 -46)`;

export default function MazariIntro({ oncePerSession = true, speed = 1, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const polyRef = useRef<SVGPolylineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const doorRef = useRef<SVGRectElement>(null);
  const ringRef = useRef<SVGRectElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setLeaving(true);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
    window.setTimeout(() => { setVisible(false); onDone?.(); }, FADE_MS);
  };

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try { seen = oncePerSession && sessionStorage.getItem(STORAGE_KEY) === '1'; } catch {}
    if (reduce || seen) { setVisible(false); onDone?.(); return; }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const apply = (t: number) => {
      // 1) Sinal desenha o M
      const q = easeInOut(seg(t, 0, 1.7));
      polyRef.current?.setAttribute('stroke-dashoffset', String(LEN * (1 - q)));
      const [x, y] = pointAt(LEN * q);
      if (dotRef.current) {
        dotRef.current.setAttribute('cx', String(x));
        dotRef.current.setAttribute('cy', String(y));
        dotRef.current.setAttribute('opacity', String(q > 0 && q < 1 ? 1 : q >= 1 ? 1 - seg(t, 1.7, 1.9) : 0));
      }
      // 2) Fundação: porta surge + onda
      doorRef.current?.setAttribute('transform', doorTransform(easeBack(seg(t, 1.7, 2.2))));
      const r = seg(t, 2.0, 2.8);
      if (ringRef.current) {
        ringRef.current.setAttribute('opacity', String(r > 0 && r < 1 ? (1 - r) * 0.8 : 0));
        ringRef.current.setAttribute('transform', doorTransform(1 + r * 2.6));
      }
      // 3) MAZARI sai do desfoque, letra a letra
      letterRefs.current.forEach((el, i) => {
        if (!el) return;
        const k = easeOut(seg(t, 1.9 + i * 0.08, 2.5 + i * 0.08));
        el.style.opacity = String(k);
        el.style.filter = `blur(${(1 - k) * 8}px)`;
      });
      // 4) CAPITAL entra da direita
      if (capRef.current) capRef.current.style.clipPath = `inset(0 0 0 ${(1 - easeInOut(seg(t, 2.5, 3.2))) * 100}%)`;
    };

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = ((now - t0) / 1000) * speed;
      apply(Math.min(t, DURATION));
      if (t >= DURATION + HOLD) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (!visible) document.body.style.overflow = ''; }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      onClick={finish}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: BG,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: leaving ? 0 : 1, transition: `opacity ${FADE_MS}ms ease`, cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 2.4vw, 28px)', transform: leaving ? 'scale(.98)' : 'none', transition: `transform ${FADE_MS}ms ease` }}>
        <svg viewBox="0 0 60 56" style={{ width: 'clamp(64px, 9vw, 112px)', height: 'auto', overflow: 'visible' }}>
          <polyline points="6,52 6,8 30,30 54,8 54,52" fill="none" stroke={INK} strokeWidth={7} opacity={0.08} />
          <polyline ref={polyRef} points="6,52 6,8 30,30 54,8 54,52" fill="none" stroke={INK} strokeWidth={7} strokeDasharray={LEN} strokeDashoffset={LEN} />
          <rect ref={ringRef} x={26} y={40} width={8} height={12} fill="none" stroke={GREEN} strokeWidth={1} opacity={0} />
          <rect ref={doorRef} x={26} y={40} width={8} height={12} fill={GREEN} transform={doorTransform(0)} />
          <circle ref={dotRef} cx={6} cy={52} r={3.2} fill={GREEN} opacity={0} style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }} />
        </svg>
        <div>
          <div ref={capRef} style={{ fontFamily: FONT, fontSize: 'clamp(10px, 1.2vw, 14px)', letterSpacing: '.62em', color: INK_2, textAlign: 'right', marginBottom: 'clamp(6px, .8vw, 10px)', clipPath: 'inset(0 0 0 100%)' }}>
            CAPITAL
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 'clamp(30px, 4.2vw, 50px)', letterSpacing: '.22em', lineHeight: 1, color: INK, display: 'flex' }}>
            {'MAZARI'.split('').map((ch, i) => (
              <span key={i} ref={(el) => { letterRefs.current[i] = el; }} style={{ display: 'inline-block', opacity: 0 }}>{ch}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
