@echo off
echo ================================================
echo   Guia Rapido de Deployment - Oracle Cloud
echo ================================================
echo.
echo Este guia vai te ajudar a fazer o deploy da aplicacao
echo Escola Vai na sua VM Oracle Cloud.
echo.
echo IP da VM: 129.148.22.95
echo Usuario: ubuntu
echo.
echo ================================================
echo   PASSO 1: Configurar Firewall Oracle Cloud
echo ================================================
echo.
echo 1. Acesse o Oracle Cloud Console
echo 2. Va em Networking -^> Virtual Cloud Networks
echo 3. Clique na VCN da sua VM
echo 4. Clique em Security Lists -^> Default Security List
echo 5. Adicione as seguintes regras de Ingress:
echo.
echo    Porta 80  (HTTP)
echo    Porta 443 (HTTPS)
echo    Porta 3000 (Node.js Backend)
echo    Porta 5000 (Python Chatbot)
echo.
pause
echo.
echo ================================================
echo   PASSO 2: Transferir Arquivos
echo ================================================
echo.
echo Opcao A - WinSCP (Recomendado):
echo   1. Baixe: https://winscp.net/
echo   2. Configure:
echo      - Host: 129.148.22.95
echo      - Usuario: ubuntu
echo      - Porta: 22
echo      - Chave PPK: Selecione sua chave
echo   3. Transfira a pasta do projeto para: /home/ubuntu/escolavai
echo.
echo Opcao B - PSCP (Linha de Comando):
echo   pscp -i "caminho\para\sua\chave.ppk" -r "%~dp0" ubuntu@129.148.22.95:/home/ubuntu/escolavai
echo.
pause
echo.
echo ================================================
echo   PASSO 3: Conectar via SSH
echo ================================================
echo.
echo 1. Abra o PuTTY
echo 2. Host: ubuntu@129.148.22.95
echo 3. Porta: 22
echo 4. Connection -^> SSH -^> Auth: Selecione sua chave PPK
echo 5. Clique em Open
echo.
pause
echo.
echo ================================================
echo   PASSO 4: Executar Scripts na VM
echo ================================================
echo.
echo Apos conectar via SSH, execute os seguintes comandos:
echo.
echo # Navegar para o diretorio
echo cd /home/ubuntu/escolavai
echo.
echo # Dar permissao de execucao
echo chmod +x deploy-scripts/*.sh
echo.
echo # 1. Instalar dependencias (Node.js, Python, MySQL, Nginx, PM2)
echo cd deploy-scripts
echo ./install-dependencies.sh
echo.
echo # 2. Configurar MySQL
echo ./setup-mysql.sh
echo.
echo # 3. Deploy da aplicacao
echo cd /home/ubuntu/escolavai
echo mkdir -p logs
echo ./deploy-scripts/deploy-app.sh
echo.
echo # 4. Configurar Nginx
echo cd deploy-scripts
echo ./setup-nginx.sh
echo.
pause
echo.
echo ================================================
echo   PASSO 5: Verificar Funcionamento
echo ================================================
echo.
echo Na VM, execute:
echo   pm2 status
echo.
echo Deve mostrar 2 processos rodando:
echo   - escolavai-backend
echo   - escolavai-chatbot
echo.
echo No seu navegador, acesse:
echo   http://129.148.22.95
echo.
echo Credenciais padrao:
echo   Email: admin@escolavai.com
echo   Senha: admin123
echo.
echo ================================================
echo   Comandos Uteis
echo ================================================
echo.
echo Ver logs:        pm2 logs
echo Reiniciar:       pm2 restart all
echo Parar:           pm2 stop all
echo Status:          pm2 status
echo Monitorar:       pm2 monit
echo.
echo ================================================
echo   Documentacao Completa
echo ================================================
echo.
echo Para mais detalhes, consulte: DEPLOYMENT.md
echo.
pause
