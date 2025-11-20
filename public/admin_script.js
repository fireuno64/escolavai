const API_URL = 'http://localhost:3000/api';

// Custom Notification System
function showNotification(message, type = 'info') {
    // Create overlay if it doesn't exist
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

    const iconMap = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };

    const colorMap = {
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'info': '#4F46E5'
    };

    overlay.innerHTML = `
        <div style="
            background: #1F2937;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            border: 1px solid #374151;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
                color: ${colorMap[type]};
                font-weight: 600;
                font-size: 1.1rem;
            ">
                <span style="font-size: 1.5rem;">${iconMap[type]}</span>
                <span>Administrador</span>
            </div>
            <div style="
                color: #F3F4F6;
                margin-bottom: 20px;
                line-height: 1.5;
            ">${message}</div>
            <div style="
                display: flex;
                justify-content: flex-end;
            ">
                <button onclick="closeNotification()" style="
                    padding: 8px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    background-color: ${colorMap[type]};
                    color: white;
                    transition: 0.3s;
                ">OK</button>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';
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
        <div style="
            background: #1F2937;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            border: 1px solid #374151;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
                color: #F59E0B;
                font-weight: 600;
                font-size: 1.1rem;
            ">
                <span style="font-size: 1.5rem;">⚠️</span>
                <span>Administrador</span>
            </div>
            <div style="
                color: #F3F4F6;
                margin-bottom: 20px;
                line-height: 1.5;
            ">${message}</div>
            <div style="
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            ">
                <button onclick="closeNotification()" style="
                    padding: 8px 20px;
                    border-radius: 6px;
                    border: 1px solid #374151;
                    cursor: pointer;
                    font-weight: 500;
                    background: transparent;
                    color: #9CA3AF;
                    transition: 0.3s;
                ">Cancelar</button>
                <button onclick="confirmAction()" style="
                    padding: 8px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    background-color: #EF4444;
                    color: white;
                    transition: 0.3s;
                ">Confirmar</button>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';

    // Store the callback
    window.pendingConfirmAction = onConfirm;
}

function closeNotification() {
    const overlay = document.getElementById('customNotificationOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function confirmAction() {
    closeNotification();
    if (window.pendingConfirmAction) {
        window.pendingConfirmAction();
        window.pendingConfirmAction = null;
    }
}

// State
let responsaveis = [];
let pagamentos = [];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
        alert('Acesso não autorizado!');
        window.location.href = 'login.html';
        return;
    }

    // Update user info in header
    const userInfoElement = document.querySelector('.user-info span');
    if (userInfoElement) {
        userInfoElement.innerText = `Olá, ${user.nome}`;
    }

    console.log('Initializing Admin Dashboard...');
    loadResponsaveis();
    loadPagamentos();

    // Form Listeners
    document.getElementById('formResponsavel').addEventListener('submit', handleResponsavelSubmit);
    document.getElementById('formPagamento').addEventListener('submit', handlePagamentoSubmit);
});

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('responsaveis-section').style.display = 'none';
    document.getElementById('pagamentos-section').style.display = 'none';

    // Show selected
    document.getElementById(`${sectionId}-section`).style.display = 'block';

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update Title
    const titles = {
        'dashboard': 'Dashboard',
        'responsaveis': 'Gerenciar Responsáveis',
        'pagamentos': 'Gerenciar Pagamentos'
    };
    document.getElementById('pageTitle').innerText = titles[sectionId];
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
    document.getElementById('childrenList').innerHTML = '';
    document.querySelector('#modalResponsavel h2').innerText = 'Novo Responsável';

    openModal('modalResponsavel');
}

function closeModal(modalId) {
    // Clean up editId when closing responsavel modal
    if (modalId === 'modalResponsavel') {
        const form = document.getElementById('formResponsavel');
        delete form.dataset.editId;
    }

    document.getElementById(modalId).style.display = 'none';
}

// Data Loading
async function loadResponsaveis() {
    console.log('Loading responsaveis...');
    try {
        const res = await fetch(`${API_URL}/responsaveis`);
        responsaveis = await res.json();
        console.log('Responsaveis loaded:', responsaveis);
        renderResponsaveisTable();
        updateStats();
        populateResponsavelSelect();
    } catch (error) {
        console.error('Erro ao carregar responsáveis:', error);
    }
}

async function loadPagamentos() {
    console.log('Loading pagamentos...');
    try {
        const res = await fetch(`${API_URL}/pagamentos`);
        pagamentos = await res.json();
        console.log('Pagamentos loaded:', pagamentos);
        renderPagamentosTable();
        updateStats();
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
    }
}

// Rendering
function renderResponsaveisTable() {
    const tbody = document.querySelector('#tableResponsaveis tbody');
    tbody.innerHTML = responsaveis.map(r => `
        <tr>
            <td>${r.nome}</td>
            <td>${r.cpf}</td>
            <td>${r.email || '-'}</td>
            <td>${r.telefone || '-'}</td>
            <td>
                <button class="btn btn-primary" style="padding: 6px 12px; margin-right: 5px;" onclick="editResponsavel(${r.id})">✏️ Editar</button>
                <button class="btn" style="padding: 6px 12px; background: var(--danger); color: white;" onclick="deleteResponsavel(${r.id})">🗑️ Excluir</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('totalResponsaveis').innerText = responsaveis.length;
}

