# Relatório Estratégico - FiraBot v7

## 1. Visão Geral

O FiraBot v7 é um bot de WhatsApp em TypeScript para atendimento acadêmico do IFMA Santa Inês. O projeto usa Baileys para conexão com WhatsApp, MySQL para persistência, Docker para ambiente local, menus guiados por números, envio de documentos PDF e estado por usuário.

O projeto está em um estágio saudável de MVP técnico: o fluxo principal funciona, há separação inicial em serviços, logs estruturados, banco local Docker, documentação de operação e testes básicos. A próxima fase deve consolidar o fluxo conversacional e preparar o caminho para um painel administrativo.

## 2. Estado Atual

Pontos consolidados:

- Mensagens iniciais sem prefixo, como `oi`, `olá`, `bom dia`, `menu` e `iniciar`.
- Comandos técnicos com prefixo `!`.
- Filtro contra mensagens antigas baseado no timestamp de inicialização.
- Estado de navegação por usuário.
- Menu de documentos com dados vindos da tabela `docs`.
- Envio de PDF com validação de arquivo existente.
- Logs técnicos e eventos de atendimento.
- Banco local via Docker.
- Build e testes básicos funcionando.

## 3. Principais Riscos Técnicos

- O `messageHandler.ts` ainda concentra decisões demais de fluxo, estado, comandos e envio.
- Os estados atuais ainda não representam todo o fluxograma desejado.
- O menu principal já recebeu a primeira etapa do novo modelo com `Editais Abertos` e `Suporte` como opção 7.
- Documentos já possuem uma primeira divisão conversacional entre DRCA e CAE, mas ainda precisam evoluir para categorias persistidas no banco.
- O fluxo de PPC já lista cursos antes de listar documentos PPC; por enquanto apenas Engenharia de Computação possui PDFs cadastrados.
- A autenticação Baileys em `auth/` precisa ser tratada como credencial sensível em produção.
- Os testes ainda não simulam o fluxo completo com Baileys, MySQL e envio de arquivo.

## 4. Painel Administrativo Futuro

A ideia aprovada para evolução é criar um painel administrativo para operar e manter o bot.

Perfis desejados:

- Administrador principal:
  - liga/desliga ou reinicia o bot pelo painel;
  - visualiza QR Code quando o WhatsApp estiver desconectado;
  - acessa todas as áreas;
  - consulta status do WhatsApp, banco, documentos, logs e métricas.

- Administrador setorial:
  - acessa apenas o próprio setor;
  - DRCA gerencia documentos e informações da DRCA;
  - CAE gerencia documentos e informações da CAE;
  - Biblioteca gerencia links, documentos e informações da biblioteca;
  - não acessa configurações globais nem dados de outros setores.

Modelo recomendado:

- Manter o bot WhatsApp em TypeScript.
- Criar uma API administrativa quando a necessidade do painel ficar madura.
- Usar controle de acesso por papéis e escopo de setor.
- Registrar auditoria de alterações feitas por administradores.
- Deixar Java como melhoria bem futura, após consolidação do projeto.

## 5. TypeScript e Java

É possível trabalhar com TypeScript e Java, mas Java não deve entrar agora no core do bot.

Recomendação atual:

- TypeScript continua responsável pelo WhatsApp/Baileys.
- Java fica como possibilidade futura para backend administrativo, integrações institucionais, relatórios e regras mais pesadas.

Motivo:

- Baileys é uma biblioteca TypeScript/JavaScript orientada a WebSocket e eventos.
- Migrar o core para Java aumentaria complexidade sem ganho imediato.
- Um backend Java/Spring Boot pode fazer sentido no futuro para painel, RBAC, auditoria, APIs internas e integrações com sistemas do IFMA.

Arquitetura futura possível:

```text
WhatsApp
  -> Bot TypeScript com Baileys
    -> API administrativa
      -> MySQL
      -> Painel web
      -> Documentos
      -> Logs
      -> Integrações IFMA
```

## 6. Melhorias Futuras Priorizadas

Curto prazo:

- Separar fluxos em arquivos próprios: biblioteca, documentos, curso, links, editais, RU e suporte.
- Expandir estados semânticos: `biblioteca`, `docs_drca`, `docs_cae`, `links`, `editais`, `ru`, `suporte`.
- Expandir submenus do novo modelo numerado.
- Evoluir submenus específicos para carregarem dados por categoria/setor no banco.
- Atualizar `!help` para refletir que `oi` e `menu` não precisam de prefixo.

Médio prazo:

- Criar categorias para documentos no banco.
- Criar fluxo de PPC por curso.
- Criar fluxo de Links Importantes e Editais Abertos com opção `0` e `encerrar`.
- Criar testes automatizados para fluxos completos.
- Criar comandos administrativos restritos por `ADMIN_NUMBERS`.

Longo prazo:

- Painel administrativo com autenticação e RBAC.
- Auditoria de alterações administrativas.
- Métricas de uso, documentos mais acessados e falhas recorrentes.
- Healthcheck operacional.
- Backend Java/Spring Boot apenas se o projeto crescer em governança, integrações e painel.

## 7. Profissionais e Especialidades

Para manter o time enxuto, as funções podem ser agrupadas em cinco frentes:

1. Arquitetura e Produto Técnico.
2. Bot, Conversa e Integrações WhatsApp.
3. Backend, Banco e Painel Administrativo.
4. DevOps, Segurança e Operação.
5. QA, Documentação e Conhecimento.

Essas frentes estão detalhadas em `docs/SUBAGENTES_FIXOS.md`.

## 8. Critério de Evolução

Cada nova melhoria deve seguir este ciclo:

1. Registrar objetivo e impacto esperado.
2. Alterar em etapas pequenas.
3. Rodar build e testes.
4. Atualizar documentação.
5. Registrar pendências ou riscos.

Isso evita reescrita agressiva e mantém o projeto simples de revisar.
