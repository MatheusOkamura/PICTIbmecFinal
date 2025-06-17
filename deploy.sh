#!/bin/bash
# Script para fazer deploy no Azure App Service

echo "🚀 Iniciando deploy para Azure App Service..."

# Fazer commit das alterações
git add .
git commit -m "Fix: Corrigir configuração para Azure App Service - resolver erro 404"

# Push para o repositório (substitua pela sua branch)
git push origin main

echo "✅ Deploy enviado! Aguarde alguns minutos para o Azure processar."
echo "📍 URL para testar: https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/auth/microsoft-login"
