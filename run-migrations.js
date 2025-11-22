// Script to run database migrations
import connection from './src/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    try {
        console.log('🔄 Starting database migrations...\n');

        // Read and execute create_contrato_table.sql
        const createTableSQL = fs.readFileSync(
            path.join(__dirname, 'database/migrations/create_contrato_table.sql'),
            'utf8'
        );

        console.log('📝 Creating contrato table...');
        const statements = createTableSQL.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        console.log('✅ Contrato table created successfully\n');

        // Read and execute migrate_existing_contracts.sql
        const migrateDataSQL = fs.readFileSync(
            path.join(__dirname, 'database/migrations/migrate_existing_contracts.sql'),
            'utf8'
        );

        console.log('📝 Migrating existing contract data...');
        const migrationStatements = migrateDataSQL.split(';').filter(stmt => stmt.trim());

        for (const statement of migrationStatements) {
            if (statement.trim()) {
                const [rows] = await connection.query(statement);
                if (Array.isArray(rows) && rows.length > 0) {
                    console.log('Result:', rows);
                }
            }
        }
        console.log('✅ Data migration completed successfully\n');

        console.log('🎉 All migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
