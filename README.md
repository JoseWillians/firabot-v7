# Firabot v7

Bot de WhatsApp em TypeScript para atendimento acadêmico do IFMA Santa Inês. Ele usa Baileys para conexão com WhatsApp, MySQL para estado/logs/documentos e menus guiados por números.

## Requisitos

- Node.js LTS
- npm ou yarn
- MySQL
- WhatsApp para leitura do QR Code

## Instalação

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Configuração

Variáveis principais:

- `BOT_NAME`: nome exibido pelo bot.
- `BOT_CAMPUS`: campus usado nas mensagens de saudação.
- `DOCUMENTS_DIR`: pasta base dos documentos.
- `IGNORE_OLD_MESSAGES`: ativa o filtro contra backlog de mensagens antigas.
- `IGNORE_GROUPS`: evita respostas em grupos.
- `DEBUG_MODE`: ativa logs detalhados quando `true`.
- `LOG_LEVEL`: nível de log esperado. Use `debug` para detalhes adicionais.
- `MESSAGE_START_GRACE_SECONDS`: tolerância para filtro de mensagens anteriores ao início.
- `SPAM_WINDOW_MS`: janela para evitar respostas repetidas ao mesmo usuário/texto.
- `RECONNECT_DELAY_MS`: atraso antes de tentar reconectar.
- `USER_STATE_TTL_MINUTES`: tempo planejado para expiração futura de estado.
- `ADMIN_NUMBERS`: números autorizados para comandos administrativos futuros, separados por vírgula.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: conexão MySQL.

## Banco de Dados

Para desenvolvimento no notebook, use o MySQL local via Docker. O banco remoto do IFMA existe, mas não deve ser usado nos testes locais.

```bash
docker compose up -d mysql
```

O `docker-compose.yml` sobe:

- container: `firabot-mysql`
- banco: `firabot`
- usuário: `firabot`
- senha local: `firabot123`
- porta local: `3306`
- schema inicial: `./database/schema.sql`

Acesse o MySQL local com:

```bash
docker exec -it firabot-mysql mysql -u firabot -p firabot
```

Senha:

```text
firabot123
```

Comandos úteis dentro do MySQL:

```sql
SHOW TABLES;
SELECT * FROM docs;
DESCRIBE docs;
```

Tabelas usadas:

- `users`: usuários identificados pelo JID/número.
- `user_states`: estado atual de navegação.
- `logs`: histórico simples de eventos.
- `docs`: documentos ativos carregados no menu de documentos.

Para produção, use outro `.env` apontando para o servidor do IFMA. Não misture credenciais remotas com o `.env` local de desenvolvimento.

### Documentos

Na tabela `docs`, a coluna `name` é o rótulo exibido ao usuário no WhatsApp e deve manter acentos. A coluna `path` é apenas o caminho físico do arquivo PDF e deve evitar acentos para reduzir problemas de encoding entre Windows, Docker, MySQL e WhatsApp.

Exemplo esperado:

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

Para conferir no PowerShell:

```powershell
Get-ChildItem documentos\drca
```

## src/ e dist/

- `src/` é o código-fonte oficial em TypeScript.
- `dist/` é gerado automaticamente por `npm run build`.
- Não edite arquivos dentro de `dist/` manualmente.
- Toda mudança deve ser feita em `src/` e depois compilada.
- `dist/` fica fora do versionamento pelo `.gitignore`, salvo se houver uma decisão explícita de distribuir build pronto.

## Execução Local

Desenvolvimento:

```bash
npm run dev
```

Use `npm run dev` em desenvolvimento. Não use `npm restart dev`; esse comando não representa o fluxo do projeto.

Build:

```bash
npm run build
```

Produção local:

```bash
npm run build
npm start
```

Testes:

```bash
npm test
```

## Estratégia de Logs

O Firabot usa uma estratégia híbrida:

- logs técnicos vão para console/stdout em formato JSON simples;
- eventos importantes do atendimento vão para a tabela `logs` no MySQL;
- arquivos `.md` documentam decisões e mudanças;
- arquivos `.txt` não são usados como armazenamento principal de logs.

Os logs técnicos mascaram telefone e removem campos sensíveis como senha, token e QR Code. Eventos do banco guardam apenas preview e metadados úteis, como tipo de evento, estado anterior, estado posterior, comando, menu, documento e sucesso.

## Docker

Build da imagem:

```bash
docker build -t firabot-v7 .
```

Execução:

```bash
docker run --env-file .env -v ./auth:/app/auth firabot-v7
```

Monte também `./documentos:/app/documentos` se quiser usar documentos do host em vez dos copiados na imagem.

## Comandos

