# Registro de Mudanças - Firabot v7

## 1. O Que É O Firabot

O Firabot v7 é um bot de WhatsApp em TypeScript para atendimento acadêmico do IFMA Santa Inês. Ele usa Baileys para conexão com WhatsApp, MySQL para persistência de usuários/estados/logs/documentos e menus guiados por mensagens numéricas.

## 2. Objetivo Do Bot

O objetivo é facilitar o acesso de estudantes a informações recorrentes, links institucionais e documentos PDF, reduzindo atendimento manual para dúvidas simples.

## 3. Fluxo De Atendimento

1. O usuário envia uma saudação ou intenção de início, como `oi`, `bom dia`, `menu` ou `iniciar`.
2. O bot envia saudação e menu principal.
3. O usuário escolhe uma opção numérica.
4. O bot consulta o estado salvo do usuário antes de interpretar a opção.
5. Submenus como `docs` e `curso` processam suas próprias opções.
6. A opção `0` volta ao menu principal a partir de submenus e salva estado `main`.

## 4. Conexão Com WhatsApp

A conexão fica em `src/connection.ts`. O bot usa `useMultiFileAuthState("auth")` para persistir credenciais locais e `makeWASocket` para criar o socket do Baileys. O QR Code é exibido no terminal quando necessário.

## 5. Proteção Contra Mensagens Antigas

O bot registra o timestamp da inicialização da instância e passa esse valor para o `messageHandler`. Mensagens com timestamp anterior são ignoradas. Isso evita que o Baileys reprocesse backlog de conversas antigas e cause spam após reinícios.

Configuração relacionada:

- `IGNORE_OLD_MESSAGES=true`
- `MESSAGE_START_GRACE_SECONDS=0`

## 6. Estado Do Usuário

O estado é salvo na tabela `user_states`. Estados atuais:

- `main`: menu principal.
- `biblioteca`: tela informativa da biblioteca.
- `docs`: submenu de documentos.
- `docs_drca`: documentos da DRCA.
- `docs_cae`: documentos da CAE.
- `curso`: submenu de PPC do curso.
- `curso_eng_comp`: PPCs de Engenharia de Computação.
- `links`: tela de links importantes.
- `editais`: tela de editais abertos.
- `ru`: tela do Restaurante Universitário.
- `suporte`: fluxo de suporte.
- `encerrado`: atendimento encerrado.

O serviço `userStateService.ts` consulta o banco e mantém fallback em memória com log explícito quando o banco falha. Isso evita fallback silencioso para `main`, que poderia mascarar erros e causar roteamento incorreto.

## 7. Menus

Os menus foram separados em `src/menus`:

- `mainMenu.ts`
- `docsMenu.ts`
- `courseMenu.ts`
- `types.ts`

O `menuService.ts` transforma definições declarativas em texto para WhatsApp.

## 8. Comandos Com Prefixo "!"

Comandos técnicos continuam usando prefixo:

- `!help`
- `!ping`
- `!ifma`
- `!encerrar`

Os comandos plugáveis ficam em `src/commands`. O carregamento é assíncrono e aguardado antes da execução.

## 9. Mensagens Normais Sem Prefixo

Mensagens como `oi`, `olá`, `bom dia`, `boa tarde`, `boa noite`, `menu`, `iniciar`, `começar` e `ajuda` iniciam o atendimento sem exigir `!`. Mensagens desconhecidas recebem orientação curta em vez de repetir o menu principal infinitamente.

`encerrar` também é aceito sem prefixo nos fluxos de conversa e salva o estado `encerrado`. O comando `!encerrar` continua existindo por compatibilidade.

## 10. Envio De Documentos

O menu de documentos usa a tabela `docs` do MySQL. Se o banco estiver vazio ou indisponível, o bot usa fallback local definido em `docsMenu.ts`.

Antes de enviar, o bot verifica se o arquivo existe. Se o arquivo estiver ausente ou houver erro de envio, o usuário recebe uma mensagem institucional curta e o erro é registrado no console.

Na tabela `docs`, `name` é o rótulo exibido no WhatsApp e deve preservar acentos. `path` é o caminho físico do arquivo e deve evitar acentos. Exemplo:

```sql
SELECT id, name, path FROM docs ORDER BY id;
```

Arquivos esperados em `documentos/drca`:

