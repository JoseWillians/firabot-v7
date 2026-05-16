# AGENTS.md - firabot-v7

## Contexto

Bot de WhatsApp em TypeScript para atendimento academico do IFMA Santa Ines, usando Baileys, MySQL e menus guiados por numeros conforme README.

## Stack detectada

- Node.js, TypeScript, Baileys, MySQL, Docker, dotenv.

## Ler antes de mexer

- README.md
- docs/contexto.md
- docs/arquitetura.md
- docs/banco-de-dados.md
- docs/seguranca.md
- docs/fluxo-conversa.md
- src/index.ts
- src/services/menuRoutingService.ts
- src/services/userStateService.ts

## Comandos confirmados no package.json

- Instalar: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Teste: `npm test`
- Start: `npm start`
- Clean: `npm run clean`
- Check/lint: pendente de confirmacao.

## Regras de seguranca

- Nao ler nem exibir valores de `.env`.
- Nao commitar auth, logs, sessoes ou QR Code.
- Validar entradas recebidas do WhatsApp antes de rotear comandos.
- Evitar logs com telefone, documentos ou conteudo sensivel.

## Banco

- Usar queries parametrizadas em MySQL.
- Documentar schema e migrations antes de alterar tabelas.
- Fazer backup antes de mudancas destrutivas.

## Arquivos proibidos de alterar sem pedido explicito

- .env, auth/, logs/, dist/, node_modules/, documentos originais, dumps e backups.

## Resposta esperada

Arquivos alterados, o que foi feito, como testar, riscos e proximos passos.
