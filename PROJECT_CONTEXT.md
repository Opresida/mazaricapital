# PROJECT_CONTEXT — MAZARI CAPITAL

Histórico de sessões e estado do projeto. Atualizar ao final de cada sessão relevante.

## 2026-09-23 — Nascimento do projeto

1. **Spec canônica consolidada**: Humberto trouxe a especificação de 42 seções do SaaS (gerada no ChatGPT, conferida por diff — link e MD 100% convergentes; o MD acrescenta a Nota de Governança). Salva em `docs/MAZARI_CAPITAL_SaaS_Especificacao_Integral_42_Itens.md`.
2. **Design aprovado no Claude Design**: handoff em bundle HTML preservado em `design/handoff/MAZARI-Capital-Site.bundle.html` (original em Downloads).
3. **Conversão para site estático**: bundle convertido para `site/` (HTML + CSS + JS puro, sem dependências), com paridade completa de conteúdo, visual e interações. Detalhes da conversão em `ARCHITECTURE.md`.
4. Estrutura de documentação padrão criada (README/CONTEXT/TODO/ARCHITECTURE/PROJECT_CONTEXT).

**Estado**: site funcional em `http://localhost:8902` (`python -m http.server 8902` dentro de `site/`). Repositório publicado: **https://github.com/Opresida/mazaricapital** (branch `main`, commit inicial `c1242aa` com tudo). Pendências principais no `TODO.md` (fotos reais, canal do consultor, revisão jurídica, deploy).

### Intro do logo (mesmo dia, mais tarde)

5. **Animação oficial do logo definida**: variação **2c "Sinal → Fundação"** aprovada no Claude Design. Componente canônico Next.js/React/TS preservado em `design/components/MazariIntro.tsx` (para a fase SaaS); portado para JS puro em `site/js/intro.js` e aplicado na abertura do site (overlay no topo do `<body>`). Toca 1x por sessão, clique/Esc pula, respeita reduced-motion. Bundle do site em Downloads conferido: idêntico ao handoff (a correção de alinhamento do logo já estava incluída).

### Ajuste de ícones do diagrama (pedido do Humberto)

6. **Divergência intencional do bundle**: no diagrama "SISTEMA MAZARI · AO VIVO" do hero, os ícones genéricos foram trocados a pedido — PARTICIPANTES = pessoas (duas silhuetas), OPERAÇÃO = martelo de construção, RESULTADO = moeda com cifrão. MAZARI permanece com o logo M. Não reverter para as formas geométricas do bundle original.

### Tela de login (/login)

7. **Login criado**: botão "Faça seu login" no header (ao lado do consultor; rótulos encurtam no mobile) → rota `/login/`. Página portada do componente aprovado `MazariLogin.tsx` (preservado em design/components/): animação Fundação 1b no logo, formulário completo, responsiva. Sem backend: envio válido informa "portal em implantação" e direciona ao consultor — decisão consciente de não simular autenticação.

### Hospedagem (decisão)

8. **Vercel escolhida como casa do projeto** (site estático agora, SaaS Next.js depois — mesmo projeto/URL evolui sem mudança de casa). `vercel.json` na raiz: sem build, outputDirectory `site`, cleanUrls. Fase 0 do SaaS: Next.js full-stack na Vercel + Neon (padrão da casa); NestJS separado só se necessário (aí Render/Fly). OG continua raiz-relativo até existir URL de produção confirmada.

**Decisões em vigor**:
- Split 75% cotistas / 25% MAZARI sobre o lucro líquido; sem taxa antecipada.
- Tudo que é exemplo leva selo ILUSTRATIVO; nenhuma projeção como resultado.
- Estrutura jurídica por operação (SPE/SCP), sistema agnóstico ao veículo.
