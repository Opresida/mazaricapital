# ARCHITECTURE — MAZARI CAPITAL

## Fase atual: site estático (este repo)

Sem framework, sem build, sem dependências externas de JS. Deployável em qualquer hosting estático (Netlify sem build, publish dir = `site`).

- `site/index.html` — todas as 17 seções, estilos inline (fidelidade 1:1 com o design aprovado) + meta/SEO/favicon + overlay da intro.
- `site/css/styles.css` — base (reset, fontes, cores) e estados de hover.
- `site/js/app.js` — toda a interatividade em JavaScript puro (IIFE, sem globals).
- `site/js/intro.js` — intro do logo, variação 2c "Sinal → Fundação" (APROVADA no Claude Design). Port em JS puro do componente canônico `design/components/MazariIntro.tsx` (Next.js/React/TS, reservado para a fase SaaS). Toca 1x por sessão (sessionStorage `mazari-intro-seen`), clique/Esc pula, respeita `prefers-reduced-motion`; timeline: sinal desenha o M → porta com onda → MAZARI sai do desfoque → CAPITAL entra da direita (3,3 s + 0,7 s hold, fade 600 ms).
- Fontes: Google Fonts (Inter 400/500/600, JetBrains Mono 400/500, Space Grotesk 400–700) — substituem os woff2 embutidos do bundle.

### Conversão do handoff Claude Design

Origem: `design/handoff/MAZARI-Capital-Site.bundle.html` (bundle auto-extraível com manifest gzip+base64, template em DSL própria e lógica em classe `DCLogic`/React UMD).

O que foi convertido e como:

| Original (bundle) | Convertido para |
|---|---|
| Template DSL (`sc-for`, `sc-if`, `{{ }}`, `sc-camel-on-click`) | HTML estático + render via JS onde é dinâmico |
| `style-hover="..."` | Classes CSS (`.nav-a`, `.btn-solid`, `.btn-ghost`, `.step-btn`, `.auto-btn`, `.faq-q`) |
| `sc-camel-view-box` | `viewBox` |
| Classe `DCLogic` (React) | IIFE em `js/app.js` |
| Fontes woff2 embutidas (base64) | Google Fonts |
| React/ReactDOM UMD | removidos (não são necessários) |

Comportamentos preservados (paridade com o original):

1. **Feed "AO VIVO"** do hero: 5 eventos, novo item a cada 2,6 s, opacidade decrescente.
2. **Pacotes animados** no diagrama Participantes→MAZARI→Operação→Resultado (RAF, ciclo 5,2 s).
3. **Ticker** contínuo (marquee via translateX).
4. **Pulso** dos indicadores verdes (box-shadow senoidal).
5. **9 etapas** com auto-avanço a cada 5 s, barra de progresso, botão ❚❚ PAUSAR / ▶ REPRODUZIR, clique manual pausa o auto.
6. **Reveal on scroll** (IntersectionObserver, threshold .15, delays por card).
7. **Contadores** R$ com easing cúbico (1,4 s) e **barras data-fill**.
8. **Simulador**: cotas × total (10/20/40) × custo (150–300k) × VGV (250–500k) × tecnologia (12/7/5 meses); impostos 10% do bruto; split 75/25; barra de destino do VGV; todos os formatos pt-BR idênticos.
9. **Abas do portal** (Minha carteira / Operação MH-001 / Documentos).
10. **FAQ acordeão** (um aberto por vez, primeiro aberto por padrão).

Extras adicionados na conversão: `lang="pt-BR"`, title/description/OG, favicon SVG, `prefers-reduced-motion` (desliga animações decorativas), preconnect das fontes.

## Fase futura: SaaS (spec canônica em docs/)

Stack proposta na spec: Next.js + React + TypeScript, Node/NestJS, PostgreSQL, storage S3-compatible, Three.js/R3F, Recharts, REST versionada.

- **4 motores**: Operation Engine, Capital Engine, Sales Engine, Performance Engine.
- **4 portais**: MAZARI COMMAND (presidência), MAZARI SALES, MAZARI PARTNERS (cotistas), MAZARI OPERATIONS.
- ~37 entidades de banco (User…AuditLog), comissão como **regra versionada**, audit log completo, Data Room por operação, RBAC + isolamento por unidade/organização + anti-IDOR.
- O site atual vira a porta de entrada pública; o portal ilustrado na seção "Portal" é o blueprint do MAZARI PARTNERS.
