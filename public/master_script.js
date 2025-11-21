const API_URL = 'http://localhost:3000/api';

let currentUser = null;
let usuarios = [];
let editingUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user || user.role !== 'master') {
        window.location.href = 'login.html';
        return;
    }

    currentUser = user;
    document.getElementById('userName').textContent = user.nome;

    loadUsuarios();
});

// Load Users
async function loadUsuarios() {
    try {
        const res = await fetch(`${API_URL}/admin-users`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (res.ok) {
            usuarios = await res.json();
            renderUsersTable();
            updateStatistics();
        } else {
            showNotification('Erro ao carregar usuários', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao carregar usuários', 'error');
    }
}

// Render Users Table
function renderUsersTable() {
    const tbody = document.querySelector('#tableUsuarios tbody');
    tbody.innerHTML = usuarios.map(u => {
        const isActive = u.active === 1 || u.active === true;
        const statusBadge = isActive
            ? '<span class="status-badge status-paid">Ativo</span>'
            : '<span class="status-badge status-late">Inativo</span>';

        const toggleButton = u.role !== 'master'
            ? `<button class="btn btn-sm" style="background: ${isActive ? '#F59E0B' : '#10B981'};" onclick="toggleUserActive(${u.id}, ${isActive}, '${u.type}')">${isActive ? '🔒' : '✅'}</button>`
            : '';

        const editButton = `<button class="btn btn-sm btn-primary" onclick="editUser(${u.id}, '${u.type}')">✏️</button>`;
        const deleteButton = u.role !== 'master'
            ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id}, '${u.type}')">🗑️</button>`
            : '';

        return `
        <tr>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td><span class="badge badge-${u.role}">${u.role === 'master' ? 'Master' : u.role === 'admin' ? 'Admin' : 'Cliente'}</span></td>
            <td>${statusBadge}</td>
            <td class="action-buttons">
                ${toggleButton}
                ${editButton}
                ${deleteButton}
            </td>
        </tr>
    `}).join('');
}

// Update Statistics
function updateStatistics() {
    const totalUsuarios = usuarios.length;
    const totalAdmins = usuarios.filter(u => u.role === 'admin').length;
    const totalClientes = usuarios.filter(u => u.role === 'cliente').length;
    const totalAtivos = usuarios.filter(u => u.active === 1 || u.active === true).length;

    document.getElementById('totalUsuarios').textContent = totalUsuarios;
    document.getElementById('totalAdmins').textContent = totalAdmins;
    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('totalAtivos').textContent = totalAtivos;
}

// Open User Modal
function openUserModal(userId = null, type = 'admin') {
    editingUserId = userId;
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');

    // Store type in a hidden field or dataset if needed, or just use global/closure
    // For simplicity, let's assume we are editing the type passed
    form.dataset.userType = type;

    if (userId) {
        const user = usuarios.find(u => u.id === userId && u.type === type);
        document.getElementById('modalTitle').textContent = 'Editar Usuário';
        document.getElementById('userId').value = user.id;
        document.getElementById('userNome').value = user.nome;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = '';
        document.getElementById('userPassword').required = false;
        document.getElementById('userPassword').placeholder = 'Deixe em branco para manter';
        document.getElementById('userRole').value = user.role;

        // Disable role change for clients if desired, or allow promoting? 
        // For now, let's keep it simple.
        if (type === 'responsavel') {
            document.getElementById('userRole').disabled = true;
        } else {
            document.getElementById('userRole').disabled = false;
        }

    } else {
        document.getElementById('modalTitle').textContent = 'Novo Usuário';
        form.reset();
        document.getElementById('userId').value = ''; // Explicitly clear hidden ID
        document.getElementById('userPassword').required = true;
        document.getElementById('userPassword').placeholder = '';
        document.getElementById('userRole').disabled = false;

        // Remove 'cliente' option if it exists, or ensure only 'admin' is selectable
        // Assuming the select has options: Admin, Cliente (maybe Master?)
        const roleSelect = document.getElementById('userRole');
        for (let i = 0; i < roleSelect.options.length; i++) {
            if (roleSelect.options[i].value === 'cliente' || roleSelect.options[i].value === 'responsavel') {
                roleSelect.options[i].style.display = 'none'; // Hide it
                // Or remove it: roleSelect.remove(i);
            }
        }
        // Select admin by default
        roleSelect.value = 'admin';

        form.dataset.userType = 'admin';
    }

    modal.style.display = 'flex';
}

// Close User Modal
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    editingUserId = null;
}

// Save User
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('userId').value;
    const nome = document.getElementById('userNome').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const type = document.getElementById('userForm').dataset.userType || 'admin';

    const userData = { nome, email, role };
    if (password) userData.password = password;

    try {
        let url = id ? `${API_URL}/admin-users/${id}` : `${API_URL}/admin-users`;
        if (id) url += `?type=${type}`;

        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            showNotification(id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!', 'success');
            closeUserModal();
            loadUsuarios();
        } else {
            const data = await res.json();
            showNotification(data.error || 'Erro ao salvar usuário', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao salvar usuário', 'error');
    }
});

// Edit User
function editUser(id, type) {
    openUserModal(id, type);
}

// Delete User
function deleteUser(id, type) {
    showConfirmation('Tem certeza que deseja excluir este usuário?', async () => {
        try {
            const res = await fetch(`${API_URL}/admin-users/${id}?type=${type}`, {
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

// Toggle User Active
async function toggleUserActive(id, currentStatus, type) {
    const action = currentStatus ? 'desativar' : 'ativar';
    showConfirmation(`Tem certeza que deseja ${action} este usuário?`, async () => {
        try {
            const res = await fetch(`${API_URL}/admin-users/${id}/toggle-active?type=${type}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });

            if (res.ok) {
                const data = await res.json();
                showNotification(data.message, 'success');
                loadUsuarios();
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

// Show Section
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    if (section === 'users') {
        document.getElementById('usersSection').style.display = 'block';
        document.getElementById('pageTitle').textContent = 'Gerenciar Usuários';
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (section === 'profile') {
        document.getElementById('profileSection').style.display = 'block';
        document.getElementById('pageTitle').textContent = 'Meu Perfil';
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        loadProfile();
    }
}

// Load Profile
function loadProfile() {
    document.getElementById('profileNome').value = currentUser.nome;
    document.getElementById('profileEmail').value = currentUser.email;
}

// Save Profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('profileNome').value;
    const email = document.getElementById('profileEmail').value;
    const password = document.getElementById('profilePassword').value;

    const profileData = { nome, email };
    if (password) profileData.password = password;

    try {
        const res = await fetch(`${API_URL}/admin-users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(profileData)
        });

        if (res.ok) {
            currentUser.nome = nome;
            currentUser.email = email;
            localStorage.setItem('user', JSON.stringify(currentUser));
            document.getElementById('userName').textContent = nome;
            showNotification('Perfil atualizado com sucesso!', 'success');
        } else {
            const data = await res.json();
            showNotification(data.error || 'Erro ao atualizar perfil', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Erro ao atualizar perfil', 'error');
    }
});

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Notification System
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
                <span>Sistema</span>
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
                <span>Confirmação</span>
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
                    background-color: transparent;
                    color: #9CA3AF;
                    transition: 0.3s;
                ">Cancelar</button>
                <button onclick="confirmAction()" style="
                    padding: 8px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    background-color: #4F46E5;
                    color: white;
                    transition: 0.3s;
                ">Confirmar</button>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';

    window.confirmAction = () => {
        closeNotification();
        onConfirm();
    };
}