```text
requerimento-academico.pdf
requerimento-diploma-tecnico.pdf
requerimento-superior.pdf
termo-de-desistencia.pdf
```

## 11. Banco De Dados

O schema oficial está em `database/schema.sql`. Tabelas principais:

- `users`
- `user_states`
- `logs`
- `docs`

O schema atual inclui índices úteis para logs, estados e documentos ativos.

### Banco Local Docker

Para desenvolvimento local no notebook, use sempre o MySQL via Docker:

```bash
docker compose up -d mysql
```

Dados locais:

- container: `firabot-mysql`
- banco: `firabot`
- usuário: `firabot`
- senha: `firabot123`
- host no `.env`: `127.0.0.1`
- porta: `3306`

Acesso:

```bash
docker exec -it firabot-mysql mysql -u firabot -p firabot
```

Comandos úteis dentro do MySQL:

```sql
SHOW TABLES;
SELECT * FROM docs;
DESCRIBE docs;
```

O banco remoto do IFMA deve ser usado apenas em produção, com outro `.env`. Testes locais não devem apontar para o servidor remoto.

## 12. Diferença Entre src/ E dist/

- `src/` é o código-fonte oficial em TypeScript.
- `dist/` é o JavaScript compilado pelo TypeScript.
- Nenhuma alteração manual deve ser feita em `dist/`.
- Depois de alterar `src/`, rode `npm run build` para regenerar `dist/`.
- `dist/` fica ignorado no `.gitignore`; só deve ser versionado se houver uma decisão explícita de distribuir artefato compilado.

## 13. Estratégia De Logs

O projeto usa uma estratégia híbrida:

- logs técnicos no console/stdout, centralizados em `logService.ts`;
- eventos relevantes do atendimento no MySQL, tabela `logs`;
- documentação em arquivos `.md`;
- arquivos `.txt` não devem ser usados como armazenamento principal de logs.

Tipos de evento padronizados incluem `BOT_STARTED`, `MESSAGE_RECEIVED`, `COMMAND_EXECUTED`, `MENU_OPENED`, `DOCUMENT_SENT`, `DATABASE_ERROR`, `WHATSAPP_SEND_ERROR` e outros. Logs técnicos mascaram telefone e sanitizam campos sensíveis como senha, token e QR Code.

## 14. Pontos Encontrados Na Revisão

### Problemas Reais

- O estado do usuário era o ponto mais sensível do fluxo; se falhasse, uma opção de submenu poderia cair no menu principal.
- Erros de envio de mensagens assíncronas podiam escapar sem log claro.
- Variáveis de ambiente tinham nomes diferentes dos esperados em alguns pontos.

### Riscos Futuros

- Arquivos da pasta `auth` são muito voláteis e podem poluir o versionamento.
- O fallback local de documentos é útil, mas pode esconder banco vazio se logs não forem monitorados.
- O bot ainda não possui testes de integração com MySQL e Baileys.

### Responsabilidades Misturadas

- O `messageHandler` ainda orquestra bastante coisa, mas regras de menus, documentos, estado, logs, anti-spam e guards já foram separadas em serviços.

### Melhorias De Conversação

- Mensagens inválidas agora orientam o usuário com opções válidas.
- Submenus deixam claro onde o usuário está.
- A opção `0` é padrão para voltar ao menu principal.

### Melhorias De Deploy

- Dockerfile funcional.
- `.dockerignore` criado.
- Scripts `build`, `start`, `dev`, `clean` e `test` revisados.

## Data: 2026-04-28

### Área Alterada

`src/connection.ts`

### O Que Foi Alterado

Foram adicionados controles contra múltiplas instâncias, reconexão com timer único, tratamento de `DisconnectReason.loggedOut`, logs claros e captura de erros no processamento de mensagens.

### Por Que Foi Alterado

Para evitar listeners duplicados, respostas duplicadas e reconexões infinitas quando a sessão do WhatsApp é encerrada.

### Impacto Esperado

Reconexão mais previsível, menos risco de spam e diagnóstico mais claro em produção.

### Como Testar

Iniciar o bot com `npm run dev`, conectar via QR Code, derrubar a conexão e observar logs de reconexão.

## Data: 2026-04-28

### Área Alterada

`src/middlewares/messageHandler.ts`

### O Que Foi Alterado

