const API_URL = 'http://localhost:3000/api';

// State
let responsaveis = [];
let filteredResponsaveis = []; // Filtered list for display
let pagamentos = [];
let filteredPagamentos = []; // Filtered list for display
let usuarios = [];
let escolas = [];
let filteredEscolas = []; // Filtered list for display
let expandedResponsaveis = new Set(); // Track which responsaveis are expanded in payment view
let currentUser = null;

// Custom Notification System
function showNotification(message, type = 'info') {
    let overlay = document.getElementById('customNotificationOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'customNotificationOverlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        document.body.appendChild(overlay);
    }

    const iconMap = { 'success': '✅', 'error': '❌', 'warning': '⚠️', 'info': 'ℹ️' };
    const colorMap = { 'success': '#10B981', 'error': '#EF4444', 'warning': '#F59E0B', 'info': '#4F46E5' };

    overlay.innerHTML = `
        <div style="background: #1F2937; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; border: 1px solid #374151; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; color: ${colorMap[type]}; font-weight: 600; font-size: 1.1rem;">
                <span style="font-size: 1.5rem;">${iconMap[type]}</span>
                <span>Sistema</span>
            </div>
            <div style="color: #F3F4F6; margin-bottom: 20px; line-height: 1.5;">${message}</div>
            <div style="display: flex; justify-content: flex-end;">
                <button onclick="closeNotification()" style="padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; background-color: ${colorMap[type]}; color: white; transition: 0.3s;">OK</button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
}

function closeNotification() {
    const overlay = document.getElementById('customNotificationOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showConfirmation(message, onConfirm) {
    let overlay = document.getElementById('customNotificationOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'customNotificationOverlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div style="background: #1F2937; border-radius: 12px; padding: 30px; max-width: 400px; width: 90%; border: 1px solid #374151; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; color: #F59E0B; font-weight: 600; font-size: 1.1rem;">
                <span style="font-size: 1.5rem;">⚠️</span>
                <span>Confirmação</span>
            </div>
            <div style="color: #F3F4F6; margin-bottom: 20px; line-height: 1.5;">${message}</div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button onclick="closeNotification()" style="padding: 8px 20px; border-radius: 6px; border: 1px solid #374151; cursor: pointer; font-weight: 500; background: transparent; color: #9CA3AF; transition: 0.3s;">Cancelar</button>
                <button onclick="confirmAction()" style="padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; background-color: #EF4444; color: white; transition: 0.3s;">Confirmar</button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
    window.pendingConfirmAction = onConfirm;
}

function confirmAction() {
    if (window.pendingConfirmAction) {
        window.pendingConfirmAction();
        window.pendingConfirmAction = null;
    }
    closeNotification();
}

// Navigation
function showSection(sectionId) {
    // Hide all sections using explicit IDs to be safe
    const sections = ['dashboard', 'responsaveis', 'pagamentos', 'escolas', 'usuarios', 'users'];
    sections.forEach(id => {
        const el = document.getElementById(`${id}-section`);
        if (el) el.style.display = 'none';
    });

    // Also try class selector as backup
    document.querySelectorAll('.content-section').forEach(el => {
        el.style.display = 'none';
    });

    // Show selected
    const section = document.getElementById(`${sectionId}-section`);
    if (section) section.style.display = 'block';

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    // Try to find nav item by ID or onclick attribute
    const navItem = document.getElementById(`nav-${sectionId}`) ||
        document.querySelector(`.nav-item[onclick="showSection('${sectionId}')"]`);
    if (navItem) navItem.classList.add('active');

    // Update Title
    const titles = {
        'dashboard': 'Dashboard',
        'responsaveis': 'Gerenciar Responsáveis',
        'pagamentos': 'Gerenciar Pagamentos',
        'escolas': 'Gerenciar Escolas',
        'usuarios': 'Gerenciar Usuários',
        'users': 'Gerenciar Usuários'
    };
    document.getElementById('pageTitle').innerText = titles[sectionId] || 'Dashboard';

    // Load data when switching to a section (if not already loaded or to refresh)
    if (sectionId === 'responsaveis' && responsaveis.length === 0) {
        loadResponsaveis();
    } else if (sectionId === 'pagamentos' && pagamentos.length === 0) {
        loadPagamentos();
    } else if (sectionId === 'escolas' && escolas.length === 0) {
        loadEscolas();
    } else if ((sectionId === 'usuarios' || sectionId === 'users') && usuarios.length === 0) {
        loadUsers();
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(storedUser);
    // Allow both admin and master
    if (currentUser.role !== 'admin' && currentUser.role !== 'master') {
        alert('Acesso não autorizado!');
        window.location.href = 'login.html';
        return;
    }

    // Update user info in header
    const userInfoElement = document.querySelector('.user-info span');
    if (userInfoElement) {
        userInfoElement.innerText = `Olá, ${currentUser.nome} (${currentUser.role === 'master' ? 'Master' : 'Admin'})`;
    }

    console.log('Initializing Dashboard for role:', currentUser.role);

    // Configure UI based on role
    if (currentUser.role === 'master') {
        // Show User Management, Hide Business Data
        document.getElementById('nav-responsaveis').style.display = 'none';
        document.getElementById('nav-pagamentos').style.display = 'none';
        document.getElementById('nav-usuarios').style.display = 'block';

        // Hide Stats that rely on business data
        document.querySelector('.stats-grid').style.display = 'none';

        loadUsers();
        showSection('usuarios'); // Default view for Master
    } else {
        // Admin View
        const navResponsaveis = document.getElementById('nav-responsaveis');
        const navPagamentos = document.getElementById('nav-pagamentos');
        const navUsuarios = document.getElementById('nav-usuarios');

        if (navResponsaveis) navResponsaveis.style.display = 'block';
        if (navPagamentos) navPagamentos.style.display = 'block';
        if (navUsuarios) navUsuarios.style.display = 'none';

        loadResponsaveis();
        loadPagamentos();
        loadEscolas();
        renderRevenueChart(); // Initialize revenue forecast chart
        showSection('dashboard'); // Default view for Admin
    }

    // Form Listeners
    const formResponsavel = document.getElementById('formResponsavel');
    console.log('formResponsavel element:', formResponsavel);
    if (formResponsavel) {
        formResponsavel.addEventListener('submit', handleResponsavelSubmit);
        console.log('Event listener attached to formResponsavel');
    } else {
        console.error('formResponsavel element NOT FOUND!');
    }

    const formPagamento = document.getElementById('formPagamento');
    if (formPagamento) formPagamento.addEventListener('submit', handlePagamentoSubmit);

    const formUsuario = document.getElementById('formUsuario');
    if (formUsuario) formUsuario.addEventListener('submit', handleUserSubmit);

    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) formPerfil.addEventListener('submit', handleProfileSubmit);

    // Initialize CEP Integration
    setupCepIntegration();
});

// Revenue Forecast Chart
let revenueChartInstance = null;

function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Get next 6 months
    const months = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        months.push({
            label: `${monthNames[date.getMonth()]}/${date.getFullYear()}`,
            month: date.getMonth() + 1,
            year: date.getFullYear()
        });
    }

    // Calculate projected revenue for each month based on active contracts
    const projectedRevenue = months.map(m => {
        // Sum all payments for this month
        const monthlyTotal = pagamentos.filter(p => {
            const paymentDate = new Date(p.dataPagamento);
            return paymentDate.getMonth() + 1 === m.month &&
                paymentDate.getFullYear() === m.year;
        }).reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);

        return monthlyTotal;
    });

    // Destroy previous chart instance if exists
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    // Create new chart
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => m.label),
            datasets: [{
                label: 'Receita Projetada',
                data: projectedRevenue,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4, // Smooth curve
                pointRadius: 4,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1F2937',
                    titleColor: '#F3F4F6',
                    bodyColor: '#F3F4F6',
                    borderColor: '#374151',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return 'R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(55, 65, 81, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        callback: function (value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                }
            }
        }
    });
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = ['dashboard', 'responsaveis', 'pagamentos', 'usuarios'];
    sections.forEach(id => {
        const el = document.getElementById(`${id}-section`);
        if (el) el.style.display = 'none';
    });

    // Show selected
    const section = document.getElementById(`${sectionId}-section`);
    if (section) section.style.display = 'block';

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.getElementById(`nav-${sectionId}`) || document.querySelector(`.nav-item[onclick="showSection('${sectionId}')"]`);
    if (navItem) navItem.classList.add('active');

    // Update Title
    const titles = {
        'dashboard': 'Dashboard',
        'responsaveis': 'Gerenciar Responsáveis',
        'pagamentos': 'Gerenciar Pagamentos',
        'usuarios': 'Gerenciar Usuários'
    };
    document.getElementById('pageTitle').innerText = titles[sectionId] || 'Dashboard';
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';

    // Load profile data when opening profile modal
    if (modalId === 'modalPerfil') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            document.getElementById('perfilNome').value = user.nome || '';
            document.getElementById('perfilEmail').value = user.email || '';
            document.getElementById('perfilCpfCnpj').value = user.cpf_cnpj || '';
            document.getElementById('perfilEndereco').value = user.endereco || '';
            document.getElementById('perfilSenha').value = '';
        }
    }
}

// Function specifically for opening new responsavel modal
function openNewResponsavelModal() {
    const form = document.getElementById('formResponsavel');
    // Always reset for new responsavel
    form.reset();
    delete form.dataset.editId;

    // Reset children state
    currentChildren = [];
    editingChildIndex = null;
    cancelChildForm();
    renderChildrenList();

    document.querySelector('#modalResponsavel h2').innerText = 'Novo Responsável';

    openModal('modalResponsavel');

    // Hide print button
    const btnPrint = document.getElementById('btnPrintContract');
    if (btnPrint) btnPrint.style.display = 'none';
}

function openNewPagamentoModal() {
    const form = document.getElementById('formPagamento');
    form.reset();
    delete form.dataset.editId;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pagData').value = today;

    document.querySelector('#modalPagamento h2').innerText = 'Novo Pagamento';
    openModal('modalPagamento');
}

function closeModal(modalId) {
    // Clean up editId when closing responsavel modal
    if (modalId === 'modalResponsavel') {
        const form = document.getElementById('formResponsavel');
        delete form.dataset.editId;
    }
    if (modalId === 'modalUsuario') {
        const form = document.getElementById('formUsuario');
        delete form.dataset.editId;
        form.reset();
    }
    if (modalId === 'modalPagamento') {
        const form = document.getElementById('formPagamento');
        delete form.dataset.editId;
        form.reset();
    }

    document.getElementById(modalId).style.display = 'none';
}

// Data Loading
async function loadResponsaveis() {
    console.log('Loading responsaveis...');
    try {
        const res = await fetch(`${API_URL}/responsaveis`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            responsaveis = await res.json();
            console.log('Responsaveis loaded:', responsaveis);
            renderResponsaveisTable();
            updateStats();
            populateResponsavelSelect();
        } else {
            console.error('Failed to load responsaveis');
        }
    } catch (error) {
        console.error('Erro ao carregar responsáveis:', error);
    }
}

async function loadPagamentos() {
    console.log('Loading pagamentos...');
    try {
        const res = await fetch(`${API_URL}/pagamentos`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            pagamentos = await res.json();
            console.log('Pagamentos loaded:', pagamentos);
            renderPagamentosTable();
            updateStats();
        } else {
            console.error('Failed to load pagamentos');
        }
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
    }
}

async function loadUsers() {
    console.log('Loading users...');
    try {
        const res = await fetch(`${API_URL}/admin-users`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            usuarios = await res.json();
            console.log('Users loaded:', usuarios);
            renderUsersTable();
        } else {
            console.error('Failed to load users');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

async function loadEscolas() {
    console.log('Loading escolas...');
    try {
        const res = await fetch(`${API_URL}/escolas`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            escolas = await res.json();
            console.log('Escolas loaded:', escolas);
            renderEscolasTable();
            populateEscolaSelect();
        } else {
            console.error('Failed to load escolas');
            // Handle error gracefully
            escolas = [];
            renderEscolasTable();
        }
    } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        // Handle error gracefully
        escolas = [];
        renderEscolasTable();
    }
}

// Responsável Filter Functions
function hasActiveResponsavelFilters() {
    const filterNome = document.getElementById('filterRespNome')?.value || '';
    const filterCpf = document.getElementById('filterRespCpf')?.value || '';
    const filterEmail = document.getElementById('filterRespEmail')?.value || '';

    return filterNome !== '' || filterCpf !== '' || filterEmail !== '';
}

function applyResponsavelFilters() {
    const filterNome = document.getElementById('filterRespNome').value.toLowerCase();
    const filterCpf = document.getElementById('filterRespCpf').value;
    const filterEmail = document.getElementById('filterRespEmail').value.toLowerCase();

    filteredResponsaveis = responsaveis.filter(r => {
        if (filterNome && !r.nome.toLowerCase().includes(filterNome)) {
            return false;
        }
        if (filterCpf && !r.cpf.includes(filterCpf)) {
            return false;
        }
        if (filterEmail && !r.email.toLowerCase().includes(filterEmail)) {
            return false;
        }
        return true;
    });

    renderResponsaveisTable();
}

function clearResponsavelFilters() {
    document.getElementById('filterRespNome').value = '';
    document.getElementById('filterRespCpf').value = '';
    document.getElementById('filterRespEmail').value = '';

    filteredResponsaveis = [];
    renderResponsaveisTable();
}

// Rendering
function renderResponsaveisTable() {
    const tbody = document.querySelector('#tableResponsaveis tbody');
    const dataToRender = filteredResponsaveis.length > 0 || hasActiveResponsavelFilters() ? filteredResponsaveis : responsaveis;

    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-gray); padding: 20px;">Nenhum responsável encontrado</td></tr>';
        document.getElementById('totalResponsaveis').innerText = '0';
        return;
    }

    tbody.innerHTML = dataToRender.map(r => `
        <tr>
            <td>${r.nome}</td>
            <td>${r.cpf}</td>
            <td>${r.email}</td>
            <td>${r.telefone}</td>
            <td>
                <button class="btn btn-sm" style="background-color: #6366f1;" onclick="openContractSelectionModal(${r.id})" title="Gerar Contrato">📄 PDF</button>
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 6px 12px; margin-right: 5px;" onclick="editResponsavel(${r.id})">✏️ Editar</button>
                <button class="btn" style="padding: 6px 12px; background: var(--danger); color: white;" onclick="deleteResponsavel(${r.id})">🗑️ Excluir</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('totalResponsaveis').innerText = dataToRender.length;
}

