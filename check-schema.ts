
import connection from './src/db.js';

async function checkSchema() {
    try {
        const [rows] = await connection.query('DESCRIBE admin');
        console.log('Admin Table Schema:', rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkSchema();
