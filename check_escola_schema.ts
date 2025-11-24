
import connection from './src/db.js';

async function checkSchema() {
    try {
        const [rows] = await connection.query('DESCRIBE escola');
        const columns = (rows as any[]).map(r => r.Field);
        console.log('Columns:', columns);
        if (columns.includes('contato')) {
            console.log('✅ Column "contato" EXISTS');
        } else {
            console.log('❌ Column "contato" MISSING');
        }
    } catch (error) {
        console.error('Error describing table:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
