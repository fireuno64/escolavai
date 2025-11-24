# 🚀 Guia de Deployment - Oracle Cloud

Guia completo para fazer deploy da aplicação **Escola Vai** na VM Oracle Cloud (Ubuntu 22.04).

**IP do Servidor:** 129.148.22.95  
**Usuário SSH:** ubuntu  
**Autenticação:** Chave PPK (PuTTY)

---

## 📋 Pré-requisitos

- [x] VM Oracle Cloud criada (Ubuntu 22.04)
- [x] Acesso SSH via PuTTY com chave PPK
- [x] IP público: 129.148.22.95
- [ ] Firewall da Oracle Cloud configurado (faremos isso)

---

## 🔥 Passo 1: Configurar Firewall na Oracle Cloud

Antes de começar, você precisa abrir as portas no firewall da Oracle Cloud:

1. Acesse o **Oracle Cloud Console**
2. Vá em **Networking** → **Virtual Cloud Networks**
3. Selecione a VCN da sua VM
4. Clique em **Security Lists** → **Default Security List**
5. Clique em **Add Ingress Rules** e adicione as seguintes regras:

| Source CIDR | IP Protocol | Source Port Range | Destination Port Range | Description |
|-------------|-------------|-------------------|------------------------|-------------|
| 0.0.0.0/0   | TCP         | All               | 80                     | HTTP        |
| 0.0.0.0/0   | TCP         | All               | 443                    | HTTPS       |
| 0.0.0.0/0   | TCP         | All               | 3000                   | Node.js     |
| 0.0.0.0/0   | TCP         | All               | 5000                   | Chatbot     |

> [!IMPORTANT]
> Sem essas regras, você não conseguirá acessar a aplicação pela internet!

---

## 📦 Passo 2: Transferir Arquivos para a VM

> [!IMPORTANT]
> **Estrutura de Diretórios:** Você deve transferir o **CONTEÚDO** da pasta `Transporte_Escolar_2025` para dentro de `/home/ubuntu/escolavai`, e **NÃO** a pasta inteira.
> 
> **Estrutura CORRETA na VM:**
> ```
> /home/ubuntu/escolavai/
> ├── src/
> ├── public/
> ├── chatbot/
> ├── deploy-scripts/
> ├── package.json
> └── ...
> ```
> 
> **Estrutura INCORRETA (NÃO faça assim):**
> ```
> /home/ubuntu/escolavai/Transporte_Escolar_2025/
> ├── src/
> └── ...
> ```

### Opção A: Usando WinSCP (Recomendado)

1. **Baixe o WinSCP**: https://winscp.net/
2. **Configure a conexão**:
   - **File protocol:** SFTP
   - **Host name:** 129.148.22.95
   - **Port number:** 22
   - **User name:** ubuntu
   - **Advanced** → **SSH** → **Authentication** → **Private key file:** Selecione sua chave `.ppk`
3. **Conecte-se** ao servidor
4. **No lado direito (VM):** Navegue até `/home/ubuntu` e crie a pasta `escolavai` (clique direito → New → Directory)
5. **Entre na pasta** `escolavai` (duplo clique)
6. **No lado esquerdo (Windows):** Navegue até `D:\ADS4NB\Transporte_Escolar_2025`
7. **Selecione TODO o conteúdo** da pasta (Ctrl+A), **EXCETO**:
   - `node_modules/` (será instalado na VM)
   - `dist/` (será compilado na VM)
   - `.git/` (não necessário)
8. **Arraste os arquivos selecionados** para o lado direito (pasta `/home/ubuntu/escolavai`)

### Opção B: Usando PSCP (Linha de Comando)

```powershell
# No PowerShell do Windows
# IMPORTANTE: Este comando copia o CONTEÚDO, não a pasta
pscp -i "C:\caminho\para\sua\chave.ppk" -r D:\ADS4NB\Transporte_Escolar_2025\* ubuntu@129.148.22.95:/home/ubuntu/escolavai/
```

