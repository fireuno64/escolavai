import connection from './src/db.js';

async function checkSchema() {
    try {
        console.log('Checking crianca table schema...\n');
        const [columns] = await connection.query('SHOW COLUMNS FROM crianca');
        console.log('Crianca columns:', columns.map(c => c.Field).join(', '));

        console.log('\nChecking pagamento table schema...\n');
        const [pagCols] = await connection.query('SHOW COLUMNS FROM pagamento');
        console.log('Pagamento columns:', pagCols.map(c => c.Field).join(', '));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
