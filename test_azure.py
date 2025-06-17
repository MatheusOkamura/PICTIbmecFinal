"""
Script para testar a configuração do Azure App Service
"""
import requests
import time

def test_azure_deployment():
    base_url = "https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net"
    
    print("🧪 Testando deployment no Azure...")
    print("=" * 50)
    
    # Teste 1: Health check
    try:
        print("1. Testando health check...")
        response = requests.get(f"{base_url}/health", timeout=30)
        if response.status_code == 200:
            print("✅ Health check funcionando!")
            print(f"   Resposta: {response.json()}")
        else:
            print(f"❌ Health check falhou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro no health check: {e}")
    
    # Teste 2: Rota principal
    try:
        print("\n2. Testando rota principal (/)...")
        response = requests.get(f"{base_url}/", timeout=30, allow_redirects=False)
        if response.status_code in [200, 302, 307]:
            print("✅ Rota principal funcionando!")
        else:
            print(f"❌ Rota principal falhou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro na rota principal: {e}")
    
    # Teste 3: Rota de autenticação
    try:
        print("\n3. Testando rota de autenticação...")
        response = requests.get(f"{base_url}/api/v1/auth/microsoft-login", timeout=30, allow_redirects=False)
        if response.status_code in [200, 302, 307]:
            print("✅ Rota de autenticação funcionando!")
            print("🎉 PROBLEMA RESOLVIDO!")
        else:
            print(f"❌ Rota de autenticação falhou: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"❌ Erro na rota de autenticação: {e}")
    
    # Teste 4: API Documentation
    try:
        print("\n4. Testando documentação da API...")
        response = requests.get(f"{base_url}/docs", timeout=30)
        if response.status_code == 200:
            print("✅ Documentação da API funcionando!")
            print(f"   Acesse: {base_url}/docs")
        else:
            print(f"❌ Documentação falhou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro na documentação: {e}")

if __name__ == "__main__":
    test_azure_deployment()
