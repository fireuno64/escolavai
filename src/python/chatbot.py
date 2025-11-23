
import sys
import json
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle
import os

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# ==========================================
# DEFINIÇÃO DAS RESPOSTAS DETALHADAS
# ==========================================
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
   ✓ Assinaturas

⚠️ MULTAS E PENALIDADES:
   • Atraso no pagamento: Multa de 2% sobre o valor da parcela
   • Cancelamento fora das condições permitidas: Multa de até 30% proporcional ao período restante
   • Cancelamento NÃO permitido nos meses de Novembro, Dezembro e Janeiro
   • Mudança de endereço com aviso prévio de 72h: SEM multa""",
    
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
   • Os números são calculados em tempo real""",
    
    "multa_atraso": """⏰ MULTA POR ATRASO DE PAGAMENTO:

📌 REGRA: Multa de 2% sobre o valor da parcela

📅 VENCIMENTO: Todo dia 5 de cada mês

💡 EXEMPLO:
   • Parcela: R$ 500,00
   • Multa (2%): R$ 10,00
   • Total com atraso: R$ 510,00

⚠️ IMPORTANTE:
   • A multa é aplicada automaticamente após o vencimento
   • Pagamentos em dia evitam custos adicionais
   • Consulte a seção 'Pagamentos' para verificar status""",
    
    "multa_cancelamento": """❌ MULTA POR CANCELAMENTO DE CONTRATO:

📌 REGRA GERAL:
   • Multa de até 30% do valor total
   • Proporcional ao período restante do contrato
   • Calculada sobre os meses que faltam até o término

🚫 PERÍODOS BLOQUEADOS:
   • Cancelamento NÃO permitido em: Novembro, Dezembro e Janeiro
   • Nestes meses, o contrato deve ser mantido

✅ CANCELAMENTO SEM MULTA:
   • Mudança de endereço (com aviso de 72h)
   • Indisciplina do aluno (após notificação)
   • Acordo mútuo entre as partes

💡 EXEMPLO:
   • Contrato anual: R$ 6.000,00
   • Faltam 6 meses: R$ 3.000,00
   • Multa (30%): R$ 900,00

📋 Para cancelar, entre em contato com o administrador.""",
    
    "termos_contrato": """📜 PRINCIPAIS TERMOS DO CONTRATO:

🔹 CLÁUSULA 1ª - OBJETO:
   • Transporte escolar do aluno entre residência e escola
   • Tipos: Ida e Volta, Somente Ida, ou Somente Volta

🔹 CLÁUSULA 2ª - VALOR:
   • Valor anual dividido em 12 parcelas mensais
   • Pagamento: 1º ao 5º dia útil de cada mês
   • Desconto de 5% para pagamento à vista

🔹 CLÁUSULA 4ª - VIGÊNCIA:
   • Duração: 12 meses a partir da data de início
   • Renovação mediante novo contrato

🔹 CLÁUSULA 5ª - PONTUALIDADE:
   • Aluno deve estar pronto no horário estabelecido
   • Transportador não pode esperar

🔹 CLÁUSULA 6ª - RESPONSABILIDADE:
   • Transportador responsável pela integridade física e moral
   • Durante o período em que o aluno estiver no veículo

🔹 CLÁUSULA 7ª - FALTAS:
   • Faltas ou licenças não isentam pagamento
   • Paralizações escolares não afetam mensalidade

🔹 CLÁUSULA 8ª - INDISCIPLINA:
   • Notificação ao responsável e escola
   • Possível rescisão sem multa em caso de reincidência

🔹 CLÁUSULA 9ª - MUDANÇA DE ENDEREÇO:
   • Aviso prévio de 72 horas por escrito
   • Cancelamento sem multa neste caso

🔹 CLÁUSULA 10ª - RESCISÃO:
   • Multa de até 30% para quem der causa
   • Proibido cancelar em Nov, Dez e Jan

🔹 CLÁUSULA 12ª - FÉRIAS E FERIADOS:
   • Sem transporte nos meses de férias
   • Dois dias por ano para vistoria (com aviso)
   • Feriados prolongados sem transporte
   • Excursões: transporte apenas em horário normal"""
}

