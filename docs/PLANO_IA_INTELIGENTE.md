# Plano de IA Inteligente para o FiraBot

## 1. Ideia central

O FiraBot deve continuar sendo um bot determinístico para ações críticas, como abrir menus, enviar documentos, controlar estados e executar comandos técnicos. A IA deve entrar como uma camada assistiva, capaz de interpretar mensagens livres, sugerir o melhor caminho e responder dúvidas simples com base em fontes oficiais.

Essa abordagem evita que a IA "assuma o volante" do WhatsApp. Ela recomenda uma ação; o core do bot decide se executa.

Importante: a IA não é a próxima prioridade de produto. Antes dela, o projeto deve priorizar o painel administrativo, porque é ele que permitirá administrar documentos, setores, links, conteúdos e operação do bot com segurança.

## 2. Linguagem recomendada

A decisão arquitetural aprovada é:

- core do WhatsApp e dos menus em TypeScript/Node.js;
- IA em Python como serviço separado;
- backend administrativo em Java/Spring Boot apenas em fase futura, se o painel e as integrações institucionais justificarem.

Python é a melhor escolha para a camada de IA porque concentra o ecossistema mais maduro para:

- RAG;
- embeddings;
- processamento de PDFs e textos;
- modelos locais ou APIs de LLM;
- pipelines de conhecimento;
- avaliação de respostas e classificação de intenção.

O TypeScript continua sendo o lugar correto para Baileys, estado da conversa, comandos, envio de documentos e regras determinísticas do bot. Java deve ficar como melhoria bem futura para backend administrativo, integrações institucionais, auditoria, RBAC avançado e governança.

## 3. Arquitetura proposta

```text
WhatsApp/Baileys
  -> Bot Core TypeScript
    -> Message Handler
      -> Fluxos determinísticos
      -> AI Client opcional
        -> Classificador de intenção
        -> Base de conhecimento
        -> Resposta assistida
        -> Recomendação de menu/documento/suporte
        -> API Python de IA
    -> MySQL
    -> Logs e auditoria
    -> Documentos
```

## 4. Contrato sugerido

A IA não deve chamar `sock.sendMessage` diretamente. O serviço Python deve receber contexto pela API e devolver uma ação. O core TypeScript decide se executa a ação.

Exemplo conceitual:

```ts
type BotAction =
  | { action: 'reply'; text: string; confidence: number }
  | { action: 'open_menu'; targetState: string; confidence: number }
  | { action: 'send_document'; documentId: string; confidence: number }
  | { action: 'handoff'; sector: string; confidence: number }
  | { action: 'fallback'; reason: string; confidence: number }
```

## 5. Estrutura futura sugerida

No projeto atual, criar apenas um cliente TypeScript fino:

```text
src/aiClient/
  pythonAiClient.ts
  types.ts
```

Para o serviço Python, usar uma pasta ou repositório separado quando a fase começar:

```text
firabot-ai-python/
  app/
    main.py
    intent_classifier.py
    knowledge_service.py
    answer_service.py
    safety_guard.py
    schemas.py
  tests/
  pyproject.toml
```

Essa separação mantém o bot estável e permite evoluir IA, dependências e deploy sem misturar o runtime do Baileys.

## 6. Dados necessários

- FAQs acadêmicas revisadas;
- links oficiais;
- documentos com título, setor, categoria, curso e resumo;
- perguntas frequentes reais anonimizadas;
- contatos e horários de setores;
- regras de quando responder, abrir menu ou encaminhar para suporte;
- histórico de dúvidas não entendidas pelo bot.

## 7. Segurança e LGPD

Regras obrigatórias:

- não enviar credenciais, QR Code, tokens ou `.env` para IA;
- mascarar telefone/JID sempre que possível;
- evitar enviar mensagens sensíveis completas para provedores externos;
- responder apenas com base em fontes oficiais;
- registrar fonte, confiança e ação tomada;
- se a IA não tiver certeza, encaminhar para menu ou suporte;
- bloquear prompt injection vindo de mensagens e documentos;
- criar política futura de retenção e anonimização.

## 8. Roadmap

### Fase 0 - Prioridade antes da IA

- consolidar o painel administrativo;
- permitir gestão de documentos por setor;
- criar RBAC para administrador principal e administradores setoriais;
- expor status do bot, WhatsApp, banco e documentos;
- preparar auditoria de alterações.

### Fase 1 - Preparar o core para integração futura

- manter `messageHandler` pequeno;
- criar tipos `ConversationContext` e `BotAction`;
- manter fluxos determinísticos como fonte de verdade.

### Fase 2 - Contrato TypeScript -> Python

- criar `ConversationContext`;
- criar `BotAction`;
- criar endpoint Python para classificar intenção;
- manter IA desligada por padrão via `.env`;
- registrar logs de confiança, ação sugerida e fallback.

### Fase 3 - Classificação de intenção

- identificar se a mensagem livre fala de documento, PPC, RU, biblioteca, edital, suporte ou saudação;
- direcionar para o menu correto sem gerar resposta longa.

### Fase 4 - Base de conhecimento curada

- criar artigos curtos e revisados;
- responder dúvidas simples com linguagem institucional;
- citar fonte quando aplicável.

### Fase 5 - RAG controlado

- indexar conteúdos revisados;
- limitar resposta por setor/estado atual;
- evitar usar PDF bruto sem curadoria.

### Fase 6 - Suporte inteligente

- resumir dúvida do usuário;
- sugerir setor responsável;
- preparar handoff para atendimento humano.

### Fase 7 - Painel administrativo

- permitir que administradores setoriais atualizem documentos, FAQs e links;
- revisar respostas sugeridas pela IA;
- acompanhar métricas e dúvidas sem resposta.

## 9. Riscos

- IA inventar informação acadêmica;
- base de conhecimento ficar desatualizada;
- custo subir se toda mensagem chamar LLM;
- vazar dados pessoais em logs ou chamadas externas;
- acoplar IA diretamente ao WhatsApp;
- tentar Java cedo demais e aumentar complexidade sem ganho real;
- acoplar o serviço Python diretamente ao WhatsApp, quebrando a fronteira do core TypeScript.

## 10. Próximo passo recomendado

Antes de implementar IA, consolidar:

1. fluxos separados por arquivo;
2. documentos por categoria;
3. painel administrativo mínimo funcionando;
4. base de conhecimento oficial;
5. testes do bot com socket fake.

Depois disso, iniciar uma Fase 2 pequena com um cliente TypeScript chamando um serviço Python mínimo, desligado por padrão via `.env`.