function renderPagamentosTable() {
    const tbody = document.querySelector('#tablePagamentos tbody');
    tbody.innerHTML = pagamentos.map(p => {
        const resp = responsaveis.find(r => r.id === p.responsavelId);
        const statusClass = p.status === 'Pago' ? 'status-paid' : (p.status === 'Pendente' ? 'status-pending' : 'status-late');

        return `
        <tr>
            <td>${resp ? resp.nome : 'Desconhecido'}</td>
            <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${p.status}</span></td>
            <td>${new Date(p.dataPagamento).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deletePagamento(${p.id})">Excluir</button>
            </td>
        </tr>
    `}).join('');
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
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId;

    // Validate Children
    const children = getChildrenData();
    if (children.length === 0) {
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
        data_inicio_contrato: document.getElementById('respDataInicio').value,
        valor_contrato: parseFloat(document.getElementById('respValorContrato').value),
        senha: editId ? undefined : 'senha123' // Default password for new users
    };

    try {
        const url = editId ? `${API_URL}/responsaveis/${editId}` : `${API_URL}/responsaveis`;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            const responsavel = await res.json();
            const responsavelId = responsavel.id || editId;

            // Handle children
            for (const child of children) {
                if (child.id) {
                    // Update existing child
                    await fetch(`${API_URL}/criancas/${child.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nome: child.nome,
                            escola: child.escola,
                            horarioEntrada: child.horarioEntrada,
                            horarioSaida: child.horarioSaida,
                            responsavelId: responsavelId
                        })
                    });
                } else {
                    // Create new child
                    await fetch(`${API_URL}/criancas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nome: child.nome,
                            escola: child.escola,
                            horarioEntrada: child.horarioEntrada,
                            horarioSaida: child.horarioSaida,
                            responsavelId: responsavelId
                        })
                    });
                }
            }

            showNotification(editId ? 'Responsável atualizado com sucesso!' : 'Responsável criado com sucesso!', 'success');
            closeModal('modalResponsavel');
            form.reset();
            document.getElementById('childrenList').innerHTML = '';
            delete form.dataset.editId;
            document.querySelector('#modalResponsavel h2').innerText = 'Novo Responsável';
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
            headers: { 'Content-Type': 'application/json' },
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

function deletePagamento(id) {
    showConfirmation('Tem certeza que deseja excluir este pagamento?', async () => {
        try {
            const res = await fetch(`${API_URL}/pagamentos/${id}`, {
                method: 'DELETE'
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
    document.getElementById('respDataInicio').value = responsavel.data_inicio_contrato ? responsavel.data_inicio_contrato.split('T')[0] : '';
    document.getElementById('respValorContrato').value = responsavel.valor_contrato || '';

    // Load children
    try {
        const res = await fetch(`${API_URL}/criancas/responsavel/${id}`);
        if (res.ok) {
            const children = await res.json();
            document.getElementById('childrenList').innerHTML = '';
            children.forEach(child => {
                addChildRow(child);
            });
        }
    } catch (error) {
        console.error('Error loading children:', error);
    }

    // Store ID for update
    document.getElementById('formResponsavel').dataset.editId = id;

    // Change modal title
    document.querySelector('#modalResponsavel h2').innerText = 'Editar Responsável';

    openModal('modalResponsavel');
}

function deleteResponsavel(id) {
    showConfirmation('Tem certeza que deseja excluir este responsável? Esta ação não pode ser desfeita.', async () => {
        try {
            const res = await fetch(`${API_URL}/responsaveis/${id}`, {
                method: 'DELETE'
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

// Children Management Functions
let childCounter = 0;

function addChildRow(childData = null) {
    const childrenList = document.getElementById('childrenList');
    const childId = childData?.id || null;
    const index = childCounter++;

    const childRow = document.createElement('div');
    childRow.className = 'child-row';
    childRow.dataset.index = index;
    if (childId) childRow.dataset.childId = childId;

    childRow.innerHTML = `
        <div class="child-row-header">
            <strong>Criança ${index + 1}</strong>
            <button type="button" class="btn" style="padding: 4px 8px; background: var(--danger); color: white;" onclick="removeChildRow(${index})">Remover</button>
        </div>
        <div class="child-row-fields">
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Nome</label>
                <input type="text" class="child-nome" value="${childData?.nome || ''}" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Escola</label>
                <input type="text" class="child-escola" value="${childData?.escola || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Horário Entrada</label>
                <input type="time" class="child-entrada" value="${childData?.horario_entrada || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <label>Horário Saída</label>
                <input type="time" class="child-saida" value="${childData?.horario_saida || ''}">
            </div>
        </div>
    `;

    childrenList.appendChild(childRow);
}

function removeChildRow(index) {
    const childRow = document.querySelector(`.child-row[data-index="${index}"]`);
    if (childRow) {
        childRow.remove();
    }
}

function getChildrenData() {
    const childRows = document.querySelectorAll('.child-row');
    const children = [];

    childRows.forEach(row => {
        const nome = row.querySelector('.child-nome').value;
        const escola = row.querySelector('.child-escola').value;
        const horarioEntrada = row.querySelector('.child-entrada').value;
        const horarioSaida = row.querySelector('.child-saida').value;
        const childId = row.dataset.childId;

        if (nome) {
            children.push({
                id: childId ? parseInt(childId) : null,
                nome,
                escola,
                horarioEntrada,
                horarioSaida
            });
        }
    });

    return children;
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
});
