# Migração SQLite → PostgreSQL no Azure

Este documento descreve o processo completo de migração do banco de dados SQLite para PostgreSQL hospedado no Azure.

## 📋 Pré-requisitos

1. **Azure CLI** instalado e configurado
2. **Python 3.11+** instalado
3. **PowerShell** (Windows) ou **Bash** (Linux/Mac)
4. Acesso ao Azure com permissões para criar recursos

## 🚀 Passo a Passo da Migração

### 1. Provisionar Infraestrutura no Azure

```powershell
# Fazer login no Azure
az login

# Criar grupo de recursos
az group create --name pictibmec-rg --location brazilsouth

# Deploy da infraestrutura PostgreSQL
az deployment group create \
  --resource-group pictibmec-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```powershell
copy backend\env.example backend\.env
```

Edite o arquivo `.env` com as informações do seu PostgreSQL:

```env
# PostgreSQL no Azure
DATABASE_URL=postgresql://pictibmecadmin:P@ssw0rd123!@your-server.postgres.database.azure.com:5432/pictibmec_db?sslmode=require

# Ou configure individualmente:
POSTGRES_HOST=your-server.postgres.database.azure.com
POSTGRES_DB=pictibmec_db
POSTGRES_USER=pictibmecadmin
POSTGRES_PASSWORD=P@ssw0rd123!
POSTGRES_PORT=5432
```

### 3. Instalar Dependências

```powershell
cd backend
pip install -r requirements.txt
```

### 4. Executar Migração de Dados

```powershell
# Migrar dados do SQLite para PostgreSQL
python migrate_data.py
```

### 5. Testar Conexão

```powershell
# Testar se a aplicação está funcionando
python -c "from database_config import db_config; print('✅ Conexão OK!' if db_config.test_connection() else '❌ Erro na conexão')"
```

### 6. Deploy no Azure (Opcional)

```powershell
# Usar Azure Developer CLI para deploy
azd up
```

## 🔧 Arquivos Modificados/Criados

### Novos Arquivos:
- `backend/database_config.py` - Configuração do banco com SQLAlchemy
- `backend/models.py` - Modelos SQLAlchemy 
- `backend/migrate_data.py` - Script de migração de dados
- `backend/Dockerfile` - Container para deploy
- `backend/env.example` - Exemplo de variáveis de ambiente
- `infra/main.bicep` - Infraestrutura como código
- `infra/main.parameters.json` - Parâmetros da infraestrutura
- `azure.yaml` - Configuração do Azure Developer CLI

### Arquivos Modificados:
- `backend/requirements.txt` - Adicionado psycopg2-binary e asyncpg
- `backend/main.py` - Usa nova configuração de banco
- `backend/app/core/config.py` - Configurações do PostgreSQL

## 📊 Vantagens da Migração

### SQLite → PostgreSQL:
- ✅ **Escalabilidade**: Suporta milhares de conexões simultâneas
- ✅ **Confiabilidade**: Backup automático e recuperação de desastres
- ✅ **Performance**: Índices avançados e otimizações de consulta
- ✅ **Segurança**: Criptografia em trânsito e em repouso
- ✅ **Recursos Avançados**: Transações ACID, triggers, stored procedures
- ✅ **Monitoramento**: Métricas e logs detalhados no Azure

### Azure Database for PostgreSQL:
- ✅ **Gerenciado**: Backups, atualizações e monitoramento automáticos
- ✅ **Alta Disponibilidade**: 99.99% de SLA
- ✅ **Segurança**: Firewall, SSL/TLS, Azure AD integration
- ✅ **Escalabilidade**: Escala vertical e horizontal
- ✅ **Integração**: Funciona nativamente com outros serviços Azure

## 🛠️ Solução de Problemas

### Erro de Conexão:
```bash
# Verificar se o firewall está configurado
az postgres flexible-server firewall-rule list --resource-group pictibmec-rg --name your-server-name

# Adicionar regra de firewall se necessário
az postgres flexible-server firewall-rule create \
  --resource-group pictibmec-rg \
  --name your-server-name \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### Erro de SSL:
```python
# Adicionar sslmode=require na string de conexão
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Erro de Migração:
```bash
# Verificar logs detalhados
python migrate_data.py --verbose

# Limpar dados e tentar novamente
python -c "from database_config import db_config; db_config.engine.execute('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')"
```

## 📈 Monitoramento

### Métricas Importantes:
- Conexões ativas
- Uso de CPU e memória
- Latência de consultas
- Throughput de dados

### Logs:
```bash
# Ver logs do PostgreSQL no Azure
az postgres flexible-server logs list --resource-group pictibmec-rg --name your-server-name
```

## 🔐 Segurança

### Recomendações:
1. **Firewall**: Restringir IPs permitidos
2. **SSL/TLS**: Sempre usar conexões criptografadas
3. **Passwords**: Usar senhas fortes e rodar periodicamente
4. **Backups**: Configurar backup automático
5. **Monitoring**: Ativar alertas de segurança

### Exemplo de Configuração Segura:
```env
# Conexão segura com SSL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require&sslrootcert=server-ca.pem&sslcert=client-cert.pem&sslkey=client-key.pem
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs de erro
2. Consultar documentação do Azure PostgreSQL
3. Verificar configurações de firewall
4. Testar conectividade local

---

**Nota**: Esta migração mantém compatibilidade com o código existente. O sistema continuará funcionando com SQLite em desenvolvimento se as variáveis PostgreSQL não estiverem configuradas.
