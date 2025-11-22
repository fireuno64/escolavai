import connection from './src/db.js';

async function addAdminFields() {
    try {
        console.log('Adding CPF/CNPJ and address fields to admin table...');

        // Check if columns already exist
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM admin LIKE 'cpf_cnpj'
        `);

        if (columns.length === 0) {
            await connection.query(`
                ALTER TABLE admin 
                ADD COLUMN cpf_cnpj VARCHAR(18) AFTER email,
                ADD COLUMN endereco VARCHAR(255) AFTER cpf_cnpj
            `);
            console.log('✅ Columns added successfully!');
        } else {
            console.log('ℹ️ Columns already exist');
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addAdminFields();
