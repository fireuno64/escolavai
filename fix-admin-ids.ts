
import connection from './src/db.js';

async function fix() {
    try {
        console.log('Fixing null admin_ids...');
        const [result] = await connection.query('UPDATE responsavel SET admin_id = 1 WHERE admin_id IS NULL');
        console.log('Updated responsaveis:', (result as any).affectedRows);

        const [result2] = await connection.query('UPDATE escola SET admin_id = 1 WHERE admin_id IS NULL');
        console.log('Updated escolas:', (result2 as any).affectedRows);

        const [result3] = await connection.query('UPDATE crianca SET admin_id = 1 WHERE admin_id IS NULL');
        console.log('Updated criancas:', (result3 as any).affectedRows);

    } catch (error) {
        console.error('Fix failed:', error);
    } finally {
        process.exit(0);
    }
}

fix();
