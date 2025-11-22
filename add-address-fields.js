// Script to add address fields to database
import connection from './src/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addAddressFields() {
    try {
        console.log('🔄 Adding separate address fields...\n');

        const sql = fs.readFileSync(
            path.join(__dirname, 'database/migrations/add_address_fields.sql'),
            'utf8'
        );

        const statements = sql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
                console.log('✅ Executed:', statement.substring(0, 50) + '...');
            }
        }

        console.log('\n🎉 Address fields added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addAddressFields();
