# Backlog

## 1. CRÍTICO antes de produção

- [ ] Proteger `auth/` como credencial sensivel. Motivo: sessao Baileys permite acesso ao WhatsApp. Arquivos provaveis: `docs/docker.md`, `docs/deploy.md`, `.gitignore`. Status: pendente.
- [ ] Definir backup e restore MySQL testado. Motivo: perder `users`, `user_states`, `logs` e `docs` afeta operacao. Arquivos provaveis: `docs/banco-de-dados.md`, `docs/docker.md`. Status: pendente.
- [ ] Separar `.env` local e producao. Motivo: evitar uso de credenciais locais/remotas erradas. Arquivos provaveis: `.env.example`, `docs/deploy.md`. Status: pendente.
- [ ] Definir estrategia de deploy Linux. Motivo: producao ainda nao escolheu Docker, systemd ou PM2. Arquivos provaveis: `docs/deploy.md`, `docs/docker.md`. Status: pendente de confirmacao.
- [ ] Confirmar que MySQL nao ficara publico. Motivo: banco exposto e risco critico. Arquivos provaveis: `docker-compose.yml`, `docs/deploy.md`. Status: pendente de confirmacao.

## 2. Alta prioridade

- [x] Planejar painel administrativo mínimo. Motivo: o painel agora tem prioridade maior que IA e deve permitir operação do bot e gestão por setor. Arquivos provaveis: `docs/PLANO_PAINEL_ADMIN.md`, `docs/RELATORIO_ESTRATEGICO.md`, futura API/painel. Status: escopo inicial documentado.
- [x] Modelar RBAC do painel por setor. Motivo: administrador principal acessa tudo; DRCA, CAE e Biblioteca acessam apenas seus próprios conteúdos. Arquivos provaveis: `database/schema.sql`, `docs/PLANO_PAINEL_ADMIN.md`. Status: tabelas-base criadas no schema.
- [x] Definir API administrativa inicial. Motivo: painel precisa consultar status do bot, documentos, links e setores sem mexer direto no banco. Arquivos provaveis: `docs/PRD_PAINEL_ADMIN.md`, `C:\Dev\Projetos\admin-firabot\server\src`. Status: API inicial implementada no painel em raiz separada.
- [x] Confirmar fluxo completo no codigo. Motivo: README descreve fluxo, mas opcoes finais dependem do codigo. Arquivos provaveis: `src/menus`, `src/commands`, `src/middlewares/messageHandler.ts`, `src/services`. Status: fluxo principal refatorado e validado com testes.
- [x] Alinhar menu principal ao novo modelo numerado. Motivo: o fluxo aprovado prevê Biblioteca, Documentos, PPC do Curso, Links Importantes, Editais Abertos, RU e Suporte. Arquivos provaveis: `src/menus`, `src/services`, `src/middlewares/messageHandler.ts`, `docs/fluxo-conversa.md`. Status: primeira etapa concluida.
- [x] Criar submenus semânticos para Documentos DRCA e Documentos CAE. Motivo: documentos devem ser escolhidos dentro do setor correto. Arquivos provaveis: `src/menus`, `src/services`, `src/middlewares/messageHandler.ts`. Status: primeira etapa concluida.
- [x] Fazer PPC do Curso listar cursos antes dos PPCs disponíveis. Motivo: preparar múltiplos cursos e manter PPCs por curso. Arquivos provaveis: `src/menus/courseMenu.ts`, `src/handlers/menuOptionHandler.ts`, `src/flows/courseFlow.ts`. Status: PPCs mapeados por curso e validados com testes.
- [x] Carregar documentos por categoria/setor no banco. Motivo: DRCA, CAE, Biblioteca e PPC devem crescer sem hardcode. Arquivos provaveis: `database/schema.sql`, `src/functions/database.ts`, `src/services/documentService.ts`. Status: primeira etapa concluída com `category_code`, summaries e fallback local.
- [x] Preparar painel administrativo com RBAC por setor. Motivo: administrador principal deve controlar o bot e administradores setoriais devem editar apenas suas áreas. Arquivos provaveis: `docs/RELATORIO_ESTRATEGICO.md`, `docs/PRD_PAINEL_ADMIN.md`, `database/schema.sql`, `C:\Dev\Projetos\admin-firabot`. Status: protótipo/API com sessão, RBAC, CRUD inicial, upload e fila inicial de suporte; pendente integração operacional completa com WhatsApp/QR.
- [ ] Confirmar estados reais persistidos. Motivo: evitar menus errados e estado preso. Arquivos provaveis: `src/services/userStateService.ts`, `database/schema.sql`. Status: pendente.
- [ ] Extrair testes com socket fake para `messageHandler`. Motivo: aumentar cobertura depois da refatoracao em flows e handlers. Arquivos provaveis: `tests/`, `src/middlewares/messageHandler.ts`, `src/handlers`. Status: iniciado com fake socket para flow; ainda falta cobrir messageHandler completo.
- [ ] Definir contrato TypeScript -> Python para IA. Motivo: manter o core Baileys em TypeScript e isolar IA em serviço Python com retorno padronizado `BotAction`. Arquivos provaveis: `docs/PLANO_IA_INTELIGENTE.md`, futura pasta `src/aiClient`, futuro projeto Python. Status: depois do painel.
- [ ] Remover `auth/` do versionamento, se estiver rastreado. Motivo: arquivos de sessão Baileys são credenciais sensíveis. Arquivos provaveis: git index, `.gitignore`, docs de segurança. Status: ação crítica pendente.
- [ ] Definir retencao de logs. Motivo: logs podem conter metadados sensiveis. Arquivos provaveis: `docs/logs.md`, `src/services/logService.ts`. Status: pendente.
- [ ] Confirmar politica de restart automatico. Motivo: bot precisa voltar apos queda. Arquivos provaveis: `docs/deploy.md`, `docs/docker.md`. Status: pendente de confirmacao.
- [ ] Confirmar onde os PDFs ficarao em producao. Motivo: documentos precisam existir no host/container. Arquivos provaveis: `documentos/`, `docs/docker.md`. Status: pendente de confirmacao.

