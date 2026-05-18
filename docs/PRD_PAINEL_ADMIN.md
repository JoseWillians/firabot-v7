# PRD - Painel Administrativo do FiraBot

## 1. Visão geral

O Painel Administrativo do FiraBot será a interface oficial para operar e manter o bot de WhatsApp do IFMA Santa Inês sem editar código, banco de dados ou arquivos manualmente.

O painel não nasce como uma peça visual ou comercial. Ele nasce como uma ferramenta operacional: segura, clara, auditável e útil para administradores reais que precisam manter documentos, links, editais, setores, status do WhatsApp e solicitações de suporte.

## 2. Objetivo do produto

Permitir que administradores autorizados:

- acompanhem a saúde do bot;
- vejam o status do WhatsApp e do banco;
- conectem o WhatsApp com QR Code quando necessário;
- gerenciem documentos exibidos/enviados pelo bot;
- gerenciem links importantes;
- gerenciem editais abertos;
- gerenciem conteúdos de setores como DRCA, CAE e Biblioteca;
- acompanhem solicitações de suporte;
- gerenciem usuários administrativos;
- auditem alterações feitas no painel.

## 3. Escopo do MVP

O MVP deve entregar o mínimo necessário para tirar a manutenção diária do código e do banco manual.

### Dentro do MVP

- Login administrativo.
- Sessão segura.
- Perfis `admin_principal` e `admin_setor`.
- Permissões por setor.
- Dashboard operacional.
- Gestão de documentos.
- Gestão de links importantes.
- Gestão de editais.
- Gestão básica de usuários administrativos.
- Visualização de QR Code apenas para administrador principal.
- Auditoria básica.
- Upload seguro de PDF.
- Listagem de logs/eventos operacionais com dados minimizados.

### Fora do MVP

- IA inteligente.
- Backend Java/Spring Boot.
- Multi-campus.
- SSO institucional completo.
- Sincronização automática de editais.
- Métricas avançadas.
- Aprovação editorial em múltiplas etapas.
- Relatórios institucionais complexos.

## 4. Stack definida e opções aceitas

Frontend:

- HTML.
- TypeScript.
- Tailwind CSS.
- Bootstrap.
- VueJS.
- React.
- Next.js.

Opção base atual:

- VueJS com TypeScript, aproveitando o protótipo estático já existente como referência funcional de login. A primeira implementação do protótipo já foi iniciada em `C:\Dev\Projetos\teste\admin-firabot` com Vite, Tailwind CSS e Bootstrap.

Opções também aceitas:

- React com TypeScript, caso a equipe prefira um SPA administrativo simples.
- Next.js com TypeScript, caso o painel precise evoluir para autenticação mais estruturada, rotas protegidas, SSR/SSG controlado, API routes ou integração futura mais forte com deploy web.

Backend/API sugerido para a primeira fase:

- Node.js com TypeScript.
- MySQL atual.
- API REST versionada em `/api/admin/v1`.

Observação: Bootstrap e Tailwind devem ter papéis claros para evitar conflito visual e CSS desorganizado. Recomendação: Bootstrap pode servir como base de componentes utilitários conhecidos; Tailwind pode cuidar de composição, espaçamento, estados e refinamentos.

Decisão atual: usar VueJS + TypeScript na primeira fase para reduzir custo de migração do protótipo. React e Next.js seguem como opções aceitas para uma mudança futura, principalmente se o painel exigir SSR, rotas protegidas server-side, API routes integradas ou uma plataforma web mais ampla. O PRD permanece válido para as três opções, pois descreve funcionalidades e regras de negócio, não design visual.

## 5. Usuários e permissões

### Administrador principal

Perfil com acesso total.

Pode:

- acessar dashboard global;
- visualizar status do WhatsApp;
- visualizar QR Code quando houver desconexão;
- reiniciar/reconectar o bot, se a operação for implementada;
- gerenciar usuários administrativos;
- gerenciar setores;
- acessar todos os documentos;
- acessar todos os links;
- acessar todos os editais;
- acessar logs e auditoria;
- ver alertas de banco, documentos e operação;
- alterar permissões.

