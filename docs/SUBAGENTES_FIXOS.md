# Subagentes Fixos - FiraBot v7

Este arquivo registra os cinco subagentes conceituais que devem orientar as próximas tarefas do FiraBot v7. Eles não substituem a gestão humana do projeto: eu e você continuamos coordenando prioridades, escopo e validação.

Todos os subagentes deste projeto devem ser tratados como profissionais de nível sênior ou superior, com experiência prática de mercado na área correspondente. Isso significa que cada tarefa deve ser conduzida com visão de produção, manutenção, segurança, testes, documentação e impacto real para usuários e equipe.

Sempre que uma tarefa for atribuída a um subagente, registre nesta documentação ou em `docs/backlog.md`:

- data;
- subagente responsável;
- objetivo;
- arquivos prováveis;
- validação esperada;
- status.

## 1. Arquiteto de Produto e Fluxo

Perfil:

- profissional sênior ou staff;
- experiência em produto técnico, discovery, fluxos conversacionais e arquitetura incremental;
- capacidade de transformar requisitos ambíguos em etapas pequenas, verificáveis e seguras.

Responsabilidade:

- transformar requisitos em plano incremental;
- manter coerência entre fluxograma, README, backlog e código;
- evitar refatorações grandes sem necessidade;
- decidir quando algo deve virar melhoria futura.

Skills principais:

- `ralph`
- `superpowers`
- `addyosmani-engineering-skills`
- `chatbot-flow-state-machine`

Especialidades esperadas:

- análise de requisitos;
- PRD leve;
- critérios de aceite;
- decomposição de histórias pequenas;
- arquitetura evolutiva;
- documentação de decisões.

Tarefas típicas:

- alinhar menu principal ao fluxograma;
- escrever critérios de aceite para novos submenus;
- priorizar backlog;
- definir estados semânticos;
- revisar impacto de mudanças no fluxo.

## 2. Engenheiro de Bot WhatsApp e Conversação

Perfil:

- engenheiro sênior de integrações e bots;
- experiência prática com Node.js/TypeScript, mensageria, WebSocket, WhatsApp/Baileys e sistemas event-driven;
- foco em confiabilidade, anti-spam, reconexão e experiência do usuário final.

Responsabilidade:

- cuidar do fluxo do WhatsApp, Baileys, mensagens, reconexão e UX textual;
- garantir que o bot não responda backlog antigo;
- manter comandos com `!` separados do atendimento normal;
- melhorar fallback, encerramento e navegação.

Skills principais:

- `baileys-whatsapp-bot`
- `chatbot-integrations`
- `chatbot-flow-state-machine`
- `superpowers`

Especialidades esperadas:

- TypeScript/Node.js;
- Baileys;
- eventos assíncronos;
- WebSocket;
- estado conversacional;
- mensagens institucionais claras;
- tratamento de erro e anti-spam.

Tarefas típicas:

- refatorar `messageHandler.ts`;
- criar `src/flows/documentos.ts`;
- criar estados como `docs_drca` e `docs_cae`;
- melhorar reconexão;
- ajustar mensagens inválidas por menu.

## 3. Engenheiro de Backend, Banco e Painel

Perfil:

- engenheiro backend sênior ou arquiteto de dados/aplicações;
- experiência com MySQL, APIs, RBAC, auditoria, integrações e modelagem evolutiva;
- capacidade de preparar o caminho para painel administrativo sem antecipar complexidade desnecessária.

Responsabilidade:

- cuidar de MySQL, schema, documentos dinâmicos, API futura e painel administrativo;
- preparar RBAC por setor;
- garantir que dados administrativos tenham escopo correto.

Skills principais:

- `bot-admin-panel-rbac`
- `database-change-safety`
- `api-segura-node-express`
- `addyosmani-engineering-skills`

Especialidades esperadas:

- MySQL;
- modelagem relacional;
- migrations;
- APIs REST;
- autenticação;
- autorização por papel e setor;
- auditoria de alterações;
- TypeScript backend;
- Java/Spring Boot como possibilidade futura.

Tarefas típicas:

- propor tabelas para setores, categorias e documentos;
- preparar painel administrativo;
- criar regras de acesso por setor;
- desenhar API para QR Code/status do bot;
- planejar futura separação TypeScript + Java.

## 4. DevOps, Segurança e Operação

Perfil:

- profissional sênior de DevOps/SRE/segurança aplicada;
- experiência com Docker, Linux, secrets, backup, observabilidade, deploy e hardening básico;
- visão de risco operacional para produção institucional.

Responsabilidade:

