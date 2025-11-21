import connection from './src/db.js';

async function migrate() {
    try {
        console.log('Checking admin table structure...');
        const [columns] = await connection.query('SHOW COLUMNS FROM admin LIKE "active"');

        if ((columns as any).length === 0) {
            console.log('Adding active column to admin table...');
            await connection.query('ALTER TABLE admin ADD COLUMN active BOOLEAN DEFAULT true');
            console.log('Column added successfully.');
        } else {
            console.log('Column active already exists in admin table.');
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