O fluxo passou a ignorar mensagens antigas, mensagens do próprio bot, status/broadcasts e grupos por padrão. O estado do usuário é consultado antes de interpretar números. Comandos com `!` e mensagens normais sem prefixo seguem caminhos separados.

### Por Que Foi Alterado

Para evitar spam, preservar navegação por estado e permitir atendimento natural sem prefixo.

### Impacto Esperado

O cenário `2 - Documentos` seguido de `3 - Requerimento Superior` passa a funcionar corretamente.

### Como Testar

Enviar `oi`, depois `2`, depois `3`. O bot deve enviar/processar o documento `Requerimento Superior`.

## Data: 2026-04-28

### Área Alterada

`src/services` e `src/menus`

### O Que Foi Alterado

Foram criados serviços para estado, menus, documentos, logs, roteamento, anti-spam e guards de mensagens. Menus foram movidos para definições declarativas.

### Por Que Foi Alterado

Para reduzir responsabilidade concentrada no `messageHandler` e facilitar manutenção futura.

### Impacto Esperado

Código mais organizado, testável e fácil de evoluir.

### Como Testar

Rodar `npm test` e validar manualmente os menus no WhatsApp.

## Data: 2026-04-28

### Área Alterada

`src/functions/database.ts` e `database/schema.sql`

### O Que Foi Alterado

O código passou a usar `config.ts` para dados de conexão. Erros importantes de estado/log são relançados para a camada de serviço registrar fallback explícito. O schema oficial foi ampliado com campos estruturados em `logs`, como `message_preview`, `state_before`, `state_after`, `command`, `menu`, `document_id`, `success` e `error_message`.

### Por Que Foi Alterado

Para evitar fallback silencioso e melhorar rastreabilidade.

### Impacto Esperado

Falhas de banco ficam visíveis no console e não são confundidas com fluxo normal.

### Como Testar

Executar com banco indisponível e observar logs de erro claros sem queda imediata do processo.

## Data: 2026-04-28

### Área Alterada

`.env.example`, `README.md`, `Dockerfile`, `.dockerignore`

### O Que Foi Alterado

Foram documentadas variáveis como `BOT_CAMPUS`, `DOCUMENTS_DIR`, `IGNORE_OLD_MESSAGES`, `IGNORE_GROUPS`, `LOG_LEVEL` e `DB_PASSWORD`. Foi criado `.dockerignore`.

### Por Que Foi Alterado

Para melhorar configuração, deploy e evitar copiar `auth`, `.env`, `node_modules` e `dist` para a imagem Docker.

### Impacto Esperado

Setup mais claro e imagem Docker mais limpa.

### Como Testar

Executar `docker build -t firabot-v7 .`.

## Data: 2026-04-28

### Área Alterada

`logService.ts`, `.gitignore`, `README.md`, `docs/REGISTRO_DE_MUDANCAS.md`

### O Que Foi Alterado

Foi criada uma estratégia de logs mais estruturada: tipos de evento padronizados, logs técnicos em JSON no console, telefone mascarado e eventos de atendimento persistidos no banco com campos estruturados. O `.gitignore` passou a ignorar `dist/`, `auth/`, `logs/` e `*.log`.

### Por Que Foi Alterado

Para separar logs técnicos de auditoria de atendimento, reduzir exposição de dados sensíveis e deixar claro que `dist/` é artefato gerado.

### Impacto Esperado

Diagnóstico mais fácil em produção, menor risco de vazar credenciais/telefones e versionamento mais limpo.

### Como Testar

Rodar `npm run build`, `npm test` e observar os logs no console ao iniciar o bot.

## Data: 2026-04-28

### Área Alterada

`documentService.ts`, `messageHandler.ts`, `status.ts`, `database/schema.sql`, `README.md`

### O Que Foi Alterado

Os documentos da DRCA passaram a usar `name` com acento para exibição e `path` sem acento para acesso ao arquivo. O envio agora só registra `DOCUMENT_SENT` depois de sucesso real. Falhas registram `DOCUMENT_ERROR` e não disparam follow-up de sucesso. O comando `!status` passou a exibir documentos ativos, encontrados e ausentes no disco.

### Por Que Foi Alterado

Para corrigir acentuação quebrada no WhatsApp, evitar erro de arquivo não encontrado por path com acento e impedir logs falsos de documento enviado.

