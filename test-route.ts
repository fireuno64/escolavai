
import fetch from 'node-fetch';

async function test() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@escolavai.com', password: 'admin' }) // Assuming default admin credentials
        });

        if (!loginRes.ok) {
            throw new Error('Login failed: ' + loginRes.statusText);
        }

        const loginData = await loginRes.json();
        const token = (loginData as any).user.token;
        console.log('Got token.');

        // 2. Test PDF Route
        console.log('Testing PDF route...');
        const pdfRes = await fetch('http://localhost:3000/api/contracts/1/pdf', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('PDF Response Status:', pdfRes.status);
        if (pdfRes.ok) {
            console.log('PDF generated successfully (Content-Type:', pdfRes.headers.get('content-type'), ')');
        } else {
            const errorText = await pdfRes.text();
            console.log('PDF generation failed:', errorText);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
