import connection from './src/db.js';

async function addAdminFields() {
    try {
        console.log('Adicionando colunas cpf_cnpj e endereco à tabela admin...\n');

        // Add cpf_cnpj column
        try {
            await connection.query(`
                ALTER TABLE admin 
                ADD COLUMN cpf_cnpj VARCHAR(18) AFTER email
            `);
            console.log('✅ Coluna cpf_cnpj adicionada com sucesso!');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Coluna cpf_cnpj já existe');
            } else {
                throw error;
            }
        }

        // Add endereco column
        try {
            await connection.query(`
                ALTER TABLE admin 
                ADD COLUMN endereco VARCHAR(255) AFTER cpf_cnpj
            `);
            console.log('✅ Coluna endereco adicionada com sucesso!');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Coluna endereco já existe');
            } else {
                throw error;
            }
        }

        console.log('\n✅ Migração concluída com sucesso!');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        await connection.end();
        process.exit(1);
    }
}

addAdminFields();
