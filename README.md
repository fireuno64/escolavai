# 🚌 Sistema de Gestão de Transporte Escolar (Escola Van)

Sistema completo para gestão de transporte escolar, incluindo controle de responsáveis, crianças, escolas, pagamentos e contratos. Conta com um chatbot inteligente para suporte automatizado.

## 🚀 Funcionalidades Principais

- **Dashboard Administrativo**: Visão geral com métricas e gráficos.
- **Gestão de Cadastros**:
  - Responsáveis (Pais/Tutores)
  - Crianças (Alunos)
  - Escolas (Instituições de Ensino)
- **Financeiro**:
  - Controle de Pagamentos e Mensalidades
  - Geração de Boletos (Simulação)
- **Documentação**:
  - Geração automática de Contratos em PDF
- **Suporte Inteligente**:
  - Chatbot com Inteligência Artificial (Python/Scikit-Learn)
  - Respostas contextuais e passo a passo
  - Integração direta com o sistema

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com **TypeScript**
- **Express** (API REST)
- **MySQL** (Banco de Dados)
- **JWT** (Autenticação)

### Frontend
- **HTML5**, **CSS3**, **JavaScript** (Vanilla)
- Design Responsivo e Moderno

### Chatbot (IA)
- **Python 3**
- **Flask** (API do Chatbot)
- **Scikit-Learn** (Machine Learning - Naive Bayes)
- **Pandas/Numpy** (Processamento de Dados)

## 📦 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Python (v3.8+)
- MySQL Server

### Instalação

1. **Clone o repositório**
2. **Instale as dependências do Node.js**:
   ```bash
   npm install
   ```
3. **Instale as dependências do Python**:
   ```bash
   cd chatbot
   pip install -r requirements.txt
   cd ..
   ```
4. **Configure o Banco de Dados**:
   - Crie um banco de dados MySQL
   - Configure o arquivo `.env` (use `.env.example` como base)
   - Rode as migrações (se houver)

### Executando

Para rodar todo o sistema (Backend + Chatbot + Frontend):

```bash
npm run dev:all
```

Ou no Windows, basta executar o arquivo:
`start-servers.bat`

## 🤖 Chatbot

O chatbot roda em um servidor Python separado (porta 5000) e se comunica com o frontend. Ele utiliza um modelo de Machine Learning treinado para identificar intenções do usuário e fornecer respostas precisas.

- **Treinamento**: O modelo é treinado automaticamente ao iniciar, ou pode ser retreinado rodando `python chatbot_model.py` na pasta `chatbot`.

## 📝 Licença

Este projeto está sob a licença ISC.

---

## 🚀 Deployment em Produção

Para fazer o deploy desta aplicação em um servidor de produção (Oracle Cloud, AWS, Azure, etc.), consulte o guia completo:

📖 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guia completo de deployment para Oracle Cloud

O guia inclui:
- Configuração de servidor Ubuntu 22.04
- Scripts automatizados de instalação
- Configuração de Nginx, PM2, MySQL
- Instruções de transferência de arquivos
- Troubleshooting e manutenção
- Configuração de domínio e SSL

### Quick Start (Oracle Cloud)

```bash
# 1. Transferir arquivos para a VM
# 2. Na VM, executar:
cd /home/ubuntu/escolavai
chmod +x deploy-scripts/*.sh

# Instalar dependências
cd deploy-scripts && ./install-dependencies.sh

# Configurar MySQL
./setup-mysql.sh

# Deploy da aplicação
cd /home/ubuntu/escolavai && ./deploy-scripts/deploy-app.sh

# Configurar Nginx
cd deploy-scripts && ./setup-nginx.sh
```

Acesse: `http://SEU_IP_PUBLICO`

