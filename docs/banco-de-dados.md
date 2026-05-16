# Banco de dados

## Status

Parcialmente confirmado pelo README. O projeto usa MySQL para usuarios, estados, logs e documentos. A estrutura exata deve ser confirmada em `database/schema.sql` antes de qualquer mudanca.

## Confirmado no README

- Banco local via Docker Compose.
- Banco local: `firabot`.
- Container local: `firabot-mysql`.
- Porta local: `3306`.
- Schema inicial: `./database/schema.sql`.
- Tabelas usadas:
  - `users`: usuarios identificados pelo JID/numero.
  - `user_states`: estado atual de navegacao.
  - `logs`: historico simples de eventos.
  - `docs`: documentos ativos carregados no menu de documentos.

## Regras de seguranca

- Nao usar banco remoto em testes locais.
- Nao versionar `.env`.
- Usar usuario MySQL com menor privilegio em producao.
- Evitar registrar dados sensiveis em `logs`.
- Fazer backup antes de qualquer alteracao destrutiva.

## Tabela `docs`

A tabela `docs` continua compatível com o fluxo atual, que lê documentos ativos pelo rótulo (`name`) e caminho (`path`). Para preparar a evolução por setor/categoria sem quebrar o envio atual, o schema agora possui campos opcionais:

- `category_code`: código estável da categoria, como `drca` ou futuramente `cae`.
- `category_label`: rótulo exibível/administrativo da categoria, como `DRCA` ou futuramente `CAE`.
- `sort_order`: ordem do documento dentro da categoria.

Os documentos iniciais permanecem como DRCA:

```sql
SELECT id, name, path, category_code, category_label, sort_order
FROM docs
ORDER BY id;
```

A categoria CAE fica preparada para cadastro futuro, mas sem registros iniciais no schema. Quando for ativada, recomenda-se inserir documentos com `category_code = 'cae'`, `category_label = 'CAE'` e `sort_order` sequencial, mantendo `is_active = 1`.

Para bancos já existentes, aplique a mudança de forma incremental após backup:

```sql
ALTER TABLE docs
  ADD COLUMN category_code VARCHAR(50) NULL AFTER path,
  ADD COLUMN category_label VARCHAR(100) NULL AFTER category_code,
  ADD COLUMN sort_order INT NULL AFTER category_label,
  ADD INDEX idx_docs_category_active_sort (category_code, is_active, sort_order, id);

UPDATE docs
SET category_code = 'drca',
    category_label = 'DRCA',
    sort_order = id
WHERE category_code IS NULL;
```

## Backup e restore

Pendente de confirmacao. Procedimento recomendado a documentar:

- [ ] Definir local seguro para backups fora do repositorio.
- [ ] Definir periodicidade de backup.
- [ ] Definir comando de dump usando variaveis/credenciais do ambiente, sem expor senha em docs publicos.
- [ ] Testar restore em ambiente separado antes de producao.
- [ ] Documentar responsavel e retencao dos backups.

## Pendencias tecnicas

- [ ] Confirmar schema completo em `database/schema.sql`.
- [ ] Confirmar indices e constraints.
- [x] Preparar documentos por categoria/setor na tabela `docs` sem alterar o fluxo atual.
- [ ] Confirmar se ha migrations alem do schema inicial.
- [ ] Confirmar limpeza/retencao de `logs`.
- [ ] Confirmar limpeza/expiracao de `user_states`.
- [ ] Confirmar permissao do usuario MySQL de producao.

## Links

- [[10-Architecture/padrao-projeto-chatbot]]
- [[08-Databases/mysql-boas-praticas]]
- [[08-Databases/backup-e-restore]]
