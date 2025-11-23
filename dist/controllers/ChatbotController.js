import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// In-memory conversation history storage (session-based)
// In production, consider using Redis or database for persistence
const conversationHistories = new Map();
export class ChatbotController {
    async processMessage(req, res) {
        const { message, session_id } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Mensagem é obrigatória.' });
        }
        // Get or create conversation history for this session
        const sessionId = session_id || 'default';
        if (!conversationHistories.has(sessionId)) {
            conversationHistories.set(sessionId, []);
        }
        const history = conversationHistories.get(sessionId);
        // Keep only last 10 messages for context
        if (history.length > 10) {
            history.shift();
        }
        // Caminho para o script Python
        const scriptPath = path.resolve(__dirname, '../python/chatbot.py');
        // Pass message and conversation history to Python
        const historyJson = JSON.stringify(history);
        const pythonProcess = spawn('python', [scriptPath, message, historyJson]);
        let dataString = '';
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Erro ao processar mensagem no chatbot.' });
            }
            try {
                const result = JSON.parse(dataString);
                // Add to conversation history
                history.push({
                    message: message,
                    intent: result.intent,
                    timestamp: new Date().toISOString()
                });
                return res.json(result);
            }
            catch (e) {
                console.error('Erro ao fazer parse do JSON do Python:', dataString);
                return res.status(500).json({ error: 'Erro na resposta do chatbot.' });
            }
        });
    }
}
