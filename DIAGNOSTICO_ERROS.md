# 🔍 Diagnóstico de Erros 500 - Servidor Remoto

## Problema Atual

Você está recebendo erros 500 ao tentar:
- ✅ Carregar pagamentos
- ✅ Buscar crianças de um responsável
- ✅ Gerar PDF do contrato

## Passo 1: Verificar Logs do Servidor

Execute no servidor remoto (via SSH):

```bash
# Ver logs do backend
pm2 logs escolavai-backend --lines 100 --err
```

**O que procurar:**
- Mensagens de erro SQL como "Unknown column"
- Erros de foreign key
- Problemas de conexão com banco de dados

---

## Passo 2: Verificar Schema das Tabelas

```bash
# Conectar ao MySQL
mysql -u escolavai_user -p escolavai_db

# Verificar estrutura da tabela pagamento
DESCRIBE pagamento;

# Verificar estrutura da tabela crianca
DESCRIBE crianca;

# Verificar estrutura da tabela contrato
DESCRIBE contrato;

# Sair do MySQL
exit;
```

**Colunas esperadas:**

### Tabela `pagamento`
- `id`
- `responsavelId`
- `criancaId` ← **Importante!**
- `contrato_id`
- `valor`
- `dataPagamento`
- `status`
- `admin_id`

### Tabela `crianca`
- `id`
- `nome`
- `data_nascimento`
- `escola`
- `escola_id`
- `horario`
- `horario_entrada`
- `horario_saida`
- `tipo_transporte`
- `responsavel_id`
- `valor_contrato_anual`
- `data_inicio_contrato`

### Tabela `contrato`
- `id`
- `crianca_id`
- `responsavel_id`
- `admin_id`
- `data_inicio`
- `data_fim`
- `valor_anual`
- `valor_mensal`
- `status`
- `data_criacao`
- (outras colunas...)

---

## Passo 3: Copiar e Enviar os Resultados

Após executar os comandos acima, copie e cole os resultados aqui para que eu possa criar a migração correta.

---

## Comandos Rápidos para Copiar

```bash
# SSH no servidor
ssh ubuntu@<IP-DO-SERVIDOR>

# Ver logs de erro
pm2 logs escolavai-backend --lines 100 --err

# Verificar schema
mysql -u escolavai_user -p escolavai_db -e "DESCRIBE pagamento; DESCRIBE crianca; DESCRIBE contrato;"
```

---

## Possíveis Problemas e Soluções

### Problema 1: Coluna `criancaId` não existe em `pagamento`
**Solução**: Adicionar coluna via migração

### Problema 2: Coluna `admin_id` não existe em `pagamento`
**Solução**: Adicionar coluna via migração

### Problema 3: Tabela `contrato` não existe
**Solução**: Criar tabela via migração

### Problema 4: Foreign keys faltando
**Solução**: Adicionar constraints via migração

---

## Próximos Passos

1. Execute os comandos de diagnóstico acima
2. Copie os resultados (especialmente o DESCRIBE das tabelas)
3. Cole aqui para análise
4. Criarei a migração necessária para corrigir o schema

---

## Atalho: Se você quiser aplicar o schema completo

Se preferir aplicar o schema completo do zero (CUIDADO: isso pode apagar dados):

```bash
# Fazer backup primeiro!
mysqldump -u escolavai_user -p escolavai_db > backup_antes_schema_$(date +%Y%m%d_%H%M%S).sql

# Aplicar schema completo (CUIDADO!)
mysql -u escolavai_user -p escolavai_db < database/schema.sql
```

**⚠️ ATENÇÃO**: Isso vai recriar todas as tabelas e APAGAR todos os dados!
