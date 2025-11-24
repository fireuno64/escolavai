
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

        // Split by semicolon and filter out comments and empty lines
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--'));

        let addedCount = 0;
        let skippedCount = 0;

        for (const statement of statements) {
            try {
                console.log('📝 Executing:', statement.substring(0, 50) + '...');
                await connection.query(statement);
                addedCount++;
                console.log('   ✅ Success');
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    const match = statement.match(/ADD COLUMN (\w+)/);
                    const columnName = match ? match[1] : 'unknown';
                    console.log(`   ⚠️  Column "${columnName}" already exists, skipping`);
                    skippedCount++;
                } else {
                    throw error;
                }
            }
        }

        console.log('\n✅ Migration completed!');
        console.log(`   Added: ${addedCount} column(s)`);
        console.log(`   Skipped: ${skippedCount} column(s) (already exist)`);
    } catch (error) {
        console.error('❌ Error applying fix:', error.message);
    } finally {
        process.exit();
    }
}

applyFix();