## 3. Média prioridade

- [ ] Documentar comportamento de reconexao WhatsApp/Baileys. Motivo: reduzir indisponibilidade. Arquivos provaveis: `src/connection.ts`, `docs/deploy.md`. Status: pendente.
- [ ] Confirmar comportamento em grupos. Motivo: `IGNORE_GROUPS` pode bloquear respostas esperadas. Arquivos provaveis: `.env.example`, `src/services/messageGuardService.ts`. Status: pendente.
- [ ] Confirmar comportamento de mensagens antigas. Motivo: evitar resposta a backlog do WhatsApp. Arquivos provaveis: `src/services/messageGuardService.ts`. Status: pendente.
- [x] Confirmar TTL de estado. Motivo: `USER_STATE_TTL_MINUTES` deve evitar estados antigos depois de longos intervalos. Arquivos provaveis: `src/services/userStateService.ts`. Status: aplicado com base em `user_states.updated_at`.
- [x] Confirmar uso de `ADMIN_NUMBERS`. Motivo: comandos operacionais nao devem ficar públicos. Arquivos provaveis: `.env.example`, `src/commands`. Status: `!ping` e `!status` protegidos.

## 4. Baixa prioridade

- [ ] Criar diagrama simples do fluxo. Motivo: facilitar manutencao. Arquivos provaveis: `docs/fluxo-conversa.md`. Status: pendente.
- [ ] Consolidar changelog. Motivo: reduzir duplicidade entre historico e changelog. Arquivos provaveis: `docs/REGISTRO_DE_MUDANCAS.md`, `docs/changelog.md`. Status: pendente.
- [ ] Registrar prompts recorrentes. Motivo: acelerar tarefas futuras com Codex. Arquivos provaveis: `docs/prompts-codex.md`. Status: pendente.

## 5. Segurança

- [ ] Mascarar telefone/JID em logs quando possivel. Motivo: reduzir dados pessoais em diagnostico. Arquivos provaveis: `src/services/logService.ts`, `docs/logs.md`. Status: pendente.
- [ ] Evitar registrar QR Code e tokens. Motivo: dados permitem acesso indevido. Arquivos provaveis: `src/connection.ts`, `src/services/logService.ts`. Status: pendente.
- [ ] Revisar `DEBUG_MODE` em producao. Motivo: debug pode vazar detalhes. Arquivos provaveis: `.env.example`, `docs/logs.md`. Status: pendente.
- [ ] Revisar permissao do usuario MySQL. Motivo: menor privilegio reduz impacto de falha. Arquivos provaveis: `database/schema.sql`, `docker-compose.yml`. Status: pendente de confirmacao.
- [ ] Rotacionar credenciais expostas, se houver. Motivo: segredos vazados nao devem ser reutilizados. Arquivos provaveis: `.env.example`, ambiente de producao. Status: pendente de confirmacao.

