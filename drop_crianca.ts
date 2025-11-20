
import connection from './src/db.js';

async function dropTable() {
    try {
        await connection.execute('DROP TABLE IF EXISTS crianca');
        console.log('Tabela crianca dropada.');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao dropar tabela:', error);
        process.exit(1);
    }
}

dropTable();
