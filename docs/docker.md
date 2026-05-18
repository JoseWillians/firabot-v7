# Docker

## Status

Parcialmente confirmado pelo README. Docker Compose e usado para MySQL local. O README tambem documenta build e execucao da imagem do bot, mas estrategia final de producao segue pendente de confirmacao.

## Comandos documentados no README

- Banco local: `docker compose up -d mysql`
- Build da imagem do bot: `docker build -t firabot-v7 .`
- Execucao da imagem do bot: `docker run --env-file .env -v ./auth:/app/auth -v ./documentos:/app/documentos firabot-v7`
- MySQL publicado apenas em `127.0.0.1:3306`.

## Volumes e dados persistentes

- `auth/`: credenciais/sessao Baileys; deve ser persistente e nunca versionado.
- `documentos/`: PDFs enviados pelo bot; pode ser montado do host.
- Dados MySQL: volume do Docker Compose. Nome/caminho pendente de confirmacao no `docker-compose.yml`.
- Backups MySQL: local e padrao pendentes de confirmacao.

## Pendencias

- [ ] Documentar backup MySQL local.
- [ ] Documentar restore MySQL local.
- [ ] Confirmar se producao usara bot em container, systemd ou PM2.
- [ ] Confirmar volumes usados pelo MySQL.
- [ ] Garantir que `.env`, `auth/`, `logs/` e sessoes nao sejam versionados.
- [ ] Confirmar estrategia de atualizacao da imagem em servidor Linux.
- [ ] Confirmar politica de restart automatico do container/processo.
- [ ] Em Linux, validar permissao de escrita do volume `auth/` para o usuario `node` do container.

## Seguranca

- Nao copiar `.env` para imagem.
- Nao versionar `auth/`.
- Usar `.env` especifico de producao no servidor.
- Proteger volume de `auth/` com permissao restrita.
- Evitar publicar porta MySQL para a internet.
- Rodar a imagem do bot sem root.
- Manter o healthcheck do MySQL ativo para facilitar diagnostico local.

## Links

- [[09-Deploy/docker]]
- [[08-Databases/backup-e-restore]]
