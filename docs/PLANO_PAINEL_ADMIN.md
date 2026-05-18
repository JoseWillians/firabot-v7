# Plano do Painel Administrativo do FiraBot

## 1. Prioridade

O painel administrativo tem prioridade maior que a IA. Ele deve vir primeiro porque resolve a manutenção diária do bot: documentos, links, setores, status operacional e permissões.

## 2. Objetivo

Criar uma interface administrativa para que o FiraBot possa ser operado sem editar código ou banco manualmente.

## 3. Perfis

### Administrador principal

- Visualiza status do WhatsApp, banco, documentos e logs.
- Liga, reinicia ou acompanha o bot pelo painel.
- Visualiza QR Code quando o WhatsApp estiver desconectado.
- Gerencia usuários administrativos.
- Acessa todos os setores.

### Administrador setorial

- Acessa apenas o próprio setor.
- DRCA gerencia documentos e informações da DRCA.
- CAE gerencia documentos e informações da CAE.
- Biblioteca gerencia links, documentos e informações da biblioteca.
- Não acessa configurações globais, dados de outros setores ou ações sensíveis.

## 4. Módulos do MVP

1. Login administrativo.
2. Perfis e permissões por setor.
3. Cadastro de setores.
4. Gestão de documentos.
5. Gestão de links importantes.
6. Gestão de editais.
7. Status do bot e do WhatsApp.
8. Auditoria básica de alterações.

## 5. Stack sugerida

Primeira fase:

- Backend/API em TypeScript/Node.js.
- Banco MySQL atual.
- Frontend em VueJS, React ou Next.js com TypeScript.
- HTML, Tailwind CSS e Bootstrap conforme stack definida para o painel.

Fase futura:

- Java/Spring Boot apenas se o painel crescer em governança, auditoria, integrações institucionais ou múltiplos campi.

## 6. Tabelas futuras prováveis

- `admin_users`
- `admin_roles`
- `sectors`
- `admin_user_sectors`
- `document_categories`
- `important_links`
- `notices`
- `admin_audit_logs`
- `support_tickets`

## 7. Regras de segurança

- Nunca expor QR Code em logs.
- Não salvar senhas em texto puro.
- Usar hash forte de senha.
- Restringir CORS por ambiente.
- Usar sessão/cookie seguro ou JWT com expiração curta.
- Auditar alterações em documentos e links.
- Validar uploads de PDF por tipo, tamanho e destino.
- Separar permissões por setor.

## 8. O que fazer agora

1. Definir escopo do MVP do painel. Status: iniciado neste documento.
2. Modelar tabelas administrativas. Status: base inicial criada em `database/schema.sql`.
3. Decidir frontend: VueJS, React ou Next.js com TypeScript, Tailwind CSS e Bootstrap. Status: VueJS + TypeScript escolhido para a primeira implementação por reaproveitar melhor o protótipo atual; React e Next.js seguem documentados como alternativas futuras.
4. Criar API administrativa mínima em TypeScript. Status: implementado no painel em `C:\Dev\Projetos\admin-firabot`, com Express, cookie HttpOnly, rate limit, Helmet, CORS restrito, Zod, RBAC por permissão e endpoints reais para documentos, links, editais, suporte e usuários.
5. Criar tela de login e dashboard simples. Status: implementado no painel oficial `C:\Dev\Projetos\admin-firabot` com VueJS, Vite, TypeScript, Tailwind CSS e Bootstrap.
6. Criar tela de documentos por setor. Status: implementado com CRUD real, upload seguro de PDF, filtro por categoria e PPC por curso.
7. Criar auditoria básica. Status: schema inicial criado em `admin_audit_logs`; CRUDs administrativos já registram auditoria inicial.
8. Criar fila de suporte setorial. Status: iniciado com `support_tickets`, registro pelo bot e atualização de status pelo painel.

## 8.1 Decisão de raiz do painel

O painel deve permanecer em uma raiz separada do chatbot. Essa separação reduz risco operacional porque o bot e o painel têm responsabilidades e ciclos de deploy diferentes:

- o bot executa Baileys, sessão WhatsApp, mensagens, documentos e estado de conversa;
- o painel executa autenticação administrativa, RBAC, uploads, dashboard, auditoria e módulos web;
- o deploy do painel pode seguir domínio próprio, enquanto o bot pode continuar como serviço de backend;
- alterações visuais e dependências web não entram no mesmo pacote do serviço WhatsApp.

Raiz oficial do painel:

```text
C:\Dev\Projetos\admin-firabot
```

## 9. Base já preparada no schema

O `database/schema.sql` já contém uma primeira base para:

- `sectors`: setores como DRCA, CAE e Biblioteca;
- `admin_roles`: papéis como administrador principal e administrador setorial;
- `admin_users`: usuários administrativos com `email`, `enrollment_code` e `password_hash`;
- `admin_user_sectors`: vínculo entre administradores e setores;
- `admin_audit_logs`: trilha de auditoria para alterações administrativas.

O protótipo do painel já permite criar e desativar administradores pela tela `Usuários`. O login administrativo aceita e-mail/senha ou matrícula/senha. Em produção, o cadastro inicial deve continuar usando senha hasheada e fluxo seguro.

## 10. O que fica para depois

- Consolidar fallbacks mockados para ambiente de desenvolvimento e bloquear definitivamente em produção.
- Status: leitura/escrita real via MySQL já existe para documentos, links, editais, suporte e usuários administrativos no painel `C:\Dev\Projetos\admin-firabot`.
- Expandir CRUD de suporte para responsável, prioridade, histórico e observações por setor.
- CRUD inicial de usuários administrativos: implementado no protótipo com criação, listagem e desativação.
- Upload seguro de PDF no painel: implementado com destino por categoria/setor.
- Integrar status/QR Code do WhatsApp com o serviço do bot sem expor `auth/`.
- Integração com Java/Spring Boot.
- Painel multi-campus.
- Métricas avançadas.
- Gestão da base de conhecimento da IA.
- Aprovação/revisão de respostas sugeridas pela IA.
- Relatórios institucionais.

## 11. PRD funcional

O PRD completo do painel está em `docs/PRD_PAINEL_ADMIN.md`. Ele detalha funcionalidades, regras de negócio, matriz de permissões, endpoints sugeridos, critérios de aceite, riscos e roadmap por fases.
