# Mapa de Menus e Fluxos - FiraBot v7

Este documento registra o fluxo conversacional real observado no código.

## Entradas De Início

Iniciam ou reiniciam o atendimento sem prefixo:

- `oi`
- `olá` / `ola`
- `bom dia`
- `boa tarde`
- `boa noite`
- `menu`
- `iniciar`
- `inicio`
- `começar` / `comecar`
- `ajuda`
- `help`
- `start`

Com prefixo `!`, também funcionam como início:

- `!oi`
- `!menu`
- `!start`
- `!ajuda`

`encerrar` e `!encerrar` encerram o atendimento e salvam o estado `encerrado`.

## Árvore Principal

```text
Menu Principal
├─ 1 Biblioteca
├─ 2 Documentos
│  ├─ 1 Documentos DRCA
│  │  ├─ 1 Requerimento Acadêmico
│  │  ├─ 2 Requerimento Diploma Técnico
│  │  ├─ 3 Requerimento Superior
│  │  └─ 4 Termo de Desistência
│  └─ 2 Documentos CAE
│     └─ Ainda sem documentos automáticos
├─ 3 PPC do Curso
│  ├─ 1 Engenharia de Computação
│  │  ├─ 1 PPC 2022
│  │  └─ 2 PPC 2024
│  ├─ 2 Bacharelado em Administração
│  │  ├─ 1 PPC 2022
│  │  └─ 2 PPC 2023
│  ├─ 3 Licenciatura em Física
│  │  ├─ 1 PPC 2019
│  │  └─ 2 PPC 2023
│  ├─ 4 Tecnologia em Construção de Edifícios
│  │  └─ 1 PPC
│  └─ 5 Engenharia Civil
│     └─ 1 PPC 2022
├─ 4 Links Importantes
├─ 5 Editais Abertos
├─ 6 RU
└─ 7 Suporte
```

## Regra Da Opção `0`

`0 - Voltar ao Menu Principal` só vale quando o usuário está fora do estado `main`.

No menu principal, `0` não é exibido e deve cair como opção inválida.

## Estados

Estados aceitos pelo código:

| Estado | Significado |
| --- | --- |
| `main` | Menu principal |
| `biblioteca` | Tela informativa da biblioteca |
| `docs` | Escolha de setor de documentos |
| `docs_drca` | Lista de documentos DRCA |
| `docs_cae` | Tela de documentos CAE sem cadastro automático |
| `curso` | Escolha de curso para PPC |
| `curso_eng_comp` | PPCs de Engenharia de Computação |
| `curso_bach_adm` | PPCs de Bacharelado em Administração |
| `curso_lic_fis` | PPCs de Licenciatura em Física |
| `curso_grad_tce` | PPC de Tecnologia em Construção de Edifícios |
| `curso_eng_civil` | PPC de Engenharia Civil |
| `links` | Links importantes |
| `editais` | Editais abertos |
| `ru` | Restaurante Universitário |
| `suporte` | Aguardando mensagem livre de suporte |
| `suporte_confirmacao` | Suporte registrado e aguardando retorno/encerramento |
| `encerrado` | Atendimento encerrado |

Se o banco retornar estado desconhecido, o serviço normaliza para `main`.

## Documentos DRCA

Fonte principal: tabela `docs`, filtrando `category_code = 'drca'`.

Fallback local: `src/menus/docsMenu.ts`.

| Opção | Documento | Caminho |
| --- | --- | --- |
| `1` | Requerimento Acadêmico | `documentos/drca/requerimento-academico.pdf` |
| `2` | Requerimento Diploma Técnico | `documentos/drca/requerimento-diploma-tecnico.pdf` |
| `3` | Requerimento Superior | `documentos/drca/requerimento-superior.pdf` |
| `4` | Termo de Desistência | `documentos/drca/termo-de-desistencia.pdf` |

## PPCs

Fonte principal: tabela `docs`, por `category_code` do curso.

Fallback local: `src/menus/courseMenu.ts`.

| Curso | Estado | Categoria | PDFs |
| --- | --- | --- | --- |
| Engenharia de Computação | `curso_eng_comp` | `ppc_eng_comp` | 2022, 2024 |
| Bacharelado em Administração | `curso_bach_adm` | `ppc_bach_adm` | 2022, 2023 |
| Licenciatura em Física | `curso_lic_fis` | `ppc_lic_fis` | 2019, 2023 |
| Tecnologia em Construção de Edifícios | `curso_grad_tce` | `ppc_grad_tce` | PPC único |
| Engenharia Civil | `curso_eng_civil` | `ppc_eng_civil` | 2022 |

## Comandos Técnicos

| Comando | Função |
| --- | --- |
| `!help` / `!ajuda` / `!menu` | Lista comandos e instruções |
| `!ping` | Confirma que o bot responde; restrito a `ADMIN_NUMBERS` |
| `!status` | Mostra status de WhatsApp, banco, documentos e debug; restrito a `ADMIN_NUMBERS` |
| `!ifma` | Mostra informações úteis do campus |
| `!oi` | Abre o menu principal |
| `!encerrar` | Encerra atendimento |

## Fluxo De Suporte

1. Usuário escolhe `7 - Suporte`.
2. Bot informa que ainda não há administradores setoriais atendendo pelo painel.
3. Bot pede uma mensagem única com dúvida/solicitação.
4. Mensagem é registrada em log.
5. Estado muda para `suporte_confirmacao`.
6. Bot oferece `0` para menu principal ou `encerrar`.

## Fluxos Informativos

Os estados `biblioteca`, `links`, `editais`, `ru`, `docs_cae`, `suporte_confirmacao` e `encerrado` não aceitam subopções numéricas próprias. Neles, números diferentes de `0` recebem fallback contextual.

## Follow-up Contextual

Depois de enviar um documento ou PPC, o bot mantém o usuário no mesmo submenu e mostra as opções irmãs restantes, além de:

- `0 - Voltar ao Menu Principal`
- `encerrar - Terminar conversa`

Isso evita obrigar o usuário a voltar ao menu anterior para pedir outro documento relacionado.