Não deve:

- visualizar senhas;
- visualizar tokens;
- visualizar conteúdo bruto do `auth/`;
- acessar QR Code em logs ou histórico.

### Administrador setorial

Perfil com acesso restrito aos setores vinculados.

Exemplos:

- Admin DRCA.
- Admin CAE.
- Admin Biblioteca.

Pode:

- acessar apenas setores vinculados;
- cadastrar documentos do próprio setor;
- editar documentos do próprio setor;
- ativar/inativar documentos do próprio setor;
- gerenciar links do próprio setor;
- gerenciar informações do próprio setor;
- visualizar solicitações de suporte ligadas ao próprio setor;
- ver logs operacionais limitados ao seu escopo, quando aplicável.

Não pode:

- ver QR Code;
- reiniciar bot;
- alterar usuários administrativos globais;
- acessar setores não vinculados;
- acessar logs sensíveis completos;
- alterar configurações globais;
- elevar a própria permissão.

## 6. Módulos funcionais

### 6.1 Autenticação

Funcionalidades:

- login com e-mail/usuário e senha;
- logout;
- sessão expirada;
- usuário ativo/inativo;
- troca ou reset de senha;
- recuperação de acesso, se definida para o MVP;
- opção futura de conta institucional.

Regras:

- senha nunca pode ser salva em texto puro;
- usar Argon2id ou bcrypt forte;
- login deve ter rate limit;
- falhas repetidas podem gerar bloqueio temporário;
- erro de login não deve dizer se o usuário existe;
- sessão deve usar cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax` ou `Strict`;
- evitar token em `localStorage`.

Critérios de aceite:

- usuário ativo com senha correta acessa o painel;
- usuário inativo não acessa;
- senha errada não dá detalhes do motivo;
- sessão expirada redireciona para login;
- logout invalida a sessão.

### 6.2 Dashboard operacional

Funcionalidades:

- status do WhatsApp: conectado, conectando, desconectado, logged out;
- status do banco;
- data/hora de inicialização;
- ambiente atual;
- modo debug;
- documentos ativos;
- documentos encontrados no disco;
- documentos ausentes;
- últimos erros importantes;
- alertas operacionais.

Alertas esperados:

- WhatsApp desconectado;
- QR Code necessário;
- banco indisponível;
- documento cadastrado ausente no disco;
- debug ativo em ambiente de produção;
- logs sem política de retenção definida;
- backup não configurado;
- MySQL exposto, se detectável por configuração.

Critérios de aceite:

- admin principal vê status global;
- admin setorial vê status simplificado sem ações sensíveis;
- documento ausente aparece como alerta;
- banco indisponível aparece como erro;
- status não expõe senha, token, QR salvo ou conteúdo de `auth/`.

### 6.3 Conexão WhatsApp e QR Code

Funcionalidades:

- mostrar status do WhatsApp;
- mostrar QR Code quando o bot estiver desconectado/logged out;
- ocultar QR Code quando conectado;
- expirar QR Code visualmente após curto intervalo;
- permitir ação de reconectar/reiniciar apenas se aprovada para o MVP.

Regras:

- QR Code é segredo operacional;
- somente `admin_principal` pode visualizar QR Code;
- QR Code nunca deve ser salvo no banco;
- QR Code nunca deve entrar em logs;
- QR Code nunca deve aparecer para admin setorial;
- arquivos em `auth/` nunca devem ser lidos/exibidos no frontend.

Critérios de aceite:

- admin principal vê QR quando necessário;
- admin setorial recebe `403` na API de QR;
- logs não contêm QR;
- sessão Baileys continua protegida.

### 6.4 Gestão de documentos

Funcionalidades:

- listar documentos por setor/categoria;
- cadastrar documento;
- fazer upload de PDF;
- editar nome exibido;
- editar resumo;
- editar categoria;
- editar ordem;
- ativar/inativar;
- substituir PDF;
- verificar saúde do arquivo;
- visualizar se o documento aparece no bot;
- impedir exclusão física acidental no MVP, preferindo inativação.

Campos mínimos:

- nome exibido;
- resumo;
- setor;
- categoria;
- arquivo PDF;
- ordem;
- ativo/inativo.

Categorias iniciais:

- DRCA;
- CAE;
- Biblioteca;
- PPC por curso.

Regras:

- `name` é rótulo exibido no WhatsApp;
- `path` é caminho físico relativo;
- path não deve ter acento;
- path não pode conter `..`;
- path não pode ser absoluto;
- arquivo precisa ficar dentro de `DOCUMENTS_DIR`;
- upload deve aceitar somente PDF;
- validar MIME, extensão, tamanho e assinatura inicial do arquivo;
- nome físico deve ser gerado pelo servidor;
- conteúdo inativo não aparece no bot;
- ordem do menu vem de `sort_order`;
- admin setorial só gerencia documentos do setor vinculado.

Critérios de aceite:

- documento ativo aparece no menu correto;
- documento inativo não aparece;
- PDF inválido é recusado;
- path traversal é bloqueado;
- admin DRCA não edita documento CAE;
- alteração gera auditoria.

### 6.5 Gestão de links importantes

Funcionalidades:

- listar links;
- cadastrar link;
- editar título;
- editar URL;
- editar descrição;
- definir setor ou escopo global;
- ordenar;
- ativar/inativar.

Regras:

- URL deve ser válida;
- link inativo não aparece no bot;
- admin setorial só altera links do próprio setor;
- admin principal pode criar links globais.

Critérios de aceite:

- link ativo aparece no fluxo `Links Importantes`;
- link inativo não aparece;
- URL inválida é recusada;
- alteração gera auditoria.

### 6.6 Gestão de editais

Funcionalidades:

- listar editais;
- cadastrar edital;
- editar título;
- editar URL;
- definir status;
- definir data de publicação;
- definir data de validade, quando aplicável;
- ordenar;
- ativar/inativar.

Regras:

- no MVP, cadastro pode ser manual e curado;
- sincronização automática com fonte oficial fica para fase futura;
- edital inativo não aparece no bot;
- edital vencido não deve aparecer como aberto;
- URL deve apontar preferencialmente para fonte oficial.

Critérios de aceite:

- edital ativo e válido aparece em `Editais Abertos`;
- edital vencido/inativo não aparece;
- alteração gera auditoria;
- painel informa que a lista exige curadoria enquanto não houver sincronização.

### 6.7 Gestão de setores

Funcionalidades:

- listar setores;
- criar setor;
- editar nome e descrição;
- ativar/inativar setor;
- vincular usuários administrativos.

Setores iniciais:

- DRCA;
- CAE;
- Biblioteca.

Regras:

- `code` do setor deve ser estável;
- inativar setor não deve apagar histórico;
- somente admin principal gerencia setores.

Critérios de aceite:

- admin principal cria/edita setor;
- admin setorial não acessa gestão de setores;
- setor inativo não fica disponível para novos conteúdos.

### 6.8 Gestão de usuários administrativos

Funcionalidades:

- listar usuários;
- criar usuário;
- editar nome/e-mail;
- definir papel;
- vincular setores;
- ativar/inativar;
- resetar senha;
- ver último login.

Regras:

- somente admin principal gerencia usuários;
- admin principal não deve remover o último admin principal ativo sem proteção;
- senha deve ser hasheada;
- usuário inativo não faz login.

Critérios de aceite:

- admin principal cria admin setorial vinculado à DRCA;
- admin setorial não acessa usuários;
- usuário inativo não faz login;
- mudança de papel gera auditoria.

### 6.9 Suporte setorial

Funcionalidades:

- listar solicitações registradas pelo fluxo `7 - Suporte`;
- filtrar por setor, status, data e usuário mascarado;
- marcar como novo, em análise, resolvido ou arquivado;
- adicionar observação interna;
- encaminhar para setor responsável.

Regras:

- mensagens livres podem conter dados pessoais;
- exibir o mínimo necessário;
- mascarar telefone/JID;
- definir política de retenção;
- admin setorial só vê solicitações do setor.

Critérios de aceite:

- solicitação registrada aparece na fila correta;
- admin setorial não vê solicitações de outro setor;
- ação sobre solicitação gera auditoria;
- conteúdo sensível não aparece em logs técnicos.

### 6.10 Logs e auditoria

Funcionalidades:

- listar eventos técnicos e administrativos;
- filtrar por tipo, data, usuário, setor e entidade;
- visualizar alterações administrativas;
- exportação futura, se necessário.

Regras:

- auditoria administrativa usa `admin_audit_logs`;
- logs de atendimento e logs administrativos devem ser separados conceitualmente;
- não salvar senha, token, QR Code ou conteúdo completo desnecessário;
- details JSON não pode virar depósito de dados sensíveis.

Eventos auditáveis:

- `ADMIN_LOGIN`;
- `ADMIN_LOGIN_FAILED`;
- `ADMIN_LOGOUT`;
- `DOC_CREATED`;
- `DOC_UPDATED`;
- `DOC_DISABLED`;
- `DOC_FILE_REPLACED`;
- `LINK_CREATED`;
- `LINK_UPDATED`;
- `LINK_DISABLED`;
- `NOTICE_CREATED`;
- `NOTICE_UPDATED`;
- `NOTICE_DISABLED`;
- `USER_CREATED`;
- `USER_UPDATED`;
- `USER_DISABLED`;
- `SECTOR_UPDATED`;
- `BOT_RECONNECT_REQUESTED`;
- `PERMISSION_CHANGED`.

## 7. Matriz de permissões

| Módulo | Admin principal | Admin setorial |
|---|---:|---:|
| Dashboard global | Sim | Parcial |
| QR Code WhatsApp | Sim | Não |
| Reconectar/reiniciar bot | Sim | Não |
| Documentos | Todos | Apenas setores vinculados |
| Links | Todos | Apenas setores vinculados |
| Editais | Todos ou globais | Conforme permissão definida |
| Setores | Sim | Não |
| Usuários admin | Sim | Não |
| Suporte | Todos | Apenas setores vinculados |
| Logs técnicos | Sim | Não ou limitado |
| Auditoria | Sim | Limitado às próprias ações |
| Configurações globais | Sim | Não |

## 8. API administrativa sugerida

Base: `/api/admin/v1`

Autenticação:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Setores:

- `GET /sectors`
- `POST /sectors`
- `PATCH /sectors/:id`

Usuários:

- `GET /admin-users`
- `POST /admin-users`
- `PATCH /admin-users/:id`
- `POST /admin-users/:id/reset-password`

Documentos:

- `GET /documents?sector=drca`
- `POST /documents`
- `PATCH /documents/:id`
- `POST /documents/:id/file`
- `DELETE /documents/:id` como soft delete ou `is_active=false`
- `GET /documents/health`

Links:

- `GET /links`
- `POST /links`
- `PATCH /links/:id`
- `DELETE /links/:id` como soft delete

Editais:

- `GET /notices`
- `POST /notices`
- `PATCH /notices/:id`
- `DELETE /notices/:id` como soft delete

Bot:

- `GET /bot/status`
- `GET /bot/qrcode`
- `POST /bot/reconnect`

Suporte:

- `GET /support-tickets`
- `PATCH /support-tickets/:id`

Auditoria:

- `GET /audit-logs`

## 9. Requisitos não funcionais

Segurança:

- validação com Zod ou equivalente;
- CORS restrito por ambiente;
- rate limit no login;
- cookies seguros;
- RBAC obrigatório no backend;
- helmet/headers de segurança;
- upload seguro;
- logs sem segredo;
- queries parametrizadas.

Performance:

- telas devem carregar rapidamente em rede comum do campus;
- filtros de logs devem ser paginados;
- upload deve exibir progresso;
- listas devem usar paginação ou busca.

Acessibilidade:

- navegação por teclado;
- labels visíveis;
- foco visível;
- mensagens de erro associadas ao campo;
- contraste adequado;
- estados de loading e erro compreensíveis.

Operação:

- painel deve funcionar com MySQL local no desenvolvimento;
- produção deve usar `.env` próprio;
- não depender do banco remoto nos testes locais;
- não expor `.env` no frontend;
- não exibir conteúdo de `auth/`.

## 10. Estados de tela obrigatórios

Cada módulo deve prever:

- carregando;
- vazio;
- erro;
- sem permissão;
- sessão expirada;
- sucesso;
- confirmação para ação sensível.

Exemplos:

- setor sem documentos;
- CAE sem documentos automáticos;
- nenhum edital ativo;
- nenhum link cadastrado;
- nenhum chamado de suporte;
- WhatsApp desconectado;
- banco indisponível;
- upload recusado.

## 11. Roadmap

### Fase 0 - Preparação

- Revisar schema e criar migrations.
- Definir contratos da API.
- Definir estratégia de sessão.
- Definir política de upload.
- Confirmar estrutura do frontend: VueJS, React ou Next.js com TypeScript.

### Fase 1 - Base administrativa

- Login/logout.
- `GET /auth/me`.
- Middleware de autenticação.
- Middleware de autorização por papel/setor.
- Dashboard com status básico.
- Auditoria de login.

### Fase 2 - Documentos

- CRUD de documentos.
- Upload seguro.
- Healthcheck de documentos.
- Integração com menu DRCA/CAE/PPC.
- Auditoria de alterações.

### Fase 3 - Conteúdos administráveis

- CRUD de links.
- CRUD de editais.
- Preparar Biblioteca e RU para dados administráveis.
- Remover hardcode progressivamente do bot.

### Fase 4 - Usuários e setores

- Gestão de usuários administrativos.
- Gestão de setores.
- Vínculo admin-setor.
- Auditoria de permissões.

### Fase 5 - Suporte e operação

- Fila de suporte setorial.
- Status avançado.
- QR Code no painel para admin principal.
- Ações operacionais restritas.

### Fase 6 - Pós-MVP

- Métricas.
- Relatórios.
- Sincronização de editais.
- SSO institucional.
- Multi-campus.
- Base de conhecimento para IA.

## 12. Riscos

- Vazamento de QR Code ou sessão Baileys.
- Admin setorial acessando setor errado.
- Upload malicioso ou path traversal.
- Logs com dados pessoais.
- Editais desatualizados.
- Falta de migrations.
- MySQL exposto.
- Frontend escondendo opções sem backend validar permissões.
- Uso confuso de Bootstrap e Tailwind sem padrão.
- Escolha tardia entre VueJS, React e Next.js atrasar a implementação do frontend.

## 13. Métricas de sucesso

- Tempo para atualizar um documento sem mexer no código.
- Número de documentos ausentes detectados pelo painel.
- Redução de alterações manuais no banco.
- Percentual de ações administrativas auditadas.
- Tempo de recuperação quando WhatsApp desconecta.
- Quantidade de links/editais atualizados pelo painel.
- Erros de permissão bloqueados corretamente.

## 14. Critérios gerais de pronto

- Build do painel passa.
- Testes de API passam.
- Login, logout e sessão funcionam.
- RBAC bloqueia acesso fora do setor.
- Upload seguro bloqueia arquivos inválidos.
- Documentos ativos aparecem no bot.
- Links/editais ativos aparecem no bot.
- Auditoria registra alterações relevantes.
- QR Code não aparece para admin setorial.
- Nenhum segredo é salvo em log.
