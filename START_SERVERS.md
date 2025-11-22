# Iniciar Servidores - Escola Vai

## Opção 1: Script Batch (Recomendado para Windows)

### Uso
Simplesmente clique duas vezes no arquivo:
```
start-servers.bat
```

Isso vai:
1. Abrir uma janela para o servidor Node.js (porta 3000)
2. Abrir outra janela para o servidor Flask (porta 5000)

### Vantagens
- Fácil de usar (duplo clique)
- Cada servidor em sua própria janela
- Fácil de fechar servidores individualmente

---

## Opção 2: NPM Script com Concurrently

### Instalação
Primeiro, instale o pacote `concurrently`:
```bash
npm install --save-dev concurrently
```

### Uso
Execute o comando:
```bash
npm run dev:all
```

Isso iniciará ambos os servidores no mesmo terminal.

### Vantagens
- Tudo em um terminal
- Logs combinados
- Ctrl+C fecha ambos

---

## Opção 3: Comandos Separados (Manual)

### Terminal 1 - Node.js
```bash
npm run dev
```

### Terminal 2 - Flask
```bash
npm run chatbot
```
ou
```bash
cd chatbot
python app.py
```

---

## Recomendação

**Para desenvolvimento diário**: Use `start-servers.bat` (Opção 1)
- Mais fácil e rápido
- Janelas separadas facilitam debug
- Não precisa lembrar comandos

**Para produção**: Configure como serviços do sistema operacional
