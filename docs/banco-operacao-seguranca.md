# Banco, Operação e Segurança - FiraBot v7

Este documento consolida banco de dados, configuração, Docker, logs e pontos de segurança observados no projeto.

## Banco De Dados

Banco esperado: MySQL 8+.

Schema principal: `database/schema.sql`.

Tabelas atuais:

| Tabela | Responsabilidade |
| --- | --- |
| `users` | Usuários que conversaram com o bot, identificados por `phone_number` |
| `user_states` | Estado atual de navegação por usuário |
| `logs` | Eventos de atendimento, comandos, menus, documentos e erros |
| `docs` | Documentos ativos, caminhos, resumos, categoria e ordenação |
| `sectors` | Setores administrativos futuros |
| `admin_roles` | Papéis administrativos futuros |
| `admin_users` | Usuários futuros do painel administrativo |
| `admin_user_sectors` | Relação entre admin setorial e setor |
| `admin_audit_logs` | Auditoria futura de ações administrativas |

Índices relevantes:

- `user_states.state`
- `logs.user_id`
- `logs.created_at`
- `logs.event_type`
- `logs.success`
- `docs.is_active`
- `docs.category_code, docs.is_active, docs.sort_order, docs.id`

## Documentos No Banco

A tabela `docs` já suporta categorias:

- `drca`
- `ppc_eng_comp`
- `ppc_bach_adm`
- `ppc_lic_fis`
- `ppc_grad_tce`
- `ppc_eng_civil`

CAE está preparado conceitualmente, mas sem documentos automáticos iniciais.

Regra recomendada para o painel futuro:

- aceitar apenas PDF;
- limitar tamanho máximo;
- salvar somente caminhos relativos;
- bloquear `..`, caminhos absolutos e path traversal;
- garantir que o arquivo final esteja dentro de `DOCUMENTS_DIR`;
- manter `category_code`, `category_label`, `sort_order` e `is_active`.

## Configuração

Variáveis documentadas em `.env.example`:

| Variável | Uso |
| --- | --- |
| `BOT_NAME` | Nome exibido pelo bot |
| `BOT_CAMPUS` | Campus exibido na saudação |
| `DOCUMENTS_DIR` | Pasta base dos PDFs |
| `IGNORE_OLD_MESSAGES` | Ignora mensagens anteriores ao início do processo |
| `IGNORE_GROUPS` | Ignora mensagens em grupos |
| `DEBUG_MODE` | Ativa logs detalhados |
| `LOG_LEVEL` | Nível de log |
| `MESSAGE_START_GRACE_SECONDS` | Tolerância do filtro de mensagens antigas |
| `SPAM_WINDOW_MS` | Janela anti-spam |
| `RECONNECT_DELAY_MS` | Atraso de reconexão |
| `USER_STATE_TTL_MINUTES` | Configuração planejada para expiração de estado |
| `ADMIN_NUMBERS` | Configuração planejada para comandos administrativos |
| `DB_HOST` | Host do MySQL |
| `DB_PORT` | Porta do MySQL |
| `DB_USER` | Usuário do MySQL |
| `DB_PASSWORD` | Senha do MySQL |
| `DB_NAME` | Nome do banco |

Aliases aceitos no código, mas ainda não destacados no `.env.example`:

- `CAMPUS_NAME`, como alternativa a `BOT_CAMPUS`;
- `DOCUMENTS_BASE_PATH`, como alternativa a `DOCUMENTS_DIR`;
- `DB_PASS`, como alternativa a `DB_PASSWORD`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Executa `tsx src/index.ts` |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Executa `node dist/index.js` |
| `npm test` | Roda build e depois `tests/run-tests.mjs` |
| `npm run clean` | Remove `dist/` |

Observação: `npm test` gera/atualiza `dist/`, porque chama `npm run build` antes dos testes.

## Docker

`docker-compose.yml` sobe apenas o MySQL local:

- imagem `mysql:8.0`;
- container `firabot-mysql`;
- volume `firabot_mysql_data`;
- schema montado em `/docker-entrypoint-initdb.d/01-schema.sql`;
- porta `3306:3306`.

Para produção, a porta do MySQL não deve ficar pública. Usar firewall, rede interna do Docker, bind restrito ou outra estratégia equivalente.

`Dockerfile` usa build multi-stage:

1. Stage `build`: instala dependências, copia `src` e roda build.
2. Stage `production`: instala dependências sem dev, copia `dist` e `documentos`.

`auth/` não é copiado pela imagem e deve ser volume persistente em execução real.

## Logs

Logs técnicos:

- saem em stdout/stderr como JSON simples;
- mascaram telefone/JID;
- removem chaves sensíveis conhecidas como `password`, `token`, `qr`, `secret` e `authorization`;
- dependem de `DEBUG_MODE` ou `LOG_LEVEL=debug` para detalhes.

Logs persistidos:

- ficam na tabela `logs`;
- registram preview, estado, evento, comando, menu, documento, sucesso e erro;
- podem conter dados pessoais no preview da mensagem.

Pendências:

- definir retenção;
- definir limpeza periódica;
- definir quem pode acessar logs;
- definir anonimização para relatórios;
- evitar guardar conteúdo livre de suporte por tempo indefinido.

## Segurança Operacional

Pontos positivos:

- `.env` está no `.gitignore`.
- `auth/` está no `.gitignore`.
- `git ls-files auth` não retornou arquivos rastreados nesta leitura.
- Queries principais usam parâmetros.
- Estado é normalizado para lista permitida.
- Mensagens antigas, grupos e mensagens próprias têm guardas.
- Há anti-spam simples.

Pontos de atenção:

- `auth/` contém credenciais de sessão Baileys e deve ser tratado como segredo.
- `DEBUG_MODE=true` em produção pode expor detalhes em logs.
- `DB_PASSWORD` do `.env.example` é local/dev; produção deve usar credencial própria.
- MySQL em `3306:3306` é adequado para desenvolvimento, mas perigoso em VPS sem restrição.
- Não há política definida de backup/restore.
- Não há migrations versionadas.
- `USER_STATE_TTL_MINUTES` ainda não limpa estados antigos.
- `ADMIN_NUMBERS` ainda não protege comandos reais.
- Editais hardcoded podem ficar desatualizados.

## Checklist Para Produção

- [ ] Usar `.env` de produção separado do local.
- [ ] Não versionar `.env`, `auth/`, logs ou dumps.
- [ ] Montar `auth/` como volume persistente com permissão restrita.
- [ ] Não expor MySQL publicamente.
- [ ] Usar usuário MySQL de menor privilégio possível.
- [ ] Criar rotina de backup e teste de restore.
- [ ] Definir retenção de logs.
- [ ] Desativar debug por padrão.
- [ ] Validar documentos antes de cadastrar via painel.
- [ ] Criar estratégia de restart automático.
- [ ] Criar runbook de QR Code/repareamento.
- [ ] Documentar rollback.
