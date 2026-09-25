# MODELO DE DADOS — MAZARI CAPITAL API

> Schema Drizzle em `api/src/db/schema/` (fonte da verdade). Migration SQL gerada em `api/drizzle/`. 55 tabelas · 33 enums. Multi-tenant: toda tabela raiz carrega `organization_id`.

## Status de implementação (2026-09-26)

Todas as 55 tabelas **existem no banco** (Neon `sweet-cherry-75628492`, migrado). O que difere é o estágio de cada grupo:

| Estágio | Tabelas |
|---|---|
| 🟢 **Com API + dados** (módulos auth/CRM no ar) | `organizations`, `units`, `users`, `memberships`, `org_settings`, `expense_categories`, `call_outcomes`, `lead_sources` (seed) · `audit_logs` (gravando) · `leads`, `lead_batches`, `lead_referrers`, `call_attempts`, `lead_meetings`, `dnc_entries` (API CRM completa) |
| 🟡 **Estrutura pronta, API parcial/pendente no CRM** | `teams` (usada pelo escopo do supervisor; CRUD vem com módulo Estrutura) · `dialer_campaigns`, `dialer_campaign_leads` (aguardam contrato 3C) · `call_scripts` (CRUD pendente) |
| ⚪ **Estrutura pronta, aguardando módulo** | Operation Engine: `operations`, `assets`, `vehicles`, `operation_units`, `documents`, `document_versions`, `budgets`, `budget_items`, `expenses`, `construction_stages`, `construction_updates`, `update_media`, `sales`, `sale_proposals`, `results` · Capital: `participants`, `participations`, `contributions`, `distributions`, `distribution_items` · Comissões: `commission_rules`, `commission_events`, `commission_ledger` · Performance: `campaigns`, `goal_levels`, `goals`, `prizes`, `prize_awards` · Pagamentos: `payments`, `bank_accounts` · Controladoria: `corporate_expenses` · Estrutura: `membership_transfers`, `user_consents` · Plataforma: `notifications`, `feed_events`, `contract_templates` |

## Tabelas por motor

### Sales Engine — `organization.ts`
| Tabela | Papel |
|---|---|
| `organizations` | Tenant raiz (isolamento por organização) |
| `units` | Unidades comerciais (ex.: Unidade Manaus) |
| `users` | Identidade de autenticação (email, hash, MFA, LGPD) |
| `user_consents` | Consentimentos LGPD com concessão/revogação datadas |
| `memberships` | Vínculo papel×org×unidade (presidente/diretor/supervisor/consultor/cotista; status convidado→ativo→suspenso→desligado) |
| `teams` | Equipe de um supervisor dentro da unidade |
| `membership_transfers` | Transferências com vigência + motivo (não alteram comissões adquiridas) |
| `participants` | Perfil de cotista com **consultor de origem** (atribuição rastreável) |

### Operation Engine — `operations.ts`
| Tabela | Papel |
|---|---|
| `assets` | Imóvel: matrícula, endereço, imagens, 3D/tour |
| `vehicles` | Estrutura jurídica (SPE/SCP/outra) — agnóstico ao veículo |
| `operations` | Núcleo: código MH-XXX, status (rascunho→…→encerrada), capital, cotas, **split de lucro por operação** |
| `operation_units` | Unidades autorizadas a ver a oportunidade |
| `documents` + `document_versions` | Data Room: categoria, status, permissão, versionamento |
| `budgets` + `budget_items` | Orçamento versionado, previsto × realizado por etapa |
| `expenses` | Lançamento financeiro — comprovante obrigatório |
| `construction_stages` | Etapas com datas, avanço físico/financeiro, reprogramação com motivo |
| `construction_updates` + `update_media` | Diário da operação (fotos, medições, relatórios) |
| `sales` + `sale_proposals` | Venda: preço, propostas, comprador, VGV |
| `results` | Apuração: receita − custos − tributos − despesas − reservas, com memória de cálculo (jsonb) e split |

### Capital Engine — `capital.ts`
| Tabela | Papel |
|---|---|
| `lead_sources` | Canal de entrada configurável (Telemarketing, Influencer, Relacionamento, Indicação de cliente, Evento…) |
| `lead_referrers` | Quem indicou: influencer, cotista, contato de networking — atribuição p/ métricas, sem remuneração implícita |
| `lead_batches` | Mailing B2B importado: origem, base legal LGPD, qualidade medida por conversão |
| `leads` | Pipeline lead→prospect→participante→capital confirmado; B2B (empresa/CNPJ/cidade); canal + indicador + mailing; `next_callback_at` alimenta a fila; dono pode ser consultor, supervisor ou diretor |
| `participations` | Cotas: reservada→em_documentacao→**confirmada**; snapshot da cadeia na confirmação — `seller_membership_id` + `seller_role` (consultor OU supervisor vendedor; se supervisor, o campo supervisor fica null) |
| `contributions` | Aportes confirmados com comprovante — o "capital confirmado" |
| `distributions` + `distribution_items` | Distribuição pós-apuração, cálculo individual por cota com memória |

### Performance Engine — `commissions.ts` + `performance.ts`
| Tabela | Papel |
|---|---|
| `commission_rules` | Regras **versionadas** pela combinação **(quem recebe × quem vendeu)**: `audience_role` × `seller_role`, %, vigência, aprovação jurídica + administrativa. Cenários: consultor×consultor (produção), supervisor×consultor (override equipe), supervisor×supervisor (produção própria do supervisor), diretor×consultor (override unidade), diretor×supervisor (override sobre venda direta do supervisor — % definido pela Presidência), diretor×diretor (produção própria do diretor — comissão **toda dele**, sem override acima: a Presidência já recebe pelo capital da operação) |
| `commission_events` | Evento nasce só com capital confirmado; % e `seller_role` congelados (snapshot); pendente→disponivel→em_saque→pago |
| `commission_ledger` | Extrato **append-only**; correção = ajuste com motivo |
| `campaigns` + `goal_levels` + `goals` | Campanhas, níveis e metas (base = capital confirmado) |
| `prizes` + `prize_awards` | Catálogo de prêmios e conquistas/entregas |