### Impacto Esperado

O menu deve mostrar `Requerimento Acadêmico`, `Requerimento Diploma Técnico`, `Requerimento Superior` e `Termo de Desistência`. Cada opção deve enviar o PDF sem acento correspondente. Se algum PDF estiver ausente, o bot registra `DOCUMENT_ERROR` e nunca `DOCUMENT_SENT`.

### Como Testar

Enviar `oi`, depois `2`, e testar as opções `1`, `2`, `3` e `4`. Depois enviar `!status` para conferir se há documentos ausentes.

## Data: 2026-04-28

### Área Alterada

`docker-compose.yml`, `.env.example`, `database/schema.sql`, `src/functions/database.ts`, `src/commands/status.ts`

### O Que Foi Alterado

Foi documentado e validado o MySQL local via Docker (`firabot-mysql`) usando banco `firabot`, usuário `firabot` e senha local `firabot123`. A conexão MySQL passou a declarar `charset: utf8mb4`. Foi adicionado healthcheck de banco na inicialização e criado o comando `!status`.

### Por Que Foi Alterado

Para separar claramente desenvolvimento local do banco remoto do IFMA, diagnosticar falhas de banco logo ao iniciar e reduzir risco de problemas de acentuação nos nomes dos documentos.

### Impacto Esperado

Ambiente local mais previsível, status operacional consultável pelo WhatsApp e nomes como `Requerimento Acadêmico`, `Requerimento Diploma Técnico` e `Termo de Desistência` preservados corretamente.

### Como Testar

Subir o banco com `docker compose up -d mysql`, rodar `npm run dev`, enviar `!status` e navegar por `oi` -> `2` -> `3`.

## 15. Mudanças Implementadas Agora

- Comentários explicativos em regras sensíveis.
- Suporte aos nomes de `.env` pedidos.
- Filtro configurável para grupos.
- Mensagens melhores para opção inválida e erro de documento.
- Captura de erro no listener `messages.upsert`.
- `.dockerignore`.
- Registro de mudanças completo.
- Logs técnicos centralizados com tipos de evento e telefone mascarado.
- Campos estruturados na tabela `logs` do schema oficial.
- `.gitignore` atualizado para separar código-fonte de artefatos e credenciais.

## 16. Melhorias Futuras Recomendadas

- Criar testes de integração com banco MySQL de teste.
- Criar mocks de Baileys para testar `messageHandler` ponta a ponta.
- Mover handlers de estado para arquivos separados se o fluxo crescer.
- Adicionar tabela de auditoria para erros técnicos.
- Avaliar cache com TTL para documentos ativos.
- Padronizar versionamento da pasta `auth`, possivelmente ignorando-a no Git.
- Implementar expiração real de estado com `USER_STATE_TTL_MINUTES`.
- Criar comandos administrativos restritos usando `ADMIN_NUMBERS`.
- Criar migração SQL incremental para bancos já existentes que não tenham os novos campos de `logs`.
- Consolidar o fluxo novo com Biblioteca, Documentos DRCA, Documentos CAE, PPC por curso, Links Importantes, Editais Abertos, RU e Suporte.
- Criar painel administrativo com administrador principal e administradores setoriais por DRCA, CAE e Biblioteca.
- Manter Java/Spring Boot como possibilidade bem futura para backend administrativo e integrações institucionais, depois que o core TypeScript estiver consolidado.
- Usar os subagentes fixos documentados em `docs/SUBAGENTES_FIXOS.md` para organizar tarefas recorrentes.

## 17. Como Testar Depois Das Mudanças

Automático:

```bash
npm test
```

Manual:

1. Enviar `oi`.
2. Escolher `2`.
3. Escolher `3`.
4. Confirmar envio/processamento de `Requerimento Superior`.
5. Enviar `0`.
6. Confirmar retorno ao menu principal.
7. Enviar `oi` em qualquer estado e confirmar reset para `main`.
8. Enviar `!ping`, `!help` e `!status`.
9. Reiniciar o bot e confirmar que ele não manda boas-vindas automaticamente; depois enviar `oi` ou `menu` e confirmar saudação + menu.

## 18. Como Executar Localmente

```bash
npm install
npm run dev
```

## 19. Como Executar Com Docker

```bash
docker build -t firabot-v7 .
docker run --env-file .env -v ./auth:/app/auth -v ./documentos:/app/documentos firabot-v7
```

