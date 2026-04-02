import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

// Função interna para garantir que o usuário existe e retornar seu ID
async function getUserId(phoneNumber: string, fullName?: string): Promise<number> {
    // Tenta inserir se não existir, se existir apenas ignora (INSERT IGNORE)
    await pool.execute(
        'INSERT IGNORE INTO users (phone_number, full_name) VALUES (?, ?)',
        [phoneNumber, fullName || 'Aluno']
    );
    
    const [rows]: any = await pool.execute(
        'SELECT id FROM users WHERE phone_number = ?',
        [phoneNumber]
    );
    return rows[0].id;
}

export async function getUserState(phoneNumber: string): Promise<string> {
    try {
        const userId = await getUserId(phoneNumber);
        const [rows]: any = await pool.execute(
            'SELECT state FROM user_states WHERE user_id = ?',
            [userId]
        );
        return rows.length > 0 ? rows[0].state : 'main';
    } catch (error) {
        return 'main';
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
    }
}

export async function saveLog(phoneNumber: string, userName: string, message: string): Promise<void> {
    try {
        const userId = await getUserId(phoneNumber, userName);
        await pool.execute(
            'INSERT INTO logs (user_id, message) VALUES (?, ?)',
            [userId, message]
        );
    } catch (error) {
        console.error("Erro ao salvar log:", error);
    }
}