### CRM Telemarketing — `crm.ts` (desenho funcional em `docs/CRM_TELEMARKETING.md`)
| Tabela | Papel |
|---|---|
| `call_outcomes` | Plano de tabulação configurável pela Presidência; `kind` (contato_efetivo/sem_contato/descarte/conversao) classifica p/ métricas; flags `requires_callback` e `is_dnc` |
| `dialer_campaigns` + `dialer_campaign_leads` | Campanha de discagem espelhada no discador (3C) via `external_id`; leads carregados já filtrados pela DNC |
| `call_attempts` | Cada ligação tabulada: duração, gravação, consultor, `dialer_call_id` único (idempotência do webhook) |
| `dnc_entries` | Lista "não ligar" (pedido do titular, Procon, tabulação DNC) — checada antes de subir lead p/ campanha |
| `lead_meetings` | Reunião de apresentação da estrutura (presencial ou Meet): host, oportunidade, agendada→realizada/no-show; remarcação gera novo registro |
| `call_scripts` | Roteiro na tela do consultor, versionado |

### Controladoria — `finance.ts`
| Tabela | Papel |
|---|---|
| `expense_categories` | Plano de contas gerido pela Presidência, com `kind`: **'obra'** (aquisição, materiais, mão de obra, impostos…) ou **'corporativa'** (água, luz, telefone, aluguel, internet, gastos internos…) |
| `corporate_expenses` | Custos da EMPRESA: categoria, competência, vencimento, status a_pagar→paga, comprovante, recorrência; `unit_id` null = sede, preenchido = custo da unidade. **Não tem `operation_id` de propósito** |

> Separação definitiva: custo de obra vive em `expenses` (sempre amarrado a uma operação); custo da empresa vive em `corporate_expenses` (nunca amarrado a operação). `budget_items` e `expenses` usam a mesma categoria kind='obra', fechando **previsto × realizado por categoria**.

### Central de Pagamentos — `payments.ts`
| Tabela | Papel |
|---|---|
| `bank_accounts` | PIX/conta validado no nome do beneficiário |
| `payments` | Saques e distribuições: dupla aprovação (approved_by_1/2), "pago" só com comprovante |

### Plataforma — `platform.ts`
| Tabela | Papel |
|---|---|
| `notifications` | Push/in-app por usuário |
| `feed_events` | Feed gerado pelo sistema (não editável); comunicados fixáveis |
| `audit_logs` | **Append-only**: quem/o quê/quando/onde/antes/depois/motivo/IP |
| `org_settings` | Parâmetros: split padrão, limite de dupla aprovação, impostos estimados |
| `contract_templates` | Modelos de contrato/termos versionados |

## Invariantes que a APLICAÇÃO deve garantir (não estão no SQL)

1. `commission_ledger` e `audit_logs`: **nunca** UPDATE/DELETE (só INSERT). Em produção, revogar UPDATE/DELETE via GRANT.
2. `payments.status = 'pago'` exige `receipt_storage_key` preenchido.
3. Pagamento acima de `org_settings.payment_dual_approval_limit` exige `approved_by_2 ≠ approved_by_1 ≠ paid_by`.
4. `commission_events` só é criado a partir de `contributions.confirmed_at` preenchido.
5. `participations`: snapshot de atribuição (vendedor+papel/supervisor/diretor/team/unit) preenchido **na confirmação** e nunca alterado depois. Quando `seller_role = supervisor`, `supervisor_membership_id` fica null — o override vai direto ao diretor.
5b. O motor de comissão resolve a regra pela combinação (papel do beneficiário × `seller_role` da participação) vigente na data da confirmação.
6. Mudança em `commission_rules` gera **nova versão** (nova linha), nunca UPDATE de percentual em regra ativa.
7. `results` calculado só com `sales.status = 'concluida'`; distribuição só com `results.status = 'aprovada'`.
8. Progresso de metas (`goals.settledAmount`) é derivado de capital confirmado no período — materializado na apuração, nunca digitado.
8b. **Contagem de metas por nível** (decisão da Presidência, 2026-09-26): venda própria do supervisor **conta na meta da equipe dele** (ele é o líder — prêmios de equipe incentivam a equipe toda, incluindo ele). Por extensão, a meta da unidade agrega toda a produção confirmada da unidade: consultores + supervisores + diretor. A meta pessoal de cada um conta só a produção própria.
9. Todo valor estimado exposto pela API leva flag `isProjection: true` (a UI renderiza tracejado, nunca verde).
10. Toda mutação sensível grava `audit_logs` na mesma transação.
11. **Separação empresa × obra**: lançamento em `expenses` exige categoria kind='obra'; lançamento em `corporate_expenses` exige kind='corporativa'. Nenhum relatório financeiro de operação inclui custo corporativo, e o resultado da empresa nunca absorve custo de obra. `corporate_expenses.status='paga'` exige comprovante.

## Comandos

```bash
cd api
npm run typecheck      # valida o schema TS
npm run db:generate    # gera migration SQL a partir do schema
npm run db:migrate     # aplica no banco (precisa DATABASE_URL no .env)
```
