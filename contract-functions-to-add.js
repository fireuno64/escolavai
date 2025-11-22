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
