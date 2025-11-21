require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.MYSQL_PASSWORD,
        database: 'escolavai_db'
    });

    try {
        console.log('Adding active column to responsavel...');
        await connection.execute('ALTER TABLE responsavel ADD COLUMN active BOOLEAN DEFAULT TRUE');
        console.log('Success!');
    } catch (err) {
        console.log('Error or column already exists:', err.message);
    } finally {
        await connection.end();
    }
}

run();
