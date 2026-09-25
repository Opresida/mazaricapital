# MAPA DE TELAS — MAZARI CAPITAL (desktop + mobile)

> Extraído do documento aprovado no Claude Design ("MAZARI · Mapa de Telas"). Para cada módulo: objetivo, entidades, regras de viabilidade (o que não pode faltar), ações, o que cada perfil vê e o que vai para o celular. O Command Center já está definido e aparece só no mapa geral.

Níveis de acesso (RBAC): **T** Total · **U** Unidade · **E** Equipe · **P** Próprio · **L** Leitura · **N** Sem acesso.

## Matriz geral de acesso

| Módulo | Presidência | Diretor | Supervisor | Consultor | Cotista |
|---|---|---|---|---|---|
| Command Center | T | U | E | P | P |
| 1. Oportunidades | T | U | E | P | L |
| 2. Operações | T | U | L | L | P |
| 3. Estrutura | T | U | E | P | N |
| 4. Comissões | T | U | E | P | N |
| 5. Pagamentos | T | P | P | P | P |
| 6. Metas e prêmios | T | U | E | P | N |
| 7. Feed | T | U | E | P | P |
| 8. Auditoria | T | L | N | N | N |
| 9. Configurações | T | P | P | P | P |

Todos entram no **mesmo sistema**; RBAC filtra dados e ações.

---

## 1 · Oportunidades

**Objetivo**: onde cada oportunidade nasce, é validada e publicada. Para a equipe é material de venda; para o cotista, a vitrine.
**Entidades**: Operation · Asset · Document · Budget · Participation · Lead

**Viabilidade (o que não pode faltar)**:
1. Status de publicação: Rascunho → Em análise → Aprovada → Publicada → Captação encerrada.
2. Só publica com checklist completo: matrícula, orçamento, cronograma, estrutura jurídica (SPE/SCP) e contrato modelo.
3. Unidade autorizada define quem enxerga a oportunidade.
4. Capital: necessário × comprometido × confirmado. Só o aporte **confirmado** conta como captação e produção.
5. Total de cotas, valor da cota e cotas restantes em tempo real, com **reserva temporária** para lead em documentação.
6. Regra de divisão do lucro (ex.: 75% cotistas / 25% MAZARI) registrada **por operação**. Número estimado aparece como "Projeção".

**Ações**: Nova oportunidade · Enviar para análise · Aprovar e publicar · Pausar/encerrar captação · Compartilhar com lead · Manifestar interesse.
**Cadastro em 6 passos**: 1 Ativo e localização · 2 Financeiro e cotas · 3 Documentos · 4 Cronograma · 5 Estrutura jurídica · 6 Revisão e publicação.

**Por perfil**: Presidência (T) cria/edita/aprova/publica, define unidade, vê captação global · Diretor (U) vê publicadas da unidade, captação por supervisor, anexa materiais · Supervisor (E) captação da equipe, distribui leads · Consultor (P) material pronto, link rastreado, reserva de cotas · Cotista (L) vitrine (fotos, 3D, cotas, docs autorizados) + botão "Tenho interesse" que avisa o consultor.

**Mobile entra**: vitrine em cards; compartilhar via WhatsApp com link rastreado (consultor); aviso de nova oportunidade + "Tenho interesse" (cotista). **Fica no desktop**: cadastro 6 passos, checklist/aprovação, funil detalhado.

---

## 2 · Operações

**Objetivo**: gestão da operação depois da captação — obra, orçamento, documentos, venda e resultado. O "prontuário" de cada ativo.
**Entidades**: Operation · Vehicle · Budget · Expense · ConstructionStage · ConstructionUpdate · Sale · Distribution

**Viabilidade**:
1. Cada operação vinculada a estrutura jurídica própria (SPE ou SCP) e conta própria.
2. Orçamento aprovado e **versionado**: previsto × realizado por etapa.
3. Cronograma com etapas, datas e responsáveis; mudança de prazo registrada com motivo.
4. Diário de obra com fotos, medições e autor; avanço físico × financeiro sempre visíveis.
5. Todo lançamento financeiro com comprovante e categoria.
6. Venda: preço, propostas, comprador, VGV. Apuração com **memória de cálculo** antes de liberar distribuição.

