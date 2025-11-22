
import connection from './src/db.js';

async function resetPassword() {
    try {
        console.log('Resetting password for admin@escolavai.com...');
        const [result] = await connection.query('UPDATE admin SET senha = ? WHERE email = ?', ['admin', 'admin@escolavai.com']);
        console.log('Updated rows:', (result as any).affectedRows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

resetPassword();
