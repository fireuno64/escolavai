import connection from './src/db.js';

async function checkAndAddAdminFields() {
    try {
        console.log('Verificando colunas da tabela admin...');

        // Check current columns
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM admin
        `);

        console.log('Colunas atuais:');
        console.table(columns);

        // Check if cpf_cnpj exists
        const hasCpfCnpj = columns.some((col: any) => col.Field === 'cpf_cnpj');
        const hasEndereco = columns.some((col: any) => col.Field === 'endereco');

        if (!hasCpfCnpj || !hasEndereco) {
            console.log('\n⚠️ Colunas faltando. Adicionando...');

            if (!hasCpfCnpj) {
                await connection.query(`
                    ALTER TABLE admin 
                    ADD COLUMN cpf_cnpj VARCHAR(18) AFTER email
                `);
                console.log('✅ Coluna cpf_cnpj adicionada!');
            }

            if (!hasEndereco) {
                await connection.query(`
                    ALTER TABLE admin 
                    ADD COLUMN endereco VARCHAR(255) AFTER cpf_cnpj
                `);
                console.log('✅ Coluna endereco adicionada!');
            }
        } else {
            console.log('\n✅ Todas as colunas já existem!');
        }

        // Show final structure
        const [finalColumns] = await connection.query(`
            SHOW COLUMNS FROM admin
        `);

        console.log('\nEstrutura final da tabela admin:');
        console.table(finalColumns);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

checkAndAddAdminFields();
