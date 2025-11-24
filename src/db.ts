import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || 'escolavai_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        await connection.query('SELECT 1');
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Falha ao conectar ao MySQL2:', error);
        console.error('Verifique se o MySQL está rodando e se a senha no .env está correta.');
    }
}

testConnection();

export default connection;