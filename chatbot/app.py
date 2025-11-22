# -*- coding: utf-8 -*-
# Flask API para servir o chatbot
from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot_model import EscolaVaiChatbot
import os
import sys

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# Inicializa o chatbot
print("Inicializando chatbot...")
chatbot = EscolaVaiChatbot()

# Armazena histórico de conversas por sessão (em produção, usar Redis ou banco)
conversation_history = {}

# Respostas detalhadas para follow-up
detailed_responses = {
    "cadastro": """📋 PASSO A PASSO PARA CADASTROS:

🔹 RESPONSÁVEL:
   1️⃣ Acesse 'Responsáveis' no menu lateral
   2️⃣ Clique em '+ Novo Responsável'
   3️⃣ Preencha: Nome, CPF, RG, Telefone, Email, Endereço e Senha
   4️⃣ Clique em 'Salvar'

🔹 CRIANÇA:
   1️⃣ Acesse 'Crianças' no menu
   2️⃣ Clique em '+ Nova Criança'
   3️⃣ Preencha: Nome, Data de Nascimento
   4️⃣ Selecione: Escola e Responsável
   5️⃣ Escolha: Tipo de Transporte (Ida e Volta, Só Ida, Só Volta)
   6️⃣ Informe: Valor do Contrato Anual
   7️⃣ Clique em 'Salvar'

🔹 ESCOLA:
   1️⃣ Acesse 'Escolas' no menu
   2️⃣ Clique em '+ Nova Escola'
   3️⃣ Preencha: Nome, Endereço, Telefone
   4️⃣ Clique em 'Salvar'""",
    
    "crianca": """👶 CADASTRO DE CRIANÇA - PASSO A PASSO:

1️⃣ No menu lateral, clique em 'Crianças'

2️⃣ Clique no botão '+ Nova Criança' (canto superior direito)

3️⃣ Preencha os campos obrigatórios:
   ✓ Nome completo da criança
   ✓ Data de nascimento
   ✓ Selecione a escola (deve estar previamente cadastrada)
   ✓ Selecione o responsável (deve estar previamente cadastrado)
   ✓ Tipo de transporte: Ida e Volta, Só Ida ou Só Volta
   ✓ Valor do contrato anual (em R$)
   ✓ Data de início do contrato

4️⃣ Clique em 'Salvar'

✅ A criança aparecerá na lista e os pagamentos serão gerados automaticamente!""",
    
    "pagamento": """💰 INFORMAÇÕES SOBRE PAGAMENTOS:

📅 VENCIMENTO: Todo dia 5 de cada mês

🔄 COMO FUNCIONA:
   • Os pagamentos são gerados automaticamente ao cadastrar uma criança
   • O valor anual é dividido em 12 parcelas mensais
   • Cada parcela vence no dia 5 do mês

🎨 STATUS:
   🟡 Pendente - Aguardando pagamento
   🟢 Pago - Pagamento confirmado
   🔴 Vencido - Passou da data de vencimento

✏️ COMO ATUALIZAR:
   1️⃣ Acesse 'Pagamentos' no menu
   2️⃣ Encontre o responsável
   3️⃣ Clique na seta para expandir
   4️⃣ Clique em 'Editar' no pagamento desejado
   5️⃣ Altere o status para 'Pago'
   6️⃣ Salve as alterações""",
    
    "contrato": """📄 GERAR CONTRATO EM PDF:

1️⃣ Acesse 'Responsáveis' no menu lateral

2️⃣ Encontre o responsável desejado na lista

3️⃣ Na coluna 'Ações', clique no botão 'PDF' (ícone de documento)

4️⃣ O contrato será gerado automaticamente em PDF

5️⃣ O arquivo será baixado para seu computador

📋 O CONTRATO INCLUI:
   ✓ Dados do contratado (administrador)
   ✓ Dados do contratante (responsável)
   ✓ Informações das crianças vinculadas
   ✓ Valor total anual
   ✓ Termos e condições do serviço
   ✓ Assinaturas""",
    
    "responsavel": """👤 GERENCIAMENTO DE RESPONSÁVEIS:

📋 O QUE VOCÊ PODE FAZER:
   ✓ Cadastrar novos responsáveis
   ✓ Editar dados (telefone, endereço, etc)
   ✓ Gerar contratos em PDF
   ✓ Visualizar crianças vinculadas

🔍 COMO ACESSAR:
   1️⃣ Clique em 'Responsáveis' no menu lateral
   2️⃣ Use a barra de pesquisa para encontrar alguém
   3️⃣ Clique nos ícones de ação para Editar ou Gerar PDF

💡 DICA: O responsável é quem assina o contrato e realiza os pagamentos.""",

    "dashboard": """📊 DETALHES SOBRE O DASHBOARD:

📈 CARDS PRINCIPAIS:

1️⃣ Total Responsáveis
   → Quantidade de responsáveis cadastrados

2️⃣ Crianças Cadastradas
   → Total de alunos no sistema

3️⃣ Pagamentos Pendentes
   → Valor total a receber

4️⃣ Escolas Ativas
   → Número de escolas cadastradas

💡 COMO USAR:
   • Os cards são atualizados automaticamente
   • Clique nos itens do menu lateral para acessar cada seção
   • Use o dashboard para ter uma visão geral do sistema
   • Os números são calculados em tempo real"""
}

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint para receber mensagens do chatbot"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        if not message:
            return jsonify({'error': 'Mensagem vazia'}), 400
        
        # Inicializa histórico da sessão se não existir
        if session_id not in conversation_history:
            conversation_history[session_id] = []
        
        # ===== DETECÇÃO EXPLÍCITA DE TÓPICOS FORA DO ESCOPO =====
        message_lower = message.lower()
        
        # Palavras-chave que claramente não têm relação com o sistema
        out_of_scope_keywords = [
            # Veículos e transporte não escolar
            'carro', 'moto', 'bicicleta', 'caminhão', 'avião', 'navio', 'trem',
            'comprar carro', 'vender carro', 'dirigir', 'carteira de motorista',
            # Viagens e turismo
            'viajar', 'viagem', 'europa', 'férias', 'hotel', 'passagem', 'turismo',
            'praia', 'montanha', 'paris', 'londres', 'nova york',
            # Comida e culinária
            'receita', 'cozinhar', 'comida', 'restaurante', 'pizza', 'hamburguer',
            # Esportes
            'futebol', 'basquete', 'jogo', 'time', 'campeonato',
            # Tecnologia não relacionada
            'celular', 'smartphone', 'computador', 'notebook', 'tablet',
            'comprar celular', 'qual celular', 'melhor notebook',
            # Entretenimento
            'filme', 'série', 'netflix', 'música', 'cantor', 'banda',
            # Saúde não relacionada
            'médico', 'hospital', 'remédio', 'doença', 'sintoma',
            # Outros
            'clima', 'tempo', 'previsão', 'chuva', 'sol',
            'política', 'eleição', 'presidente', 'governo',
            'religião', 'igreja', 'deus',
            'namoro', 'relacionamento', 'amor'
        ]
        
        # Verifica se a mensagem contém palavras claramente fora do escopo
        if any(keyword in message_lower for keyword in out_of_scope_keywords):
            # Verifica se não menciona palavras do sistema junto
            system_keywords = ['escola', 'criança', 'crianca', 'responsável', 'responsavel', 
                             'pagamento', 'cadastro', 'contrato', 'dashboard', 'aluno']
            
            # Se não menciona nada do sistema, é claramente fora do escopo
            if not any(sys_keyword in message_lower for sys_keyword in system_keywords):
                return jsonify({
                    'response': '🤖 Desculpe, só posso ajudar com informações sobre o sistema Escola Vai.\n\n📋 Posso responder sobre:\n   • Cadastros (Responsáveis, Crianças, Escolas)\n   • Pagamentos e vencimentos\n   • Contratos em PDF\n   • Dashboard e métricas\n   • Navegação do sistema\n\n💬 Como posso ajudar com o sistema?',
                    'intent': 'out_of_scope'
                })
        
        # Processa mensagem com ML
        result = chatbot.get_response(message)
        
        # ===== DETECÇÃO INTELIGENTE DE CONTEXTO =====
        message_lower = message.lower()
        
        # Detecta tipo específico de cadastro
        if result['intent'] == 'cadastro':
            # Palavras-chave para cada tipo
            if any(word in message_lower for word in ['criança', 'crianca', 'filho', 'filha', 'aluno', 'estudante']):
                result['response'] = detailed_responses['crianca']
                result['intent'] = 'cadastro_crianca'
            elif any(word in message_lower for word in ['responsável', 'responsavel', 'pai', 'mãe', 'mae', 'tutor']):
                result['response'] = """👤 CADASTRO DE RESPONSÁVEL - PASSO A PASSO:

1️⃣ No menu lateral, clique em 'Responsáveis'

2️⃣ Clique no botão '+ Novo Responsável' (canto superior direito)

3️⃣ Preencha os campos obrigatórios:
   ✓ Nome completo
   ✓ CPF (formato: 000.000.000-00)
   ✓ RG
   ✓ Telefone (formato: (00) 00000-0000)
   ✓ Email
   ✓ Endereço completo
   ✓ Senha (para acesso ao sistema)

4️⃣ Clique em 'Salvar'

✅ O responsável aparecerá na lista e poderá ser vinculado a crianças!"""
                result['intent'] = 'cadastro_responsavel'
            elif any(word in message_lower for word in ['escola', 'colégio', 'colegio', 'instituição', 'instituicao']):
                result['response'] = """🏫 CADASTRO DE ESCOLA - PASSO A PASSO:

1️⃣ No menu lateral, clique em 'Escolas'

2️⃣ Clique no botão '+ Nova Escola' (canto superior direito)

3️⃣ Preencha os campos:
   ✓ Nome da escola
   ✓ Endereço completo
   ✓ Telefone de contato

4️⃣ Clique em 'Salvar'

✅ A escola aparecerá na lista e poderá ser vinculada a crianças!

⚠️ IMPORTANTE: As escolas devem ser cadastradas antes de cadastrar crianças."""
                result['intent'] = 'cadastro_escola'
        
        # Detecta perguntas específicas sobre criança mesmo sem palavra "cadastro"
        elif result['intent'] == 'crianca':
            if any(word in message_lower for word in ['cadastrar', 'adicionar', 'criar', 'registrar', 'como', 'onde']):
                result['response'] = detailed_responses['crianca']
                result['intent'] = 'crianca_cadastro'
        
        # Detecta perguntas específicas sobre escola
        elif result['intent'] == 'escola':
            if any(word in message_lower for word in ['cadastrar', 'adicionar', 'criar', 'registrar', 'como', 'onde']):
                result['response'] = """🏫 CADASTRO DE ESCOLA - PASSO A PASSO:

1️⃣ No menu lateral, clique em 'Escolas'

2️⃣ Clique no botão '+ Nova Escola' (canto superior direito)

3️⃣ Preencha os campos:
   ✓ Nome da escola
   ✓ Endereço completo
   ✓ Telefone de contato

4️⃣ Clique em 'Salvar'

✅ A escola aparecerá na lista e poderá ser vinculada a crianças!"""
                result['intent'] = 'escola_cadastro'

        # Detecta perguntas específicas sobre responsável
        elif result['intent'] == 'responsavel':
            if any(word in message_lower for word in ['cadastrar', 'adicionar', 'criar', 'registrar', 'como', 'onde', 'novo']):
                result['response'] = """👤 CADASTRO DE RESPONSÁVEL - PASSO A PASSO:

1️⃣ No menu lateral, clique em 'Responsáveis'

2️⃣ Clique no botão '+ Nova Responsável' (canto superior direito)

3️⃣ Preencha os campos obrigatórios:
   ✓ Nome completo
   ✓ CPF (formato: 000.000.000-00)
   ✓ RG
   ✓ Telefone (formato: (00) 00000-0000)
   ✓ Email
   ✓ Endereço completo
   ✓ Senha (para acesso ao sistema)

4️⃣ Clique em 'Salvar'

✅ O responsável aparecerá na lista e poderá ser vinculado a crianças!"""
                result['intent'] = 'responsavel_cadastro'
        
        # Detecta pedidos de mais detalhes
        follow_up_keywords = ['mais detalhes', 'passo a passo', 'como faço', 'explique melhor', 
                             'detalhe', 'detalhes', 'mais informações', 'me explica',
                             'não entendi', 'pode explicar', 'como funciona']
        
        is_follow_up = any(keyword in message_lower for keyword in follow_up_keywords)
        
        # Se for pedido de mais detalhes e há histórico
        if is_follow_up and len(conversation_history[session_id]) > 0:
            last_intent = conversation_history[session_id][-1].get('intent')
            # Remove sufixos _detailed, _cadastro, etc para pegar o intent base
            base_intent = last_intent.split('_')[0]
            if base_intent in detailed_responses:
                result['response'] = detailed_responses[base_intent]
                result['intent'] = f"{last_intent}_detailed"
        
        # Armazena no histórico
        conversation_history[session_id].append({
            'message': message,
            'intent': result['intent'],
            'response': result['response']
        })
        
        # Limita histórico a últimas 10 mensagens
        if len(conversation_history[session_id]) > 10:
            conversation_history[session_id] = conversation_history[session_id][-10:]
        
        return jsonify({
            'response': result['response'],
            'intent': result['intent']
        })
    
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/health', methods=['GET'])
def health():
    """Verifica se o serviço está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'Chatbot está funcionando!'
    })

if __name__ == '__main__':
    print("Servidor Flask iniciado na porta 5000")
    print("Endpoint: http://localhost:5000/api/chat")
    app.run(host='0.0.0.0', port=5000, debug=True)
