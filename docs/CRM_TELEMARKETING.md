# CRM TELEMARKETING — MAZARI CAPITAL

> Desenho funcional do módulo CRM, 100% dentro da realidade MAZARI: captação majoritariamente por **telemarketing ativo B2B via discador** (3C Plus contratada como motor de discagem). O CRM não é um kanban genérico — é uma **esteira de ligações**. O funil, as métricas e a comissão vivem no NOSSO banco; o discador é invisível por trás.

## Princípio de arquitetura

```
Mailing B2B → lead_batches → leads → dialer_campaigns (espelho na 3C)
                                          ↓ 3C disca (preditivo 7/1)
                                    ligação conecta → consultor atende NA NOSSA TELA
                                          ↓ webhook 3C
                                    call_attempts + tabulação (call_outcomes)
                                          ↓
              lead → prospect → participante → CAPITAL CONFIRMADO
                                          ↓ (mesma transação)
                              comissão + meta + feed + auditoria
```

- A 3C **nunca** é a fonte da verdade: cada chamada volta por webhook (`dialer_call_id` garante idempotência) e vira `call_attempts` tabulado aqui.
- Lead **não sobe** para campanha sem passar pelo filtro `dnc_entries` (não ligar).
- Conversão no telefone não é produção: produção só existe com **capital confirmado** (regra inegociável nº 3).

## A esteira do consultor (tela principal)

1. **Fila do dia**: retornos agendados vencendo (`next_callback_at`) primeiro, depois leads da campanha ativa. O consultor não escolhe manualmente em quem "fuçar" — a fila prioriza.
2. **Ligação conecta** (o discador já filtrou caixa postal/não-atende): a tela abre com o lead completo — empresa, CNPJ, cidade, histórico de tentativas, **roteiro da campanha** (`call_scripts`) com objeções e respostas.
3. **Tabulação obrigatória em 1 clique** ao encerrar: os nomes são configuráveis pela Presidência (`call_outcomes`), classificados em 4 tipos para métrica: contato efetivo · sem contato · descarte · conversão.
   - Tabulação com `requires_callback` → abre agendamento de retorno.
   - Tabulação com `is_dnc` (ex.: "pediu para não ligar") → telefone entra automático na `dnc_entries`.
4. **Conversão** → na própria tabulação o consultor **agenda a reunião de apresentação** (`lead_meetings`): presencial ou Meet, com data, local/link e a oportunidade a apresentar. O lead vira `prospect`.
5. **Reunião** — o passo que explica a estrutura MAZARI. Realizada → segue para documentação → contrato → aporte → **capital confirmado** (o lead só vira `participante` ao formalizar). Não compareceu → remarcação gera novo registro (o histórico de no-show é métrica de funil). Lembrete automático ao lead e ao consultor antes do horário (notificações).

## Canais de entrada (decisão 2026-09-26)

O telemarketing é o canal **principal**, mas não o único. Todo lead tem um **canal de origem** (`lead_sources`, configurável pela Presidência — seed: Telemarketing, Influencer, Relacionamento próximo, Indicação de cliente, Evento) e, quando existe, **quem indicou** (`lead_referrers`: o influencer específico, o cotista que indicou, o contato de networking).

| Canal | Caminho no CRM |
|---|---|
| **Telemarketing** | Mailing → campanha no discador → esteira de ligações → tabulação → reunião |
| **Influencer / Relacionamento / Indicação** | Lead cadastrado direto (pelo consultor, supervisor ou diretor dono do relacionamento) → **pula a esteira** → agenda `lead_meetings` direto → mesmo funil dali em diante |

Pontos fixos, independentes do canal:
- A **reunião individual é o ponto de convergência**: todo canal desemboca nela.
- O funil e a produção são os mesmos: prospect → reunião → participante → **capital confirmado** — comissão e meta não mudam com o canal (o que muda é como o lead chegou).
- Leads de relacionamento vivem melhor na **visão Kanban** (gestão por relacionamento); leads de telemarketing, na Esteira (a fila manda).
- Métricas por canal e **por indicador**: qual influencer traz lead que vira capital confirmado, indicação de qual cotista converte — mesma lógica da qualidade de mailing.
- `lead_referrers` registra **atribuição**, não remuneração: qualquer acordo com influencer/indicador é decisão comercial da Presidência, fora do sistema até que ela defina.
- LGPD por canal: telemarketing herda a base do mailing; indicação/relacionamento registra consentimento no primeiro contato.

## Visões da tela (decisão 2026-09-26)

- **Esteira** (padrão de trabalho): a fila de ligações descrita acima — o consultor não escolhe, o sistema prioriza.
- **Kanban** (visão de gestão): o pipeline em colunas por etapa (Lead → Prospect → Reunião agendada → Participante → Capital confirmado), com cartões arrastáveis. Alternância de visão em 1 clique, preferência lembrada por usuário.
- **Tabulações são criáveis/editáveis pela Presidência** em Configurações › Tabulações (nome, tipo, efeitos callback/DNC, ordem). As 7 sugeridas são só o seed inicial.

## O que cada perfil vê

