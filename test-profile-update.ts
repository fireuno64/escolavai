
import fetch from 'node-fetch';

async function testProfileUpdate() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@escolavai.com', password: 'admin' })
        });

        if (!loginRes.ok) throw new Error('Login failed');
        const loginData = await loginRes.json();
        const token = (loginData as any).user.token;
        const userId = (loginData as any).user.id;
        console.log('Logged in. User ID:', userId);

        // 2. Update Profile
        console.log('Updating profile...');
        const updateRes = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: userId,
                nome: 'Administrador Updated',
                email: 'admin@escolavai.com',
                cpf_cnpj: '123.456.789-00',
                endereco: 'Rua Teste, 123'
            })
        });

        if (updateRes.ok) {
            console.log('Profile updated successfully!');
            const data = await updateRes.json();
            console.log('Updated Data:', data);
        } else {
            const error = await updateRes.text();
            console.log('Update failed:', error);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testProfileUpdate();
