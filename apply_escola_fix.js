
import connection from './src/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyFix() {
    try {
        console.log('🔄 Applying fix for "escola" table...');

        const migrationPath = path.join(__dirname, 'database/migrations/add_contato_to_escola.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Executing SQL:', sql);

        await connection.query(sql);

        console.log('✅ Fix applied successfully! Column "contato" added.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Column "contato" already exists. No changes needed.');
        } else {
            console.error('❌ Error applying fix:', error);
        }
    } finally {
        process.exit();
    }
}

applyFix();
