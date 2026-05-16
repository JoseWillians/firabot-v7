# Estados do bot

## Status

Confirmado parcialmente no código. O projeto usa MySQL para estado de usuarios e a tabela `user_states` guarda o estado atual de navegacao. A primeira ampliação de estados informativos foi aplicada para o novo menu principal.

## Confirmado no README

- O bot consulta o estado antes de interpretar opcoes numericas.
- A tabela `user_states` armazena o estado atual de navegacao.
- Depois de escolher `2 - Documentos`, a proxima opcao numerica deve ser interpretada dentro do menu de documentos.
- Enviar `oi` em qualquer estado deve resetar para `main`.
- `encerrar` e `!encerrar` salvam estado `encerrado`.
- `USER_STATE_TTL_MINUTES` existe como variavel planejada para expiracao futura de estado.

## Estados atuais no código

- `main`
- `biblioteca`
- `docs`
- `docs_drca`
- `docs_cae`
- `curso`
- `curso_eng_comp`
- `links`
- `editais`
- `ru`
- `suporte`
- `encerrado`

## Pendencias tecnicas

- [x] Confirmar nomes reais dos estados persistidos.
- [x] Confirmar se `main` e o estado inicial real.
- [ ] Confirmar se `USER_STATE_TTL_MINUTES` ja e aplicado ou apenas planejado.
- [ ] Confirmar comportamento apos reinicio do processo.
- [ ] Confirmar se estados antigos sao limpos por rotina ou manualmente.
- [ ] Confirmar constraints/indices da tabela `user_states`.
- [ ] Confirmar se estado e identificado por JID, telefone ou outro identificador.
- [x] Criar estados específicos para `docs_drca`, `docs_cae` e PPC de Engenharia de Computação.
- [ ] Avaliar estado futuro `ppc_documentos` se houver múltiplos cursos com PPCs cadastrados.

## Riscos

- Estado antigo pode levar o usuario para menu errado se nao houver expiracao/limpeza. Pendente de confirmacao.
- Falha de banco pode impedir navegacao por menus se nao houver fallback. Pendente de confirmacao.

## Arquivos para conferir

- `src/services/userStateService.ts`
- `src/types/userState.ts`
- `database/schema.sql`
- `src/services/menuRoutingService.ts`

## Links

- [[10-Architecture/padrao-projeto-chatbot]]
- [[08-Databases/mysql-boas-praticas]]
