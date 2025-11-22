
import connection from './src/db.js';

async function checkSchema() {
    try {
        const [rows] = await connection.execute('DESCRIBE responsavel');
        console.log('Schema da tabela responsavel:', rows);

        const [adminRows] = await connection.execute('DESCRIBE admin');
        console.log('Schema da tabela admin:', adminRows);
        process.exit(0);
    } catch (error) {
        console.error('Erro ao verificar schema:', error);
        process.exit(1);
    }
}

checkSchema();