async function openContractSelectionModal(responsavelId) {
    // showNotification('Verificando contratos...', 'info'); // Removed as requested

    try {
        const res = await fetch(`${API_URL}/criancas/responsavel/${responsavelId}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (res.ok) {
            const children = await res.json();

            if (children.length === 0) {
                showNotification('Nenhuma criança cadastrada para este responsável.', 'warning');
                return;
            }

            // If only one child, download directly
            if (children.length === 1) {
                downloadContract(responsavelId, children[0].id);
                return;
            }

            // Multiple children: show modal
            const list = document.getElementById('contractList');
            list.innerHTML = children.map(child => `
                <button class="btn" style="background: #374151; text-align: left; padding: 12px; display: flex; justify-content: space-between; align-items: center;" 
                    onclick="downloadContract(${responsavelId}, ${child.id}); closeModal('modalSelecaoContrato')">
                    <span>
                        <strong>${child.nome}</strong>
                        <div style="font-size: 0.8rem; color: var(--text-gray);">Escola: ${child.escola || 'Não informada'}</div>
                    </span>
                    <span>🖨️</span>
                </button>
            `).join('');

            openModal('modalSelecaoContrato');

        } else {
            showNotification('Erro ao buscar crianças.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao buscar crianças.', 'error');
    }
}

async function downloadContract(responsavelId, childId = null) {
    try {
        let url = `${API_URL}/contracts/${responsavelId}/pdf`;
        if (childId) {
            url += `?childId=${childId}`;
        }

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (res.ok) {
            // Extract filename from Content-Disposition header
            const contentDisposition = res.headers.get('Content-Disposition');
            let filename = 'contrato.pdf'; // Default fallback

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } else {
            const data = await res.json();
            showNotification(data.error || 'Erro ao gerar contrato.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao gerar contrato.', 'error');
    }
}

// Payment Filter Functions
function hasActiveFilters() {
    const filterResp = document.getElementById('filterResponsavel')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    const filterDataInicio = document.getElementById('filterDataInicio')?.value || '';
    const filterDataFim = document.getElementById('filterDataFim')?.value || '';

    return filterResp !== '' || filterStatus !== '' || filterDataInicio !== '' || filterDataFim !== '';
}

function applyPagamentoFilters() {
    const filterResp = document.getElementById('filterResponsavel').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    const filterDataInicio = document.getElementById('filterDataInicio').value;
    const filterDataFim = document.getElementById('filterDataFim').value;

    filteredPagamentos = pagamentos.filter(p => {
        // Filter by responsável name
        const resp = responsaveis.find(r => r.id === p.responsavelId);
        const respNome = resp ? resp.nome.toLowerCase() : '';
        if (filterResp && !respNome.includes(filterResp)) {
            return false;
        }

        // Filter by status
        if (filterStatus && p.status !== filterStatus) {
            return false;
        }

        // Filter by date range
        const pagamentoDate = new Date(p.dataPagamento);
        if (filterDataInicio) {
            const dataInicio = new Date(filterDataInicio);
            if (pagamentoDate < dataInicio) {
                return false;
            }
        }
        if (filterDataFim) {
            const dataFim = new Date(filterDataFim);
            if (pagamentoDate > dataFim) {
                return false;
            }
        }

        return true;
    });

    renderPagamentosTable();
}

function clearPagamentoFilters() {
    document.getElementById('filterResponsavel').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDataInicio').value = '';
    document.getElementById('filterDataFim').value = '';

    filteredPagamentos = [];
    renderPagamentosTable();
}

function renderPagamentosTable() {
    const tbody = document.querySelector('#tablePagamentos tbody');
    const dataToRender = filteredPagamentos.length > 0 || hasActiveFilters() ? filteredPagamentos : pagamentos;

    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-gray); padding: 20px;">Nenhum pagamento encontrado</td></tr>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group payments by responsável
    const grouped = {};
    dataToRender.forEach(p => {
        if (!grouped[p.responsavelId]) {
            grouped[p.responsavelId] = [];
        }
        grouped[p.responsavelId].push(p);
    });

    let html = '';

    Object.keys(grouped).forEach(responsavelId => {
        const resp = responsaveis.find(r => r.id === parseInt(responsavelId));
        const payments = grouped[responsavelId];
        const respName = resp ? resp.nome : 'Desconhecido';
        const totalPendente = payments
            .filter(p => p.status === 'Pendente')
            .reduce((acc, p) => acc + parseFloat(p.valor), 0);

        const totalPago = payments
            .filter(p => p.status === 'Pago')
            .reduce((acc, p) => acc + parseFloat(p.valor), 0);

        // Calculate total value of overdue payments (not count)
        const totalVencidos = payments.filter(p => {
            const pDate = new Date(p.dataPagamento);
            pDate.setHours(0, 0, 0, 0);
            return p.status === 'Pendente' && pDate < today;
        }).reduce((acc, p) => acc + parseFloat(p.valor), 0);

        const isExpanded = expandedResponsaveis.has(parseInt(responsavelId));

        // Header row for responsável (always visible)
        html += `
        <tr class="responsavel-header" onclick="toggleResponsavelPayments(${responsavelId})" style="cursor: pointer; background: rgba(255,255,255,0.05); font-weight: 500; border-bottom: 2px solid #374151;">
            <td style="padding: 12px;">
                <span id="toggle-icon-${responsavelId}" style="display: inline-block; width: 20px; transition: transform 0.3s;">${isExpanded ? '▼' : '▶'}</span>
                <strong>${respName}</strong>
                <span style="color: var(--text-gray); font-size: 0.85rem; margin-left: 8px;">(${payments.length} pagamento${payments.length > 1 ? 's' : ''})</span>
            </td>
            <td style="color: ${totalPendente > 0 ? '#FBBF24' : 'var(--text-gray)'};">R$ ${totalPendente.toFixed(2)}</td>
            <td style="color: ${totalPago > 0 ? '#34D399' : 'var(--text-gray)'};">R$ ${totalPago.toFixed(2)}</td>
            <td style="color: ${totalVencidos > 0 ? '#F87171' : 'var(--text-gray)'};">R$ ${totalVencidos.toFixed(2)}</td>
            <td>
                <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="event.stopPropagation(); openNewPagamentoModal(); document.getElementById('pagRespId').value = ${responsavelId};">+ Novo</button>
            </td>
        </tr>`;

        // Payment rows (initially hidden)
        payments.forEach(p => {
            const pagamentoDate = new Date(p.dataPagamento);
            let displayStatus = p.status;
            let statusClass = '';

            if (p.status === 'Pendente' && pagamentoDate < today) {
                displayStatus = 'Vencido';
                statusClass = 'status-overdue';
            } else {
                statusClass = p.status === 'Pago' ? 'status-paid' : (p.status === 'Pendente' ? 'status-pending' : 'status-late');
            }

            const toggleButtonText = p.status === 'Pago' ? '↩️ Pendente' : '✓ Pagar';
            const toggleButtonColor = p.status === 'Pago' ? '#f59e0b' : '#10b981';

            // Get contract/child reference if available
            const contratoRef = p.contratoId ? `Contrato #${p.contratoId}` : (p.crianca_nome || p.referencia || 'Sem referência');

            html += `
            <tr class="payment-row payment-row-${responsavelId}" style="display: ${isExpanded ? 'table-row' : 'none'}; background: rgba(255,255,255,0.02);">
                <td style="padding-left: 40px; font-size: 0.9rem;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div>
                            <span style="color: var(--text-gray);">Vencimento:</span> ${pagamentoDate.toLocaleDateString('pt-BR')}
                        </div>
                        <div style="font-size: 0.85rem; color: #9CA3AF;">
                            <span style="color: var(--text-gray);">Ref:</span> ${contratoRef}
                        </div>
                    </div>
                </td>
                <td colspan="2">
                    <span style="color: var(--text-gray);">Valor:</span> R$ ${parseFloat(p.valor).toFixed(2)}
                    <span class="status-badge ${statusClass}" style="margin-left: 10px;">${displayStatus}</span>
                </td>
                <td colspan="2">
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 5px;" onclick="event.stopPropagation(); editPagamento(${p.id})">✏️ Editar</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 0.8rem; background: ${toggleButtonColor}; color: white; margin-right: 5px;" onclick="event.stopPropagation(); togglePagamentoStatus(${p.id}, '${p.status}')">${toggleButtonText}</button>
                    <button class="btn" style="padding: 4px 8px; font-size: 0.8rem; background: var(--danger); color: white;" onclick="event.stopPropagation(); deletePagamento(${p.id})">🗑️</button>
                </td>
            </tr>`;
        });
    });

    tbody.innerHTML = html;
}



