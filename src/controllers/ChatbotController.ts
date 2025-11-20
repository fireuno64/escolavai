import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ChatbotController {

    async processMessage(req: Request, res: Response) {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Mensagem é obrigatória.' });
        }

        // Caminho para o script Python
        const scriptPath = path.resolve(__dirname, '../python/chatbot.py');

        const pythonProcess = spawn('python', [scriptPath, message]);

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
                return res.json(result);
            } catch (e) {
                console.error('Erro ao fazer parse do JSON do Python:', dataString);
                return res.status(500).json({ error: 'Erro na resposta do chatbot.' });
            }
        });
    }
}
