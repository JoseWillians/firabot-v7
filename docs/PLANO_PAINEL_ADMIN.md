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
- Frontend em React/Vite ou Next.js, a decidir.

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
3. Decidir frontend: React/Vite ou Next.js. Status: pendente, aguardando desenho/decisão visual.
4. Criar API administrativa mínima em TypeScript. Status: próximo passo técnico.
5. Criar tela de login e dashboard simples. Status: pendente, após decisão de frontend.
6. Criar tela de documentos por setor. Status: pendente.
7. Criar auditoria básica. Status: schema inicial criado em `admin_audit_logs`.

## 9. Base já preparada no schema

O `database/schema.sql` já contém uma primeira base para:

- `sectors`: setores como DRCA, CAE e Biblioteca;
- `admin_roles`: papéis como administrador principal e administrador setorial;
- `admin_users`: usuários administrativos com `password_hash`;
- `admin_user_sectors`: vínculo entre administradores e setores;
- `admin_audit_logs`: trilha de auditoria para alterações administrativas.

Essa base ainda não cria usuários reais. O cadastro inicial deve ser feito com senha hasheada e fluxo seguro quando a API do painel for implementada.

## 10. O que fica para depois

- Integração com Java/Spring Boot.
- Painel multi-campus.
- Métricas avançadas.
- Gestão da base de conhecimento da IA.
- Aprovação/revisão de respostas sugeridas pela IA.
- Relatórios institucionais.
