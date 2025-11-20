
const API_URL = 'http://localhost:3000/api';

async function createDemoUser() {
    const demoUser = {
        nome: 'Responsável Teste',
        email: 'responsavel@teste.com',
        telefone: '11988887777',
        endereco: 'Rua Exemplo, 100',
        senha: '123', // Senha simples para teste
        cpf: '11122233344',
        enderecoId: 1
    };

    try {
        console.log('Criando usuário de teste...');
        const res = await fetch(`${API_URL}/responsaveis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demoUser)
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ Usuário criado com sucesso!');
            console.log(`📧 Email: ${demoUser.email}`);
            console.log(`🔑 Senha: ${demoUser.senha}`);
        } else {
            const err = await res.text();
            console.log('ℹ️  Talvez o usuário já exista ou houve erro:', err);
            // Se já existe, apenas mostramos as credenciais
            if (err.includes('Duplicate entry') || res.status === 500) {
                console.log('⚠️  Usuário provavelmente já existe. Tente logar com os dados acima.');
            }
        }
    } catch (error) {
        console.error('Erro ao conectar:', error);
    }
}

createDemoUser();
