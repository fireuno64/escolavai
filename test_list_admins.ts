
import connection from './src/db.js';
import { RowDataPacket } from 'mysql2';

async function testListAdmins() {
    try {
        console.log('Fetching admins...');
        const [admins] = await connection.query<RowDataPacket[]>('SELECT id, nome, email, role, active FROM admin');
        console.log('Admins fetched:', admins.length);

        console.log('Fetching responsaveis...');
        const [responsaveis] = await connection.query<RowDataPacket[]>('SELECT id, nome, email, "cliente" as role, active FROM responsavel');
        console.log('Responsaveis fetched:', responsaveis.length);

        const adminUsers = admins.map(a => ({ ...a, type: 'admin' }));
        const clientUsers = responsaveis.map(r => ({ ...r, type: 'responsavel' }));

        const result = [...adminUsers, ...clientUsers];
        console.log('Total users:', result.length);
        console.log('Sample user:', result[0]);

        process.exit(0);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        process.exit(1);
    }
}

testListAdmins();