## 20. Problemas Conhecidos E Observações

- `auth/` contém credenciais e arquivos de sessão do Baileys; idealmente deve ser tratado como volume/segredo e não como código-fonte.
- Os testes atuais cobrem regras puras, não integração real com WhatsApp.
- O fallback local de documentos mantém o bot operando, mas logs devem ser monitorados para detectar falhas de banco.
- Se um banco antigo já existir, pode ser necessário aplicar uma migração para adicionar os novos campos estruturados da tabela `logs`.

## Data: 2026-05-15

### Área Alterada

Documentação estratégica e organização de trabalho.

### O Que Foi Alterado

Foi registrado o relatório estratégico em `docs/RELATORIO_ESTRATEGICO.md` e criado o mapa de subagentes fixos em `docs/SUBAGENTES_FIXOS.md`. Também foram criadas skills locais para Baileys/WhatsApp, fluxo conversacional por estado e painel administrativo com RBAC.

### Por Que Foi Alterado

Para deixar explícito o caminho de evolução do FiraBot v7, registrar que Java ficará para uma fase bem futura e organizar as próximas tarefas em frentes fixas de responsabilidade.

### Impacto Esperado

O projeto passa a ter uma trilha mais clara para consolidar o bot em TypeScript, evoluir o fluxo conversacional, preparar o painel administrativo e delegar tarefas futuras com critérios mais objetivos.

### Como Testar

Revisar `docs/RELATORIO_ESTRATEGICO.md`, `docs/SUBAGENTES_FIXOS.md` e confirmar que as novas skills locais foram validadas estruturalmente.

## Data: 2026-05-15

### Área Alterada

Fluxo conversacional, menu principal, estados e documentação.

### O Que Foi Alterado

O menu principal passou para o modelo `1 - Biblioteca`, `2 - Documentos`, `3 - PPC do Curso`, `4 - Links Importantes`, `5 - Editais Abertos`, `6 - RU` e `7 - Suporte`. Foram adicionados estados informativos para Biblioteca, Links, Editais e RU. O comando `encerrar` sem prefixo agora encerra atendimento e salva estado `encerrado`; `!encerrar` foi mantido por compatibilidade. A opção `0` deixou de agir como retorno no menu principal e permanece válida em submenus/telas de continuidade.

### Por Que Foi Alterado

Para iniciar o alinhamento do código com o novo fluxograma aprovado e reduzir ambiguidade entre menu principal e submenus.

### Impacto Esperado

O usuário vê o novo menu principal, consegue acessar Links Importantes e Editais Abertos como opções próprias, e pode encerrar atendimento digitando apenas `encerrar` em telas de continuidade.

### Como Testar

Enviar `oi`, conferir as sete opções do menu principal, testar `4`, depois `0`, testar `5`, depois `encerrar`, e rodar `npm test`.

## Data: 2026-05-15

### Área Alterada

Submenus de Documentos e PPC do Curso.

### O Que Foi Alterado

O menu `2 - Documentos` deixou de listar PDFs diretamente e passou a pedir primeiro o setor: `1 - Documentos DRCA` e `2 - Documentos CAE`. Os PDFs atuais foram mantidos dentro de `Documentos DRCA`; `Documentos CAE` fica preparado e informa que ainda não há documentos cadastrados. O menu `3 - PPC do Curso` passou a listar cursos antes de listar os PPCs disponíveis. Em etapa posterior, os PPCs foram organizados por curso em `documentos/ppc`.

### Por Que Foi Alterado

Para alinhar o bot ao fluxo aprovado, separar setores acadêmicos e preparar a evolução futura por categorias no banco.

### Impacto Esperado

O usuário passa por uma navegação mais clara: `2 -> 1 -> documento DRCA` para documentos da DRCA, e `3 -> curso -> PPC` para documentos de PPC.

### Como Testar

Enviar `oi`, depois `2`, depois `1`, depois `3` para validar `Requerimento Superior`. Em seguida enviar `0`, `3`, escolher um curso e selecionar um PPC disponível.

## Data: 2026-05-15

### Área Alterada

Banco de dados e documentação de documentos por categoria.

### O Que Foi Alterado

