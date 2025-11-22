
import connection from './src/db.js';

async function checkAdmins() {
    try {
        const [rows] = await connection.query('SELECT email FROM admin');
        console.log('Admins:', rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkAdmins();