> [!TIP]
> O WinSCP é mais fácil e visual. Use a Opção A se não tiver experiência com linha de comando.

---

## 🛠️ Passo 3: Conectar via SSH e Instalar Dependências

### 3.1 Conectar via PuTTY

1. Abra o **PuTTY**
2. **Host Name:** ubuntu@129.148.22.95
3. **Port:** 22
4. **Connection** → **SSH** → **Auth** → **Credentials** → **Private key file:** Selecione sua chave `.ppk`
5. Clique em **Open**

### 3.2 Executar Scripts de Instalação

Após conectar via SSH, execute os seguintes comandos:

```bash
# Navegar para o diretório da aplicação
cd /home/ubuntu/escolavai

# Dar permissão de execução aos scripts
chmod +x deploy-scripts/*.sh

# 1. Instalar dependências do sistema
cd deploy-scripts
./install-dependencies.sh

# Aguarde a instalação (pode levar 5-10 minutos)
```

> [!NOTE]
> Durante a instalação do MySQL, você pode ser solicitado a confirmar. Pressione **Enter** para aceitar os padrões.

```bash
# 2. Configurar MySQL
./setup-mysql.sh

# 3. Voltar para o diretório principal
cd /home/ubuntu/escolavai

# 4. Fazer deploy da aplicação
./deploy-scripts/deploy-app.sh

# 5. Configurar Nginx
cd deploy-scripts
./setup-nginx.sh
```

---

## ✅ Passo 4: Verificar se Está Funcionando

### 4.1 Verificar Processos PM2

```bash
pm2 status
```

Você deve ver dois processos rodando:
- `escolavai-backend` (status: online)
- `escolavai-chatbot` (status: online)

### 4.2 Verificar Logs

```bash
# Ver todos os logs
pm2 logs

# Ver apenas logs do backend
pm2 logs escolavai-backend

# Ver apenas logs do chatbot
pm2 logs escolavai-chatbot
```

### 4.3 Testar Localmente na VM

```bash
# Testar backend
curl http://localhost:3000

# Testar chatbot
curl http://localhost:5000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"oi"}'
```

### 4.4 Testar do Navegador (Seu Computador)

Abra o navegador e acesse:

```
http://129.148.22.95
```

Você deve ver a página de login da aplicação Escola Vai! 🎉

---

## 🔐 Credenciais Padrão

**Usuário Admin Master:**
- **Email:** admin@escolavai.com
- **Senha:** admin123

> [!WARNING]
> Altere a senha padrão após o primeiro login!

**Banco de Dados:**
- **Host:** localhost
- **Database:** escolavai_db
- **User:** escolavai_user
- **Password:** Aa135790*

---

## 🌐 Passo 5 (Opcional): Configurar Domínio Próprio

Se você tem um domínio registrado, pode apontá-lo para a VM:

### 5.1 Configurar DNS

No painel onde você registrou seu domínio (Registro.br, GoDaddy, Hostinger, etc.):

1. Acesse a **Zona DNS** do seu domínio
2. Adicione um registro **A**:
   - **Nome/Host:** @ (ou deixe em branco para o domínio raiz)
   - **Tipo:** A
   - **Valor/IP:** 129.148.22.95
   - **TTL:** 3600 (ou padrão)

3. (Opcional) Adicione um registro **A** para www:
   - **Nome/Host:** www
   - **Tipo:** A
   - **Valor/IP:** 129.148.22.95
   - **TTL:** 3600

### 5.2 Atualizar Nginx

Após o DNS propagar (pode levar até 24h, mas geralmente é rápido):

```bash
# Conectar via SSH
cd /home/ubuntu/escolavai/deploy-scripts

# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/escolavai
```

Altere a linha:
```nginx
server_name 129.148.22.95;
```

Para:
```nginx
server_name seudominio.com.br www.seudominio.com.br;
```

