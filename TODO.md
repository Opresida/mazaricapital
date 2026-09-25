# TODO — MAZARI CAPITAL

## Site (curto prazo)

- [ ] Substituir placeholders de imagem por fotos/renders reais:
  - [x] MAZARI HOUSE — foto da casa em site/img/mh-001-casa.jpg (selo EXEMPLO ILUSTRATIVO mantido por cima)
  - [x] ALVENARIA — foto em site/img/alvenaria-blocos.jpg
  - [x] MONOLEV — logomarca oficial em site/img/monolev-logo.png (se surgir foto real dos painéis em obra, avaliar troca p/ manter padrão do GABLOK)
- [x] Vídeo do processo GABLOK: botão no card abre modal com player oficial do YouTube (embed, não cópia; Vimeo do site deles é restrito ao domínio gablok.be)
  - [x] GABLOK — foto real do bloco em site/img/gablok-bloco.jpg
  - 3 miniaturas do "Diário da operação" (aba Operação MH-001)
- [ ] CTA "Falar com consultor": apontar para canal real (WhatsApp/formulário) — hoje é âncora `#contato`
- [ ] Confirmar e-mail real (rodapé usa `contato@mazaricapital.com.br` como placeholder)
- [ ] Revisão jurídica dos textos (disclaimers, SPE/SCP, 75/25) antes de publicar
- [x] Git: repositório publicado em https://github.com/Opresida/mazaricapital (main)
- [x] Deploy **Vercel**: https://mazaricapital.vercel.app (auto-deploy a cada push na main)
- [x] OG absoluto apontado para mazaricapital.vercel.app (todas as rotas) + og:url + canonical
- [ ] Domínio (mazaricapital.com.br?) → conectar na Vercel, trocar og/canonical para o domínio definitivo e validar no debugger do Facebook (developers.facebook.com/tools/debug)
- [x] og:image 1200×630 por rota (home e /login) — fontes em design/og/, PNGs em site/img/, pipeline Chrome headless
- [ ] Após definir o domínio: trocar og:image/twitter:image para URL absoluta (hoje é raiz-relativa; WhatsApp/Facebook preferem absoluta)

## Site (desejável)

- [ ] Menu mobile (hambúrguer) — hoje o nav rola horizontalmente no mobile, como no design original
- [ ] Analytics/pixel, se for rodar tráfego

## Marca / animação do logo (2c aprovada)

- [x] Intro 2c na abertura do site (site/js/intro.js, 1x por sessão)
- [ ] Intro 2c no carregamento do portal (fase SaaS — usar design/components/MazariIntro.tsx)
- [ ] Manual de marca com a animação oficial

## SaaS (fases seguintes — ver docs/ e ARCHITECTURE.md)

- [x] Stack definida (2026-09-25, Humberto): **NestJS + Drizzle + Neon** em `api/`
- [x] Modelagem do banco (entidades da spec, veículo-agnóstico) — 43 tabelas em `api/src/db/schema/`, migration gerada, ver docs/MODELO_DE_DADOS.md
- [x] Banco Neon criado e migrado (2026-09-26): projeto `sweet-cherry-75628492`, branch production, 55 tabelas/33 enums; DATABASE_URL em api/.env
- [x] Seed inicial (2026-09-26, `npm run db:seed` idempotente): org MAZARI CAPITAL + Unidade Manaus + presidência (Humberto) + 18 categorias do plano de contas + 7 tabulações + 5 canais + parâmetros (split 75/25, 4 tentativas/semana)
- [ ] Comunicados segmentados no Feed (pedido de Humberto 2026-09-26, "coisa pequena p/ depois"): endereçar comunicado a unidade específica, diretor específico ou equipe de supervisor específica → exigirá tabela `feed_event_targets` (evento × alvo: unit/membership/team/role)
- [x] CRM API (2026-09-26): módulo completo em api/src/crm/ — fila da esteira (callbacks primeiro, DNC + 4 tentativas/semana), leads CRUD, tabulação transacional com efeitos (callback/DNC/estágio), reuniões (agendar/realizar/no-show/remarcar), kanban, catálogos (tabulações/canais/indicadores), mailings com import filtrado por DNC. Escopo RBAC nas queries. Smoke test 16/16 ✓
- [x] CRM front operacional (2026-09-26): /crm/leads (lista+filtros+paginação), /crm/leads/novo, /crm/leads/[id] (ficha: tabulação 1-clique com efeitos + agendar reunião + timeline), /crm/agenda (minhas×escopo, realizada/no-show/remarcar), /crm/mailings (import com relatório DNC); fila "Ligar"→ficha; agenda da API devolve leadName (join)
- [ ] CRM próximos: webhook 3C real (POST /crm/webhooks/dialer c/ dialer_call_id idempotente) após contrato; roteiros (call_scripts) CRUD + tela; gestão de tabulações/canais/DNC no front (Configurações); métricas/relatórios (conversão por canal/mailing/indicador, no-show); notificação de lembrete de reunião; normalização de telefone (E.164); kanban com cartões arrastáveis
- [ ] Discador: decisão 2026-09-26 — ASSINAR 3C Plus (10 PAs, preditivo 7/1, telecom ilimitado, R$15.480/ano; proposta vence 30/09) em vez de construir (própria custaria 2–4×). Nosso CRM = dono do funil; integrar 3C via API/webhooks (lead→campanha; tabulação/gravação→pipeline). Antes de assinar checar: fair-use do ilimitado, API inclusa, prefixo 0303/reputação de números, pagamento e cláusula de saída. Reavaliar build próprio na renovação com dados reais de minutos
- [x] Autenticação (2026-09-26): POST /auth/login (JWT 8h), GET /auth/me, POST /auth/change-password; JwtAuthGuard + RolesGuard (@Roles); testado ao vivo (login ok, 401 sem token/senha errada; auth.login no audit_logs)
- [ ] Escopo fino RBAC nas queries dos módulos (níveis T/U/E/P/L por unidade/equipe/próprio — RolesGuard só barra papel)
- [x] AuditService base (log + logIn transacional) — interceptor automático de mutações fica p/ quando os módulos de negócio nascerem
- [ ] Módulos por motor: operations → capital → commissions → payments → performance
- [ ] Commission Engine com regras versionadas
- [ ] Autenticação real da tela /login (hoje é vitrine: valida campos e direciona ao consultor; componente Next.js pronto em design/components/MazariLogin.tsx com hook onLogin p/ NextAuth/API)
- [ ] Rota real de "Esqueci minha senha" (hoje aponta p/ contato)
- [ ] Fase 0 de front do SaaS (sugestão: MAZARI PARTNERS somente-leitura: carteira + diário + documentos)