**Abas**: Visão geral · Imóvel · 3D/Tour · Documentos · Financeiro · Obra · Cronograma · Atualizações · Participantes · Venda · Resultado · Histórico.
**Ações**: Publicar atualização · Registrar lançamento · Anexar documento · Avançar etapa · Iniciar venda · Registrar proposta · Apurar resultado.

**Por perfil**: Presidência (T) todas as abas, aprova orçamento/etapas/apuração, libera venda e distribuição · Diretor (U) operações da unidade, publica atualização de obra, financeiro resumido (sem lançar) · Supervisor (L) andamento p/ informar equipe · Consultor (L) operações dos seus cotistas · Cotista (P, menu "Minha carteira") só as operações de que participa: obra, docs autorizados, resultado, cotas e memória de cálculo.

**Mobile entra**: diário de obra com câmera (foto + medição na hora — diretor); linha do tempo de fotos e avanço; aviso de mudança de etapa/documento novo. **Fica no desktop**: lançamentos financeiros e orçamento; venda/propostas e apuração; gestão de participantes.

---

## 3 · Estrutura

**Objetivo**: organização comercial — unidades, diretores, supervisores, consultores e a origem de cada cotista.
**Entidades**: Organization · Unit · Director · Supervisor · Consultant · Team · Participant

**Viabilidade**:
1. Árvore única: Unidade → Diretor → Supervisor → Consultor → Cotista.
2. Todo cotista tem **consultor de origem** (atribuição rastreável) — alimenta a comissão.
3. Transferências com data de vigência e motivo; **não mudam comissões já adquiridas**.
4. Status do membro: convidado, ativo, suspenso, desligado.
5. Entrada: convite, documentos, aceite de termos, perfil de acesso.

**Ações**: Criar unidade · Convidar membro · Transferir consultor/cotista · Suspender acesso · Histórico de vínculos.

**Por perfil**: Presidência (T) árvore completa, aprova entradas/transferências · Diretor (U, menu "Equipe") árvore da unidade, propõe mudanças, desempenho por supervisor · Supervisor (E, "Consultores") seus consultores + carteira da equipe · Consultor (P, "CRM") seu supervisor + sua carteira · Cotista (N) vê só nome/contato do seu consultor.

**Mobile entra**: consulta da equipe com contato rápido (ligar/WhatsApp); desempenho resumido. **Fica no desktop**: edição da árvore, criação de unidades, transferências, suspensões, convites/onboarding.

---

## 4 · Comissões

**Objetivo**: motor de comissões — regras versionadas, eventos gerados pela produção e saldos.
**Entidades**: CommissionRule · CommissionEvent · CommissionLedger

**Viabilidade**:
1. Regra versionada: vigência, percentual, público, base de cálculo, status.
2. Regra só ativa após aprovação **jurídica e administrativa**.
3. Evento de comissão só nasce com **capital confirmado** (não com cadastro de lead).
4. Estados: Pendente → Disponível → Em saque → Pago.
5. Mudança de regra **não recalcula** comissões já adquiridas.
6. Extrato imutável: correções entram como **ajuste com motivo**.

**Ações**: Nova regra (rascunho) · Enviar para aprovação · Ativar/encerrar vigência · Ajuste com motivo · Ver memória do cálculo.

**Por perfil**: Presidência (T) cria/versiona regras, todos os eventos e saldos, ajustes · Diretor (U) saldo próprio + comissão gerada pela estrutura da unidade · Supervisor (E) saldo próprio + produção da equipe · Consultor (P) saldo disponível/pendente, extrato por operação, projeção da próxima venda (marcada como projeção) · Cotista (N).