Salve (Ctrl+O, Enter, Ctrl+X) e reinicie o Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 5.3 (Opcional) Configurar SSL/HTTPS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua pelo seu domínio)
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br

# Siga as instruções na tela
# O Certbot configurará automaticamente o HTTPS
```

---

## 🔧 Comandos Úteis

### Gerenciar Aplicação (PM2)

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs

# Reiniciar aplicação
pm2 restart all

# Parar aplicação
pm2 stop all

# Iniciar aplicação
pm2 start all

# Reiniciar apenas o backend
pm2 restart escolavai-backend

# Reiniciar apenas o chatbot
pm2 restart escolavai-chatbot
```

### Gerenciar Nginx

```bash
# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Ver logs de erro
sudo tail -f /var/log/nginx/escolavai-error.log

# Ver logs de acesso
sudo tail -f /var/log/nginx/escolavai-access.log
```

### Gerenciar MySQL

```bash
# Conectar ao MySQL
mysql -u root -p
# Senha: Aa135790*

# Ver bancos de dados
SHOW DATABASES;

# Usar banco da aplicação
USE escolavai_db;

# Ver tabelas
SHOW TABLES;

# Sair
EXIT;
```

---

## 🐛 Troubleshooting

### Problema: Não consigo acessar http://129.148.22.95

**Soluções:**
1. Verifique se o firewall da Oracle Cloud está configurado (Passo 1)
2. Verifique se o UFW está permitindo conexões:
   ```bash
   sudo ufw status
   ```
3. Verifique se o Nginx está rodando:
   ```bash
   sudo systemctl status nginx
   ```
4. Verifique se a aplicação está rodando:
   ```bash
   pm2 status
   ```

### Problema: Aplicação não inicia (PM2)

**Soluções:**
1. Verifique os logs:
   ```bash
   pm2 logs
   ```
2. Verifique se o MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```
3. Verifique o arquivo `.env`:
   ```bash
   cat /home/ubuntu/escolavai/.env
   ```

### Problema: Chatbot não responde

**Soluções:**
1. Verifique se o processo está rodando:
   ```bash
   pm2 status escolavai-chatbot
   ```
2. Verifique os logs do chatbot:
   ```bash
   pm2 logs escolavai-chatbot
   ```
3. Teste diretamente:
   ```bash
   curl http://localhost:5000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"oi"}'
   ```

### Problema: Erro de conexão com banco de dados

**Soluções:**
1. Verifique se o MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```
2. Teste a conexão:
   ```bash
   mysql -u escolavai_user -p escolavai_db
   # Senha: Aa135790*
   ```
3. Verifique as credenciais no `.env`

---

## 🔄 Atualizar a Aplicação

Quando você fizer alterações no código localmente e quiser atualizar na VM:

```bash
# 1. Transfira os arquivos novamente via WinSCP
# 2. Conecte via SSH e execute:

cd /home/ubuntu/escolavai

# Instalar novas dependências (se houver)
npm install
cd chatbot && pip3 install -r requirements.txt && cd ..

# Recompilar TypeScript
npm run build

# Reiniciar aplicação
pm2 restart all
```

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
# CPU e memória
htop

# Espaço em disco
df -h

# Processos
pm2 monit
```

---

## 🎉 Conclusão

Sua aplicação **Escola Vai** está agora rodando em produção na Oracle Cloud!

**URLs de Acesso:**
- **Aplicação:** http://129.148.22.95
- **API Docs:** http://129.148.22.95/api-docs

**Próximos Passos Recomendados:**
1. ✅ Alterar senha do admin padrão
2. ✅ Configurar domínio próprio (opcional)
3. ✅ Configurar SSL/HTTPS (recomendado para produção)
4. ✅ Configurar backups automáticos do banco de dados
5. ✅ Monitorar logs regularmente

---

**Suporte:** Se tiver problemas, verifique a seção de Troubleshooting ou consulte os logs com `pm2 logs`.
