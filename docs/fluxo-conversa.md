# Fluxo de conversa

## Status

Parcialmente implementado e confirmado no código. O bot usa menus guiados por numeros, comandos com prefixo `!` e estado do usuario no MySQL. O novo modelo numerado ja foi aplicado ao menu principal, Documentos, PPC por curso, Suporte simples, Links, Editais e RU informativo.

## Entradas confirmadas no README

- `oi`, `ola`, `bom dia`, `boa tarde`, `boa noite`, `menu`, `iniciar`, `inicio`, `comecar`, `ajuda`, `help`, `start`: iniciam atendimento sem prefixo.
- `!help`: lista comandos tecnicos.
- `!ping`: verifica se o bot esta ativo. Restrito a `ADMIN_NUMBERS`.
- `!status`: mostra status de WhatsApp, banco, inicializacao, ambiente, documentos ativos e debug. Restrito a `ADMIN_NUMBERS`.
- `!ifma`: mostra informacoes uteis do campus.
- `encerrar`: encerra atendimento em fluxos de conversa.
- `!encerrar`: encerra atendimento como comando tecnico compativel.

## Fluxo confirmado no README

- Depois do restart, o bot nao deve mandar boas-vindas sozinho.
- Ao receber `oi` ou `menu`, deve exibir saudacao e menu principal.
- O menu principal atual usa:
  - `1 - Biblioteca`
  - `2 - Documentos`
  - `3 - PPC do Curso`
  - `4 - Links Importantes`
  - `5 - Editais Abertos`
  - `6 - RU`
  - `7 - Suporte`
- O menu principal nao exibe `0 - Voltar`.
- Opcao `2` abre o menu de documentos por setor:
  - `1 - Documentos DRCA`
  - `2 - Documentos CAE`
- Dentro de `Documentos DRCA`, as opcoes `1`, `2`, `3` e `4` enviam PDFs cadastrados.
- Dentro de `Documentos CAE`, o bot informa que ainda não há documentos cadastrados para envio automático.
- Opcao `3` abre primeiro o menu de cursos. Ha PPCs cadastrados para Engenharia de Computacao, Administracao, Licenciatura em Fisica, Tecnologia em Construcao de Edificios e Engenharia Civil.
- No estado `suporte`, mensagens numericas diferentes de `0` sao tratadas como texto de suporte, pois podem ser matricula, telefone ou protocolo.
- Em erro de documento, o bot orienta o usuario e deve manter uma rota de continuidade com outras opcoes do submenu, `0` ou `encerrar`.
- Opcao `0` retorna ao menu principal apenas a partir de submenus ou telas de continuidade.
- Enviar `oi` em qualquer estado deve resetar para `main`.
- O bot consulta o estado do usuario antes de interpretar opcoes numericas.

## Pendencias tecnicas

- [x] Confirmar no codigo todas as opcoes do menu principal.
- [x] Confirmar no codigo as primeiras opcoes dos submenus de Documentos e PPC.
- [x] Confirmar texto de fallback para entrada invalida.
- [x] Confirmar comportamento quando documento cadastrado nao existe no disco/container.
- [ ] Confirmar comportamento em grupos quando `IGNORE_GROUPS=true`.
- [ ] Confirmar comportamento de mensagens antigas quando `IGNORE_OLD_MESSAGES=true`.
- [x] Confirmar encerramento: `encerrar` e `!encerrar` salvam estado `encerrado`.
- [ ] Evoluir Biblioteca e RU de respostas informativas para conteudo administravel ou submenus completos, se necessario.
- [ ] Carregar documentos CAE dinamicamente quando houver dados cadastrados.
- [ ] Mover Links Importantes e Editais Abertos para dados administraveis pelo painel.

## Arquivos para conferir

- `src/menus/mainMenu.ts`
- `src/menus/docsMenu.ts`
- `src/menus/courseMenu.ts`
- `src/middlewares/messageHandler.ts`
- `src/services/menuRoutingService.ts`
- `src/services/userStateService.ts`
- `src/services/messageGuardService.ts`
- `src/services/spamGuardService.ts`

## Links

- [[10-Architecture/padrao-projeto-chatbot]]
- [[07-Security/checklist-seguranca-web]]
