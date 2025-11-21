const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createMasterUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'transporte_escolar'
    });

    try {
        console.log('🔧 Criando usuário Master...');

        // Check if master already exists
        const [existing] = await connection.execute(
            'SELECT id FROM admin WHERE role = ?',
            ['master']
        );

        if (existing.length > 0) {
            console.log('⚠️  Usuário Master já existe!');
            console.log('📧 Email: master@escolavai.com');
            console.log('🔑 Senha: master123');
            await connection.end();
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('master123', 10);

        // Create master user
        await connection.execute(
            'INSERT INTO admin (nome, email, password, role, active) VALUES (?, ?, ?, ?, ?)',
            ['Master Admin', 'master@escolavai.com', hashedPassword, 'master', true]
        );

        console.log('✅ Usuário Master criado com sucesso!');
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('📧 Email: master@escolavai.com');
        console.log('🔑 Senha: master123');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('Use essas credenciais para fazer login no sistema.');

    } catch (error) {
        console.error('❌ Erro ao criar usuário Master:', error.message);
    } finally {
        await connection.end();
    }
}

createMasterUser();
