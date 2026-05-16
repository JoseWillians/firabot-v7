# Logs

## Status

Parcialmente confirmado pelo README. O projeto usa logs tecnicos em console/stdout e eventos importantes na tabela `logs` do MySQL. A politica de retencao, limpeza e acesso segue pendente de confirmacao.

## Confirmado no README

- Logs tecnicos vao para console/stdout em formato JSON simples.
- Eventos importantes do atendimento vao para a tabela `logs`.
- Arquivos `.txt` nao sao armazenamento principal de logs.
- Logs tecnicos mascaram telefone e removem campos sensiveis como senha, token e QR Code.
- Eventos do banco guardam preview e metadados como tipo de evento, estado anterior/posterior, comando, menu, documento e sucesso.

## Regras de seguranca

- Nao registrar senhas, tokens, QR Code, dados sensiveis ou conteudo pessoal desnecessario.
- Evitar expor telefone completo quando nao for necessario para diagnostico.
- Diferenciar logs de desenvolvimento e producao.
- Registrar erros com contexto minimo e sem secrets.
- Revisar `DEBUG_MODE` antes de producao.
- Evitar salvar conteudo integral de mensagens de usuarios. Pendente de confirmacao.

## Pendencias

- [ ] Definir tempo de retencao dos logs.
- [ ] Confirmar quais campos a tabela `logs` armazena.
- [ ] Definir rotina de limpeza/arquivamento.
- [ ] Revisar se `DEBUG_MODE` pode vazar dados em producao.
- [ ] Confirmar quem pode acessar logs no servidor Linux.
- [ ] Confirmar se logs do Docker/systemd/PM2 terao rotacao.
- [ ] Confirmar se eventos com erro incluem stack trace ou SQL. Pendente de confirmacao.

## Antes de producao

- [ ] Definir nivel `LOG_LEVEL` de producao.
- [ ] Desativar `DEBUG_MODE` em producao, salvo diagnostico temporario.
- [ ] Configurar rotacao de logs do processo/container.
- [ ] Documentar procedimento de auditoria sem expor dados pessoais.

## Links

- [[07-Security/checklist-seguranca-web]]
- [[07-Security/checklist-secrets]]
