# MAZARI CAPITAL

Site institucional da **MAZARI CAPITAL** — plataforma de estruturação, administração e execução de operações em ativos reais (imobiliário). "Construindo patrimônio com ativos reais."

Este repositório contém o **site de apresentação** (landing) convertido do design aprovado no Claude Design, além da especificação canônica do SaaS completo.

## Como rodar

O site é 100% estático, sem build:

```bash
cd site
python -m http.server 8902
# abrir http://localhost:8902
```

Ou simplesmente abrir `site/index.html` no navegador.

## Deploy

Compatível com Netlify **sem build**: publish directory = `site`, sem comando de build.

## Estrutura

```
mazari-capital/
├── README.md            # este arquivo
├── CONTEXT.md           # contexto de negócio
├── ARCHITECTURE.md      # arquitetura atual e futura + notas da conversão
├── TODO.md              # próximos passos
├── PROJECT_CONTEXT.md   # histórico de sessões / estado
├── docs/
│   └── MAZARI_CAPITAL_SaaS_Especificacao_Integral_42_Itens.md  # spec canônica do SaaS
├── design/
│   └── handoff/
│       └── MAZARI-Capital-Site.bundle.html  # bundle original do Claude Design (referência)
└── site/                # site estático (deployável)
    ├── index.html
    ├── css/styles.css
    └── js/app.js
```

## Pontos de atenção

- Todos os valores, telas e exemplos do site são **ilustrativos** (marcados como tal no próprio site).
- O disclaimer do rodapé e as notas de governança **não devem ser removidos** sem análise jurídica.
- MONOLEV e GABLOK são marcas de seus respectivos fabricantes.