> **Atualização 2026-09-25 (Humberto)**: o supervisor **também vende** e é comissionado pela produção própria; quando a venda vem do supervisor, o **diretor** recebe override com percentual definido pela Presidência. A regra de comissão passa a ser a combinação (quem recebe × quem vendeu) — ver `docs/MODELO_DE_DADOS.md`. Impacto de UI: supervisor ganha carteira própria de leads no CRM/Oportunidades (além de distribuir para a equipe).
>
> **Atualização 2026-09-26 (Humberto)**: (1) venda própria do supervisor **conta na meta da equipe dele** — prêmios de equipe incentivam a equipe toda, e ele é o líder; (2) o **diretor também pode vender**: nesse caso a comissão é **toda dele**, sem override para ninguém acima (a Presidência já recebe pelo capital da operação). Impacto de UI: diretor também pode ter carteira de leads; ranking/metas de equipe incluem a produção do supervisor.

**Mobile entra**: saldo em destaque, extrato em lista, Solicitar saque (painel inferior + biometria), aviso de comissão aprovada. **Fica no desktop**: criação/versionamento de regras, ajustes manuais, visão por hierarquia.

---

## 5 · Pagamentos

**Objetivo**: central de pagamentos — saques de comissão e distribuições de resultado aos cotistas.
**Entidades**: Payment · Distribution · CommissionLedger · Notification

**Viabilidade**:
1. Fila com prazo de atendimento e prioridade.
2. **Dupla aprovação** acima de valor definido (quem aprova ≠ quem paga).
3. Status só vira Pago com **comprovante anexado**.
4. Conta/PIX validado **no nome do beneficiário**.
5. Distribuição só após apuração aprovada, com cálculo individual por cota.
6. Beneficiário notificado a cada mudança de status.

**Ações**: Aprovar · Recusar com motivo · Anexar comprovante · Marcar como pago · Lote de distribuição · Exportar remessa.

**Por perfil**: Presidência (T) fila completa, aprova e paga, lotes · Diretor/Supervisor (P, "Comissões › Saques") seus saques e comprovantes · Consultor (P) solicitar saque, acompanhar status, baixar comprovante · Cotista (P, "Distribuições") distribuições recebidas + comprovante + memória de cálculo.

**Mobile entra**: aprovar/recusar em 1 toque com biometria (Presidência); solicitar saque + aviso de "Pago"; comprovante de distribuição (cotista). **Fica no desktop**: lotes/remessa bancária, conciliação, limites de aprovação.

---

## 6 · Metas e prêmios

**Objetivo**: motor de performance — campanhas, metas por nível e catálogo de prêmios.
**Entidades**: Goal · GoalRule · Campaign · Prize · PrizeAward

**Viabilidade**:
1. Meta por período e público: consultor, equipe ou unidade.
2. Base de cálculo: **capital confirmado** — a mesma da comissão.
3. Níveis e prêmios configuráveis, com critérios de elegibilidade.
4. Apuração no fim do período, com registro da entrega do prêmio.
5. Mudanças durante a campanha ficam auditadas.

**Ações**: Nova campanha · Definir níveis · Cadastrar prêmio · Apurar · Registrar entrega.

**Por perfil**: Presidência (T) cria campanhas/níveis/prêmios, apura, registra entregas · Diretor (U) meta da unidade + progresso por supervisor · Supervisor (E) meta da equipe + progresso por consultor · Consultor (P) sua meta, próxima conquista, histórico de prêmios · Cotista (N).

**Mobile entra**: card de progresso com próxima conquista; aviso de nível atingido; ranking resumido. **Fica no desktop**: criação de campanhas/níveis, catálogo, apuração/entrega.

---

## 7 · Feed

**Objetivo**: linha do tempo que conecta a organização — tudo que acontece nas operações e na área comercial.
**Entidades**: Notification · ConstructionUpdate · Document · CommissionEvent · Payment

**Viabilidade**:
1. Eventos gerados automaticamente pelo sistema, **não editáveis**.
2. Filtrado por permissão: cada pessoa vê só o que pode ver.
3. Tipos: operação, documento, fotos, meta, comissão, pagamento, comunicado.
4. Comunicados da Presidência podem ficar fixados no topo.

**Ações**: Publicar comunicado · Fixar no topo · Filtrar · Marcar como lido.

**Por perfil**: Presidência (T) tudo + publica/fixa · Diretor (U) eventos e comunicados da unidade · Supervisor (E) equipe + unidade · Consultor (P) seus eventos + unidade · Cotista (P, no "Início") só eventos das operações de que participa.