A tabela `docs` foi preparada para documentos por categoria com os campos opcionais `category_code`, `category_label` e `sort_order`. Os registros iniciais continuam sendo os quatro documentos da DRCA, agora marcados com `category_code = 'drca'`, `category_label = 'DRCA'` e ordenação sequencial. A categoria CAE foi documentada como preparada para cadastro futuro, sem documentos iniciais no schema.

### Por Que Foi Alterado

Para permitir evolução segura do menu de documentos por setor sem quebrar o fluxo atual, que ainda consulta documentos ativos por `name` e `path`.

### Impacto Esperado

O envio atual de documentos DRCA continua funcionando. Em uma etapa futura, o código poderá filtrar por `category_code` e ordenar por `sort_order` para carregar documentos DRCA, CAE ou outros setores dinamicamente.

### Como Testar

Rodar `npm run build` e, em banco local recriado pelo schema, conferir:

```sql
DESCRIBE docs;
SELECT id, name, category_code, category_label, sort_order, is_active FROM docs ORDER BY id;
```

## Data: 2026-05-16

### Área Alterada

Arquitetura de fluxo, documentos, PPCs e planejamento de IA.

### O Que Foi Alterado

O `messageHandler.ts` foi enxugado para atuar como coordenador do recebimento das mensagens. A lógica de comandos com `!` foi movida para `src/handlers/commandHandler.ts`; o roteamento de opções numéricas ficou em `src/handlers/menuOptionHandler.ts`; e os fluxos específicos foram separados em `src/flows/conversationFlow.ts`, `src/flows/mainMenuFlow.ts`, `src/flows/documentsFlow.ts`, `src/flows/courseFlow.ts` e `src/flows/documentSendFlow.ts`.

O menu `PPC do Curso` passou a usar os novos PPCs organizados por curso em `documentos/ppc`. Foram adicionados estados semânticos para Administração, Licenciatura em Física, Tecnologia em Construção de Edifícios e Engenharia Civil, além de Engenharia de Computação.

O envio de documentos agora retorna uma mensagem de sucesso com um resumo breve sobre a finalidade do documento. Isso vale para documentos DRCA e PPCs. Também foi criado o documento `docs/PLANO_IA_INTELIGENTE.md` para registrar a estratégia futura de IA do bot.

### Por Que Foi Alterado

Para reduzir o tamanho e a responsabilidade do `messageHandler.ts`, facilitar manutenção por área do fluxo, implementar os PPCs recém-adicionados e melhorar a experiência do estudante após receber um documento.

### Impacto Esperado

O código fica mais modular e mais fácil de evoluir com os subagentes. O usuário consegue escolher PPCs de cursos diferentes, recebe o PDF correto e também entende rapidamente para que aquele documento serve. A IA futura fica planejada sem ser acoplada prematuramente ao core atual.

### Como Testar

Rodar:

```bash
npm test
```

Testes manuais recomendados:

1. Enviar `oi`.
2. Enviar `2`, depois `1`, depois escolher um documento DRCA.
3. Confirmar PDF enviado e resumo exibido.
4. Enviar `0`.
5. Enviar `3`.
6. Escolher cada curso disponível e validar os PPCs listados.
7. Escolher um PPC e confirmar PDF enviado com resumo.
8. Validar `!ping`, `!help` e `!status`.

## Data: 2026-05-16

### Área Alterada

Continuação contextual após documentos e decisão arquitetural de IA.

### O Que Foi Alterado

Após o envio bem-sucedido de um documento, o bot passou a mostrar as outras opções do mesmo submenu, removendo apenas a opção que acabou de ser escolhida. A mensagem mantém `0 - Voltar ao Menu Principal` e `encerrar - Terminar conversa`.

Também foi atualizada a decisão de arquitetura: o core do WhatsApp permanece em TypeScript/Baileys, a IA futura será planejada como serviço Python separado, e Java/Spring Boot fica reservado para backend administrativo em uma fase bem posterior.

Depois da revisão de prioridade, ficou registrado que o painel administrativo vem antes da IA. Foi criado `docs/PLANO_PAINEL_ADMIN.md` para orientar o MVP do painel com administrador principal, administradores setoriais, gestão de documentos, status do bot e auditoria.

### Por Que Foi Alterado

