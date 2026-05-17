-- =========================================================
-- Schema do banco de dados do FiraBot v7
-- Projeto: Bot de WhatsApp para atendimento acadêmico IFMA
-- Banco sugerido: MySQL 8+
-- =========================================================

-- Cria o banco caso ele ainda não exista.
-- Altere o nome do banco se o seu .env estiver usando outro DB_NAME.
CREATE DATABASE IF NOT EXISTS firabot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE firabot;

-- =========================================================
-- 1. TABELA DE USUÁRIOS
-- Guarda os usuários que já conversaram com o bot.
-- phone_number é único para evitar duplicidade de cadastro.
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. TABELA DE ESTADOS DO USUÁRIO
-- Controla em qual menu/fluxo cada usuário está.
-- Isso evita que uma opção de submenu seja interpretada como opção do menu principal.
-- Estados esperados inicialmente: main, docs, curso, suporte, encerrado.
-- =========================================================
CREATE TABLE IF NOT EXISTS user_states (
    user_id INT PRIMARY KEY,
    state VARCHAR(50) NOT NULL DEFAULT 'main',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_states_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice auxiliar para consultas por estado, útil em debug/relatórios.
CREATE INDEX idx_user_states_state ON user_states (state);

-- =========================================================
-- 3. TABELA DE LOGS
-- Registra interações, erros e eventos importantes do bot.
-- A coluna message mantém compatibilidade com versões anteriores.
-- Os campos estruturados ajudam auditoria sem salvar conteúdo sensível completo.
-- =========================================================
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    message_preview VARCHAR(255),
    state VARCHAR(50),
    state_before VARCHAR(50),
    state_after VARCHAR(50),
    event_type VARCHAR(50) DEFAULT 'MESSAGE_RECEIVED',
    command VARCHAR(100),
    menu VARCHAR(100),
    document_id VARCHAR(100),
    success TINYINT(1),
    error_message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para facilitar auditoria e consultas recentes.
CREATE INDEX idx_logs_user_id ON logs (user_id);
CREATE INDEX idx_logs_created_at ON logs (created_at);
CREATE INDEX idx_logs_event_type ON logs (event_type);
CREATE INDEX idx_logs_success ON logs (success);

-- =========================================================
-- 4. TABELA DINÂMICA DE DOCUMENTOS
-- Permite montar menus de documentos a partir do banco,
-- evitando deixar tudo fixo dentro do messageHandler.
-- =========================================================
CREATE TABLE IF NOT EXISTS docs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    summary TEXT,
    category_code VARCHAR(50),
    category_label VARCHAR(100),
    sort_order INT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_docs_path (path),
    INDEX idx_docs_is_active (is_active),
    INDEX idx_docs_category_active_sort (category_code, is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. DOCUMENTOS INICIAIS
-- O ON DUPLICATE KEY evita duplicar registros caso o script seja executado novamente.
-- Atenção: os arquivos PDF precisam existir nesses caminhos dentro do projeto/container.
-- A categoria CAE fica preparada para cadastro futuro, sem registros iniciais.
-- =========================================================
INSERT INTO docs (id, name, path, summary, category_code, category_label, sort_order, is_active) VALUES
(1, 'Requerimento Acadêmico', './documentos/drca/requerimento-academico.pdf', 'Use este requerimento para solicitar serviços acadêmicos gerais junto à DRCA, como ajustes, declarações ou outros procedimentos administrativos.', 'drca', 'DRCA', 1, 1),
(2, 'Requerimento Diploma Técnico', './documentos/drca/requerimento-diploma-tecnico.pdf', 'Use este formulário para solicitar emissão ou encaminhamento relacionado ao diploma de curso técnico.', 'drca', 'DRCA', 2, 1),
(3, 'Requerimento Superior', './documentos/drca/requerimento-superior.pdf', 'Use este requerimento para solicitações acadêmicas de cursos superiores, como aproveitamento, declarações ou demandas de registro acadêmico.', 'drca', 'DRCA', 3, 1),
(4, 'Termo de Desistência', './documentos/drca/termo-de-desistencia.pdf', 'Use este termo quando o estudante desejar formalizar a desistência do curso ou de vínculo acadêmico, conforme orientação institucional.', 'drca', 'DRCA', 4, 1),
(101, 'PPC - Engenharia de Computação 2022', './documentos/ppc/eng_comp/ppc.eng_.comp_2022_.pdf', 'Este PPC apresenta a organização curricular, carga horária, perfil do egresso e regras acadêmicas do curso de Engenharia de Computação para as turmas vinculadas a essa matriz.', 'ppc_eng_comp', 'PPC - Engenharia de Computação', 1, 1),
(102, 'PPC - Engenharia de Computação 2024', './documentos/ppc/eng_comp/ppc.eng_.comp_2024_.pdf', 'Este PPC descreve a matriz mais recente de Engenharia de Computação, com componentes curriculares, objetivos do curso e orientações acadêmicas para as turmas da nova estrutura.', 'ppc_eng_comp', 'PPC - Engenharia de Computação', 2, 1),
(201, 'PPC - Bacharelado em Administração 2022', './documentos/ppc/bach_adm/ppc_adm_2022.pdf', 'Este PPC reúne as diretrizes do curso de Administração, incluindo matriz curricular, competências esperadas, carga horária e normas do percurso formativo.', 'ppc_bach_adm', 'PPC - Bacharelado em Administração', 1, 1),
(202, 'PPC - Bacharelado em Administração 2023', './documentos/ppc/bach_adm/ppc_adm_2023.pdf', 'Este PPC apresenta a atualização do curso de Administração, servindo como referência para disciplinas, perfil profissional e organização acadêmica da matriz vigente.', 'ppc_bach_adm', 'PPC - Bacharelado em Administração', 2, 1),
(301, 'PPC - Licenciatura em Física 2019', './documentos/ppc/lic_fis/ppc_fis_2019.pdf', 'Este PPC orienta a formação do licenciando em Física, detalhando disciplinas, estágios, práticas pedagógicas e requisitos da matriz de 2019.', 'ppc_lic_fis', 'PPC - Licenciatura em Física', 1, 1),
(302, 'PPC - Licenciatura em Física 2023', './documentos/ppc/lic_fis/ppc_fis_2023.pdf', 'Este PPC apresenta a matriz atualizada da Licenciatura em Física, com foco na formação docente, componentes curriculares e atividades acadêmicas obrigatórias.', 'ppc_lic_fis', 'PPC - Licenciatura em Física', 2, 1),
(401, 'PPC - Tecnologia em Construção de Edifícios', './documentos/ppc/grad_tce/ppc_tce.pdf', 'Este PPC descreve a estrutura do curso de Tecnologia em Construção de Edifícios, incluindo matriz curricular, competências profissionais e orientações para integralização.', 'ppc_grad_tce', 'PPC - Tecnologia em Construção de Edifícios', 1, 1),
(501, 'PPC - Engenharia Civil 2022', './documentos/ppc/eng_civil/ppc_eng_civil_2022.pdf', 'Este PPC apresenta a organização acadêmica de Engenharia Civil, com matriz curricular, perfil do egresso, carga horária e requisitos do curso.', 'ppc_eng_civil', 'PPC - Engenharia Civil', 1, 1)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    path = VALUES(path),
    summary = VALUES(summary),
    category_code = VALUES(category_code),
    category_label = VALUES(category_label),
    sort_order = VALUES(sort_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

-- =========================================================
-- 6. BASE DO PAINEL ADMINISTRATIVO
-- Estrutura inicial para RBAC por setor. O painel tem prioridade antes da IA
-- e deve permitir que cada administrador gerencie apenas sua área.
-- =========================================================
CREATE TABLE IF NOT EXISTS sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_users_role
      FOREIGN KEY (role_id) REFERENCES admin_roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_user_sectors (
    admin_user_id INT NOT NULL,
    sector_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_user_id, sector_id),
    CONSTRAINT fk_admin_user_sectors_user
      FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
      ON DELETE CASCADE,
    CONSTRAINT fk_admin_user_sectors_sector
      FOREIGN KEY (sector_id) REFERENCES sectors(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_audit_logs_user
      FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
      ON DELETE SET NULL,
    INDEX idx_admin_audit_created_at (created_at),
    INDEX idx_admin_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO sectors (code, name, description, is_active) VALUES
('drca', 'DRCA', 'Documentos e informações de registro e controle acadêmico.', 1),
('cae', 'CAE', 'Atendimento estudantil e documentos da assistência estudantil.', 1),
('biblioteca', 'Biblioteca', 'Links, documentos e informações da biblioteca.', 1)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO admin_roles (code, name, description) VALUES
('admin_principal', 'Administrador Principal', 'Acesso total ao painel, operação do bot e todos os setores.'),
('admin_setor', 'Administrador Setorial', 'Acesso restrito aos setores vinculados ao usuário.')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description);