# ==========================================
# CLASSE DO CHATBOT
# ==========================================
class EscolaVaiChatbot:
    def __init__(self):
        self.pipeline = None
        self.intents = self.load_intents()
        self.train()
    
    def load_intents(self):
        """Define intents e respostas do chatbot"""
        return {
            "saudacao": {
                "patterns": [
                    "oi", "olá", "ola", "bom dia", "boa tarde", "boa noite",
                    "hey", "e ai", "opa", "alo", "alô", "eai", "oii", "oie",
                    "oi tudo bem", "olá tudo bem", "oi como vai", "olá como vai",
                    "bom dia tudo bem", "boa tarde tudo bem", "boa noite tudo bem",
                    "oi bot", "olá bot", "oi chatbot", "olá chatbot",
                    "oi assistente", "olá assistente", "oi sistema", "olá sistema",
                    "oi escola vai", "olá escola vai", "oi robo", "olá robo",
                    "oi robô", "olá robô", "oi ai", "olá ai",
                    "oi!", "olá!", "ola!", "hey!", "opa!", "eai!",
                    "oii!", "oie!", "alô!", "alo!"
                ],
                "responses": [
                    "Olá! Sou o assistente virtual da Escola Vai. Como posso ajudar?",
                    "Oi! Em que posso ajudá-lo hoje?",
                    "Olá! Estou aqui para ajudar com suas dúvidas sobre o sistema.",
                    "Oi! Seja bem-vindo! Como posso auxiliar?",
                    "Olá! Prazer em atendê-lo. O que você gostaria de saber?"
                ]
            },
            "pagamento": {
                "patterns": [
                    "pagamento", "pagar", "mensalidade", "valor", "quanto custa",
                    "preço", "parcela", "vencimento", "quando vence", "data pagamento",
                    "boleto", "fatura", "cobrança",
                    "fale sobre pagamentos", "me explique sobre pagamentos", "como funcionam os pagamentos",
                    "quero saber sobre pagamentos", "informações de pagamento", "detalhes do pagamento",
                    "sobre pagamento", "explica pagamento", "dúvida pagamento",
                    "pagamentos atrasados", "pagamentos em dia", "histórico de pagamentos",
                    "o que é pagamento", "o que são pagamentos", "pra que serve pagamento",
                    "pagamneto", "pagmento", "pagameto", "vencimneto" # Typos comuns
                ],
                "responses": [
                    "Os pagamentos vencem todo dia 5 de cada mês. Você pode visualizar todos os pagamentos pendentes na seção 'Pagamentos' do sistema.",
                    "As mensalidades são geradas automaticamente e vencem no dia 5 de cada mês. O valor é dividido em 12 parcelas anuais."
                ]
            },
            "contrato": {
                "patterns": [
                    "contrato", "acordo", "documento", "pdf", "gerar contrato",
                    "baixar contrato", "imprimir contrato", "como gerar",
                    "o que é contrato", "pra que serve contrato", "onde fica contrato",
                    "termos do contrato", "cláusulas", "clausulas", "condições do contrato",
                    "contarto", "contrata", "ducumento" # Typos comuns
                ],
                "responses": [
                    "Para gerar um contrato, vá até a seção 'Responsáveis', encontre o responsável desejado e clique no botão 'PDF'. O contrato será gerado automaticamente.",
                    "Você pode gerar contratos em PDF na tela de Responsáveis. Basta clicar no botão 'PDF' ao lado do nome do responsável."
                ]
            },
            "multa_atraso": {
                "patterns": [
                    "multa", "multa de atraso", "multa atraso", "atraso", "atrasado",
                    "pagar atrasado", "pagamento atrasado", "juros", "mora",
                    "quanto é a multa", "qual a multa", "valor da multa",
                    "multa por atraso", "penalidade atraso", "taxa de atraso",
                    "atrasei o pagamento", "paguei atrasado", "venceu",
                    "multa de pagamento", "multa pagamento"
                ],
                "responses": [
                    "A multa por atraso de pagamento é de 2% sobre o valor da parcela. Por exemplo, se a parcela é R$ 500, a multa será R$ 10. O vencimento é sempre no dia 5 de cada mês."
                ]
            },
            "multa_cancelamento": {
                "patterns": [
                    "cancelar", "cancelamento", "rescindir", "rescisão", "rescisao",
                    "multa de cancelamento", "multa cancelamento", "cancelar contrato",
                    "quero cancelar", "como cancelar", "posso cancelar",
                    "desistir", "desistência", "romper contrato",
                    "multa por cancelar", "penalidade cancelamento",
                    "quanto pago para cancelar", "valor para cancelar",
                    "sair do contrato", "encerrar contrato"
                ],
                "responses": [
                    "A multa por cancelamento é de até 30% do valor total, proporcional ao período restante. IMPORTANTE: Cancelamento NÃO é permitido em Novembro, Dezembro e Janeiro. Mudança de endereço com aviso de 72h não gera multa."
                ]
            },
            "termos_contrato": {
                "patterns": [
                    "termos", "cláusulas", "clausulas", "condições", "condicoes",
                    "regras do contrato", "o que diz o contrato", "detalhes do contrato",
                    "termos do contrato", "condições do contrato",
                    "cláusula", "clausula", "regra", "norma",
                    "o que está no contrato", "conteúdo do contrato"
                ],
                "responses": [
                    "O contrato possui 12 cláusulas principais cobrindo: objeto do serviço, valor e pagamento, vigência, pontualidade, responsabilidade, faltas, indisciplina, mudança de endereço, rescisão, reajuste, foro e férias. Posso detalhar alguma cláusula específica?"
                ]
            },
            "cadastro": {
                "patterns": [
                    "cadastrar", "adicionar", "novo", "criar", "registrar",
                    "cadastro", "incluir", "inserir",
                    "como cadastrar", "como adicionar", "como criar", "como registrar",
                    "cadastrar responsável", "adicionar responsável", "novo responsável",
                    "criar responsável", "registrar responsável", "incluir responsável",
                    "cadastrar criança", "adicionar criança", "nova criança",
                    "criar criança", "registrar criança", "incluir criança",
                    "cadastrar escola", "adicionar escola", "nova escola",
                    "criar escola", "registrar escola", "incluir escola",
                    "como faço cadastro", "como faço para cadastrar",
                    "quero cadastrar", "preciso cadastrar", "vou cadastrar",
                    "onde cadastro", "onde cadastrar", "onde adiciono",
                    "fazer cadastro", "fazer registro", "realizar cadastro",
                    "cadastrar novo", "adicionar novo", "criar novo",
                    "cadastro de responsável", "cadastro de criança", "cadastro de escola",
                    "registro de responsável", "registro de criança", "registro de escola",
                    "o que é cadastro", "pra que serve cadastro",
                    "cadastror", "cadastra", "resgistrar" # Typos comuns
                ],
                "responses": [
                    "Para cadastrar um novo responsável, clique em '+ Novo Responsável' na seção de Responsáveis. Para cadastrar uma criança, use o botão '+ Nova Criança'.",
                    "Você pode cadastrar responsáveis, crianças e escolas através dos botões '+ Novo' em cada seção do sistema.",
                    "Para fazer cadastros, acesse a seção desejada (Responsáveis, Crianças ou Escolas) e clique no botão '+ Novo' correspondente."
                ]
            },
            "escola": {
                "patterns": [
                    "escola", "colégio", "instituição", "ensino",
                    "cadastrar escola", "adicionar escola", "nova escola",
                    "criar escola", "registrar escola", "incluir escola",
                    "escolas", "colégios", "instituições",
                    "como cadastrar escola", "como adicionar escola",
                    "onde cadastro escola", "onde adiciono escola",
                    "gerenciar escola", "gerenciar escolas",
                    "lista de escolas", "listar escolas", "ver escolas",
                    "editar escola", "atualizar escola", "modificar escola",
                    "excluir escola", "deletar escola", "remover escola",
                    "escola ativa", "escolas ativas", "quantas escolas",
                    "informações da escola", "dados da escola",
                    "nome da escola", "endereço da escola", "telefone da escola",
                    "o que é escola", "o que são escolas", "pra que serve escola",
                    "escolas cadastradas", "cadastro de escola",
                    "escola", "escolas", "colegio", "instituicao"
                ],
                "responses": [
                    "Para gerenciar escolas, acesse a seção 'Escolas' no menu. Lá você pode adicionar, editar ou remover escolas do sistema.",
                    "As escolas podem ser cadastradas na seção 'Escolas'. Cada criança deve estar vinculada a uma escola.",
                    "Na seção Escolas você pode cadastrar novas instituições, editar informações ou visualizar todas as escolas ativas no sistema."
                ]
            },
            "crianca": {
                "patterns": [
                    "criança", "aluno", "estudante", "filho", "filha",
                    "cadastrar criança", "adicionar criança", "nova criança",
                    "criar criança", "registrar criança", "incluir criança",
                    "crianças", "alunos", "estudantes", "filhos",
                    "como cadastrar criança", "como adicionar criança",
                    "onde cadastro criança", "onde adiciono criança",
                    "cadastro de criança", "registro de criança",
                    "cadastro de aluno", "registro de aluno",
                    "cadastro de filho", "registro de filho",
                    "gerenciar criança", "gerenciar crianças", "gerenciar alunos",
                    "lista de crianças", "listar crianças", "ver crianças",
                    "editar criança", "atualizar criança", "modificar criança",
                    "excluir criança", "deletar criança", "remover criança",
                    "vincular criança", "associar criança",
                    "criança e escola", "criança e responsável",
                    "dados da criança", "informações da criança",
                    "nome da criança", "idade da criança", "escola da criança",
                    "quantas crianças", "total de crianças", "crianças cadastradas",
                    "o que é criança", "o que é aluno", "cadastro de crianças",
                    "crianca", "criancas", "alunno", "estudante" # Typos
                ],
                "responses": [
                    "Para cadastrar uma criança, vá em 'Crianças' e clique em '+ Nova Criança'. Você precisará informar nome, data de nascimento, escola e responsável.",
                    "Cada criança deve estar vinculada a um responsável e uma escola. O cadastro é feito na seção 'Crianças'.",
                    "Na seção Crianças você pode cadastrar novos alunos, editar informações e vincular cada criança ao seu responsável e escola."
                ]
            },
            "ajuda": {
                "patterns": [
                    "ajuda", "help", "socorro", "não sei", "como funciona",
                    "tutorial", "instruções", "dúvida", "problema",
                    "o que fazer", "estou perdido", "me ajuda"
                ],
                "responses": [
                    "Posso ajudar com: Pagamentos, Contratos, Cadastros, Escolas e Crianças. Sobre o que você gostaria de saber?",
                    "Estou aqui para ajudar! Você pode me perguntar sobre pagamentos, contratos, cadastros ou qualquer funcionalidade do sistema."
                ]
            },
            "despedida": {
                "patterns": [
                    "tchau", "até logo", "adeus", "falou", "bye",
                    "até mais", "obrigado", "obrigada", "valeu",
                    "ok", "ok obrigado", "ok obrigada", "ok valeu",
                    "tá bom", "ta bom", "beleza", "beleza obrigado",
                    "entendi", "entendi obrigado", "entendi obrigada",
                    "certo", "certo obrigado", "certo obrigada",
                    "muito obrigado", "muito obrigada", "muitíssimo obrigado",
                    "agradeço", "grato", "grata", "agradecido", "agradecida",
                    "obg", "vlw", "tmj", "flw",
                    "ok tchau", "ok até logo", "beleza tchau",
                    "entendi tchau", "certo tchau", "valeu tchau",
                    "obrigado pela ajuda", "obrigada pela ajuda",
                    "obrigado pelo suporte", "obrigada pelo suporte",
                    "muito obrigado pela ajuda", "muito obrigada pela ajuda",
                    "ok entendi", "ok entendi obrigado", "ok entendi obrigada",
                    "tá bom obrigado", "ta bom obrigado", "tá bom obrigada",
                    "perfeito", "perfeito obrigado", "perfeito obrigada",
                    "ótimo", "otimo", "ótimo obrigado", "otimo obrigado"
                ],
                "responses": [
                    "Até logo! Se precisar de ajuda, estou sempre por aqui. 😊",
                    "Foi um prazer ajudar! Até a próxima! 👋",
                    "Tchau! Volte sempre que precisar. Estou à disposição!",
                    "Por nada! Fico feliz em ajudar. Até mais! 😊",
                    "De nada! Qualquer dúvida, é só chamar. Até logo!",
                    "Disponha! Estou aqui sempre que precisar. Até breve!",
                    "Que bom que pude ajudar! Até a próxima! 👋",
                    "Sempre às ordens! Volte quando quiser. Até mais!"
                ]
            },
            "responsavel": {
                "patterns": [
                    "responsável", "responsavel", "responsáveis", "responsaveis",
                    "pai", "mãe", "mae", "pais", "tutor", "tutores",
                    "ver responsável", "ver responsáveis", "listar responsável", "listar responsáveis",
                    "buscar responsável", "procurar responsável", "encontrar responsável",
                    "editar responsável", "alterar responsável", "modificar responsável",
                    "excluir responsável", "deletar responsável", "remover responsável",
                    "dados do responsável", "informações do responsável",
                    "cadastro de responsável", "novo responsável",
                    "gerenciar responsável", "gerenciar responsáveis",
                    "quantos responsáveis", "total de responsáveis",
                    "responsável financeiro", "responsável legal",
                    "vincular responsável", "associar responsável",
                    "telefone do responsável", "email do responsável", "endereço do responsável",
                    "cpf do responsável", "rg do responsável",
                    "o que é responsável", "o que são responsáveis", "pra que serve responsável",
                    "responsalvel", "responsave", "pais e maes" # Typos
                ],
                "responses": [
                    "Na seção 'Responsáveis' você pode gerenciar todos os pais e tutores. É possível cadastrar, editar, excluir e gerar contratos para cada responsável.",
                    "Os responsáveis são os pagadores e contratantes do serviço. Você pode gerenciá-los clicando em 'Responsáveis' no menu lateral.",
                    "Para acessar os dados dos responsáveis, vá para a seção 'Responsáveis'. Lá você encontra a lista completa com telefone, email e crianças vinculadas."
                ]
            },
            "dashboard": {
                "patterns": [
                    "dashboard", "painel", "visão geral", "resumo", "estatísticas",
                    "cards", "métricas", "números", "totais", "indicadores",
                    "o que é dashboard", "como funciona dashboard", "para que serve dashboard",
                    "responsáveis cadastrados", "crianças cadastradas", "pagamentos pendentes",
                    "escolas ativas", "quantos responsáveis", "quantas crianças",
                    "fale sobre dashboard", "me explique o dashboard", "quero saber sobre dashboard",
                    "tela inicial", "página inicial", "home", "inicio", "início",
                    "explica dashboard", "sobre dashboard", "detalhes dashboard",
                    "dashbord", "dashborad", "painel inicial" # Typos
                ],
                "responses": [
                    "O Dashboard é a tela inicial que mostra um resumo geral do sistema com 4 cards principais: Total de Responsáveis, Crianças Cadastradas, Pagamentos Pendentes e Escolas Ativas. É sua visão geral do sistema!",
                    "No Dashboard você encontra as principais métricas do sistema: número de responsáveis, crianças, pagamentos pendentes e escolas ativas. Use o menu lateral para acessar cada seção detalhadamente.",
                    "O painel Dashboard exibe cards com estatísticas importantes: Total Responsáveis (quantos responsáveis cadastrados), Crianças Cadastradas (total de alunos), Pagamentos Pendentes (valores a receber) e Escolas Ativas (escolas cadastradas)."
                ]
            },
            "perfil": {
                "patterns": [
                    "perfil", "meu perfil", "minha conta", "meus dados",
                    "alterar senha", "mudar senha", "trocar senha", "nova senha",
                    "editar perfil", "editar dados", "atualizar cadastro",
                    "mudar email", "alterar email", "trocar email",
                    "mudar endereço", "alterar endereço", "trocar endereço",
                    "como altero minha senha", "como editar meu perfil",
                    "onde mudo a senha", "esqueci a senha",
                    "configurações de conta", "meus dados pessoais",
                    "foto de perfil", "mudar foto", "alterar foto"
                ],
                "responses": [
                    "Para editar seus dados (senha, endereço, email), clique no seu avatar/ícone no canto superior direito da tela. Um formulário abrirá para você atualizar suas informações.",
                    "Você pode alterar sua senha e outros dados clicando na sua foto de perfil no topo da página. Não se esqueça de salvar as alterações!",
                    "O gerenciamento do seu perfil é feito clicando no ícone do usuário no canto superior direito. Lá você pode atualizar endereço, email e senha."
                ]
            }
        }
    
    def train(self):
        """Treina o modelo de classificação de intents"""
        training_data = []
        training_labels = []
        
        # Prepara dados de treinamento
        for intent_name, intent_data in self.intents.items():
            for pattern in intent_data["patterns"]:
                training_data.append(pattern.lower())
                training_labels.append(intent_name)
        
        # Cria pipeline com TF-IDF e Naive Bayes
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))),
            ('clf', MultinomialNB())
        ])
        
        # Treina o modelo
        self.pipeline.fit(training_data, training_labels)
    
    def get_response(self, message, conversation_history=None):
        """Retorna resposta para uma mensagem com suporte a histórico de conversa"""
        message_lower = message.lower().strip()
        
        # Analisa histórico para contexto
        context_intent = None
        if conversation_history and len(conversation_history) > 0:
            # Pega a última intent do histórico
            last_message = conversation_history[-1] if conversation_history else None
            if last_message and 'intent' in last_message:
                context_intent = last_message['intent']
        
        # Detecta perguntas de follow-up
        follow_up_patterns = [
            'me dê detalhes', 'me de detalhes', 'detalhes', 'mais informações',
            'mais info', 'explica melhor', 'explique melhor', 'pode explicar',
            'me explica', 'me explique', 'conta mais', 'fala mais',
            'e sobre', 'e quanto', 'e o que', 'como assim', 'o que mais',
            'quais são', 'quais sao', 'me fale mais', 'me fala mais'
        ]
        
        is_follow_up = any(pattern in message_lower for pattern in follow_up_patterns)
        
        # Se é follow-up e temos contexto, usa a intent anterior com resposta detalhada
        if is_follow_up and context_intent:
            if context_intent in detailed_responses:
                return {
                    "intent": f"{context_intent}_details",
                    "response": detailed_responses[context_intent],
                    "confidence": "high"
                }
            elif context_intent == 'multa_atraso':
                return {
                    "intent": "multa_atraso_details",
                    "response": detailed_responses['multa_atraso'],
                    "confidence": "high"
                }
            elif context_intent == 'multa_cancelamento':
                return {
                    "intent": "multa_cancelamento_details",
                    "response": detailed_responses['multa_cancelamento'],
                    "confidence": "high"
                }
            elif context_intent == 'termos_contrato':
                return {
                    "intent": "termos_contrato_details",
                    "response": detailed_responses['termos_contrato'],
                    "confidence": "high"
                }
        
        # Classifica a intent e obtém probabilidades
        predicted_intent = self.pipeline.predict([message_lower])[0]
        probabilities = self.pipeline.predict_proba([message_lower])[0]
        max_probability = max(probabilities)
        
        # Se a confiança for muito baixa
        if max_probability < 0.2:
            return {
                "intent": "unknown",
                "response": "Desculpe, só posso ajudar com informações sobre o sistema Escola Vai. Posso responder sobre: Pagamentos, Contratos, Cadastros, Escolas, Crianças, Dashboard e funcionalidades do sistema. Como posso ajudar?",
                "confidence": "low"
            }
        
        # Pega uma resposta aleatória da intent
        responses = self.intents[predicted_intent]["responses"]
        response = random.choice(responses)
        
        return {
            "intent": predicted_intent,
            "response": response,
            "confidence": "high" if max_probability > 0.6 else "medium"
        }

