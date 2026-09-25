# BASE UI — MAZARI CAPITAL (v1.0)

> Extraído do documento aprovado no Claude Design ("MAZARI · Base UI"). Base comum da plataforma: estrutura, fundamentos e componentes compartilhados pelos 4 portais (Command, Sales, Partners, Operations).

## 01 · Estrutura do app

Uma estrutura, cinco perfis. Sidebar **240px** · topbar **60px** · conteúdo com padding **24px** · grid de **12 colunas, gap 12px**. O menu, o nome do portal e os indicadores mudam conforme o perfil (RBAC). Busca global "⌘K" (operação, pessoa, documento).

## 02 · Fundamentos

### Cores

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#020A12` | fundo base (site usa `#01060B` no body) |
| `surface` | `#06131D` | painéis/cards |
| `surface-2` | `#091923` | camada 2 (hover, células) |
| `accent` | `#52FF9D` | ação / destaque |
| `accent-hover` | `#20D98A` | hover da ação |
| `text` | `#F5F7FA` | texto principal |
| `text-2` | `#91A4B4` | texto secundário |
| `text-3` | `#5E7282` | muted |
| atenção | `#E8C468` | avisos |
| negativo | `#E5736B` | erros / recusas |

Bordas padrão: `rgba(255,255,255,.08)` (cards), `rgba(82,255,157,.3–.5)` (destaque accent).

### Tipografia

Famílias (todas Google Fonts — pesos definidos pela Presidência em 2026-09-26):
- **Space Grotesk** 400/500/600 — títulos, números importantes e valores financeiros
- **Inter** 400/500/600 — textos, tabelas, menus e botões
- **JetBrains Mono** 400/500 — rótulos técnicos em caixa alta, códigos e metadados (acréscimo do Humberto ao design)

Nenhum peso fora desses (sem 700+; destaque se faz com tamanho/cor, não com bold extra).

| Papel | Tamanho |
|---|---|
| Número XL | 48 |
| Título | 34 |
| Seção | 20 |
| Corpo (Inter) | 15 |
| Tabela (Inter) | 13 |
| Rótulo (Mono) | 11, letter-spacing largo, caps |

### Espaço, raios e profundidade

- Espaçamento base 4: `4 · 8 · 12 · 16 · 24 · 32 · 48`.
- Raios: `6` chip · `8` botão · `10` input · `12` card · `16` modal · pill.
- Profundidade: `0` card (só borda) · `1` popover · `2` modal.

### Iconografia

Grid 24 · traço 1,75 · pontas arredondadas · 18px no menu · 22px no mobile. Inativo `#91A4B4`, ativo `#52FF9D` (traço 2,1 no mobile). **Nunca preencher o ícone** — o destaque vem da cor e do fundo do item.

## 03 · Componentes

- **Botões**: Primário (accent, texto escuro) · Secundário · Terciário · Recusar (negativo) · tamanhos Pequeno/Grande · Desabilitado · estado carregando.
- **Status da operação** (chips): conforme ciclo (Aberta, Em captação, Em execução, Em venda, Encerrada…).
- **Status financeiro**: Disponível · Pendente · Em análise · Pago · Recusado · **Projeção**.
  - **Regra**: "Projeção" sempre com **borda tracejada**. **Nunca usar verde para valores não realizados.**
- **Campos**: input com rótulo, prefixo `R$`, select `▼`, validação inline (ex.: "CPF incompleto."), toggles (ex.: "Publicar para a unidade", "Notificar cotistas"), radio SPE/SCP.
- **Navegação**: abas, breadcrumb (`Operações / MH-001 / …`), stepper numerado, paginação `‹ 1 2 3 … 12 ›`.

### Valores monetários (decisão 2026-09-26)

- **KPIs e destaques**: formato compacto pt-BR — `R$ 950 mil`, `R$ 1,25 mi` (a Base UI já usava `R$ 1,62 mi` no gráfico; "mil/mi" em vez de K/M).
- **Tabelas, extratos e memória de cálculo**: sempre o valor completo (`R$ 1.250.000` / `R$ 10.350,00`) — onde se confere, não se resume.
- Implementação: `web/lib/format.ts` (`fmtCompactBRL`).

## 04 · Dados

- **Card de saldo** (Consultor/Supervisor/Diretor): Disponível em destaque XL, Pendente, Histórico, botão "Solicitar saque".
- **Meta**: barra de progresso + % + "faltam R$ X" + marcadores de nível (NÍVEL 1 · 50 MIL…) + próxima conquista com imagem do prêmio.
- **Avanço**: físico % × financeiro % lado a lado.
- **Gráficos**: Recharts; ex. "Capital originado · 6 meses" com delta.
- **Tabela padrão**: header mono 10–11px caps, colunas DATA ↓ · OPERAÇÃO · ORIGEM · VALOR · STATUS; valores negativos com `−`.
- **Documento (Data Room)**: tipo (PDF), nome, categoria · responsável · data, versão (`v3`), permissão.
- **Registro de auditoria**: avatar/iniciais, quem, ação, entidade, antes `→` depois, data/hora, IP, motivo.

## 05 · Feedback

- Toasts: sucesso (Pagamento realizado), aviso (Cronograma alterado), erro (Documento recusado), informação ("Valores exibidos como 'Projeção' não são resultados realizados.").
- Empty state: mensagem + CTA (ex.: "Nenhuma operação ainda" → "Ver oportunidades").
- Loading: letras M-A-Z-A-R-I animadas + "CARREGANDO".

## 06 · Base mobile

**No desktop se administra. No celular se acompanha, aprova e registra.**

### Feito para o celular
- Notificações push de obra, comissão e pagamento.
- Aprovar saque em 1 toque (Presidência).
- Publicar atualização com a câmera (Diretor).
- Registrar lead rápido e ligar/WhatsApp (Consultor).
- Login por biometria e saldo em destaque.

### Adaptações
| Desktop | Mobile |
|---|---|
| Menu lateral | Barra inferior + "Mais" |
| Tabelas | Lista de cards |
| Modal | Painel inferior (sheet) |
| 4 indicadores | 1 destaque + 2 menores |
| Busca ⌘K / abas | Tela cheia / abas roláveis |

### Fica só no desktop
Cadastro completo de oportunidade · regras de comissão, metas e permissões · edição da hierarquia · lançamentos financeiros e orçamento detalhado · auditoria completa, exportações e upload em massa.

### Medidas mobile
- Largura de referência **390px** (mín. 360) · margem lateral **20px** · barra superior **56px** · barra inferior **5 itens · 68px** + área segura · área de toque mínima **44×44px**.
- Tipografia: Número XL 36–40 · título de tela 20–24 · corpo 14–15 · secundário 12–13 · rótulo mono mín. 10,5.

### Barra inferior por perfil
| Perfil | Itens |
|---|---|
| Presidência | Início · Operações · Pagamentos · Feed · Mais |
| Diretor | Início · Equipe · Operações · Comissões · Mais |
| Supervisor | Início · Equipe · Oportun. · Comissões · Mais |
| Consultor | Início · CRM · Oportun. · Comissões · Mais |
| Cotista | Início · Oportun. · Carteira · Docs · Mais |

### Padrão de confirmação sensível (sheet)
Ex. Solicitar saque: valor + destino (PIX mascarado) + aviso ("A Presidência será notificada. Você recebe o comprovante quando o status mudar para Pago.") + **Confirmar com biometria** / Cancelar.
