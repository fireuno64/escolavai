const API_URL = 'http://localhost:3000/api';

// State
let responsaveis = [];
let pagamentos = [];
let filteredPagamentos = []; // Filtered list for display
let usuarios = [];
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
});

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

// Rendering
function renderResponsaveisTable() {
    const tbody = document.querySelector('#tableResponsaveis tbody');
    tbody.innerHTML = responsaveis.map(r => `
        <tr>
            <td>${r.nome}</td>
            <td>${r.cpf}</td>
            <td>${r.email}</td>
            <td>${r.telefone}</td>
            <td>
                <button class="btn btn-sm" style="background-color: #6366f1;" onclick="downloadContract(${r.id})" title="Gerar Contrato">📄 PDF</button>
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 6px 12px; margin-right: 5px;" onclick="editResponsavel(${r.id})">✏️ Editar</button>
                <button class="btn" style="padding: 6px 12px; background: var(--danger); color: white;" onclick="deleteResponsavel(${r.id})">🗑️ Excluir</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('totalResponsaveis').innerText = responsaveis.length;
}

async function downloadContract(responsavelId) {
    try {
        showNotification('Gerando contrato...', 'info');

        const res = await fetch(`${API_URL}/contracts/${responsavelId}/pdf`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Filename is usually set by Content-Disposition header, but we can force one if needed
            // a.download = 'contrato.pdf'; 
            a.download = `contrato_responsavel_${responsavelId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showNotification('Contrato baixado com sucesso!', 'success');
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
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

    tbody.innerHTML = dataToRender.map(p => {
        const resp = responsaveis.find(r => r.id === p.responsavelId);
        const pagamentoDate = new Date(p.dataPagamento);

        // Check if payment is overdue (Pendente and date < today)
        let displayStatus = p.status;
        let statusClass = '';

        if (p.status === 'Pendente' && pagamentoDate < today) {
            displayStatus = 'Vencido';
            statusClass = 'status-overdue';
        } else {
            statusClass = p.status === 'Pago' ? 'status-paid' : (p.status === 'Pendente' ? 'status-pending' : 'status-late');
        }

        // Toggle button text and color
        const toggleButtonText = p.status === 'Pago' ? '↩️ Pendente' : '✓ Pagar';
        const toggleButtonColor = p.status === 'Pago' ? '#f59e0b' : '#10b981';

        return `
        <tr>
            <td>${resp ? resp.nome : 'Desconhecido'}</td>
            <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
            <td>${pagamentoDate.toLocaleDateString()}</td>
            <td>
                <button class="btn" style="padding: 4px 8px; font-size: 0.8rem; background: ${toggleButtonColor}; color: white; margin-right: 5px;" onclick="togglePagamentoStatus(${p.id}, '${p.status}')">${toggleButtonText}</button>
                <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deletePagamento(${p.id})">Excluir</button>
            </td>
        </tr>
    `}).join('');
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

function populateResponsavelSelect() {
    const select = document.getElementById('pagRespId');
    select.innerHTML = '<option value="">Selecione o Responsável</option>' +
        responsaveis.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
}

function updateStats() {
    // Total Pendentes
    const totalPendentes = pagamentos
        .filter(p => p.status === 'Pendente')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    document.getElementById('totalPendentes').innerText = `R$ ${totalPendentes.toFixed(2)}`;

    // Receita Mensal (Simplificado: Soma de todos os 'Pago')
    const receita = pagamentos
        .filter(p => p.status === 'Pago')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    document.getElementById('receitaMensal').innerText = `R$ ${receita.toFixed(2)}`;
}

// Form Handling
async function handleResponsavelSubmit(e) {
    console.log('=== handleResponsavelSubmit CALLED ===');
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

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
        endereco: document.getElementById('respEndereco').value,
        rg: document.getElementById('respRg').value,
        // data_inicio_contrato and valor_contrato removed from here
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
                            escola: child.escola,
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
                            escola: child.escola,
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
    const data = {
        responsavelId: document.getElementById('pagRespId').value,
        valor: parseFloat(document.getElementById('pagValor').value),
        status: document.getElementById('pagStatus').value
    };

    try {
        const res = await fetch(`${API_URL}/pagamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal('modalPagamento');
            e.target.reset();
            loadPagamentos();
            showNotification('Pagamento criado com sucesso!', 'success');
        } else {
            showNotification('Erro ao criar pagamento', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao criar pagamento', 'error');
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

// Responsável Edit/Delete Functions
async function editResponsavel(id) {
    const responsavel = responsaveis.find(r => r.id === id);
    if (!responsavel) return;

    // Pre-fill form
    document.getElementById('respNome').value = responsavel.nome;
    document.getElementById('respCpf').value = responsavel.cpf;
    document.getElementById('respEmail').value = responsavel.email || '';
    document.getElementById('respTelefone').value = responsavel.telefone || '';
    document.getElementById('respEndereco').value = responsavel.endereco || '';
    document.getElementById('respRg').value = responsavel.rg || '';
    document.getElementById('respSenha').value = '';

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
            } else {
                showNotification('Erro ao excluir responsável', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erro ao excluir responsável', 'error');
        }
    });
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

    listView.innerHTML = currentChildren.map((child, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 8px; border: 1px solid #374151;">
            <div>
                <strong style="color: white;">${child.nome || 'Sem nome'}</strong>
                <div style="font-size: 0.85rem; color: var(--text-gray); margin-top: 4px;">
                    ${child.escola ? `Escola: ${child.escola}` : ''}
                    ${child.tipoTransporte || child.tipo_transporte ? ` | Transporte: ${transporteLabels[child.tipoTransporte || child.tipo_transporte] || 'Ida e Volta'}` : ''}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-gray); margin-top: 2px;">
                    ${child.horarioEntrada || child.horarioSaida ? `Horário: ${child.horarioEntrada || '--'} - ${child.horarioSaida || '--'}` : ''}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-gray); margin-top: 2px;">
                    ${child.dataInicioContrato ? `Início: ${new Date(child.dataInicioContrato).toLocaleDateString('pt-BR')}` : ''}
                    ${child.valorContratoAnual ? ` | Valor: R$ ${parseFloat(child.valorContratoAnual).toFixed(2)}` : ''}
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="editChild(${index})">✏️ Editar</button>
                <button type="button" class="btn" style="padding: 6px 12px; background: var(--danger); color: white; font-size: 0.85rem;" onclick="deleteChild(${index})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Show form for adding/editing child
function showChildForm(childIndex = null) {
    const formContainer = document.getElementById('childFormContainer');
    const formTitle = document.getElementById('childFormTitle');
    const formFields = document.getElementById('childFormFields');

    editingChildIndex = childIndex;
    const childData = childIndex !== null ? currentChildren[childIndex] : null;

    formTitle.textContent = childData ? 'Editar Criança' : 'Nova Criança';

    formFields.innerHTML = `
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Nome *</label>
            <input type="text" id="childNome" value="${childData?.nome || ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Escola</label>
            <input type="text" id="childEscola" value="${childData?.escola || ''}">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Tipo de Transporte *</label>
            <select id="childTipoTransporte" required>
                <option value="ida_volta" ${(childData?.tipoTransporte || childData?.tipo_transporte || 'ida_volta') === 'ida_volta' ? 'selected' : ''}>Ida e Volta</option>
                <option value="so_ida" ${(childData?.tipoTransporte || childData?.tipo_transporte) === 'so_ida' ? 'selected' : ''}>Somente Ida</option>
                <option value="so_volta" ${(childData?.tipoTransporte || childData?.tipo_transporte) === 'so_volta' ? 'selected' : ''}>Somente Volta</option>
            </select>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Horário Entrada</label>
            <input type="time" id="childEntrada" value="${childData?.horarioEntrada || childData?.horario_entrada || ''}">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Horário Saída</label>
            <input type="time" id="childSaida" value="${childData?.horarioSaida || childData?.horario_saida || ''}">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Data Início Contrato *</label>
            <input type="date" id="childDataInicio" value="${childData?.dataInicioContrato ? childData.dataInicioContrato.split('T')[0] : childData?.data_inicio_contrato ? childData.data_inicio_contrato.split('T')[0] : ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label>Valor Contrato (Anual) *</label>
            <input type="number" id="childValor" step="0.01" value="${childData?.valorContratoAnual || childData?.valor_contrato_anual || ''}" required>
        </div>
    `;

    formContainer.style.display = 'block';
}

// Save child form data
function saveChildForm() {
    const nome = document.getElementById('childNome').value;
    const escola = document.getElementById('childEscola').value;
    const tipoTransporte = document.getElementById('childTipoTransporte').value;
    const horarioEntrada = document.getElementById('childEntrada').value;
    const horarioSaida = document.getElementById('childSaida').value;
    const dataInicioContrato = document.getElementById('childDataInicio').value;
    const valorContratoAnual = parseFloat(document.getElementById('childValor').value);

    if (!nome || !dataInicioContrato || !valorContratoAnual) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'warning');
        return;
    }

    const childData = {
        nome,
        escola,
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

    const nome = document.getElementById('perfilNome').value;
    const email = document.getElementById('perfilEmail').value;
    const senha = document.getElementById('perfilSenha').value;

    const data = { nome, email };
    if (senha) {
        data.password = senha;
    }

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ id: user.id, ...data }) // Send ID if needed by backend logic
        });

        if (res.ok) {
            const updatedUser = await res.json();
            // Update local storage
            const newUser = { ...user, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newUser));

            // Update header
            document.getElementById('headerUserName').innerText = `Olá, ${newUser.nome} `;

            showNotification('Perfil atualizado com sucesso!', 'success');
            closeModal('modalPerfil');
            document.getElementById('perfilSenha').value = '';
        } else {
            const errorData = await res.json();
            showNotification(errorData.error || 'Erro ao atualizar perfil', 'error');
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
