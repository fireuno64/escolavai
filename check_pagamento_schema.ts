import { connection } from './src/db.js';

async function checkSchema() {
    try {
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM pagamento
        `);

        console.log('Pagamento table columns:');
        console.log(JSON.stringify(columns, null, 2));

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
