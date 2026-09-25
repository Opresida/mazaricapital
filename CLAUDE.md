# CLAUDE.md — MAZARI CAPITAL

> "Construindo patrimônio com ativos reais."

Plataforma de estruturação, administração e execução de operações em ativos reais (linha MAZARI HOUSE — terrenos, casas, obras). A MAZARI entra com tecnologia, estruturação, administração e execução; o capital vem dos participantes de cada operação, dentro da estrutura jurídica definida para aquele negócio. A MAZARI **não imobiliza capital próprio** e **não cobra taxa antecipada**.

## Estado do projeto

- **Site institucional**: PRONTO. Estático, sem build, em `site/`. Deploy Vercel (https://mazaricapital.vercel.app), repo GitHub Opresida/mazaricapital.
- **SaaS backend**: EM CONSTRUÇÃO em `api/` — NestJS + Drizzle + PostgreSQL (Neon). Modelagem do banco COMPLETA (55 tabelas, ver `docs/MODELO_DE_DADOS.md`), incluindo controladoria (empresa × obra separados) e CRM telemarketing (esteira de ligações, ver `docs/CRM_TELEMARKETING.md`; discador 3C Plus como motor por trás — nosso CRM é o dono do funil); Implementados: seed idempotente (`npm run db:seed`), módulo auth (JWT: /auth/login, /auth/me, /auth/change-password; JwtAuthGuard + RolesGuard `@Roles`), AuditService (append-only; `logIn` p/ mesma transação) e **módulo CRM completo** (`/api/v1/crm`: fila da esteira, leads, tabulação transacional, reuniões, kanban, catálogos, mailings, DNC — escopo T/U/E/P via `crm-scope.service.ts`; endpoints em docs/CRM_TELEMARKETING.md; smoke test 16/16). Escopo fino T/U/E/P/L é aplicado nas queries de cada módulo. Banco Neon CRIADO e migrado (projeto `sweet-cherry-75628492`, branch production, 55 tabelas aplicadas em 2026-09-26; connection string em `api/.env`, fora do Git). Storage: Cloudflare R2, bucket privado `mazaricapital` (conta compartilhada com GLOMAM/DaP; credenciais em `api/.env`; acesso testado — upload/list/delete OK).
- **Portal (front)**: EM CONSTRUÇÃO em `web/` — Next.js 15 + React 19, CSS puro com os tokens da Base UI (sem Tailwind). **Toggle DEMO ⇄ REAL** no topbar (mock espelha o formato real; chip DEMO tracejado âmbar — nunca verde). Telas prontas: /login (componente canônico MazariLogin + auth real), / (Command Center), /oportunidades (layout do mapa: KPIs+grade+funil/checklist), /operacoes (+ /operacoes/[code] com as 12 abas do mapa — cadeia completa em demo), /feed, e o **CRM operacional completo**: /crm (fila + kanban), /crm/leads (lista/filtros/paginação), /crm/leads/novo, /crm/leads/[id] (ficha: tabulação 1-clique c/ efeitos, agendar reunião, timeline), /crm/agenda (minhas × escopo, realizar/no-show/remarcar), /crm/mailings (import c/ relatório DNC). No modo REAL tudo opera contra a API; no DEMO, espelho com ações travadas. Módulos restantes = "em construção".
- Rodar o site: `cd site && python -m http.server 8902` (só informar a URL; o usuário usa o próprio browser).
- API: `cd api && npm run typecheck` · `npm run db:generate` · `npm run db:seed` · `npm run start:dev` (porta 3200, prefixo `/api/v1`, CORS aberto p/ dev).
- Portal: `cd web && npm run dev` (porta 3300). Login real usa o usuário da presidência do seed.

## Documentos canônicos (ler antes de decidir qualquer coisa)

| Documento | Conteúdo |
|---|---|
| `docs/MAZARI_CAPITAL_SaaS_Especificacao_Integral_42_Itens.md` | Spec integral do ecossistema (42 seções) — fonte da verdade do produto |
| `docs/MAPA_DE_TELAS.md` | 9 módulos: objetivo, entidades, regras de viabilidade, RBAC por perfil, mobile |
| `docs/BASE_UI.md` | Design system: cores, tipografia, espaçamento, componentes, regras mobile |
| `CONTEXT.md` | Contexto de negócio resumido |
| `ARCHITECTURE.md` | Arquitetura do site atual + notas da conversão do Claude Design |
| `TODO.md` | Pendências |

## Regras de negócio INEGOCIÁVEIS

1. **Resultado só existe depois da venda**: `RECEITA − CUSTOS − TRIBUTOS − DESPESAS − RESERVAS = RESULTADO`. O sistema **nunca** fabrica rentabilidade nem apresenta projeção como resultado realizado. Todo valor estimado leva o rótulo "Projeção" (na UI: borda tracejada, **nunca verde**).
2. **Divisão do lucro líquido**: referência 75% cotistas / 25% MAZARI — mas a regra é **registrada por operação** (configurável, agnóstica ao veículo).
3. **Capital confirmado é a única base**: pipeline `lead → prospect → participante → capital confirmado`. Cadastro/lead **não** é produção. Comissão, meta e captação contam **somente** capital confirmado.
4. **Comissão é regra versionada**, nunca um percentual no cadastro do usuário. A regra é a **combinação (quem recebe × quem vendeu)** — supervisor e diretor também vendem: supervisor×supervisor (produção própria) e diretor×supervisor (override sobre venda do supervisor) têm percentuais próprios definidos pela Presidência; diretor×diretor = comissão **toda do diretor**, sem override acima (a Presidência já recebe pelo capital da operação). Metas: venda própria do supervisor **conta na meta da equipe dele** (ele é o líder); meta da unidade agrega toda a produção da unidade. Fluxo: análise jurídica → definição → aprovação administrativa → configuração → ativação. Mudança de regra **não recalcula** comissões já adquiridas. Extrato imutável: correção entra como **ajuste com motivo**.
5. **Estados de comissão**: Pendente → Disponível → Em saque → Pago.
6. **Pagamentos**: dupla aprovação acima de valor definido (quem aprova ≠ quem paga); status só vira "Pago" com comprovante anexado; conta/PIX validado no nome do beneficiário; distribuição só após apuração aprovada, com memória de cálculo individual por cota.
7. **Isolamento por operação**: cada operação tem estrutura jurídica própria (SPE/SCP/outra), conta própria, orçamento versionado. Nenhuma operação se mistura com outra nem com as contas da MAZARI. O SaaS é **agnóstico ao veículo** — a tecnologia não pré-determina conclusão jurídica.
8. **Publicação de oportunidade só com checklist completo**: matrícula, orçamento, cronograma, estrutura jurídica e contrato modelo. Status: Rascunho → Em análise → Aprovada → Publicada → Captação encerrada. A Presidência define a **unidade autorizada** (quem enxerga).
9. **Audit log append-only**: quem, o quê, quando, onde, valor anterior, novo valor, motivo. Nada é apagado ou editado. Obrigatório para comissões, pagamentos, metas, alterações financeiras, documentos, hierarquia, permissões e operações.
10. **Atribuição de origem rastreável**: todo cotista tem consultor de origem (Cotista → Consultor → Supervisor → Diretor → Unidade → Operação). Transferências têm vigência e motivo, e não mudam comissões já adquiridas.
11. **Nota de governança**: a spec é blueprint interno — não é oferta pública, prospecto nem instrumento de investimento. Disclaimers e selos "ILUSTRATIVO" do site **não podem ser removidos** sem análise jurídica.

## Hierarquia e portais

Presidente → Diretor (unidade) → Supervisor → Consultor → Cotista/Participante.

| Portal | Quem | Menu desktop |
|---|---|---|
| **MAZARI COMMAND** | Presidência | Command Center, Oportunidades, Operações, Estrutura, Comissões, Pagamentos, Metas e prêmios, Feed, Auditoria, Configurações |
| **MAZARI SALES** | Diretor / Supervisor / Consultor | Painel, Oportunidades, Operações/Equipe/CRM, Produção, Metas, Comissões, Feed |
| **MAZARI PARTNERS** | Cotista | Início, Oportunidades, Minha carteira, Documentos, Distribuições, Relatórios |
| **MAZARI OPERATIONS** | Gestão de operações/ativos | Obra, orçamento, documentos, venda, resultado |

**4 motores**: Operation Engine (negócio), Capital Engine (participantes/capital/distribuições), Sales Engine (estrutura comercial/leads/produção), Performance Engine (comissões/metas/campanhas/prêmios).

**9 módulos** (detalhe completo em `docs/MAPA_DE_TELAS.md`): Oportunidades, Operações, Estrutura, Comissões, Pagamentos, Metas e prêmios, Feed, Auditoria, Configurações — + Command Center. Níveis de acesso RBAC: **T**otal, **U**nidade, **E**quipe, **P**róprio, **L**eitura, **N**enhum.

## Stack (definida na spec)

- **Frontend**: Next.js + React + TypeScript · **3D**: Three.js / React Three Fiber · **Gráficos**: Recharts
- **Backend**: Node.js / NestJS · **API**: REST versionada
- **Banco**: PostgreSQL · **Storage**: S3-compatible (documentos privados, URLs temporárias)
- **Segurança**: auth segura, RBAC, isolamento por organização/unidade, anti-IDOR, rate limiting, controle de sessão, backups, LGPD, preparação para MFA.

Entidades núcleo (ver módulos): Organization, Unit, User/Role/Permission, Director, Supervisor, Consultant, Participant, Operation, Asset, Vehicle (SPE/SCP), Document, Budget, Expense, ConstructionStage, ConstructionUpdate, Participation, Lead, Sale, Distribution, CommissionRule, CommissionEvent, CommissionLedger, Payment, Goal, GoalRule, Campaign, Prize, PrizeAward, Notification, AuditLog.

## Design (resumo — completo em docs/BASE_UI.md)

Dark: bg `#020A12`, surface `#06131D`, accent `#52FF9D` (hover `#20D98A`), text `#F5F7FA`/`#91A4B4`/`#5E7282`, atenção `#E8C468`, negativo `#E5736B`. Fontes (Google Fonts, pesos FECHADOS): Space Grotesk 400/500/600 (títulos, números importantes, valores financeiros), Inter 400/500/600 (textos, tabelas, menus, botões), JetBrains Mono 400/500 (rótulos caixa alta, códigos, metadados). Sem 700+. Base 4, raios 6–16, sidebar 240px, topbar 60px, grid 12 col. Regra de ouro da UI: "Projeção" sempre tracejado, nunca verde para valor não realizado.

## Convenções de trabalho

- **REGRA DE FRONT**: nenhuma tela nasce sem validar a anatomia contra `docs/MAPA_DE_TELAS.md` (módulos, zonas, abas, menus por perfil) e `docs/BASE_UI.md` (tokens, componentes, ícones — paths oficiais em `web/components/icons.tsx`). O design aprovado DETERMINA; desvio só com decisão explícita do Humberto.
- Idioma do produto e docs: **pt-BR**. Formatos monetários pt-BR (`R$ 4.850,00`).
- Design é único deste projeto — não replicar anatomia de outros projetos MAZARI (e vice-versa).
- Mobile: no desktop se administra; no celular se acompanha, aprova e registra (ver docs/MAPA_DE_TELAS.md §mobile).
- Antes de criar algo novo, verificar o que já existe (site, spec, docs). Docs são fotos datadas — confirmar contra o código.
- Push para o GitHub é do usuário (Humberto); commits locais ok quando pedido.
