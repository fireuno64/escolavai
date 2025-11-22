// src/db.ts
import * as mysql from 'mysql2/promise';
import 'dotenv/config'; // Garante que o .env seja lido
// A senha e os dados são lidos do .env via process.env
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD, // Lendo a variável que definimos
    database: 'escolavai_db', // O banco que você criou no MySQL Workbench/Terminal
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
async function testConnection() {
    try {
        await connection.query('SELECT 1');
        console.log('✅ Conexão MySQL2 estabelecida com sucesso!');
    }
    catch (error) {
        console.error('❌ Falha ao conectar ao MySQL2:', error);
        console.error('Verifique se o MySQL está rodando e se a senha no .env está correta.');
    }
}
testConnection();
export default connection;
