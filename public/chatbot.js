// ChatBot Widget
(function () {
    // Styles
    const styles = `
        #chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
        }

        #chatbot-toggle {
            width: 60px;
            height: 60px;
            background-color: #4F46E5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.3s;
        }

        #chatbot-toggle:hover { transform: scale(1.1); }

        #chatbot-toggle svg { width: 30px; height: 30px; fill: white; }

        #chatbot-window {
            display: none;
            width: 350px;
            height: 450px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            flex-direction: column;
            overflow: hidden;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
        }

        .chat-header {
            background-color: #4F46E5;
            color: white;
            padding: 15px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-body {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .message {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 0.9rem;
            line-height: 1.4;
        }

        .msg-bot {
            background-color: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }

        .msg-user {
            background-color: #4F46E5;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }

        .chat-footer {
            padding: 10px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 10px;
            background-color: white;
        }

        .chat-footer input {
            flex: 1;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            outline: none;
        }

        .chat-footer button {
            background-color: #4F46E5;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
        }
    `;

    // Inject Styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // HTML Structure
    const widgetHTML = `
        <div id="chatbot-widget">
            <div id="chatbot-window">
                <div class="chat-header">
                    <span>Suporte Escola Vai</span>
                    <span style="cursor:pointer" onclick="toggleChat()">✕</span>
                </div>
                <div class="chat-body" id="chatBody">
                    <div class="message msg-bot">Olá! Como posso ajudar você hoje?</div>
                </div>
                <div class="chat-footer">
                    <input type="text" id="chatInput" placeholder="Digite sua mensagem...">
                    <button onclick="sendMessage()">Enviar</button>
                </div>
            </div>
            <div id="chatbot-toggle" onclick="toggleChat()">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Logic
    window.toggleChat = function () {
        const window = document.getElementById('chatbot-window');
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
    };

    window.sendMessage = async function () {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        // Loading state
        const loadingId = addMessage("Digitando...", 'bot');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await res.json();

            // Remove loading message
            const loadingMsg = document.getElementById(loadingId);
            if (loadingMsg) loadingMsg.remove();

            if (data.response) {
                addMessage(data.response, 'bot');

                // Opcional: Mostrar confiança para debug
                // console.log(`Intent: ${data.intent}, Confidence: ${data.confidence}`);
            } else {
                addMessage("Desculpe, tive um erro interno.", 'bot');
            }

        } catch (error) {
            console.error(error);
            const loadingMsg = document.getElementById(loadingId);
            if (loadingMsg) loadingMsg.remove();
            addMessage("Erro de conexão com o servidor.", 'bot');
        }
    };

    function addMessage(text, sender) {
        const body = document.getElementById('chatBody');
        const div = document.createElement('div');
        div.className = `message msg-${sender}`;
        div.innerText = text;
        div.id = `msg-${Date.now()}`; // ID único para remover se necessário
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        return div.id;
    }

    // Enter key support
    document.getElementById('chatInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

})();
