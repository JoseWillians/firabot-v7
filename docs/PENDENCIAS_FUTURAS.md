# Pendências Futuras do FiraBot v7

Este arquivo registra pontos que não serão atacados imediatamente, mas que precisam ficar visíveis para as próximas rodadas de desenvolvimento.

## 1. Robustez do bot

- Monitorar em produção o TTL real para `user_states` usando `USER_STATE_TTL_MINUTES`.
- Criar testes com socket fake cobrindo o `messageHandler` completo.
- Criar testes de integração com MySQL local via Docker.
- Criar testes de fluxo com falha real de banco, documento ausente e reconexão WhatsApp.
- Separar `DocumentCatalogService` de `DocumentDeliveryService`.
- Separar logger técnico independente para eliminar os últimos `console.error` locais sem criar ciclo de importação.

## 2. Banco de dados

- Criar migrations versionadas em vez de depender apenas de `database/schema.sql`.
- Definir estratégia de backup e restore testado para MySQL.
- Definir retenção e limpeza de `logs`.
- Definir limpeza/expiração de `user_states`.
- Avaliar `created_by`, `updated_by`, `deleted_at`, `sector_id` e índices novos para entidades administráveis.

## 3. Segurança e privacidade

- Garantir que `auth/` nunca seja versionado e seja tratado como credencial sensível.
- Definir política de retenção de logs e dados pessoais.
- Revisar permissões do usuário MySQL em produção.
- Garantir que MySQL não fique público em produção.
- Definir política de rotação de credenciais quando necessário.
- Bloquear QR Code, tokens e credenciais em logs, auditoria e frontend.

## 4. Painel administrativo

- API administrativa em TypeScript/Node.js: implementada no painel `C:\Dev\Projetos\admin-firabot`.
- Login administrativo com sessão segura: implementado no protótipo com cookie HttpOnly, rate limit e validação.
- RBAC por papel e setor: implementado no backend e refletido no frontend.
- CRUD de documentos por setor/categoria: implementado, incluindo upload seguro e PPC por curso.
- CRUD de links importantes: implementado.
- CRUD de editais: implementado.
- Fila inicial de suporte setorial: implementada com `support_tickets`, registro pelo bot e atualização de status no painel.
- Implementar status operacional do bot, WhatsApp, banco e documentos.
- Implementar auditoria administrativa.
- Integrar QR Code/status real do WhatsApp ao painel sem expor `auth/`.
- Integrar o bot para ler links/editais do banco: concluído na primeira versão, com fallback local.
- Remover hardcode de Links Importantes, Editais, Biblioteca e RU quando houver entidades administráveis.

## 5. Deploy e operação

- Definir estratégia oficial de produção: Docker, systemd ou PM2.
- Configurar volumes persistentes para `auth/` e `documentos/`.
- Configurar usuário Linux sem root.
- Criar checklist de rollback.
- Criar healthcheck operacional para monitoramento.
- Documentar restart automático e recuperação após queda.

## 6. IA e Java

- Manter IA como etapa posterior ao painel administrativo.
- Definir contrato TypeScript -> Python antes de implementar IA.
- Criar serviço Python separado somente após base de conhecimento curada.
- Manter Java/Spring Boot como possibilidade bem futura, caso o painel cresça em governança, integrações institucionais ou múltiplos campi.

## 7. Documentação

- Consolidar `docs/REGISTRO_DE_MUDANCAS.md` e `docs/changelog.md`.
- Atualizar `docs/estados-do-bot.md` com todos os estados reais.
- Atualizar `docs/logs.md` com retenção, acesso e privacidade.
- Atualizar `docs/deploy.md` após decisão de produção.
- Atualizar `docs/docker.md` com diferenças entre desenvolvimento e produção.
