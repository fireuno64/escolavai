# 🔧 Comandos para Servidor Remoto - Escola Vai

## 🚨 Correções de Erros no Cadastro

### ✅ Cadastro de Escolas - RESOLVIDO
Se você estava recebendo o erro **"Unknown column 'admin_id' in 'field list'"** ao tentar cadastrar uma escola, este problema já foi corrigido seguindo os passos abaixo.

### ✅ Cadastro de Responsáveis - RESOLVIDO
Se você estava recebendo o erro **"Unknown column 'enderecoId' in 'field list'"** ao tentar cadastrar um responsável, este problema foi corrigido. Basta seguir os passos de atualização abaixo.

---

## 📋 Passo a Passo para Atualizar o Servidor

### 1️⃣ Conectar ao Servidor via SSH

```bash
ssh ubuntu@<IP-DO-SERVIDOR>
```

> **Nota**: Substitua `<IP-DO-SERVIDOR>` pelo IP real do seu servidor Oracle Cloud.

---

### 2️⃣ Navegar até a Pasta do Projeto

```bash
cd /home/ubuntu/escolavai
```

---

### 3️⃣ Baixar as Atualizações do GitHub

```bash
git pull
```

> **Importante**: Antes de executar este comando, certifique-se de que você já fez `git push` no Windows para enviar o script de migração.

---

### 4️⃣ Executar o Script de Migração do Banco de Dados

```bash
mysql -u escolavai_user -p escolavai_db < database/migrations/fix_escola_schema_remote.sql
```

**O que vai acontecer:**
- O sistema vai pedir a senha do banco de dados
- Digite a senha e pressione Enter
- O script vai adicionar as colunas faltantes na tabela `escola`
- Ao final, mostrará a estrutura atualizada da tabela

---

### 5️⃣ Verificar se as Colunas Foram Adicionadas

```bash
mysql -u escolavai_user -p escolavai_db -e "DESCRIBE escola;"
```

**Você deve ver estas colunas:**
- `id`
- `nome`
- `endereco`
- `cep`
- `rua`
- `numero`
- `complemento`
- `bairro`
- `cidade`
- `estado`
- `contato`
- `telefone`
- `email`
- `admin_id` ← **Esta é a coluna crítica que estava faltando!**

---

### 6️⃣ Reiniciar a Aplicação

```bash
pm2 restart all
```

---

### 7️⃣ Verificar se Está Funcionando

```bash
pm2 status
pm2 logs escolavai-backend --lines 50
```

---

## ✅ Testar no Navegador

1. Acesse: **https://duzie.com.br**
2. Faça login como admin
3. Vá em **"Gerenciar Escolas"**
4. Clique em **"Nova Escola"**
5. Preencha o formulário e clique em **"Salvar Escola"**
6. **Verifique se não há erros** no console do navegador (F12)
7. A escola deve aparecer na lista

---

## 🔍 Diagnóstico de Problemas

### Se ainda houver erros:

#### Ver logs do servidor:
```bash
pm2 logs escolavai-backend --err
```

#### Ver logs do MySQL:
```bash
sudo tail -f /var/log/mysql/error.log
```

#### Verificar conexão com banco de dados:
```bash
mysql -u escolavai_user -p escolavai_db -e "SELECT COUNT(*) FROM escola;"
```

#### Verificar se o arquivo .env está correto:
```bash
cat /home/ubuntu/escolavai/.env
```

---

## 📊 Verificar Escolas Cadastradas

```bash
mysql -u escolavai_user -p escolavai_db -e "SELECT id, nome, admin_id FROM escola;"
```

---

## 🔄 Comandos Úteis

### Reiniciar apenas o backend:
```bash
pm2 restart escolavai-backend
```

### Ver status de todos os processos:
```bash
pm2 status
```

### Ver logs em tempo real:
```bash
pm2 logs
```

### Parar todos os processos:
```bash
pm2 stop all
```

### Iniciar todos os processos:
```bash
pm2 start all
```

---

## ⚠️ Importante

- **Sempre faça backup do banco de dados antes de executar migrações**
- O script de migração é **seguro** e verifica se as colunas já existem antes de adicioná-las
- Se você executar o script múltiplas vezes, não haverá problemas

---

## 🆘 Em Caso de Emergência

Se algo der errado e você precisar reverter:

```bash
# Fazer backup do banco
mysqldump -u escolavai_user -p escolavai_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup (se necessário)
mysql -u escolavai_user -p escolavai_db < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📞 Suporte

Se os problemas persistirem após seguir todos os passos:
1. Verifique os logs do PM2
2. Verifique os logs do MySQL
3. Verifique o console do navegador (F12)
4. Anote a mensagem de erro exata e consulte a documentação