// Toggle function for expanding/collapsing payment rows
function toggleResponsavelPayments(responsavelId) {
    const id = parseInt(responsavelId);
    const rows = document.querySelectorAll(`.payment-row-${responsavelId}`);
    const icon = document.getElementById(`toggle-icon-${responsavelId}`);

    if (expandedResponsaveis.has(id)) {
        // Collapse
        expandedResponsaveis.delete(id);
        rows.forEach(row => row.style.display = 'none');
        if (icon) icon.textContent = '▶';
    } else {
        // Expand
        expandedResponsaveis.add(id);
        rows.forEach(row => row.style.display = 'table-row');
        if (icon) icon.textContent = '▼';
    }
}


function renderUsersTable() {
    const tbody = document.querySelector('#tableUsuarios tbody');
    tbody.innerHTML = usuarios.map(u => {
        const statusBadge = u.active !== false
            ? '<span class="status-badge status-paid" style="font-size: 0.75rem;">Ativo</span>'
            : '<span class="status-badge status-late" style="font-size: 0.75rem;">Inativo</span>';

        const toggleButton = u.role !== 'master'
            ? `<button class="btn" style="padding: 6px 12px; margin-right: 5px; background: ${u.active !== false ? '#F59E0B' : '#10B981'}; color: white;" onclick="toggleUserActive(${u.id}, ${u.active !== false})">${u.active !== false ? '🔒 Desativar' : '✅ Ativar'}</button>`
            : '';

        return `
        <tr>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${statusBadge}</td>
            <td>
                ${toggleButton}
                <button class="btn btn-primary" style="padding: 6px 12px; margin-right: 5px;" onclick="editUser(${u.id})">✏️ Editar</button>
                <button class="btn" style="padding: 6px 12px; background: var(--danger); color: white;" onclick="deleteUser(${u.id})">🗑️ Excluir</button>
            </td>
        </tr>
    `}).join('');

    // Update Master statistics
    if (currentUser && currentUser.role === 'master') {
        const totalAdmins = usuarios.filter(u => u.role === 'admin').length;
        const totalClientes = usuarios.filter(u => u.role === 'cliente').length;
        const totalUsuarios = usuarios.length;

        document.getElementById('totalAdmins').innerText = totalAdmins;
        document.getElementById('totalClientes').innerText = totalClientes;
        document.getElementById('totalUsuarios').innerText = totalUsuarios;

        // Show stats grid
        document.getElementById('masterStats').style.display = 'grid';
    }
}