# ==========================================
# EXECUÇÃO PRINCIPAL
# ==========================================
if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
        conversation_history = json.loads(sys.argv[2]) if len(sys.argv) > 2 else []
        
        # Inicializa e treina o chatbot (rápido o suficiente para rodar a cada request neste contexto)
        bot = EscolaVaiChatbot()
        
        # ===== DETECÇÃO EXPLÍCITA DE TÓPICOS FORA DO ESCOPO =====
        message_lower = user_input.lower()
        
        out_of_scope_keywords = [
            'carro', 'moto', 'bicicleta', 'caminhão', 'avião', 'navio', 'trem',
            'comprar carro', 'vender carro', 'dirigir', 'carteira de motorista',
            'viajar', 'viagem', 'europa', 'férias', 'hotel', 'passagem', 'turismo',
            'praia', 'montanha', 'paris', 'londres', 'nova york',
            'receita', 'cozinhar', 'comida', 'restaurante', 'pizza', 'hamburguer',
            'futebol', 'basquete', 'jogo', 'time', 'campeonato',
            'celular', 'smartphone', 'computador', 'notebook', 'tablet',
            'comprar celular', 'qual celular', 'melhor notebook',
            'filme', 'série', 'netflix', 'música', 'cantor', 'banda',
            'médico', 'hospital', 'remédio', 'doença', 'sintoma',
            'clima', 'tempo', 'previsão', 'chuva', 'sol',
            'política', 'eleição', 'presidente', 'governo',
            'religião', 'igreja', 'deus',
            'namoro', 'relacionamento', 'amor'
        ]
        
        # Verifica se a mensagem contém palavras claramente fora do escopo
        is_out_of_scope = False
        if any(keyword in message_lower for keyword in out_of_scope_keywords):
            system_keywords = ['escola', 'criança', 'crianca', 'responsável', 'responsavel', 
                             'pagamento', 'cadastro', 'contrato', 'dashboard', 'aluno']
            if not any(sys_keyword in message_lower for sys_keyword in system_keywords):
                is_out_of_scope = True
        
        if is_out_of_scope:
            result = {
                'response': '🤖 Desculpe, só posso ajudar com informações sobre o sistema Escola Vai.\n\n📋 Posso responder sobre:\n   • Cadastros (Responsáveis, Crianças, Escolas)\n   • Pagamentos e vencimentos\n   • Contratos em PDF\n   • Dashboard e métricas\n   • Navegação do sistema\n\n💬 Como posso ajudar com o sistema?',
                'intent': 'out_of_scope',
                'confidence': 1.0
            }
        else:
            # Processa mensagem com ML
            result = bot.get_response(user_input, conversation_history)
            
            # ===== DETECÇÃO INTELIGENTE DE CONTEXTO (Refinamento) =====
            
            # Detecta tipo específico de cadastro
            if result['intent'] == 'cadastro':
                if any(word in message_lower for word in ['criança', 'crianca', 'filho', 'filha', 'aluno', 'estudante']):
                    result['response'] = detailed_responses['crianca']
                    result['intent'] = 'cadastro_crianca'
                elif any(word in message_lower for word in ['responsável', 'responsavel', 'pai', 'mãe', 'mae', 'tutor']):
                    result['response'] = detailed_responses['responsavel'] # Reusing responsavel detailed text
                    result['intent'] = 'cadastro_responsavel'
                elif any(word in message_lower for word in ['escola', 'colégio', 'colegio', 'instituição', 'instituicao']):
                    result['response'] = detailed_responses['cadastro'] # Using general cadastro text or specific if available
                    # Actually let's use the specific text from app.py logic
                    result['response'] = """🏫 CADASTRO DE ESCOLA - PASSO A PASSO:

1️⃣ No menu lateral, clique em 'Escolas'

2️⃣ Clique no botão '+ Nova Escola' (canto superior direito)

3️⃣ Preencha os campos:
   ✓ Nome da escola
   ✓ Endereço completo
   ✓ Telefone de contato

4️⃣ Clique em 'Salvar'

✅ A escola aparecerá na lista e poderá ser vinculada a crianças!"""
                    result['intent'] = 'cadastro_escola'
            
            # Detecta perguntas específicas sobre criança
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
                    result['response'] = detailed_responses['responsavel']
                    result['intent'] = 'responsavel_cadastro'

        # Retornar JSON
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "Nenhum texto fornecido"}))
