# Chatbot com Python e Scikit-Learn
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle
import os

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
                    "contarto", "contrata", "ducumento" # Typos comuns
                ],
                "responses": [
                    "Para gerar um contrato, vá até a seção 'Responsáveis', encontre o responsável desejado e clique no botão 'PDF'. O contrato será gerado automaticamente.",
                    "Você pode gerar contratos em PDF na tela de Responsáveis. Basta clicar no botão 'PDF' ao lado do nome do responsável."
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
        
        # Cria pipeline com TF-IDF e Naive Bayes (analyzer='char_wb' para tolerância a erros de digitação)
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))),
            ('clf', MultinomialNB())
        ])
        
        # Treina o modelo
        self.pipeline.fit(training_data, training_labels)
        
        print("Modelo treinado com sucesso!")
        print(f"Total de padroes: {len(training_data)}")
        print(f"Intents: {list(self.intents.keys())}")
    
    def get_response(self, message):
        """Retorna resposta para uma mensagem"""
        import random
        
        message_lower = message.lower().strip()
        
        # Classifica a intent e obtém probabilidades
        predicted_intent = self.pipeline.predict([message_lower])[0]
        probabilities = self.pipeline.predict_proba([message_lower])[0]
        max_probability = max(probabilities)
        
        # Se a confiança for muito baixa, retorna mensagem de tópico não reconhecido
        if max_probability < 0.2:  # Threshold de confiança (reduzido para melhor reconhecimento)
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
    
    def save_model(self, filepath="chatbot_model.pkl"):
        """Salva o modelo treinado"""
        with open(filepath, 'wb') as f:
            pickle.dump(self.pipeline, f)
        print(f"Modelo salvo em {filepath}")
    
    def load_model(self, filepath="chatbot_model.pkl"):
        """Carrega modelo treinado"""
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                self.pipeline = pickle.load(f)
            print(f"Modelo carregado de {filepath}")
            return True
        return False

# Teste do chatbot
if __name__ == "__main__":
    print("Iniciando Chatbot Escola Vai...\n")
    
    bot = EscolaVaiChatbot()
    
    # Testes
    test_messages = [
        "Olá",
        "Como faço para pagar?",
        "Quando vence o pagamento?",
        "Como gerar um contrato?",
        "Preciso cadastrar uma criança",
        "Obrigado!"
    ]
    
    print("\nTestando chatbot:\n")
    for msg in test_messages:
        result = bot.get_response(msg)
        print(f"Usuário: {msg}")
        print(f"Bot ({result['intent']}): {result['response']}\n")
    
    # Salva o modelo
    bot.save_model()
