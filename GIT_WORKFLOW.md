# 🔄 Fluxo de Trabalho Git - Escola Vai

Guia rápido para atualizar a aplicação em produção usando Git.

---

## 📝 No Windows (Desenvolvimento Local)

Após fazer alterações no código:

```powershell
# 1. Navegar até a pasta do projeto
cd D:\ADS4NB\Transporte_Escolar_2025

# 2. Verificar arquivos alterados (opcional)
git status

# 3. Adicionar todos os arquivos modificados
git add .

# 4. Fazer commit com mensagem descritiva
git commit -m "Descrição clara das mudanças realizadas"

# 5. Enviar para o GitHub
git push
```

### Exemplos de Mensagens de Commit:

```powershell
git commit -m "Corrigido bug no login de responsáveis"
git commit -m "Adicionado campo telefone na tela de cadastro"
git commit -m "Melhorias na interface do dashboard"
```

---

## 🚀 Na VM Oracle Cloud (Produção)

Conecte via SSH (PuTTY) e execute:

```bash
# 1. Navegar até a pasta da aplicação
cd /home/ubuntu/escolavai

# 2. Baixar as atualizações do GitHub
git pull

# 3. Instalar novas dependências (se houver)
npm install

# 4. Instalar dependências do chatbot (se houver)
cd chatbot && pip3 install -r requirements.txt && cd ..

# 5. Recompilar o TypeScript
npm run build

# 6. Reiniciar a aplicação
pm2 restart all

# 7. Verificar se está rodando
pm2 status
```

### Comando Rápido (se não mudou dependências):

```bash
cd /home/ubuntu/escolavai && git pull && npm run build && pm2 restart all
```

---

## 🔍 Comandos Úteis

### Verificar Logs:
```bash
pm2 logs
pm2 logs escolavai-backend
pm2 logs escolavai-chatbot
```

### Ver Status:
```bash
pm2 status
```

### Reiniciar Apenas um Processo:
```bash
pm2 restart escolavai-backend
pm2 restart escolavai-chatbot
```

### Ver Diferenças Antes de Fazer Pull:
```bash
git fetch
git diff origin/main
```

---

## ⚠️ Troubleshooting

### Conflitos ao fazer Pull:

Se aparecer erro de conflito:

```bash
# Ver quais arquivos têm conflito
git status

# Descartar mudanças locais e usar a versão do GitHub
git reset --hard origin/main
```

### Aplicação não Inicia Após Update:

```bash
# Ver logs de erro
pm2 logs --err

# Verificar se o banco de dados está rodando
sudo systemctl status mysql

# Verificar arquivo .env
cat /home/ubuntu/escolavai/.env
```

---

## 📋 Checklist de Atualização

- [ ] Fazer alterações no código (Windows)
- [ ] Testar localmente
- [ ] `git add .`
- [ ] `git commit -m "mensagem"`
- [ ] `git push`
- [ ] Conectar via SSH na VM
- [ ] `cd /home/ubuntu/escolavai`
- [ ] `git pull`
- [ ] `npm install` (se necessário)
- [ ] `npm run build`
- [ ] `pm2 restart all`
- [ ] Testar em https://duzie.com.br

---

## 🎯 Boas Práticas

1. **Sempre teste localmente** antes de fazer push
2. **Use mensagens de commit descritivas**
3. **Faça commits pequenos e frequentes**
4. **Verifique os logs após atualizar** na produção
5. **Mantenha backup** do banco de dados

---

**Repositório GitHub:** https://github.com/fireuno64/escolavai
