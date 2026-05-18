# Pendências De Documentação - FiraBot v7

Este documento registra divergências e lacunas encontradas durante a leitura do projeto.

## Divergências Entre Docs E Código

### `docs/arquitetura.md`

O documento ainda fala em separar fluxos como evolução recomendada. O código já tem uma separação relevante em `src/flows/`, `src/handlers/` e `src/services/`.

Atualização recomendada:

- registrar a arquitetura real por camadas;
- incluir `src/flows` como camada central;
- adicionar diagrama `Baileys -> messageHandler -> handlers -> flows -> services -> database`.

### `docs/fluxo-conversa.md`

O documento diz que apenas Engenharia de Computação possui PPCs cadastrados. O código e `database/schema.sql` já incluem:

- Engenharia de Computação;
- Bacharelado em Administração;
- Licenciatura em Física;
- Tecnologia em Construção de Edifícios;
- Engenharia Civil.

Atualização recomendada:

- refletir cinco cursos;
- documentar follow-up contextual;
- documentar suporte com mensagem livre;
- documentar editais hardcoded.

### `docs/estados-do-bot.md`

Não lista todos os estados reais aceitos pelo código.

Estados a incluir:

- `curso_bach_adm`
- `curso_lic_fis`
- `curso_grad_tce`
- `curso_eng_civil`
- `suporte_confirmacao`

Também deve marcar que `USER_STATE_TTL_MINUTES` já tem expiração real implementada no bot.

### `docs/regras-de-negocio.md`

Está muito curto para ser o documento central de regras.

Sugestão de conteúdo:

- regra de início/reinício;
- regra de `0`;
- regra de estado antes de opção numérica;
- regra de fallback;
- regra de documentos por categoria;
- regra de suporte;
- regra de logs;
- regra de editais.

### `docs/banco-de-dados.md`

Ainda marca como pendente confirmar schema, índices e constraints, mas `database/schema.sql` já define boa parte disso.

Atualização recomendada:

- listar tabelas reais;
- listar índices reais;
- registrar ausência de migrations;
- separar schema atual de evolução futura do painel.

### `docs/logs.md`

O schema já possui campos estruturados de logs, mas o documento ainda trata parte disso como pendência.

Atualização recomendada:

- documentar campos reais da tabela `logs`;
- explicar preview e risco de dados pessoais;
- definir política futura de retenção.

### `docs/seguranca.md`

O documento alerta sobre `auth/` rastreado. Nesta leitura, `git ls-files auth` não retornou arquivos rastreados e `.gitignore` contém `auth/`.

Atualização recomendada:

- manter alerta histórico;
- diferenciar estado atual do risco histórico;
- recomendar checagem em remoto/histórico;
- documentar rotação/repareamento da sessão.

### `docs/changelog.md` e `docs/REGISTRO_DE_MUDANCAS.md`

Há sobreposição de intenção. O `REGISTRO_DE_MUDANCAS.md` parece ser o histórico real; `changelog.md` parece inicial/template.

Atualização recomendada:

- decidir se `changelog.md` será removido, redirecionado ou mantido como resumo de releases;
- manter `REGISTRO_DE_MUDANCAS.md` como histórico detalhado.

## Lacunas Técnicas A Documentar

- Política de backup e restore MySQL.
- Política de retenção e limpeza de logs.
- Estratégia de deploy final: Docker, PM2 ou systemd.
- Estratégia de restart automático.
- Runbook de QR Code e sessão Baileys.
- Regras de cadastro seguro de documentos pelo painel futuro.
- Modelo de autorização real do painel administrativo.
- Plano de migrations incrementais.
- Tratamento de estado expirado.
- Atualização de editais a partir de fonte dinâmica.

## Pendências De Código Que Impactam Docs

- `USER_STATE_TTL_MINUTES` está aplicado ao estado do usuário.
- `ADMIN_NUMBERS` protege comandos operacionais do bot.
- `src/functions/database.ts` concentra múltiplas responsabilidades.
- `src/menus/noticesMenu.ts` mantém editais locais apenas como fallback quando o banco está vazio ou indisponível.
- CAE já pode receber documentos automáticos via painel e tabela `docs` com `category_code = cae`.
- O painel administrativo existe em `C:\Dev\Projetos\admin-firabot`, com API local, sessão, RBAC, CRUD inicial, upload seguro e fila inicial de suporte; ainda faltam integrações operacionais completas com WhatsApp/QR, produção, auditoria avançada e deploy.

## Prioridade Recomendada

1. Atualizar `docs/arquitetura.md`.
2. Atualizar `docs/fluxo-conversa.md`.
3. Atualizar `docs/estados-do-bot.md`.
4. Expandir `docs/regras-de-negocio.md`.
5. Consolidar `docs/banco-de-dados.md`.
6. Expandir `docs/logs.md` e `docs/seguranca.md`.
7. Definir destino de `docs/changelog.md`.

## Nota De Segurança

Não documentar valores reais de `.env`, QR Code, sessão Baileys, tokens, senhas ou dumps de banco. Exemplos devem usar placeholders ou valores explicitamente locais de desenvolvimento já presentes em `.env.example`.