function renderEscolasTable() {
    const tbody = document.getElementById('escolasTableBody');
    if (!tbody) return;

    const dataToRender = filteredEscolas.length > 0 || hasActiveEscolaFilters() ? filteredEscolas : escolas;

    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-gray); padding: 20px;">Nenhuma escola encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = dataToRender.map(e => `
        <tr>
            <td>${e.nome}</td>
            <td>${e.endereco || '-'}</td>
            <td>${e.contato || '-'}</td>
            <td>${e.telefone || '-'}</td>
            <td>
                <button class="btn btn-primary" style="padding: 6px 12px; margin-right: 5px;" onclick="editEscola(${e.id})">✏️ Editar</button>
                <button class="btn" style="padding: 6px 12px; background: var(--danger); color: white;" onclick="deleteEscola(${e.id})">🗑️ Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Escola Filter Functions
function hasActiveEscolaFilters() {
    const filterNome = document.getElementById('filterEscolaNome')?.value || '';
    const filterEndereco = document.getElementById('filterEscolaEndereco')?.value || '';
    const filterTelefone = document.getElementById('filterEscolaTelefone')?.value || '';

    return filterNome !== '' || filterEndereco !== '' || filterTelefone !== '';
}

function applyEscolaFilters() {
    const filterNome = document.getElementById('filterEscolaNome').value.toLowerCase();
    const filterEndereco = document.getElementById('filterEscolaEndereco').value.toLowerCase();
    const filterTelefone = document.getElementById('filterEscolaTelefone').value;

    filteredEscolas = escolas.filter(e => {
        if (filterNome && !e.nome.toLowerCase().includes(filterNome)) {
            return false;
        }
        if (filterEndereco && !(e.endereco || '').toLowerCase().includes(filterEndereco)) {
            return false;
        }
        if (filterTelefone && !(e.telefone || '').includes(filterTelefone)) {
            return false;
        }
        return true;
    });

    renderEscolasTable();
}

function clearEscolaFilters() {
    document.getElementById('filterEscolaNome').value = '';
    document.getElementById('filterEscolaEndereco').value = '';
    document.getElementById('filterEscolaTelefone').value = '';

    filteredEscolas = [];
    renderEscolasTable();
}


function populateResponsavelSelect() {
    const select = document.getElementById('pagRespId');
    select.innerHTML = '<option value="">Selecione o Responsável</option>' +
        responsaveis.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
}

function updateStats() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Total Pendentes (All time)
    const totalPendentes = pagamentos
        .filter(p => p.status === 'Pendente')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    document.getElementById('totalPendentes').innerText = `R$ ${totalPendentes.toFixed(2)}`;

    // Receita Mensal (Paid in current month)
    const receita = pagamentos
        .filter(p => {
            const pDate = new Date(p.dataPagamento);
            return p.status === 'Pago' &&
                pDate.getMonth() === currentMonth &&
                pDate.getFullYear() === currentYear;
        })
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    document.getElementById('receitaMensal').innerText = `R$ ${receita.toFixed(2)}`;

    // Valor Total de Vencidos (Pending and date < today)
    today.setHours(0, 0, 0, 0);
    const totalVencidos = pagamentos
        .filter(p => {
            const pDate = new Date(p.dataPagamento);
            pDate.setHours(0, 0, 0, 0);
            return p.status === 'Pendente' && pDate < today;
        })
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    const elTotalVencidos = document.getElementById('totalVencidos');
    if (elTotalVencidos) elTotalVencidos.innerText = `R$ ${totalVencidos.toFixed(2)}`;

    // Pagamentos Vencidos Count (Pending and date < today)
    const vencidosCount = pagamentos.filter(p => {
        const pDate = new Date(p.dataPagamento);
        pDate.setHours(0, 0, 0, 0);
        const todayCheck = new Date();
        todayCheck.setHours(0, 0, 0, 0);
        return p.status === 'Pendente' && pDate < todayCheck;
    }).length;

    const elVencidos = document.getElementById('pagamentosVencidos');
    if (elVencidos) elVencidos.innerText = vencidosCount;

    renderRevenueChart();
}

