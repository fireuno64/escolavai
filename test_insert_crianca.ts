
import connection from './src/db.js';

async function testInsert() {
    try {
        console.log('Tentando insert direto...');

        // Primeiro pega um responsavel existente
        const [respRows] = await connection.execute('SELECT id FROM responsavel LIMIT 1');
        if (respRows.length === 0) {
            console.log('Nenhum responsavel encontrado para vincular.');
            process.exit(1);
        }
        const respId = respRows[0].id;
        console.log('Usando responsavelId:', respId);

        const query = 'INSERT INTO crianca (nome, escola, horario, responsavel_id) VALUES (?, ?, ?, ?)';
        const params = ['Criança Teste Direct', 'Escola Direct', 'Tarde', respId];

        console.log('Executando:', query, params);

        const [result] = await connection.execute(query, params);
        console.log('Insert sucesso:', result);
        process.exit(0);
    } catch (error) {
        console.error('Erro no insert:', error);
        process.exit(1);
    }
}

testInsert();
