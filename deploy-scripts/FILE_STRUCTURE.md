# 📁 Estrutura de Arquivos para Deployment

Antes de transferir os arquivos para a VM, certifique-se de que você tem a seguinte estrutura:

## ✅ Arquivos que DEVEM ser transferidos:

```
escolavai/
├── src/                          # Código-fonte TypeScript
├── public/                       # Arquivos estáticos (HTML, CSS, JS)
├── chatbot/                      # Aplicação Python do chatbot
│   ├── app.py
│   ├── chatbot_model.py
│   ├── chatbot_model.pkl
│   ├── requirements.txt
│   └── Dockerfile
├── deploy-scripts/               # Scripts de deployment
│   ├── install-dependencies.sh
│   ├── setup-mysql.sh
│   ├── deploy-app.sh
│   ├── setup-nginx.sh
│   ├── nginx.conf
│   └── backup-db.sh
├── migrations/                   # Migrações SQL (se houver)
├── database/                     # Schemas SQL
├── package.json
├── package-lock.json
├── tsconfig.json
├── ecosystem.config.js           # Configuração PM2
├── create_master_user.ts
├── chatbot_model.pkl
└── .env.production              # Template de variáveis de ambiente
```

## ❌ Arquivos que NÃO devem ser transferidos:

```
❌ node_modules/      # Será instalado na VM
❌ dist/              # Será compilado na VM
❌ .git/              # Não necessário em produção
❌ .env               # Contém credenciais locais
❌ *.log              # Logs locais
❌ .venv/             # Virtual env Python local
❌ __pycache__/       # Cache Python
```

## 📦 Tamanho Estimado da Transferência

- **Com node_modules e dist:** ~200-300 MB
- **Sem node_modules e dist (recomendado):** ~10-20 MB

## 💡 Dica

Use o WinSCP e exclua manualmente as pastas `node_modules`, `dist`, `.git` antes de transferir para economizar tempo e banda.
