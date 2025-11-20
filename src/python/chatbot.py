
import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# Dados de Treinamento (Pequeno dataset para demonstração)
data = [
    ("quanto custa o transporte", "valores"),
    ("qual o valor da mensalidade", "valores"),
    ("preço do serviço", "valores"),
    ("gostaria de saber os valores", "valores"),
    ("tabela de preços", "valores"),
    
    ("tenho pendencias financeiras", "pendencias"),
    ("como pagar meu boleto", "pendencias"),
    ("estou com mensalidade atrasada", "pendencias"),
    ("verificar meus pagamentos", "pendencias"),
    ("divida em aberto", "pendencias"),
    
    ("ola tudo bem", "saudacao"),
    ("bom dia", "saudacao"),
    ("boa tarde", "saudacao"),
    ("oi", "saudacao"),
    
    ("preciso de ajuda", "ajuda"),
    ("suporte tecnico", "ajuda"),
    ("estou com duvida", "ajuda"),
    ("como funciona", "ajuda")
]

# Separar dados
X_train = [text for text, label in data]
y_train = [label for text, label in data]

# Criar Pipeline (Vetorização + Classificação)
model = make_pipeline(TfidfVectorizer(), MultinomialNB())

# Treinar Modelo
model.fit(X_train, y_train)

def predict_intent(text):
    # Predição
    intent = model.predict([text])[0]
    # Probabilidade (opcional, para confiança)
    probs = model.predict_proba([text])[0]
    confidence = max(probs)
    
    return intent, confidence

if __name__ == "__main__":
    # Ler entrada dos argumentos da linha de comando
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
        intent, conf = predict_intent(user_input)
        
        # Resposta baseada na intenção
        response_text = ""
        if intent == "valores":
            response_text = "Os valores dependem da rota e do período. Por favor, entre em contato com a secretaria para um orçamento detalhado."
        elif intent == "pendencias":
            response_text = "Você pode verificar suas pendências e boletos acessando o Painel do Cliente na aba 'Pagamentos'."
        elif intent == "saudacao":
            response_text = "Olá! Sou o assistente virtual da Escola Vai. Como posso ajudar você hoje?"
        elif intent == "ajuda":
            response_text = "Estou aqui para ajudar! Você pode perguntar sobre 'valores' ou 'pagamentos'."
        else:
            response_text = "Desculpe, não entendi. Tente perguntar sobre valores ou pagamentos."
            
        # Retornar JSON para o Node.js
        result = {
            "intent": intent,
            "confidence": float(conf),
            "response": response_text
        }
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "Nenhum texto fornecido"}))
