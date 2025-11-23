const API_URL = '/api';

let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user || user.role !== 'cliente') {
        window.location.href = 'login.html';
        return;
    }

    currentUser = user;
    document.getElementById('userName').textContent = user.nome;

    loadClientData();
});

// Load Client Data (Profile, Children, Payments)
async function loadClientData() {
    try {
        // 1. Load Profile Details
        const profileRes = await fetch(`${API_URL}/responsaveis/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (profileRes.ok) {
            const profile = await profileRes.json();
            fillProfileForm(profile);
        }

        // 2. Load Children
        const childrenRes = await fetch(`${API_URL}/criancas/responsavel/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (childrenRes.ok) {
            const children = await childrenRes.json();
            renderChildren(children);
            document.getElementById('totalChildren').textContent = children.length;
        }

        // 3. Load Payments
        const paymentsRes = await fetch(`${API_URL}/pagamentos/responsavel/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (paymentsRes.ok) {
            const payments = await paymentsRes.json();
            renderPayments(payments);
            calculateFinancials(payments);
        }

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar informações.', 'error');
    }
}

// Fill Profile Form
function fillProfileForm(profile) {
    document.getElementById('profileNome').value = profile.nome;
    document.getElementById('profileCpf').value = profile.cpf;
    document.getElementById('profileEmail').value = profile.email;
    document.getElementById('profileTelefone').value = profile.telefone;
    document.getElementById('profileEndereco').value = profile.endereco;
}

// Render Children
function renderChildren(children) {
    const container = document.getElementById('childrenList');

    if (children.length === 0) {
        container.innerHTML = '<p style="color: var(--text-gray); font-style: italic;">Nenhuma criança cadastrada.</p>';
        return;
    }

    container.innerHTML = children.map(child => `
        <div class="child-card">
            <div class="child-header">
                <h3 style="color: var(--primary);">${child.nome}</h3>
                <span class="contract-status status-active">Contrato Ativo</span>
            </div>
            <div class="child-details">
                <div class="detail-item">
                    <label>Escola</label>
                    <span>${child.escola || 'Não informada'}</span>
                </div>
                <div class="detail-item">
                    <label>Período</label>
                    <span>${child.periodo || 'Não informado'}</span>
                </div>
                <div class="detail-item">
                    <label>Data de Nascimento</label>
                    <span>${formatDate(child.data_nascimento)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Render Payments
function renderPayments(payments) {
    const tbody = document.querySelector('#tablePayments tbody');
    const upcomingList = document.getElementById('upcomingPaymentsList');

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum pagamento registrado.</td></tr>';
        upcomingList.innerHTML = '<p style="color: var(--text-gray); font-style: italic;">Nenhum pagamento pendente.</p>';
        return;
    }

    tbody.innerHTML = payments.map(p => `
        <tr>
            <td>${formatDate(p.dataPagamento)}</td>
            <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
            <td>${p.referencia || '-'}</td>
            <td>${getStatusBadge(p.status)}</td>
            <td>
                <button class="btn btn-sm" onclick="viewReceipt(${p.id})">📄</button>
            </td>
        </tr>
    `).join('');

    // Filter pending payments for dashboard summary
    const pending = payments.filter(p => p.status === 'Pendente');
    if (pending.length > 0) {
        upcomingList.innerHTML = pending.slice(0, 3).map(p => `
            <div class="payment-card">
                <div class="payment-info">
                    <h4>Mensalidade</h4>
                    <div class="payment-date">Vence em: ${formatDate(p.dataVencimento || new Date())}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-light);">R$ ${parseFloat(p.valor).toFixed(2)}</div>
                    <div style="font-size: 0.8rem; color: #F59E0B;">Pendente</div>
                </div>
            </div>
        `).join('');
    } else {
        upcomingList.innerHTML = '<p style="color: var(--secondary); font-weight: 500;">Tudo em dia! 🎉</p>';
    }
}

// Calculate Financials
function calculateFinancials(payments) {
    const totalPaid = payments
        .filter(p => p.status === 'Pago')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    const totalPending = payments
        .filter(p => p.status === 'Pendente')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    document.getElementById('totalPaid').textContent = `R$ ${totalPaid.toFixed(2)}`;
    document.getElementById('totalPending').textContent = `R$ ${totalPending.toFixed(2)}`;
}

// Helper: Format Date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Helper: Get Status Badge
function getStatusBadge(status) {
    if (status === 'Pago') return '<span class="status-badge status-paid">Pago</span>';
    if (status === 'Pendente') return '<span class="status-badge status-pending">Pendente</span>';
    return '<span class="status-badge status-late">Atrasado</span>';
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => el.style.display = 'none');

    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Show selected section
    const section = document.getElementById(`${sectionId}Section`);
    if (section) section.style.display = 'block';

    // Add active class to clicked nav item
    // This is a simple implementation, assumes order matches
    const navItems = document.querySelectorAll('.nav-item');
    if (sectionId === 'dashboard') navItems[1].classList.add('active');
    if (sectionId === 'children') navItems[2].classList.add('active');
    if (sectionId === 'payments') navItems[3].classList.add('active');
    if (sectionId === 'profile') navItems[4].classList.add('active');

    // Update page title
    const titles = {
        'dashboard': 'Resumo',
        'children': 'Minhas Crianças',
        'payments': 'Histórico de Pagamentos',
        'profile': 'Meus Dados'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Área do Responsável';
}

// Profile Update
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('profileNome').value;
    const email = document.getElementById('profileEmail').value;
    const telefone = document.getElementById('profileTelefone').value;
    const endereco = document.getElementById('profileEndereco').value;
    const password = document.getElementById('profilePassword').value;

    const data = { nome, email, telefone, endereco };
    if (password) data.senha = password;

    try {
        const res = await fetch(`${API_URL}/responsaveis/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotification('Dados atualizados com sucesso!', 'success');
            // Update local storage user name if changed
            if (nome !== currentUser.nome) {
                currentUser.nome = nome;
                localStorage.setItem('user', JSON.stringify(currentUser));
                document.getElementById('userName').textContent = nome;
            }
        } else {
            showNotification('Erro ao atualizar dados.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao atualizar dados.', 'error');
    }
});

// Payment Modal
function openPaymentModal() {
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Report Payment (Mock for now, or create generic payment record)
document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // For MVP, we'll just show a success message as "Reporting" might require admin approval flow
    // Or we can create a payment with status "Em Análise"

    showNotification('Pagamento informado com sucesso! Aguardando confirmação.', 'success');
    closePaymentModal();
    document.getElementById('paymentForm').reset();
});

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    // Set color based on type
    if (type === 'success') notification.style.backgroundColor = '#10B981';
    else if (type === 'error') notification.style.backgroundColor = '#EF4444';
    else notification.style.backgroundColor = '#3B82F6';

    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Download Contract
async function downloadMyContract() {
    if (!currentUser || !currentUser.id) return;

    try {
        showNotification('Gerando contrato...', 'info');
        const res = await fetch(`${API_URL}/contracts/${currentUser.id}/pdf`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contrato_transporte.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showNotification('Contrato baixado com sucesso!', 'success');
        } else {
            showNotification('Erro ao gerar contrato.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao gerar contrato.', 'error');
    }
}
