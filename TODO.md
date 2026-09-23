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

- [ ] Autenticação real da tela /login (hoje é vitrine: valida campos e direciona ao consultor; componente Next.js pronto em design/components/MazariLogin.tsx com hook onLogin p/ NextAuth/API)
- [ ] Rota real de "Esqueci minha senha" (hoje aponta p/ contato)
- [ ] Definir fase 0 do SaaS (sugestão: MAZARI PARTNERS somente-leitura: carteira + diário + documentos)
- [ ] Modelagem do banco (entidades da spec, veículo-agnóstico)
- [ ] Autenticação + RBAC + isolamento por organização/unidade
- [ ] Commission Engine com regras versionadas