// Form Handling
async function handleResponsavelSubmit(e) {
    console.log('=== handleResponsavelSubmit CALLED ===');
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    // Get address fields separately (no concatenation)
    const endereco = document.getElementById('respEndereco').value;
    const numero = document.getElementById('respNumero').value;
    const complemento = document.getElementById('respComplemento').value;
    const cep = document.getElementById('respCep').value;

    console.log('Form data:', { editId });

    // Validate Children
    const children = getChildrenData();
    console.log('Children count:', children.length);

    if (children.length === 0) {
        console.log('No children - showing warning');
        showNotification('É obrigatório cadastrar pelo menos uma criança para o contrato.', 'warning');
        return;
    }

    const data = {
        nome: document.getElementById('respNome').value,
        cpf: document.getElementById('respCpf').value,
        email: document.getElementById('respEmail').value,
        telefone: document.getElementById('respTelefone').value,
        endereco: endereco,
        cep: cep,
        numero: numero,
        complemento: complemento,
        rg: document.getElementById('respRg').value,
    };

    const senha = document.getElementById('respSenha').value;
    if (senha) {
        data.senha = senha;
    } else if (!editId) {
        data.senha = 'senha123'; // Default for new users if not provided
    }

    try {
        const url = editId ? `${API_URL}/responsaveis/${editId}` : `${API_URL}/responsaveis`;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const responsavel = await res.json();
            const responsavelId = responsavel.id || editId;

            // Handle children
            console.log('=== handleResponsavelSubmit - Processing Children ===');
            console.log('Responsável ID:', responsavelId);
            console.log('Number of children to process:', children.length);

            for (const child of children) {
                console.log('--- Processing child ---');
                console.log('Child data:', JSON.stringify(child, null, 2));
                console.log('dataInicioContrato:', child.dataInicioContrato);
                console.log('valorContratoAnual:', child.valorContratoAnual);

                if (child.id) {
                    // Update existing child
                    await fetch(`${API_URL}/criancas/${child.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentUser.token}`
                        },
                        body: JSON.stringify({
                            nome: child.nome,
                            dataNascimento: child.dataNascimento,
                            escolaId: child.escolaId,
                            tipoTransporte: child.tipoTransporte,
                            horarioEntrada: child.horarioEntrada,
                            horarioSaida: child.horarioSaida,
                            dataInicioContrato: child.dataInicioContrato,
                            valorContratoAnual: child.valorContratoAnual,
                            responsavelId: responsavelId
                        })
                    });
                } else {
                    // Create new child
                    await fetch(`${API_URL}/criancas`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentUser.token}`
                        },
                        body: JSON.stringify({
                            nome: child.nome,
                            dataNascimento: child.dataNascimento,
                            escolaId: child.escolaId,
                            tipoTransporte: child.tipoTransporte,
                            horarioEntrada: child.horarioEntrada,
                            horarioSaida: child.horarioSaida,
                            dataInicioContrato: child.dataInicioContrato,
                            valorContratoAnual: child.valorContratoAnual,
                            responsavelId: responsavelId
                        })
                    });
                }
            }

            showNotification(editId ? 'Responsável atualizado com sucesso!' : 'Responsável criado com sucesso!', 'success');
            closeModal('modalResponsavel');
            form.reset();
            const childrenList = document.getElementById('childrenList');
            if (childrenList) childrenList.innerHTML = '';
            delete form.dataset.editId;
            const modalTitle = document.querySelector('#modalResponsavel h2');
            if (modalTitle) modalTitle.innerText = 'Novo Responsável';
            loadResponsaveis();
            loadPagamentos(); // Refresh payments list to show newly generated payments
        } else {
            // Parse error message from backend
            const errorData = await res.json();
            const errorMessage = errorData.error || 'Erro ao salvar responsável';
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao salvar responsável', 'error');
    }
}

async function handlePagamentoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    const data = {
        responsavelId: document.getElementById('pagRespId').value,
        valor: parseFloat(document.getElementById('pagValor').value),
        status: document.getElementById('pagStatus').value,
        dataPagamento: document.getElementById('pagData').value
    };

    try {
        const url = editId ? `${API_URL}/pagamentos/${editId}` : `${API_URL}/pagamentos`;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal('modalPagamento');
            e.target.reset();
            delete form.dataset.editId;
            loadPagamentos();
            showNotification(editId ? 'Pagamento atualizado com sucesso!' : 'Pagamento criado com sucesso!', 'success');
        } else {
            showNotification('Erro ao salvar pagamento', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao salvar pagamento', 'error');
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    const data = {
        nome: document.getElementById('userNome').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value
    };

    const senha = document.getElementById('userSenha').value;
    if (senha) {
        data.password = senha;
    }

    try {
        const url = editId ? `${API_URL}/admin-users/${editId}` : `${API_URL}/admin-users`;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            showNotification(editId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!', 'success');
            closeModal('modalUsuario');
            loadUsers();
        } else {
            const errorData = await res.json();
            showNotification(errorData.error || 'Erro ao salvar usuário', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao salvar usuário', 'error');
    }
}

// Toggle payment status between Pendente and Pago
async function togglePagamentoStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Pago' ? 'Pendente' : 'Pago';

    try {
        const res = await fetch(`${API_URL}/pagamentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            loadPagamentos();
            showNotification(`Status alterado para ${newStatus}!`, 'success');
        } else {
            showNotification('Erro ao alterar status', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao alterar status', 'error');
    }
}

function deletePagamento(id) {
    showConfirmation('Tem certeza que deseja excluir este pagamento?', async () => {
        try {
            const res = await fetch(`${API_URL}/pagamentos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (res.ok) {
                loadPagamentos();
                showNotification('Pagamento excluído com sucesso!', 'success');
            } else {
                showNotification('Erro ao excluir pagamento', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erro ao excluir pagamento', 'error');
        }
    });
}

function editPagamento(id) {
    const pagamento = pagamentos.find(p => p.id === id);
    if (!pagamento) return;

    document.getElementById('pagRespId').value = pagamento.responsavelId;
    document.getElementById('pagValor').value = pagamento.valor;
    document.getElementById('pagStatus').value = pagamento.status;

    // Format date for input type="date" (YYYY-MM-DD)
    const date = new Date(pagamento.dataPagamento);
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById('pagData').value = formattedDate;

    const form = document.getElementById('formPagamento');
    form.dataset.editId = id;

    document.querySelector('#modalPagamento h2').innerText = 'Editar Pagamento';
    openModal('modalPagamento');
}

// Responsável Edit/Delete Functions
async function editResponsavel(id) {
    const responsavel = responsaveis.find(r => r.id === id);
    if (!responsavel) return;

    // Pre-fill form
    document.getElementById('respNome').value = responsavel.nome;
    document.getElementById('respCpf').value = responsavel.cpf;
    document.getElementById('respEmail').value = responsavel.email || '';
    document.getElementById('respTelefone').value = responsavel.telefone || '';

    // Populate separate address fields
    document.getElementById('respEndereco').value = responsavel.endereco || '';
    document.getElementById('respNumero').value = responsavel.numero || '';
    document.getElementById('respComplemento').value = responsavel.complemento || '';
    document.getElementById('respCep').value = responsavel.cep || '';

    document.getElementById('respRg').value = responsavel.rg || '';

    // Password is optional on edit
    const senhaInput = document.getElementById('respSenha');
    senhaInput.value = '';
    senhaInput.required = false;
    senhaInput.placeholder = 'Deixe em branco para manter a senha atual';

    // Reset children state
    currentChildren = [];
    editingChildIndex = null;
    cancelChildForm();

    // Load children
    try {
        const res = await fetch(`${API_URL}/criancas/responsavel/${id}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (res.ok) {
            const children = await res.json();
            currentChildren = children;
            renderChildrenList();
        }
    } catch (error) {
        console.error('Error loading children:', error);
    }

    // Store ID for update
    document.getElementById('formResponsavel').dataset.editId = id;

    // Change modal title
    document.querySelector('#modalResponsavel h2').innerText = 'Editar Responsável';

    openModal('modalResponsavel');

    // Show print button
    const btnPrint = document.getElementById('btnPrintContract');
    if (btnPrint) btnPrint.style.display = 'inline-block';
}

function printContractFromModal() {
    const form = document.getElementById('formResponsavel');
    const id = form.dataset.editId;
    if (id) {
        downloadContract(id);
    } else {
        showNotification('Salve o responsável antes de gerar o contrato.', 'warning');
    }
}

function deleteResponsavel(id) {
    showConfirmation('Tem certeza que deseja excluir este responsável? Esta ação não pode ser desfeita.', async () => {
        try {
            const res = await fetch(`${API_URL}/responsaveis/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (res.ok) {
                showNotification('Responsável excluído com sucesso!', 'success');
                loadResponsaveis();
                loadPagamentos(); // Refresh payments list to remove deleted responsável's payments
            } else {
                showNotification('Erro ao excluir responsável', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erro ao excluir responsável', 'error');
        }
    });
}

function openNewResponsavelModal() {
    const form = document.getElementById('formResponsavel');
    form.reset();
    delete form.dataset.editId;

    // Password is required on create
    const senhaInput = document.getElementById('respSenha');
    senhaInput.required = true;
    senhaInput.placeholder = 'Digite a senha';

    document.querySelector('#modalResponsavel h2').innerText = 'Novo Responsável';

    // Reset children
    currentChildren = [];
    renderChildrenList();
    cancelChildForm();

    openModal('modalResponsavel');
}

// School Management Functions
function openNewEscolaModal() {
    const form = document.getElementById('formEscola');
    form.reset();
    delete form.dataset.editId;
    document.querySelector('#modalEscola h2').innerText = 'Nova Escola';
    openModal('modalEscola');
}

async function handleEscolaSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const editId = form.dataset.editId;
    const isEdit = !!editId;

    // Get address fields separately (no concatenation)
    const endereco = document.getElementById('escolaEndereco').value;
    const numero = document.getElementById('escolaNumero').value;
    const complemento = document.getElementById('escolaComplemento').value;
    const cep = document.getElementById('escolaCep').value;

    const data = {
        nome: document.getElementById('escolaNome').value,
        endereco: endereco,
        cep: cep,
        numero: numero,
        complemento: complemento,
        contato: document.getElementById('escolaContato').value,
        telefone: document.getElementById('escolaTelefone').value,
        email: document.getElementById('escolaEmail').value
    };

    console.log('=== handleEscolaSubmit ===');
    console.log('Edit ID:', editId);
    console.log('Data:', data);

    try {
        const url = editId ? `${API_URL}/escolas/${editId}` : `${API_URL}/escolas`;
        const method = editId ? 'PUT' : 'POST';

        console.log('URL:', url);
        console.log('Method:', method);

        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', res.status);

        if (res.ok) {
            showNotification(editId ? 'Escola atualizada com sucesso!' : 'Escola criada com sucesso!', 'success');
            closeModal('modalEscola');
            loadEscolas();
        } else {
            const errorData = await res.json();
            console.error('Error response:', errorData);
            showNotification(errorData.error || 'Erro ao salvar escola', 'error');
        }
    } catch (error) {
        console.error('Exception:', error);
        showNotification('Erro ao salvar escola', 'error');
    }
}

function editEscola(id) {
    const escola = escolas.find(e => e.id === id);
    if (!escola) return;

    document.getElementById('escolaNome').value = escola.nome;
    document.getElementById('escolaEndereco').value = escola.endereco || '';
    document.getElementById('escolaNumero').value = escola.numero || '';
    document.getElementById('escolaComplemento').value = escola.complemento || '';
    document.getElementById('escolaCep').value = escola.cep || '';
    document.getElementById('escolaContato').value = escola.contato || '';
    document.getElementById('escolaTelefone').value = escola.telefone || '';
    document.getElementById('escolaEmail').value = escola.email || '';

    document.getElementById('formEscola').dataset.editId = id;
    document.querySelector('#modalEscola h2').innerText = 'Editar Escola';
    openModal('modalEscola');
}

function deleteEscola(id) {
    showConfirmation('Tem certeza que deseja excluir esta escola?', async () => {
        try {
            const res = await fetch(`${API_URL}/escolas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (res.ok) {
                showNotification('Escola excluída com sucesso!', 'success');
                loadEscolas();
            } else {
                const errorData = await res.json();
                showNotification(errorData.error || 'Erro ao excluir escola', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erro ao excluir escola', 'error');
        }
    });
}

function populateEscolaSelect() {
    const select = document.getElementById('childEscola');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione uma escola...</option>' +
        escolas.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
}

function toggleHorarioFields() {
    const tipo = document.getElementById('childTipoTransporte').value;
    const groupEntrada = document.getElementById('groupHorarioEntrada');
    const groupSaida = document.getElementById('groupHorarioSaida');

    if (tipo === 'ida_volta') {
        groupEntrada.style.display = 'block';
        groupSaida.style.display = 'block';
    } else if (tipo === 'so_ida') {
        groupEntrada.style.display = 'block';
        groupSaida.style.display = 'none';
        document.getElementById('childHorarioSaida').value = '';
    } else if (tipo === 'so_volta') {
        groupEntrada.style.display = 'none';
        groupSaida.style.display = 'block';
        document.getElementById('childHorarioEntrada').value = '';
    }
}













function editUser(id) {
    const user = usuarios.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userNome').value = user.nome;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userSenha').value = ''; // Don't show password

    document.getElementById('formUsuario').dataset.editId = id;
    document.querySelector('#modalUsuario h2').innerText = 'Editar Usuário';
    openModal('modalUsuario');
}

function deleteUser(id) {
    showConfirmation('Tem certeza que deseja excluir este usuário?', async () => {
        try {
            const res = await fetch(`${API_URL}/admin-users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (res.ok) {
                showNotification('Usuário excluído com sucesso!', 'success');
                loadUsuarios();
            } else {
                const data = await res.json();
                showNotification(data.error || 'Erro ao excluir usuário', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erro ao excluir usuário', 'error');
        }
    });
}

async function toggleUserActive(id, currentStatus) {
    const action = currentStatus ? 'desativar' : 'ativar';
    showConfirmation(`Tem certeza que deseja ${action} este usuário?`, async () => {
        try {
            const res = await fetch(`${API_URL}/admin-users/${id}/toggle-active`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (res.ok) {
                const data = await res.json();
                showNotification(data.message, 'success');
                loadUsers(); // Changed from loadUsuarios() to loadUsers() to match existing pattern
            } else {
                const data = await res.json();
                showNotification(data.error || `Erro ao ${action} usuário`, 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification(`Erro ao ${action} usuário`, 'error');
        }
    });
}

// Children Management Functions
let childCounter = 0;
let currentChildren = []; // Store children data
let editingChildIndex = null; // Track which child is being edited

// Show children as a list (not forms)
function renderChildrenList() {
    const listView = document.getElementById('childrenListView');

    if (currentChildren.length === 0) {
        listView.innerHTML = '<p style="color: var(--text-gray); font-style: italic;">Nenhuma criança cadastrada. Clique em "Adicionar Criança" para começar.</p>';
        return;
    }

    const transporteLabels = {
        'ida_volta': 'Ida e Volta',
        'so_ida': 'Somente Ida',
        'so_volta': 'Somente Volta'
    };

    console.log('=== renderChildrenList ===');
    console.log('Escolas disponíveis:', escolas.length);
    console.log('Escolas:', escolas);

    listView.innerHTML = currentChildren.map((child, index) => {
        // Resolve school name
        let escolaNome = 'Não informada';

        console.log(`Child ${index}:`, child.nome, 'escolaId:', child.escolaId, 'escola:', child.escola);

        if (child.escolaId) {
            const escolaObj = escolas.find(e => e.id == child.escolaId);
            console.log('Found escola:', escolaObj);
            if (escolaObj) {
                escolaNome = escolaObj.nome;
            }
        } else if (child.escola) {
            escolaNome = child.escola;
        }

        // Only show contract button if child has an ID (saved)
        const contractButton = child.id
            ? `<button type="button" class="btn" style="padding: 6px 12px; background-color: #6366f1; color: white; font-size: 0.85rem;" onclick="downloadContract(${child.responsavelId || 'document.getElementById(\'formResponsavel\').dataset.editId'}, ${child.id})">🖨️ Contrato</button>`
            : '';

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 8px; border: 1px solid #374151;">
            <div>
                <strong style="color: white;">${child.nome || 'Sem nome'}</strong>
                <div style="font-size: 0.85rem; color: var(--text-gray); margin-top: 4px;">
                    Escola: ${escolaNome}
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                ${contractButton}
                <button type="button" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="editChild(${index})">✏️ Editar</button>
                <button type="button" class="btn" style="padding: 6px 12px; background: var(--danger); color: white; font-size: 0.85rem;" onclick="deleteChild(${index})">🗑️ Excluir</button>
            </div>
        </div>
    `}).join('');
}

// Show form for adding/editing child
async function showChildForm(childIndex = null) {
    const formContainer = document.getElementById('childFormContainer');
    const formTitle = document.getElementById('childFormTitle');
    const formFields = document.getElementById('childFormFields');

    editingChildIndex = childIndex;
    const childData = childIndex !== null ? currentChildren[childIndex] : null;

    formTitle.textContent = childData ? 'Editar Criança' : 'Nova Criança';

    // Check if child has active contract
    let activeContract = null;
    if (childData && childData.id) {
        try {
            console.log('🔍 Checking for active contract for child ID:', childData.id);
            const res = await fetch(`${API_URL}/contratos/crianca/${childData.id}/active`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            console.log('📡 Contract API response status:', res.status);
            if (res.ok) {
                activeContract = await res.json();
                console.log('✅ Active contract found:', activeContract);
            } else {
                console.log('❌ No active contract or error:', res.status);
            }
        } catch (error) {
            console.log('⚠️ Error checking contract:', error);
        }
    }

    const hasActiveContract = !!activeContract;
    const contractFieldsDisabled = hasActiveContract ? 'disabled' : '';
    const contractWarning = hasActiveContract ? `
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #F59E0B; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="color: #F59E0B; font-size: 1.2rem;">🔒</span>
                <strong style="color: #F59E0B;">Contrato Ativo</strong>
            </div>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-gray);">
                Os campos de contrato estão bloqueados. Para alterar valor ou data, crie um novo contrato.
            </p>
            <button type="button" class="btn" style="margin-top: 10px; background: #F59E0B; color: white; padding: 6px 12px; font-size: 0.85rem;" onclick="openNewContractModal(${childIndex})">
                📝 Criar Novo Contrato
            </button>
        </div>
    ` : '';

    formFields.innerHTML = `
        ${contractWarning}
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Nome *</label>
            <input type="text" id="childNome" value="${childData?.nome || ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Data de Nascimento</label>
            <input type="date" id="childDataNascimento" value="${childData?.dataNascimento ? childData.dataNascimento.split('T')[0] : childData?.data_nascimento ? childData.data_nascimento.split('T')[0] : ''}">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Escola *</label>
            <select id="childEscola" required>
                <option value="">Selecione uma escola...</option>
                ${escolas.map(e => `<option value="${e.id}" ${childData && (childData.escolaId == e.id || childData.escola_id == e.id) ? 'selected' : ''}>${e.nome}</option>`).join('')}
            </select>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Tipo de Transporte *</label>
            <select id="childTipoTransporte" onchange="toggleHorarioFields()" required>
                <option value="ida_volta" ${(childData?.tipoTransporte || childData?.tipo_transporte || 'ida_volta') === 'ida_volta' ? 'selected' : ''}>Ida e Volta</option>
                <option value="so_ida" ${(childData?.tipoTransporte || childData?.tipo_transporte) === 'so_ida' ? 'selected' : ''}>Somente Ida</option>
                <option value="so_volta" ${(childData?.tipoTransporte || childData?.tipo_transporte) === 'so_volta' ? 'selected' : ''}>Somente Volta</option>
            </select>
        </div>
        <div class="form-group" id="groupHorarioEntrada" style="margin-bottom: 10px;">
            <label>Horário Entrada</label>
            <input type="time" id="childHorarioEntrada" value="${childData?.horarioEntrada || childData?.horario_entrada || ''}">
        </div>
        <div class="form-group" id="groupHorarioSaida" style="margin-bottom: 10px;">
            <label>Horário Saída</label>
            <input type="time" id="childHorarioSaida" value="${childData?.horarioSaida || childData?.horario_saida || ''}">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Data Início Contrato *</label>
            <input type="date" id="childDataInicio" value="${childData?.dataInicioContrato ? childData.dataInicioContrato.split('T')[0] : childData?.data_inicio_contrato ? childData.data_inicio_contrato.split('T')[0] : ''}" ${contractFieldsDisabled} required>
            ${hasActiveContract ? '<small style="color: #9CA3AF; font-size: 0.8rem;">🔒 Campo bloqueado - contrato ativo</small>' : ''}
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Valor Contrato (Anual) *</label>
            <input type="number" id="childValor" step="0.01" value="${childData?.valorContratoAnual || childData?.valor_contrato_anual || ''}" ${contractFieldsDisabled} required>
            ${hasActiveContract ? '<small style="color: #9CA3AF; font-size: 0.8rem;">🔒 Campo bloqueado - contrato ativo</small>' : ''}
        </div>
    `;

    // Initialize visibility
    setTimeout(toggleHorarioFields, 0);

    formContainer.style.display = 'block';
}

// Save child form data
function saveChildForm() {
    const nome = document.getElementById('childNome').value;
    const dataNascimento = document.getElementById('childDataNascimento').value;
    const escolaId = document.getElementById('childEscola').value;
    const tipoTransporte = document.getElementById('childTipoTransporte').value;
    const horarioEntrada = document.getElementById('childHorarioEntrada').value;
    const horarioSaida = document.getElementById('childHorarioSaida').value;
    const dataInicioContrato = document.getElementById('childDataInicio').value;
    const valorContratoAnual = parseFloat(document.getElementById('childValor').value);

    if (!nome || !escolaId || !dataInicioContrato || !valorContratoAnual) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'warning');
        return;
    }

    const childData = {
        nome,
        dataNascimento,
        escolaId,
        tipoTransporte,
        horarioEntrada,
        horarioSaida,
        dataInicioContrato,
        valorContratoAnual
    };

    if (editingChildIndex !== null) {
        // Editing existing child - preserve ID if it exists
        childData.id = currentChildren[editingChildIndex].id;
        currentChildren[editingChildIndex] = childData;
    } else {
        // Adding new child
        currentChildren.push(childData);
    }

    cancelChildForm();
    renderChildrenList();
}

// Cancel child form
function cancelChildForm() {
    document.getElementById('childFormContainer').style.display = 'none';
    editingChildIndex = null;
}

// Edit child
function editChild(index) {
    showChildForm(index);
}

// Delete child
function deleteChild(index) {
    showConfirmation('Tem certeza que deseja remover esta criança?', () => {
        currentChildren.splice(index, 1);
        renderChildrenList();
    });
}

function removeChildRow(index) {
    // Legacy function - now handled by deleteChild
    deleteChild(index);
}

function getChildrenData() {
    // Now we just return the currentChildren array
    console.log('=== getChildrenData ===');
    console.log('Total children:', currentChildren.length);
    console.log('Children data:', JSON.stringify(currentChildren, null, 2));
    return currentChildren;
}

// Input Masks
document.addEventListener('DOMContentLoaded', function () {
    const cpfInput = document.getElementById('respCpf');
    const telefoneInput = document.getElementById('respTelefone');

    if (cpfInput) {
        cpfInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    if (telefoneInput) {
        telefoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // Profile Form Listener
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', handlePerfilSubmit);

        // Pre-fill profile data when modal opens
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            document.getElementById('perfilNome').value = user.nome;
            document.getElementById('perfilEmail').value = user.email;
        }
    }
});

async function handlePerfilSubmit(e) {
    e.preventDefault();

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    // Concatenate address
    const enderecoBase = document.getElementById('perfilEndereco').value;
    const numero = document.getElementById('perfilNumero').value;
    const complemento = document.getElementById('perfilComplemento').value;
    const cep = document.getElementById('perfilCep').value;

    let enderecoFinal = enderecoBase;
    if (numero) enderecoFinal += `, ${numero}`;
    if (complemento) enderecoFinal += ` - ${complemento}`;
    if (cep) enderecoFinal += ` - CEP: ${cep}`;

    const data = {
        nome: document.getElementById('perfilNome').value,
        email: document.getElementById('perfilEmail').value,
        cpf_cnpj: document.getElementById('perfilCpfCnpj').value,
        endereco: enderecoFinal
    };

    const senha = document.getElementById('perfilSenha').value;
    if (senha) {
        data.senha = senha;
    }

    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const updatedUser = await res.json();
            // Update local storage
            const currentStorage = JSON.parse(localStorage.getItem('user'));
            const newStorage = { ...currentStorage, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newStorage));

            // Update UI
            currentUser = newStorage;
            document.querySelector('.user-info span').innerText = `Olá, ${currentUser.nome} (${currentUser.role === 'master' ? 'Master' : 'Admin'})`;

            showNotification('Perfil atualizado com sucesso!', 'success');
            closeModal('modalPerfil');
            document.getElementById('perfilSenha').value = ''; // Clear password field after successful update
        } else {
            const error = await res.json();
            showNotification(error.error || 'Erro ao atualizar perfil', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao atualizar perfil', 'error');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ==================== CHATBOT FUNCTIONS ====================
const CHATBOT_API_URL = 'http://localhost:5000/api/chat';

// Gera ID de sessão único para o usuário
let chatSessionId = localStorage.getItem('chatSessionId');
if (!chatSessionId) {
    chatSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', chatSessionId);
}

function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    const messagesContainer = document.getElementById('chatbotMessages');
    const isOpening = !chatWindow.classList.contains('active');

    chatWindow.classList.toggle('active');

    if (isOpening) {
        document.getElementById('chatbotInput').focus();

        // Add initial greeting if this is the first time opening (no messages yet)
        if (messagesContainer.children.length === 0) {
            setTimeout(() => {
                addChatMessage('Olá! Sou o assistente virtual da Escola Vai. Como posso ajudar?', 'bot');
            }, 300);
        }
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';
    showTypingIndicator();

    try {
        const response = await fetch(CHATBOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                session_id: chatSessionId
            })
        });

        if (!response.ok) throw new Error('Erro ao conectar com o chatbot');

        const data = await response.json();
        removeTypingIndicator();
        addChatMessage(data.response, 'bot');

    } catch (error) {
        console.error('Erro no chatbot:', error);
        removeTypingIndicator();
        addChatMessage('Desculpe, estou com problemas técnicos. Tente novamente.', 'bot');
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;

    if (sender === 'bot') {
        // Para mensagens do bot, adiciona efeito de digitação
        messageDiv.textContent = ''; // Começa vazio
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Efeito de digitação
        let index = 0;
        const speed = 30; // Velocidade de digitação (ms por caractere) - mais lento para parecer humano

        function typeCharacter() {
            if (index < message.length) {
                messageDiv.textContent += message.charAt(index);
                index++;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                setTimeout(typeCharacter, speed);
            }
        }

        typeCharacter();
    } else {
        // Mensagens do usuário aparecem instantaneamente
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="typing-text">O robô está digitando...</div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// CEP Integration
function setupCepIntegration() {
    const cepInputs = [
        { id: 'respCep', addressId: 'respEndereco', numberId: 'respNumero' },
        { id: 'escolaCep', addressId: 'escolaEndereco', numberId: 'escolaNumero' },
        { id: 'perfilCep', addressId: 'perfilEndereco', numberId: 'perfilNumero' }
    ];

    cepInputs.forEach(input => {
        const el = document.getElementById(input.id);
        if (el) {
            // Mask CEP
            el.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 5) {
                    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });

            // Fetch Address on Blur
            el.addEventListener('blur', async function () {
                const cep = this.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    // showNotification('Buscando CEP...', 'info');
                    try {
                        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        const data = await response.json();

                        if (!data.erro) {
                            const addressField = document.getElementById(input.addressId);
                            const numberField = document.getElementById(input.numberId);

                            if (addressField) {
                                // Format: Rua, Bairro, Cidade - UF
                                addressField.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

                                // Focus on number field
                                if (numberField) {
                                    numberField.focus();
                                }
                                // showNotification('Endereço encontrado!', 'success');
                            }
                        } else {
                            showNotification('CEP não encontrado.', 'warning');
                        }
                    } catch (error) {
                        console.error('Erro ao buscar CEP:', error);
                        showNotification('Erro ao buscar CEP.', 'error');
                    }
                }
            });
        }
    });
}
// Append these functions to admin_script.js

// ==================== CONTRACT MANAGEMENT FUNCTIONS ====================

// Open new contract modal
function openNewContractModal(childIndex) {
    const child = currentChildren[childIndex];

    if (!child || !child.id) {
        showNotification('Criança não encontrada ou não salva', 'error');
        return;
    }

    // Pre-fill with current values
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('novoContratoDataInicio').value = today;
    document.getElementById('novoContratoValor').value = child.valorContratoAnual || child.valor_contrato_anual || '';
    document.getElementById('novoContratoMotivo').value = '';

    // Store child data for submission
    document.getElementById('formNovoContrato').dataset.criancaId = child.id;
    document.getElementById('formNovoContrato').dataset.responsavelId = child.responsavelId || child.responsavel_id;
    document.getElementById('formNovoContrato').dataset.childIndex = childIndex;

    openModal('modalNovoContrato');
}

// Initialize form handler when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContractHandlers);
} else {
    initContractHandlers();
}

function initContractHandlers() {
    const formNovoContrato = document.getElementById('formNovoContrato');
    if (formNovoContrato && !formNovoContrato.dataset.initialized) {
        formNovoContrato.dataset.initialized = 'true';
        formNovoContrato.addEventListener('submit', async function (e) {
            e.preventDefault();

            const criancaId = parseInt(this.dataset.criancaId);
            const responsavelId = parseInt(this.dataset.responsavelId);
            const childIndex = parseInt(this.dataset.childIndex);

            const data = {
                criancaId,
                responsavelId,
                dataInicio: document.getElementById('novoContratoDataInicio').value,
                valorAnual: parseFloat(document.getElementById('novoContratoValor').value),
                motivoCancelamento: document.getElementById('novoContratoMotivo').value || 'Substituído por novo contrato'
            };

            try {
                const res = await fetch(`${API_URL}/contratos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}`
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    const novoContrato = await res.json();
                    showNotification('Novo contrato criado com sucesso!', 'success');
                    closeModal('modalNovoContrato');

                    // Update child data with new contract info
                    currentChildren[childIndex].dataInicioContrato = data.dataInicio;
                    currentChildren[childIndex].valorContratoAnual = data.valorAnual;
                    currentChildren[childIndex].data_inicio_contrato = data.dataInicio;
                    currentChildren[childIndex].valor_contrato_anual = data.valorAnual;

                    // Refresh child form to show updated contract status
                    await showChildForm(childIndex);

                    // Reload pagamentos to show new installments
                    loadPagamentos();
                } else {
                    const error = await res.json();
                    showNotification(error.error || 'Erro ao criar novo contrato', 'error');
                }
            } catch (error) {
                console.error('Error creating new contract:', error);
                showNotification('Erro ao criar novo contrato', 'error');
            }
        });
    }
}

// Profile Management
async function handleProfileSubmit(e) {
    e.preventDefault();

    const id = currentUser.id;
    const nome = document.getElementById('perfilNome').value;
    const email = document.getElementById('perfilEmail').value;
    const cpf_cnpj = document.getElementById('perfilCpfCnpj').value;
    const senha = document.getElementById('perfilSenha').value;

    // Address composition
    const enderecoBase = document.getElementById('perfilEndereco').value;
    const numero = document.getElementById('perfilNumero').value;
    const complemento = document.getElementById('perfilComplemento').value;

    let endereco = enderecoBase;
    if (numero) endereco += `, ${numero}`;
    if (complemento) endereco += ` - ${complemento}`;

    const data = {
        id,
        nome,
        email,
        cpf_cnpj,
        endereco
    };

    if (senha) {
        data.password = senha;
    }

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const updatedUser = await res.json();

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const newUser = { ...storedUser, ...updatedUser };
            // Keep the token
            newUser.token = storedUser.token;

            localStorage.setItem('user', JSON.stringify(newUser));
            currentUser = newUser;

            showNotification('Perfil atualizado com sucesso!', 'success');
            closeModal('modalPerfil');

            // Update header name
            const userInfoElement = document.querySelector('.user-info span');
            if (userInfoElement) {
                userInfoElement.innerText = `Olá, ${currentUser.nome} (${currentUser.role === 'master' ? 'Master' : 'Admin'})`;
            }
        } else {
            const error = await res.json();
            showNotification(error.error || 'Erro ao atualizar perfil.', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showNotification('Erro ao atualizar perfil.', 'error');
    }
}
