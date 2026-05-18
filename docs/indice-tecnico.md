# Índice Técnico - FiraBot v7

Data da leitura: 2026-05-17.

Este índice consolida a leitura do projeto feita a partir de `README.md`, `AGENTS.md`, `docs/`, `database/schema.sql`, `package.json`, `.env.example`, `Dockerfile`, `docker-compose.yml`, `tests/run-tests.mjs` e `src/`.

Arquivos e pastas sensíveis ou gerados não foram lidos como fonte de documentação: `.env`, `auth/`, `dist/`, `node_modules/`, `coverage/`, `.git/` e `graphify-out/`.

## Documentos Criados Nesta Rodada

- `docs/mapa-do-codigo.md`: visão da arquitetura real do código TypeScript.
- `docs/mapa-de-menus.md`: árvore dos menus, estados e documentos enviados.
- `docs/banco-operacao-seguranca.md`: banco, configuração, Docker, logs e riscos operacionais.
- `docs/runbook-validacao.md`: roteiro prático para validar build, testes e atendimento no WhatsApp.
- `docs/pendencias-documentacao.md`: divergências entre documentação atual e código real.

## Visão Rápida

O FiraBot v7 é um bot de WhatsApp em TypeScript para atendimento acadêmico do IFMA Santa Inês. Ele usa Baileys para conexão com WhatsApp, MySQL para estado/logs/documentos, Docker Compose para MySQL local e menus guiados por números.

O fluxo atual já está dividido em camadas:

- `src/index.ts`: inicialização da aplicação.
- `src/connection.ts`: conexão Baileys, sessão, QR Code e reconexão.
- `src/middlewares/messageHandler.ts`: entrada e orquestração das mensagens.
- `src/handlers/`: despacho de comandos e opções numéricas.
- `src/flows/`: fluxos de conversa por área.
- `src/services/`: regras reutilizáveis, logs, estado, documentos, menu e proteções.
- `src/menus/`: definições declarativas de menus e documentos fallback.
- `src/functions/database.ts`: acesso MySQL.
- `database/schema.sql`: schema inicial e seeds.
- `tests/run-tests.mjs`: testes automatizados baseados no build.

## Estado Atual Do Projeto

Pontos consolidados:

- Atendimento inicia com `oi`, `olá`, `bom dia`, `boa tarde`, `boa noite`, `menu`, `iniciar`, `ajuda`, `help` ou `start`.
- Comandos técnicos usam prefixo `!`.
- Opções numéricas são roteadas de acordo com o estado salvo do usuário.
- Documentos DRCA e PPCs são enviados como PDF.
- Menu de PPC já contempla cinco cursos.
- Logs técnicos mascaram telefone/JID e removem chaves sensíveis conhecidas.
- SQL usa queries parametrizadas.
- Há fallback em memória para estado quando o banco falha.
- Há fallback local de documentos DRCA/PPC quando o banco não retorna registros.
- Há testes para guardas, roteamento, menus, estados, mensagens de suporte e follow-up.

Pontos ainda pendentes:

- `USER_STATE_TTL_MINUTES` é aplicado ao ler estado do usuário; estados expirados voltam para `main`.
- `ADMIN_NUMBERS` protege comandos operacionais como `!ping` e `!status`.
- Não há migrations versionadas além de `database/schema.sql`.
- Não há política definida de retenção/limpeza de logs.
- O painel administrativo ainda é planejamento/schema inicial, sem API ou frontend.
- Editais estão hardcoded em `src/menus/noticesMenu.ts`.
- O fluxo de documentos CAE ainda informa ausência de cadastro automático.

## Leitura Recomendada

Para entender o projeto rapidamente:

1. `README.md`
2. `AGENTS.md`
3. `docs/indice-tecnico.md`
4. `docs/mapa-do-codigo.md`
5. `docs/mapa-de-menus.md`
6. `docs/banco-operacao-seguranca.md`
7. `docs/runbook-validacao.md`
8. `docs/pendencias-documentacao.md`

Para trabalhar no código:

1. `src/index.ts`
2. `src/connection.ts`
3. `src/middlewares/messageHandler.ts`
4. `src/handlers/menuOptionHandler.ts`
5. `src/handlers/commandHandler.ts`
6. `src/flows/`
7. `src/services/menuRoutingService.ts`
8. `src/services/userStateService.ts`
9. `src/services/documentService.ts`
10. `src/functions/database.ts`

## Validação Recomendada

Comandos:

```powershell
cd C:\Dev\Projetos\firabot-v7
npm test
```

Validação manual principal:

```text
oi
2 -> 1 -> documentos DRCA
0 -> 3 -> cursos -> PPCs
0 -> 7 -> mensagem livre de suporte
encerrar
!ping
!help
!status
```

## Observação Sobre Git

Durante a leitura, o worktree já possuía alterações não relacionadas a esta documentação. Esta rodada criou apenas novos arquivos `.md` em `docs/`, sem reverter nem sobrescrever mudanças existentes.