- `oi`, `olá`, `bom dia`, `boa tarde`, `boa noite`, `menu`, `iniciar`, `ajuda`: iniciam atendimento sem prefixo.
- `!help`: lista comandos técnicos.
- `!ping`: verifica se o bot está ativo.
- `!status`: mostra status de WhatsApp, banco, inicialização, ambiente, documentos ativos e debug.
- `!ifma`: mostra informações úteis do campus.
- `encerrar`: encerra atendimento em fluxos de conversa.
- `!encerrar`: encerra atendimento como comando técnico compatível.

Menu principal atual:

- `1 - Biblioteca`
- `2 - Documentos`
- `3 - PPC do Curso`
- `4 - Links Importantes`
- `5 - Editais Abertos`
- `6 - RU`
- `7 - Suporte`

O menu principal não exibe `0 - Voltar`. A opção `0` vale apenas dentro de submenus ou telas de continuidade.

## Estrutura

- `src/index.ts`: entrada da aplicação.
- `src/connection.ts`: conexão com WhatsApp, QR Code e reconexão.
- `src/middlewares/messageHandler.ts`: orquestra o processamento das mensagens.
- `src/commands`: comandos com prefixo `!`.
- `src/menus`: definições declarativas de menus.
- `src/services`: regras de negócio, documentos, estado, logs e proteções.
- `src/functions/database.ts`: acesso MySQL.
- `documentos`: PDFs enviados pelo bot.
- `auth`: credenciais locais do Baileys.

## Documentação Estratégica

- `docs/RELATORIO_ESTRATEGICO.md`: visão técnica aprovada, riscos, melhorias futuras e decisão de deixar Java para uma fase bem futura.
- `docs/SUBAGENTES_FIXOS.md`: cinco frentes fixas de trabalho para organizar próximas tarefas, responsabilidades e skills.
- `docs/REGISTRO_DE_MUDANCAS.md`: histórico consolidado de mudanças e decisões.

## Fluxo de Estado

O bot consulta o estado do usuário antes de interpretar opções numéricas. Assim, depois de escolher `2 - Documentos`, a próxima opção escolhe entre `1 - Documentos DRCA` e `2 - Documentos CAE`. Dentro de `Documentos DRCA`, a opção `3` envia `Requerimento Superior`, em vez de abrir o menu de PPC do curso.

No fluxo `3 - PPC do Curso`, o bot primeiro lista cursos. Por enquanto, apenas `Engenharia de Computação` possui PPCs cadastrados; os demais cursos aparecem como opções preparadas para cadastro futuro.

## Solução de Problemas

- QR Code aparece repetidamente: apague a sessão em `auth` apenas se quiser parear novamente.
- Bot não responde: confira se `IGNORE_GROUPS=true` está bloqueando mensagens de grupo e se a mensagem não é anterior ao início do bot.
- Documentos não enviam: verifique se o caminho cadastrado em `docs.path` existe dentro do projeto ou container.
- Estado parece errado: confira a tabela `user_states` e os logs do console; falhas de banco agora são registradas claramente.
- Docker não encontra PDFs: monte `./documentos:/app/documentos` ou garanta que a pasta foi copiada para a imagem.
- Erro de configuração ao iniciar: confira `DB_HOST`, `DB_USER` e `DB_NAME` no `.env`.
- Banco indisponível: confirme `docker compose up -d mysql`, `DB_HOST=127.0.0.1`, `DB_PORT=3306` e as credenciais locais.

## Testes Manuais Recomendados

1. Reinicie o bot e confirme que ele não manda boas-vindas sozinho.
2. Depois do restart, envie `oi` ou `menu` e confirme saudação + menu principal.
3. Envie `2` e confirme abertura do submenu `Documentos DRCA` / `Documentos CAE`.
4. Envie `1` e confirme abertura dos documentos DRCA.
5. Envie `1`, `2`, `3` e `4` dentro de DRCA e confirme o envio dos quatro PDFs.
6. Envie `3` dentro de DRCA e confirme especificamente o envio de `Requerimento Superior`.
7. Envie `0` e confirme retorno ao menu principal.
8. Envie `3`, depois `1`, e confirme abertura dos PPCs de Engenharia de Computação.
9. Envie `2` dentro de Engenharia de Computação e confirme envio do PPC 2024.
10. Envie `oi` em qualquer estado e confirme reset para `main`.
11. Envie `!ping`, `!help` e `!status`.
12. Envie `4`, depois `0`, e confirme retorno ao menu principal.
13. Envie `5`, depois `encerrar`, e confirme encerramento do atendimento.

## Observações Sobre WhatsApp/Baileys

O Baileys usa arquivos de sessão na pasta `auth`. Esses arquivos mudam com frequência e devem ser tratados como credenciais locais. Em produção, prefira usar volume persistente e evitar versionar esses arquivos.
