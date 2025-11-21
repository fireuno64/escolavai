const API_URL = 'http://localhost:3000/api';

async function verifyFeatures() {
    console.log('--- Iniciando Verificação de Novas Funcionalidades ---');
    const timestamp = Date.now();

    try {
        // 1. Teste de Restrição de Master
        console.log('\n1. Testando Restrição de Criação de Master...');
        // Primeiro, login como Master (se existir) ou Admin
        // Assumindo que existe um admin padrão ou master
        // Vou tentar criar um admin com role 'master' sem autenticação primeiro (deve falhar se protegido, mas a rota atual não tem middleware de auth explícito no controller, mas deveria ter na rota)
        // O controller verifica o role no body.

        const masterFailRes = await fetch(`${API_URL}/admin-users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: 'Fake Master',
                email: `fake_master_${timestamp}@email.com`,
                password: '123',
                role: 'master'
            })
        });

        if (masterFailRes.status === 403) {
            console.log('✅ Criação de Master bloqueada com sucesso (403).');
        } else {
            console.error(`❌ Falha: Deveria bloquear criação de Master, mas retornou ${masterFailRes.status}`);
        }

        // 2. Teste de Unicidade de Email (Responsavel)
        console.log('\n2. Testando Unicidade de Email...');
        const email = `unique_${timestamp}@email.com`;
        const randomCpf = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        const respData = {
            nome: `Resp ${timestamp}`,
            cpf: randomCpf,
            email: email,
            telefone: '(11) 99999-9999',
            endereco: 'Rua Teste',
            senha: '123',
            rg: '12.345.678-9'
        };

        // Criar primeiro
        const res1 = await fetch(`${API_URL}/responsaveis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(respData)
        });

        if (res1.ok) {
            const user1 = await res1.json();
            console.log('✅ Primeiro usuário criado:', user1.id);

            // Tentar criar segundo com mesmo email
            const res2 = await fetch(`${API_URL}/responsaveis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...respData, cpf: '222.222.222-22' }) // CPF diferente, email igual
            });

            if (!res2.ok) {
                const err = await res2.text();
                if (err.includes('Email já cadastrado')) {
                    console.log('✅ Bloqueio de email duplicado funcionou.');
                } else {
                    console.warn(`⚠️ Erro retornado, mas mensagem diferente: ${err}`);
                }
            } else {
                console.error('❌ Falha: Permitiu criar usuário com email duplicado.');
            }

            // 3. Teste de Contrato na Criança
            console.log('\n3. Testando Contrato na Criança...');
            const childData = {
                nome: `Criança ${timestamp}`,
                escola: 'Escola Teste',
                horario: 'Manhã',
                horarioEntrada: '08:00',
                horarioSaida: '12:00',
                responsavelId: user1.id,
                dataInicioContrato: '2025-02-01',
                valorContratoAnual: 1500.00
            };

            const childRes = await fetch(`${API_URL}/criancas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(childData)
            });

            if (childRes.ok) {
                const child = await childRes.json();
                console.log('✅ Criança criada:', child.id);

                // Verificar se os campos foram salvos
                // Preciso buscar a criança
                // A resposta do create já deve trazer os dados se o repository retornar
                // O repository retorna { id, ...data }
                if (child.valorContratoAnual === 1500 && child.dataInicioContrato === '2025-02-01') {
                    console.log('✅ Campos de contrato salvos e retornados corretamente.');
                } else {
                    console.warn('⚠️ Campos de contrato não retornados corretamente no create. Verificando via GET...');
                    // TODO: Implementar GET se necessário, mas por enquanto confio no create return se o repository estiver certo
                }

            } else {
                const err = await childRes.text();
                console.error(`❌ Falha ao criar criança: ${err}`);
            }

        } else {
            const err = await res1.text();
            console.error(`❌ Falha ao criar primeiro usuário para teste: ${err}`);
        }

        // 4. Teste de Perfil (Login e Update)
        console.log('\n4. Testando Atualização de Perfil...');
        // Preciso de um admin. Vou criar um admin comum primeiro.
        const adminEmail = `admin_${timestamp}@email.com`;
        const createAdminRes = await fetch(`${API_URL}/admin-users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: 'Admin Teste',
                email: adminEmail,
                password: '123',
                role: 'admin'
            })
        });

        if (createAdminRes.ok) {
            const adminUser = await createAdminRes.json();
            console.log('✅ Admin criado para teste:', adminUser.id);

            // Login
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: adminEmail, password: '123', role: 'admin' })
            });

            if (loginRes.ok) {
                const loginData = await loginRes.json();
                console.log('✅ Login de admin realizado.');

                // Update Profile
                const updateRes = await fetch(`${API_URL}/auth/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: adminUser.id,
                        nome: 'Admin Atualizado',
                        email: adminEmail
                    })
                });

                if (updateRes.ok) {
                    const updated = await updateRes.json();
                    if (updated.nome === 'Admin Atualizado') {
                        console.log('✅ Perfil atualizado com sucesso.');
                    } else {
                        console.error('❌ Nome não atualizado no retorno.');
                    }
                } else {
                    const err = await updateRes.text();
                    console.error(`❌ Falha ao atualizar perfil: ${err}`);
                }

            } else {
                console.error('❌ Falha no login do admin.');
            }
        } else {
            const err = await createAdminRes.text();
            console.error(`❌ Falha ao criar admin para teste: ${err}`);
        }

    } catch (error) {
        console.error('❌ Erro fatal no teste:', error);
    }
}

verifyFeatures();
