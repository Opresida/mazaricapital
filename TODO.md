# TODO — MAZARI CAPITAL

## Site (curto prazo)

- [ ] Substituir placeholders de imagem por fotos/renders reais:
  - "FOTO / RENDER — MH-001" (card MAZARI HOUSE)
  - "FOTO · ALVENARIA"
  - [x] MONOLEV — logomarca oficial em site/img/monolev-logo.png (se surgir foto real dos painéis em obra, avaliar troca p/ manter padrão do GABLOK)
  - [x] GABLOK — foto real do bloco em site/img/gablok-bloco.jpg
  - 3 miniaturas do "Diário da operação" (aba Operação MH-001)
- [ ] CTA "Falar com consultor": apontar para canal real (WhatsApp/formulário) — hoje é âncora `#contato`
- [ ] Confirmar e-mail real (rodapé usa `contato@mazaricapital.com.br` como placeholder)
- [ ] Revisão jurídica dos textos (disclaimers, SPE/SCP, 75/25) antes de publicar
- [x] Git: repositório publicado em https://github.com/Opresida/mazaricapital (main)
- [ ] Deploy Netlify (conectar ao repo, publish dir `site`, sem build) + domínio
- [ ] og:image 1200×630 (padrão dos outros projetos)

## Site (desejável)

- [ ] Menu mobile (hambúrguer) — hoje o nav rola horizontalmente no mobile, como no design original
- [ ] Analytics/pixel, se for rodar tráfego

## Marca / animação do logo (2c aprovada)

- [x] Intro 2c na abertura do site (site/js/intro.js, 1x por sessão)
- [ ] Intro 2c no carregamento do portal (fase SaaS — usar design/components/MazariIntro.tsx)
- [ ] Manual de marca com a animação oficial

## SaaS (fases seguintes — ver docs/ e ARCHITECTURE.md)

- [ ] Definir fase 0 do SaaS (sugestão: MAZARI PARTNERS somente-leitura: carteira + diário + documentos)
- [ ] Modelagem do banco (entidades da spec, veículo-agnóstico)
- [ ] Autenticação + RBAC + isolamento por organização/unidade
- [ ] Commission Engine com regras versionadas