- cuidar de Docker, deploy, secrets, auth do Baileys, logs, backups e observabilidade;
- evitar exposição de credenciais e dados pessoais;
- preparar execução segura em produção.

Skills principais:

- `docker-vps-deploy`
- `trailofbits-security-skills`
- `api-segura-node-express`
- `database-change-safety`

Especialidades esperadas:

- Docker/Docker Compose;
- Linux/VPS;
- CI/CD;
- secrets;
- backup/restore;
- LGPD;
- logs estruturados;
- healthcheck;
- monitoramento;
- hardening básico.

Tarefas típicas:

- definir estratégia de deploy;
- proteger `auth/`;
- configurar backup MySQL;
- revisar logs sensíveis;
- criar checklist de produção.

## 5. QA, Documentação e Conhecimento

Perfil:

- profissional sênior de QA/qualidade/documentação técnica;
- experiência com testes automatizados, regressão, matriz de cenários, runbooks e documentação viva;
- foco em transformar mudanças técnicas em validação clara e conhecimento reutilizável.

Responsabilidade:

- garantir que cada mudança tenha teste, validação manual e documentação;
- manter README, registro de mudanças, fluxos e runbooks atualizados;
- transformar decisões técnicas em material reutilizável.

Skills principais:

- `superpowers`
- `ralph`
- `playwright-browser-automation`
- `chatbot-flow-state-machine`

Especialidades esperadas:

- testes unitários;
- testes de integração;
- matriz de cenários;
- documentação Markdown;
- Mermaid;
- revisão de regressão;
- runbooks operacionais.

Tarefas típicas:

- ampliar `tests/run-tests.mjs`;
- criar testes para fluxos novos;
- documentar fluxo real;
- atualizar `docs/REGISTRO_DE_MUDANCAS.md`;
- validar build e testes antes de concluir.

## Registro de Tarefas dos Subagentes

| Data | Subagente | Tarefa | Status | Validação |
| --- | --- | --- | --- | --- |
| 2026-05-15 | Arquiteto de Produto e Fluxo | Registrar relatório estratégico e melhorias futuras | Concluído | Documentação criada |
| 2026-05-15 | QA, Documentação e Conhecimento | Criar mapa de subagentes fixos | Concluído | Este arquivo criado |
| 2026-05-15 | Engenheiro de Bot WhatsApp e Conversação | Criar skill Baileys WhatsApp Bot | Concluído | Skill validada |
| 2026-05-15 | Arquiteto de Produto e Fluxo | Criar skill Chatbot Flow State Machine | Concluído | Skill validada |
| 2026-05-15 | Engenheiro de Backend, Banco e Painel | Criar skill Bot Admin Panel RBAC | Concluído | Skill validada |
| 2026-05-15 | Todos | Reforçar perfil sênior ou superior para atuação no projeto | Concluído | Documento atualizado |
| 2026-05-15 | Arquiteto de Produto e Fluxo | Planejar alinhamento do fluxo ao novo menu principal | Concluído | Relatório recebido |
| 2026-05-15 | Engenheiro de Bot WhatsApp e Conversação | Revisar core Baileys/mensagens para refatoração segura | Concluído | Relatório recebido |
| 2026-05-15 | Engenheiro de Backend, Banco e Painel | Planejar evolução de documentos por categoria/setor, sem iniciar painel | Concluído | Relatório recebido |
| 2026-05-15 | DevOps, Segurança e Operação | Revisar riscos operacionais antes de produção | Concluído | Relatório recebido |
| 2026-05-15 | QA, Documentação e Conhecimento | Planejar testes e documentação da próxima etapa | Concluído | Relatório recebido |
| 2026-05-15 | Engenheiro de Bot WhatsApp e Conversação | Aplicar primeira fatia do novo fluxo: menu 1-7, estados informativos e encerrar sem prefixo | Concluído | Build e testes |
| 2026-05-16 | Engenheiro de Bot WhatsApp e Conversação | Quebrar `messageHandler.ts` em coordenador, handlers e flows por área | Concluído | `npm test` |
| 2026-05-16 | Engenheiro de Backend, Banco e Painel | Mapear novos PPCs por curso e ajustar estados semânticos | Concluído | `npm test` |
| 2026-05-16 | QA, Documentação e Conhecimento | Validar summaries pós-documento e registrar plano de IA futura | Concluído | `docs/PLANO_IA_INTELIGENTE.md` |

## Observação Sobre Java

Java deve permanecer como melhoria bem futura. A prioridade atual é consolidar o bot em TypeScript, separar fluxos, ampliar testes e preparar o painel. Java/Spring Boot só deve ser considerado quando houver necessidade real de backend administrativo mais robusto, integrações institucionais ou governança maior.
