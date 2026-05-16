# Deploy

## Status

Pendente de confirmacao. O README documenta execucao local e Docker, mas nao define o servidor Linux final nem a estrategia oficial de producao.

## Opcoes possiveis

- Docker para bot e MySQL. Pendente de confirmacao.
- Bot como processo systemd e MySQL local/remoto. Pendente de confirmacao.
- Bot com PM2 e MySQL separado. Pendente de confirmacao.

## Checklist antes de producao

- [ ] Definir servidor Linux, usuario de deploy e diretorio da aplicacao.
- [ ] Instalar Node.js LTS ou definir imagem Docker final.
- [ ] Configurar `.env` de producao sem reaproveitar credenciais locais.
- [ ] Configurar volume persistente para `auth/`.
- [ ] Configurar local seguro para `documentos/`.
- [ ] Configurar MySQL com usuario de menor privilegio.
- [ ] Configurar backup e restore MySQL.
- [ ] Configurar logs com rotacao.
- [ ] Definir restart automatico do bot.
- [ ] Testar QR Code, menu, documentos, estado e comandos tecnicos.

## Seguranca de secrets

- Nunca versionar `.env`, `auth/`, logs, dumps ou backups.
- Proteger `auth/` como credencial sensivel do WhatsApp/Baileys.
- Separar `.env` local e `.env` de producao.
- Rotacionar credenciais caso sejam expostas. Pendente de confirmacao.
- Evitar expor MySQL publicamente.

## Runbook minimo

- Build: `npm run build`.
- Start local: `npm start`.
- Teste: `npm test`.
- Docker build: `docker build -t firabot-v7 .`.
- Docker run documentado no README: `docker run --env-file .env -v ./auth:/app/auth firabot-v7`.

## Pendencias antes de publicar

- [ ] Escolher estrategia final: Docker, systemd ou PM2.
- [ ] Criar checklist de rollback.
- [ ] Criar rotina de backup/restore testada.
- [ ] Definir monitoramento de processo e logs.
- [ ] Confirmar se o banco remoto do IFMA sera usado em producao e com quais permissoes. Pendente de confirmacao.

## Links

- [[10-Architecture/padrao-projeto-chatbot]]
- [[09-Deploy/docker]]
- [[09-Deploy/vps-linux]]
- [[07-Security/checklist-secrets]]
