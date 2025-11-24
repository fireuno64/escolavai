import connection from './src/db.js';

async function checkSchema() {
    try {
        console.log('Checking escola table schema...\n');

        const [rows] = await connection.query('DESCRIBE escola');
        console.log('Current columns in escola table:');
        console.table(rows);

        const columns = (rows as any[]).map(r => r.Field);
        console.log('\nColumn names:', columns);

        // Check for expected columns
        const expectedColumns = ['id', 'nome', 'endereco', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'contato', 'telefone', 'email', 'admin_id'];
        const missingColumns = expectedColumns.filter(col => !columns.includes(col));

        if (missingColumns.length > 0) {
            console.log('\n❌ Missing columns:', missingColumns);
        } else {
            console.log('\n✅ All expected columns are present');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
