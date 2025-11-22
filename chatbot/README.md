# Chatbot Escola Vai - Instruções de Uso

## Instalação

### 1. Instalar Python (se não tiver)
Baixe e instale Python 3.8+ de https://www.python.org/downloads/

### 2. Instalar dependências
Abra o terminal na pasta `chatbot` e execute:

```bash
cd chatbot
pip install -r requirements.txt
```

## Executar o Chatbot

### 1. Treinar o modelo (primeira vez)
```bash
python chatbot_model.py
```

Isso vai:
- Treinar o modelo com os padrões definidos
- Salvar o modelo em `chatbot_model.pkl`
- Mostrar exemplos de teste

### 2. Iniciar o servidor Flask
```bash
python app.py
```

O servidor vai iniciar na porta 5000.

### 3. Testar o chatbot
Acesse o dashboard admin e clique no botão do chatbot (🤖) no canto inferior direito.

## Como Funciona

### Machine Learning
- **Algoritmo**: TF-IDF + Naive Bayes (scikit-learn)
- **Intents**: 8 categorias (saudação, pagamento, contrato, etc.)
- **Treinamento**: Baseado em padrões de texto

### Intents Disponíveis
1. **Saudação**: Oi, olá, bom dia
2. **Pagamento**: Informações sobre pagamentos e vencimentos
3. **Contrato**: Como gerar contratos em PDF
4. **Cadastro**: Como cadastrar responsáveis e crianças
5. **Escola**: Gerenciamento de escolas
6. **Criança**: Cadastro de crianças
7. **Ajuda**: Ajuda geral
8. **Despedida**: Tchau, obrigado

### Adicionar Novos Padrões
Edite `chatbot_model.py` e adicione novos padrões no método `load_intents()`:

```python
"nova_intent": {
    "patterns": ["palavra1", "palavra2"],
    "responses": ["Resposta 1", "Resposta 2"]
}
```

Depois retreine o modelo executando `python chatbot_model.py`.

## Troubleshooting

### Erro: Módulo não encontrado
```bash
pip install -r requirements.txt
```

### Erro: Porta 5000 em uso
Edite `app.py` e mude a porta:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

E atualize `chatbot.js`:
```javascript
const CHATBOT_API_URL = 'http://localhost:5001/api/chat';
```

### Chatbot não responde
1. Verifique se o servidor Flask está rodando
2. Abra o console do navegador (F12) para ver erros
3. Teste o endpoint diretamente: http://localhost:5000/api/chat/health
