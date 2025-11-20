
const API_URL = 'http://localhost:3000/api';

async function testAuth() {
    console.log('--- Iniciando Teste de Autenticação ---');

    const timestamp = Date.now();
    const mockUser = {
        nome: `Teste ${timestamp}`,
        email: `teste${timestamp}@email.com`,
        telefone: '11999999999',
        endereco: 'Rua Teste, 123',
        senha: 'senha_secreta',
        cpf: '12345678901', // CPF fictício
        enderecoId: 1
    };

    try {
        // 1. Criar Responsável
        console.log('\n1. Criando Responsável...');
        const createRes = await fetch(`${API_URL}/responsaveis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockUser)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Falha ao criar usuário: ${createRes.status} - ${err}`);
        }

        const createdUser = await createRes.json();
        console.log('✅ Usuário criado:', createdUser.id);

        // 2. Login com senha correta
        console.log('\n2. Testando Login (Senha Correta)...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: mockUser.email,
                password: mockUser.senha,
                role: 'client'
            })
        });

        if (loginRes.ok) {
            const loginData = await loginRes.json();
            console.log('✅ Login com sucesso!');
            console.log('   Token/User:', loginData.user ? 'OK' : 'MISSING USER DATA');
        } else {
            const err = await loginRes.text();
            console.error('❌ Falha no login (esperado sucesso):', err);
        }

        // 3. Login com senha incorreta
        console.log('\n3. Testando Login (Senha Incorreta)...');
        const failRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: mockUser.email,
                password: 'senha_errada',
                role: 'client'
            })
        });

        if (failRes.status === 401) {
            console.log('✅ Login falhou como esperado (401).');
        } else {
            console.error(`❌ Login deveria falhar com 401, mas retornou: ${failRes.status}`);
        }

    } catch (error) {
        console.error('❌ Erro fatal no teste:', error);
    }
}

testAuth();
