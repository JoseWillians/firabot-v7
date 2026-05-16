# seguranca.md

## Resumo

Documento inicial para orientar manutencao do bot.

## Checklist

- [ ] Confirmar fluxo atual.
- [ ] Registrar impacto em menus, banco e logs.
- [ ] Remover `auth/` do versionamento se estiver rastreado.
- [ ] Rotacionar/reparear sessão Baileys se arquivos de `auth/` já tiverem sido enviados para remoto.

## Alerta Atual

Em 2026-05-15, foi verificado pelo índice do Git que existem arquivos sob `auth/` rastreados. A pasta `auth/` contém credenciais de sessão do Baileys e deve ser tratada como segredo operacional.

Próxima ação recomendada, sem apagar arquivos locais:

```bash
git rm --cached -r auth
```

Depois disso, manter `auth/` no `.gitignore` e considerar reparear/rotacionar a sessão caso esses arquivos já tenham sido enviados para um repositório remoto.

## Links

- [[10-Architecture/padrao-projeto-chatbot]]
