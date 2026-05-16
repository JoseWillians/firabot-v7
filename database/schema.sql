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
INSERT INTO docs (id, name, path, category_code, category_label, sort_order, is_active) VALUES
(1, 'Requerimento Acadêmico', './documentos/drca/requerimento-academico.pdf', 'drca', 'DRCA', 1, 1),
(2, 'Requerimento Diploma Técnico', './documentos/drca/requerimento-diploma-tecnico.pdf', 'drca', 'DRCA', 2, 1),
(3, 'Requerimento Superior', './documentos/drca/requerimento-superior.pdf', 'drca', 'DRCA', 3, 1),
(4, 'Termo de Desistência', './documentos/drca/termo-de-desistencia.pdf', 'drca', 'DRCA', 4, 1)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    path = VALUES(path),
    category_code = VALUES(category_code),
    category_label = VALUES(category_label),
    sort_order = VALUES(sort_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;
