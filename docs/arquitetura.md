# Arquitetura

## Visao geral

Estrutura orientada a comandos, menus, services e persistencia MySQL.

## Pontos principais

- Entrada principal: `src/index.ts`.
- Roteamento de menus: `src/services/menuRoutingService.ts`.
- Estado de usuarios: `src/services/userStateService.ts`.
- Logs e documentos: services dedicados em `src/services`.
- Evolução recomendada: separar fluxos em arquivos próprios por área, como biblioteca, documentos, curso, links, editais, RU e suporte.
- Painel administrativo futuro: administrador principal com acesso total e administradores setoriais com acesso restrito por DRCA, CAE e Biblioteca.
- Java/Spring Boot: manter como possibilidade bem futura para backend administrativo, integrações e governança, sem mover o core Baileys para Java neste momento.

## Pendente de confirmacao

- Diagrama de fluxo completo.
- Politica para reconexao e limpeza de sessoes.
- Modelo de RBAC do painel administrativo.
- Categorias de documentos por setor no banco.

## Links

- [[10-Architecture/padrao-projeto-chatbot]]
- [[08-Databases/mysql-boas-praticas]]
