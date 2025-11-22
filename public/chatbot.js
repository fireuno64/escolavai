// Chatbot Functions
const CHATBOT_API_URL = 'http://localhost:5000/api/chat';

function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('active');

    // Focus input when opening
    if (chatWindow.classList.contains('active')) {
        document.getElementById('chatbotInput').focus();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Send message to Python chatbot API
        const response = await fetch(CHATBOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Erro ao conectar com o chatbot');
        }

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        // Add bot response
        addChatMessage(data.response, 'bot');

    } catch (error) {
        console.error('Erro no chatbot:', error);
        removeTypingIndicator();
        addChatMessage(
            'Desculpe, estou com problemas técnicos. Por favor, tente novamente mais tarde.',
            'bot'
        );
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Add chatbot functions to global scope
window.toggleChatbot = toggleChatbot;
window.sendChatMessage = sendChatMessage;