Para reduzir atrito na conversa. Depois de receber um documento, o usuário pode pedir outro item relacionado sem precisar voltar ao menu principal. A decisão sobre Python evita misturar dependências de IA no core do bot e deixa cada tecnologia no papel em que faz mais sentido. A priorização do painel evita começar IA antes de resolver a administração operacional do bot.

### Impacto Esperado

A experiência fica mais fluida em menus de documentos e PPCs. A arquitetura futura fica mais clara para evolução: TypeScript para WhatsApp, Python para IA e Java apenas para backend/admin quando houver necessidade real.

### Como Testar

1. Enviar `oi`.
2. Enviar `2`, depois `1`.
3. Escolher `1 - Requerimento Acadêmico`.
4. Confirmar que o bot envia o PDF, resumo e depois lista `2`, `3`, `4`, `0` e `encerrar`.
5. Enviar uma das opções restantes e confirmar novo envio.
6. Repetir com `3 - PPC do Curso`.

## Data: 2026-05-16

### Área Alterada

Suporte, documentos dinâmicos, painel administrativo e testes.

### O Que Foi Alterado

O fluxo `7 - Suporte` passou a pedir uma mensagem livre do usuário. Enquanto não houver administradores setoriais pelo painel, o bot registra essa mensagem e em seguida pergunta se o usuário deseja voltar ao menu principal ou encerrar.

A tabela `docs` foi expandida com `summary`, e o código passou a consultar documentos por `category_code`. Os documentos DRCA e os PPCs foram registrados no schema com categorias próprias, mantendo fallback local para não quebrar o bot caso o banco antigo ainda não tenha todos os campos.

Foi criada a base inicial do painel administrativo no schema com `sectors`, `admin_roles`, `admin_users`, `admin_user_sectors` e `admin_audit_logs`. Também foi adicionado um teste com socket fake para iniciar a cobertura de fluxos sem depender do WhatsApp real.

### Por Que Foi Alterado

Para deixar o suporte coerente com a fase atual do projeto, preparar o painel administrativo antes da IA, reduzir hardcode de documentos/PPCs e começar a testar comportamentos de conversa com um socket falso.

### Impacto Esperado

O usuário consegue registrar uma mensagem de suporte simples. O painel administrativo já tem uma modelagem inicial de permissões por setor. Documentos e PPCs ficam mais próximos de uma gestão dinâmica via banco.

### Como Testar

1. Rodar `npm test`.
2. No WhatsApp, enviar `oi`, depois `7`, depois uma mensagem de suporte.
3. Confirmar que o bot registra a mensagem e mostra opções para voltar ou encerrar.
4. Testar `2 -> 1 -> documento` e `3 -> curso -> PPC`.

## Data: 2026-05-16

### Área Alterada

Links importantes, editais e confirmação do suporte.

### O Que Foi Alterado

O fluxo `4 - Links Importantes` passou a incluir o link direto de login do SUAP: `https://suap.ifma.edu.br/accounts/login/?next=/`.

O fluxo `5 - Editais Abertos` passou a listar até 10 editais em andamento encontrados na página oficial de processos seletivos do IFMA, usando `https://processoseletivo.ifma.edu.br/` como fonte. Após enviar a lista, o bot mostra imediatamente as opções `0 - Voltar ao Menu Principal` e `encerrar - Terminar conversa`.

O fluxo `7 - Suporte` agora muda para o estado `suporte_confirmacao` depois de registrar a primeira mensagem do usuário. Isso evita que mensagens como `oi` ou `menu` fiquem sendo registradas repetidamente como novas solicitações de suporte. Depois do registro, o usuário pode voltar com `0`, encerrar ou reiniciar com `oi/menu`.

### Por Que Foi Alterado

Para corrigir inconsistências vistas em teste real no WhatsApp: editais não ofereciam claramente retorno/encerramento, suporte continuava capturando mensagens repetidas, e Links Importantes ainda não tinha o link direto do login SUAP.

### Impacto Esperado

O usuário tem acesso mais rápido ao SUAP, vê editais oficiais em andamento sem sair do fluxo, e o suporte fica mais previsível após registrar uma solicitação.

### Como Testar

1. Enviar `oi`.
2. Enviar `4` e conferir se aparece `Login SUAP`.
3. Enviar `0`.
4. Enviar `5` e conferir a lista de editais e o follow-up.
5. Enviar `7`, depois uma mensagem qualquer, e conferir a confirmação + opções para voltar/encerrar.
