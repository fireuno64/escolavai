
// test_crianca_crud.js
// Native fetch is available

const API_URL = 'http://localhost:3000/api';

async function test() {
    console.log('--- Testando CRUD Crianças ---');

    // 1. Criar Responsável (para vincular)
    const respRes = await fetch(`${API_URL}/responsaveis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: 'Pai Teste Criança',
            cpf: '999.888.777-66',
            email: 'pai.crianca@teste.com',
            enderecoId: 1,
            senha: '123'
        })
    });
    const respData = await respRes.json();
    const responsavelId = respData.id;
    console.log('Responsavel criado:', responsavelId);

    // Verify Responsavel exists
    const checkResp = await fetch(`${API_URL}/responsaveis/${responsavelId}`);
    if (!checkResp.ok) {
        console.error('Responsavel NÃO encontrado via API!');
    } else {
        console.log('Responsavel verificado via API.');
    }

    // 2. Criar Criança
    const criancaRes = await fetch(`${API_URL}/criancas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: 'Filho Teste',
            escola: 'Escola Exemplo',
            horario: 'Morning',
            responsavelId: responsavelId
        })
    });
    const criancaData = await criancaRes.json();
    console.log('Criança criada:', criancaData);

    // 3. Listar Crianças
    const listRes = await fetch(`${API_URL}/criancas`);
    const listData = await listRes.json();
    console.log('Lista de Crianças (Total):', listData.length);

    // 4. Atualizar Criança
    const updateRes = await fetch(`${API_URL}/criancas/${criancaData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escola: 'Nova Escola' })
    });
    const updateData = await updateRes.json();
    console.log('Criança atualizada:', updateData.escola);

    // 5. Deletar Criança
    await fetch(`${API_URL}/criancas/${criancaData.id}`, { method: 'DELETE' });
    console.log('Criança deletada.');

    // 6. Verificar Deleção
    const checkRes = await fetch(`${API_URL}/criancas/${criancaData.id}`);
    if (checkRes.status === 404) {
        console.log('Verificação: Criança não encontrada (Sucesso).');
    } else {
        console.log('Verificação: Falha, status', checkRes.status);
    }
}

test().catch(console.error);