## 6. Banco de dados

- [ ] Documentar schema completo. Motivo: tabelas confirmadas no README precisam de campos e indices. Arquivos provaveis: `database/schema.sql`, `docs/banco-de-dados.md`. Status: pendente.
- [ ] Confirmar indices e constraints. Motivo: estabilidade de estado, docs e logs. Arquivos provaveis: `database/schema.sql`. Status: pendente.
- [ ] Confirmar se ha migrations alem do schema inicial. Motivo: controlar mudancas de banco. Arquivos provaveis: `database/`. Status: pendente de confirmacao.
- [ ] Definir limpeza de `logs`. Motivo: evitar crescimento e exposicao prolongada. Arquivos provaveis: `docs/logs.md`, `docs/banco-de-dados.md`. Status: pendente.
- [ ] Definir limpeza/expiracao de `user_states`. Motivo: estados antigos podem confundir o bot. Arquivos provaveis: `src/services/userStateService.ts`. Status: pendente.

## 7. Deploy

- [ ] Escolher Docker, systemd ou PM2. Motivo: estrategia oficial de producao ainda nao existe. Arquivos provaveis: `docs/deploy.md`. Status: pendente de confirmacao.
- [ ] Configurar usuario Linux sem root. Motivo: reduzir impacto de comprometimento. Arquivos provaveis: `docs/deploy.md`. Status: pendente.
- [ ] Configurar volume persistente para `auth/`. Motivo: nao perder pareamento do WhatsApp. Arquivos provaveis: `docs/docker.md`, `docs/deploy.md`. Status: pendente.
- [ ] Configurar rotacao de logs. Motivo: evitar disco cheio e vazamento prolongado. Arquivos provaveis: `docs/logs.md`, `docs/deploy.md`. Status: pendente.
- [ ] Criar checklist de rollback. Motivo: voltar versao em caso de falha. Arquivos provaveis: `docs/deploy.md`. Status: pendente.

## 8. Documentação

- [ ] Completar `docs/fluxo-conversa.md`. Motivo: registrar fluxo real apos leitura do codigo. Arquivos provaveis: `docs/fluxo-conversa.md`. Status: pendente.
- [ ] Completar `docs/estados-do-bot.md`. Motivo: registrar estados reais. Arquivos provaveis: `docs/estados-do-bot.md`. Status: pendente.
- [ ] Completar `docs/logs.md`. Motivo: formalizar retencao e acesso. Arquivos provaveis: `docs/logs.md`. Status: pendente.
- [ ] Completar `docs/docker.md`. Motivo: separar dev e producao. Arquivos provaveis: `docs/docker.md`. Status: pendente.
- [ ] Completar `docs/deploy.md`. Motivo: definir runbook Linux. Arquivos provaveis: `docs/deploy.md`. Status: pendente.

## 9. Testes manuais

- [ ] Testar inicializacao sem boas-vindas automatica. Motivo: comportamento confirmado no README. Arquivos provaveis: `docs/fluxo-conversa.md`. Status: pendente.
- [ ] Testar `oi` ou `menu`. Motivo: validar saudacao e menu principal. Arquivos provaveis: `src/menus/mainMenu.ts`. Status: pendente.
- [ ] Testar menu de documentos. Motivo: validar estado e envio de PDFs. Arquivos provaveis: `src/menus/docsMenu.ts`, `documentos/`. Status: pendente.
- [ ] Testar `!ping`, `!help` e `!status`. Motivo: validar comandos tecnicos. Arquivos provaveis: `src/commands`. Status: pendente.
- [ ] Testar comportamento com banco indisponivel. Motivo: falha de MySQL pode afetar fluxo. Arquivos provaveis: `src/functions/database.ts`, `src/services`. Status: pendente de confirmacao.

## Links

- [[06-Codex/prompt-auditoria-projeto-completa]]
- [[07-Security/security-auditor-codex]]
- [[08-Databases/checklist-banco-de-dados]]
- [[09-Deploy/docker]]
