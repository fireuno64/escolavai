import connection from './db.js';
async function migrate() {
    try {
        console.log('Making contract fields nullable on responsavel table...');
        // Modify data_inicio_contrato
        await connection.query('ALTER TABLE responsavel MODIFY COLUMN data_inicio_contrato DATE NULL');
        console.log('data_inicio_contrato modified.');
        // Modify valor_contrato
        await connection.query('ALTER TABLE responsavel MODIFY COLUMN valor_contrato DECIMAL(10,2) NULL');
        console.log('valor_contrato modified.');
        console.log('Migration completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
migrate();
