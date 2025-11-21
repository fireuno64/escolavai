import connection from './src/db.js';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function createMasterUser() {
    try {
        console.log('🔧 Criando usuário Master...');

        // Check if master already exists
        const [existing] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM admin WHERE role = ?',
            ['master']
        );

        if (existing.length > 0) {
            console.log('⚠️  Usuário Master já existe!');
            console.log('');
            console.log('═══════════════════════════════════════');
            console.log('📧 Email: master@escolavai.com');
            console.log('🔑 Senha: master123');
            console.log('═══════════════════════════════════════');
            console.log('');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('master123', 10);

        // Create master user
        await connection.execute<ResultSetHeader>(
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
        console.log('Acesse: http://localhost:3000');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erro ao criar usuário Master:', error.message);
        process.exit(1);
    }
}

createMasterUser();
