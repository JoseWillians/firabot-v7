import mysql from 'mysql2/promise';
import { config } from '../config.js';
import type { BotEventType, UserLogDetails } from '../services/logService.js';

const pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
});

pool.on('connection', (connection) => {
    connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
});

function explainDatabaseConnectionError(error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'ECONNREFUSED') {
        return 'Não foi possível conectar ao MySQL. Verifique se o Docker está ativo, se o container firabot-mysql subiu, e se DB_HOST/DB_PORT/.env apontam para 127.0.0.1:3306 no desenvolvimento local.';
    }

    return 'Falha ao conectar ao MySQL. Verifique DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME no .env.';
}

/**
 * Healthcheck usado na inicialização e no comando !status.
 * Faz uma consulta leve ao MySQL para confirmar credenciais, banco e charset.
 */
export async function checkDatabaseConnection(): Promise<{ ok: boolean; message: string }> {
    try {
        await pool.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        await pool.query('SELECT 1');
        return { ok: true, message: 'Banco conectado' };
    } catch (error) {
        return { ok: false, message: explainDatabaseConnectionError(error) };
    }
}

/**
 * Garante que todo evento tenha um usuário associado antes de salvar estado/log.
 * A combinação INSERT IGNORE + SELECT mantém a operação idempotente para o mesmo
 * JID do WhatsApp e evita duplicar usuários.
 */
async function getUserId(phoneNumber: string, fullName?: string): Promise<number> {
    await pool.execute(
        'INSERT IGNORE INTO users (phone_number, full_name) VALUES (?, ?)',
        [phoneNumber, fullName || 'Aluno']
    );

    const [rows]: any = await pool.execute(
        'SELECT id FROM users WHERE phone_number = ?',
        [phoneNumber]
    );
    if (!rows[0]?.id) {
        throw new Error(`Usuário não encontrado após INSERT IGNORE: ${phoneNumber}`);
    }
    return rows[0].id;
}

/**
 * Busca estado persistido no MySQL.
 * Erros são relançados para que a camada de serviço registre fallback explícito
 * em memória, sem mascarar problemas de banco como se fossem estado "main".
 */
export async function getUserState(phoneNumber: string): Promise<string> {
    try {
        const userId = await getUserId(phoneNumber);
        const [rows]: any = await pool.execute(
            'SELECT state FROM user_states WHERE user_id = ?',
            [userId]
        );
        return rows.length > 0 ? rows[0].state : 'main';
    } catch (error) {
        console.error("Erro ao obter estado do usuário:", error);
        throw error;
    }
}

export async function setUserState(phoneNumber: string, state: string): Promise<void> {
    try {
        const userId = await getUserId(phoneNumber);
        await pool.execute(
            `INSERT INTO user_states (user_id, state) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE state = ?`,
            [userId, state, state]
        );
    } catch (error) {
        console.error("Erro ao definir estado:", error);
        throw error;
    }
}

export async function saveLog(phoneNumber: string, userName: string, message: string, state?: string, eventType: BotEventType = 'MESSAGE_RECEIVED', details: UserLogDetails = {}): Promise<void> {
    try {
        const userId = await getUserId(phoneNumber, userName);
        await pool.execute(
            `INSERT INTO logs
             (user_id, message, message_preview, state, state_before, state_after, event_type, command, menu, document_id, success, error_message)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                message,
                message,
                state || null,
                details.stateBefore || null,
                details.stateAfter || null,
                eventType,
                details.command || null,
                details.menu || null,
                details.documentId ? String(details.documentId) : null,
                typeof details.success === 'boolean' ? details.success : null,
                details.errorMessage || null
            ]
        );
    } catch (error) {
        console.error("Erro ao salvar log:", error);
        throw error;
    }
}


/**
 * Busca documentos ativos para montar o submenu em tempo de execução.
 * Em caso de erro, retorna lista vazia: o documentService registra o problema e
 * aplica fallback local para não interromper o atendimento.
 */
export async function getActiveDocs(categoryCode?: string): Promise<any[]> {
    try {
        const [rows] = categoryCode
            ? await pool.execute(
                'SELECT name, path, category_code, category_label, sort_order, summary FROM docs WHERE is_active = 1 AND category_code = ? ORDER BY COALESCE(sort_order, id), id ASC',
                [categoryCode]
            )
            : await pool.execute(
                'SELECT name, path, category_code, category_label, sort_order, summary FROM docs WHERE is_active = 1 ORDER BY COALESCE(sort_order, id), id ASC'
            );
        return rows as any[];
    } catch (error) {
        console.error('Erro ao buscar documentos no banco:', error);
        return []; // Retorna lista vazia em caso de erro para não travar o bot
    }
}

export async function countActiveDocs(): Promise<number> {
    try {
        const [rows]: any = await pool.execute(
            'SELECT COUNT(*) AS total FROM docs WHERE is_active = 1'
        );
        return Number(rows[0]?.total || 0);
    } catch (error) {
        console.error('Erro ao contar documentos ativos:', error);
        throw error;
    }
}
