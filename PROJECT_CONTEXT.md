# PROJECT_CONTEXT — MAZARI CAPITAL

Histórico de sessões e estado do projeto. Atualizar ao final de cada sessão relevante.

## 2026-09-23 — Nascimento do projeto

1. **Spec canônica consolidada**: Humberto trouxe a especificação de 42 seções do SaaS (gerada no ChatGPT, conferida por diff — link e MD 100% convergentes; o MD acrescenta a Nota de Governança). Salva em `docs/MAZARI_CAPITAL_SaaS_Especificacao_Integral_42_Itens.md`.
2. **Design aprovado no Claude Design**: handoff em bundle HTML preservado em `design/handoff/MAZARI-Capital-Site.bundle.html` (original em Downloads).
3. **Conversão para site estático**: bundle convertido para `site/` (HTML + CSS + JS puro, sem dependências), com paridade completa de conteúdo, visual e interações. Detalhes da conversão em `ARCHITECTURE.md`.
4. Estrutura de documentação padrão criada (README/CONTEXT/TODO/ARCHITECTURE/PROJECT_CONTEXT).

**Estado**: site funcional em `http://localhost:8902` (`python -m http.server 8902` dentro de `site/`). Repositório publicado: **https://github.com/Opresida/mazaricapital** (branch `main`, commit inicial `c1242aa` com tudo). Pendências principais no `TODO.md` (fotos reais, canal do consultor, revisão jurídica, deploy).

**Decisões em vigor**:
- Split 75% cotistas / 25% MAZARI sobre o lucro líquido; sem taxa antecipada.
- Tudo que é exemplo leva selo ILUSTRATIVO; nenhuma projeção como resultado.
- Estrutura jurídica por operação (SPE/SCP), sistema agnóstico ao veículo.
