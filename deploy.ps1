# PowerShell script para fazer deploy no Azure
Write-Host "🚀 Iniciando deploy para Azure App Service..." -ForegroundColor Green

# Verificar se está no diretório correto
if (Test-Path "backend\main.py") {
    Write-Host "✅ Diretório correto encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Execute este script na raiz do projeto" -ForegroundColor Red
    exit 1
}

# Fazer commit das alterações
Write-Host "📝 Fazendo commit das alterações..." -ForegroundColor Yellow
git add .
git commit -m "Fix: Corrigir configuração para Azure App Service - resolver erro 404"

# Push para o repositório
Write-Host "📤 Enviando para o repositório..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deploy enviado! Aguarde alguns minutos para o Azure processar." -ForegroundColor Green
Write-Host "📍 URL para testar: https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/auth/microsoft-login" -ForegroundColor Cyan

# Aguardar um pouco e testar
Write-Host "⏳ Aguardando 60 segundos antes de testar..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Executar teste
Write-Host "🧪 Executando teste automatizado..." -ForegroundColor Yellow
python test_azure.py