**Mobile entra**: feed completo (formato natural do celular) + push. **Fica no desktop**: redação de comunicados longos.

---

## 8 · Auditoria

**Objetivo**: registro permanente de todas as ações relevantes — base da confiança e da governança.
**Entidades**: AuditLog

**Viabilidade**:
1. Cada registro: quem, o quê, quando, onde, valor anterior, novo valor, motivo.
2. **Somente inclusão**: nada é apagado ou editado.
3. Filtros por período, usuário, entidade e ação.
4. Alertas para ações sensíveis: regra de comissão, pagamento, permissão, dado financeiro.
5. Exportação para auditoria externa.

**Ações**: Filtrar · Ver antes/depois · Exportar · Configurar alertas.

**Por perfil**: Presidência (T) histórico completo, alertas, exportação · Diretor (L) ações da própria estrutura, só leitura · Supervisor (N) · Consultor (N — vê o próprio histórico pelo extrato) · Cotista (N — vê histórico da própria participação na carteira).

**Mobile entra**: alertas de ações sensíveis por push (Presidência). **Fica no desktop**: tela completa e exportação.

---

## 9 · Configurações

**Objetivo**: parâmetros da plataforma para a Presidência e "Minha conta" para todos.
**Entidades**: Organization · Role · Permission · User

**Viabilidade**:
1. Perfis e permissões (RBAC) por papel e por unidade.
2. Parâmetros financeiros padrão: divisão do lucro, impostos estimados, limites de aprovação.
3. Modelos de contrato e termos, com versão.
4. Integrações: banco/PIX, assinatura eletrônica, e-mail e WhatsApp.
5. Segurança: MFA, sessão, dispositivos.
6. Privacidade (LGPD): consentimento, exportação e exclusão de dados.

**Seções**: Organização · Perfis e permissões · Parâmetros financeiros · Documentos e termos · Integrações · Segurança · Privacidade (LGPD) · Minha conta.
**Ações**: Salvar com registro na auditoria · Convidar administrador · Testar integração.

**Por perfil**: Presidência (T) todas as seções · demais (P) "Minha conta": dados, conta/PIX, senha, MFA, notificações (cotista: conta para distribuições).

**Mobile entra**: Minha conta, notificações e biometria. **Fica no desktop**: toda a administração.

---

## Portais por perfil

| Perfil | Portal | Menu desktop | Barra inferior mobile |
|---|---|---|---|
| Presidência | MAZARI COMMAND | Command Center · Oportunidades · Operações · Estrutura · Comissões · Pagamentos · Metas e prêmios · Feed · Auditoria · Configurações | Início · Operações · Pagamentos · Feed · Mais |
| Diretor | MAZARI SALES | Painel da unidade · Oportunidades · Operações · Equipe · Produção · Metas · Comissões · Feed | Início · Equipe · Operações · Comissões · Mais |
| Supervisor | MAZARI SALES | Painel da equipe · Oportunidades · Consultores · Produção · Metas · Comissões · Feed | Início · Equipe · Oportun. · Comissões · Mais |
| Consultor | MAZARI SALES | Meu painel · CRM · Oportunidades · Metas · Comissões · Extrato · Feed | Início · CRM · Oportun. · Comissões · Mais |
| Cotista | MAZARI PARTNERS | Início · Oportunidades · Minha carteira · Documentos · Distribuições · Relatórios | Início · Oportun. · Carteira · Docs · Mais |

**Resumo por perfil**:
- **Presidência**: controla estratégia, oportunidades, regras, pagamentos e governança. Único perfil que cria oportunidades, define regras e libera dinheiro.
- **Diretor**: comanda uma unidade — produção, metas, informa a equipe, publica atualizações das operações da região.
- **Supervisor**: conduz equipe de consultores — distribui leads, acompanha produção e metas.
- **Consultor**: desenvolve relacionamentos — CRM, oportunidades para apresentar, meta e saldo de comissões.
- **Cotista**: acompanha oportunidades abertas e as operações de que participa — obra, documentos, resultado, distribuições.