| Perfil | Na esteira |
|---|---|
| Consultor | Sua fila, seus retornos, seu roteiro, suas métricas do dia (ligações, contatos efetivos, conversões) |
| Supervisor | Fila e métricas da equipe em tempo real, gravações das ligações da equipe, redistribuição de leads; **sua própria fila também** (supervisor vende) |
| Diretor | Métricas por equipe/campanha da unidade, qualidade dos mailings (conversão por `lead_batch`); **sua própria fila também** (diretor vende) |
| Presidência | Tudo + gestão do plano de tabulação, campanhas, roteiros, mailings e DNC |

## Integração 3C Plus (quando contratada)

| Evento 3C (webhook) | Ação no nosso banco |
|---|---|
| Chamada conectada/finalizada | upsert em `call_attempts` por `dialer_call_id` (fone, duração, gravação) |
| Tabulação feita na tela nossa | grava `outcome_id` no attempt + efeitos (callback/DNC/avanço de stage) |
| Campanha criada por nós | `dialer_campaigns.external_id` guarda o id da 3C; leads sobem via API já filtrados pela DNC |

Pré-requisitos de contrato (checar antes de assinar): API/webhooks inclusos no plano · fair-use do "ilimitado" · números com prefixo **0303** e gestão de reputação.

## Regulatório (desde o dia 1)

- Prefixo **0303** (Anatel) em toda chamada ativa de oferta.
- Respeito ao **Não Me Perturbe** e listas Procon — carga periódica na `dnc_entries`.
- **LGPD**: base legal registrada por mailing (`lead_batches.lgpd_basis`); aviso de gravação; descarte de lead a pedido do titular.
- Limite de tentativas por lead: **4 por semana** (decisão da Presidência 2026-09-26; parâmetro `crm_max_attempts_per_week` em `org_settings`, ajustável). O contador usa `call_attempts`; a API da 3C reforça o controle no discador.

## Métricas que o modelo já sustenta

- Taxa de contato efetivo e de conversão por consultor, equipe, campanha e **por mailing** (qualidade da lista comprada).
- Tempo médio de conversa, tentativas até conversão, retorno agendado × cumprido.
- **Reuniões**: agendadas × realizadas × no-show, por consultor e por modo (presencial/Meet).
- Funil completo: ligações → contatos → conversões → **reuniões realizadas** → participações → **capital confirmado** (a única métrica que vira comissão).

## Tabulações sugeridas (seed inicial — Presidência ajusta depois)

| Nome | Kind | Efeito |
|---|---|---|
| Atendeu — interessado | conversao | avança stage |
| Atendeu — retorno agendado | contato_efetivo | requires_callback |
| Atendeu — sem interesse | contato_efetivo | — |
| Atendeu — fora do perfil | descarte | — |
| Não atendeu / caixa postal | sem_contato | — |
| Número inválido | descarte | — |
| Pediu para não ligar | descarte | is_dnc → entra na DNC |

## API implementada (`api/src/crm/`, prefixo `/api/v1/crm`, JWT + RBAC)

| Endpoint | Quem | O quê |
|---|---|---|
| `GET /crm/queue` | equipe comercial | Fila pessoal da esteira: callbacks vencidos primeiro, depois leads frescos; exclui DNC e quem estourou 4 tentativas/semana |
| `GET /crm/leads` · `GET /crm/leads/:id` | escopo T/U/E/P | Lista com filtros (etapa, canal, mailing, busca) e detalhe com timeline (ligações + reuniões) |
| `POST /crm/leads` · `PATCH /crm/leads/:id` | equipe comercial | Criar/editar; telefone em DNC é recusado; etapas participante/capital_confirmado só via formalização |
| `POST /crm/leads/:id/attempts` | equipe comercial | **Tabulação** com efeitos em transação: callback obrigatório quando a tabulação exige, DNC automático, conversão → prospect; tudo auditado |
| `POST /crm/leads/:id/meetings` · `PATCH /crm/meetings/:id` · `GET /crm/meetings` | equipe comercial | Reunião de apresentação: agendar (lead→prospect), realizar/no-show/cancelar, remarcar (novo registro encadeado), agenda |
| `GET /crm/board` | escopo T/U/E/P | Kanban: colunas por etapa com totais |
| `GET/POST/PATCH /crm/outcomes` | leitura: todos · escrita: Presidência | Tabulações configuráveis |
| `GET/POST /crm/sources` | leitura: todos · escrita: Presidência | Canais de entrada |
| `GET/POST /crm/referrers` | equipe comercial | Indicadores (influencer/cotista/networking) |
| `POST /crm/batches` · `POST /crm/batches/:id/leads` | Presidência/Diretor | Mailing + import em lote (até 5.000) com filtro DNC e relatório de pulados |
| `GET/POST /crm/dnc` | Presidência/Diretor | Lista "não ligar" |

Escopo RBAC aplicado nas queries (`crm-scope.service.ts`): Presidência=tudo · Diretor=unidade · Supervisor=equipe(s)+próprio · Consultor=próprio · Cotista=sem acesso. Validado por smoke test end-to-end (16 verificações) em 2026-09-26.

## Tabelas do módulo (schema `crm.ts` + extensões em `capital.ts`)

`lead_batches` · `leads` (+ empresa/CNPJ/cidade/UF, `batch_id`, `next_callback_at`) · `call_outcomes` · `dialer_campaigns` · `dialer_campaign_leads` · `call_attempts` · `dnc_entries` · `lead_meetings` (reunião presencial/Meet de apresentação da estrutura) · `call_scripts`. Detalhe em `docs/MODELO_DE_DADOS.md`.
