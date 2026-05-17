# Relatório Estratégico - FiraBot v7

## 1. Visão Geral

O FiraBot v7 é um bot de WhatsApp em TypeScript para atendimento acadêmico do IFMA Santa Inês. O projeto usa Baileys para conexão com WhatsApp, MySQL para persistência, Docker para ambiente local, menus guiados por números, envio de documentos PDF e estado por usuário.

O projeto está em um estágio saudável de MVP técnico: o fluxo principal funciona, há separação inicial em serviços, logs estruturados, banco local Docker, documentação de operação e testes básicos. A próxima prioridade estratégica é preparar o painel administrativo; a IA fica depois dele, como serviço Python separado.

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
- O fluxo de PPC já lista cursos antes de listar documentos PPC, com PDFs organizados por curso em `documentos/ppc`.
- A autenticação Baileys em `auth/` precisa ser tratada como credencial sensível em produção.
- Os testes ainda não simulam o fluxo completo com Baileys, MySQL e envio de arquivo.

## 4. Painel Administrativo Prioritário

A ideia aprovada para evolução é criar um painel administrativo para operar e manter o bot. Esse painel tem prioridade maior que a IA, porque resolve primeiro a manutenção real do conteúdo, documentos, setores e operação do WhatsApp.

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
- Criar primeiro uma API administrativa em TypeScript/Node.js para reduzir risco e reaproveitar tipos/serviços atuais.
- Usar controle de acesso por papéis e escopo de setor.
- Registrar auditoria de alterações feitas por administradores.
- Deixar Java como melhoria bem futura, após o painel estar validado e caso a governança/integracões institucionais justifiquem.

## 5. TypeScript e Java

É possível trabalhar com TypeScript, Python e Java, cada um com uma fronteira clara.

Recomendação atual:

- TypeScript continua responsável pelo WhatsApp/Baileys.
- Python fica como linguagem futura da IA, em serviço separado chamado pelo core TypeScript.
- Java fica como possibilidade futura para backend administrativo, integrações institucionais, relatórios e regras mais pesadas.

Motivo:

- Baileys é uma biblioteca TypeScript/JavaScript orientada a WebSocket e eventos.
- Migrar o core para Java aumentaria complexidade sem ganho imediato.
- Python tem o melhor ecossistema para RAG, embeddings, processamento de documentos e classificação de intenção.
- Um backend Java/Spring Boot pode fazer sentido no futuro para painel, RBAC, auditoria, APIs internas e integrações com sistemas do IFMA.

Arquitetura futura possível:

```text
WhatsApp
  -> Bot TypeScript com Baileys
    -> API administrativa/painel
    -> Serviço Python de IA futuro
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
- Criar testes com socket fake para `messageHandler`, handlers e fluxos.
- Validar manualmente os PPCs de todos os cursos cadastrados.
- Definir escopo mínimo do painel administrativo: login, perfis, setores, documentos, links e status do bot.

Médio prazo:

- Criar categorias para documentos no banco.
- Mover PPCs e documentos por categoria para dados persistidos, reduzindo hardcode.
- Criar painel administrativo mínimo com administrador principal e administradores setoriais.
- Criar fluxo de Links Importantes e Editais Abertos com opção `0` e `encerrar`.
- Criar testes automatizados para fluxos completos.
- Criar comandos administrativos restritos por `ADMIN_NUMBERS`.
- Definir o contrato futuro TypeScript -> Python antes de implementar IA.

Depois do painel:

- Criar serviço Python mínimo de IA com classificação de intenção, desligado por padrão.

Longo prazo:

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
