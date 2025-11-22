@echo off
echo Iniciando Escola Vai - Servidor Completo
echo.

echo [1/2] Iniciando servidor Node.js (porta 3000)...
start "Node Server" cmd /k "npm run dev"

timeout /t 2 /nobreak > nul

echo [2/2] Iniciando servidor Flask - Chatbot (porta 5000)...
start "Flask Chatbot" cmd /k "cd chatbot && python app.py"

echo.
echo ✅ Servidores iniciados!
echo.
echo 📡 Node.js: http://localhost:3000
echo 🤖 Flask: http://localhost:5000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul
