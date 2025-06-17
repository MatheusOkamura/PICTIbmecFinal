#!/usr/bin/env python3
"""
Script para testar e listar as rotas da aplicação FastAPI
"""
import sys
sys.path.append('.')

try:
    from main import app
    
    print("✅ Aplicação carregada com sucesso!")
    print("\n📋 Rotas disponíveis:")
    print("=" * 50)
    
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = ', '.join(sorted(route.methods))
            print(f"  {methods:<10} {route.path}")
        elif hasattr(route, 'path'):
            print(f"  {'MOUNT':<10} {route.path}")
    
    print("\n🔍 Verificando rota específica:")
    target_route = "/api/v1/auth/microsoft-login"
    found = False
    
    for route in app.routes:
        if hasattr(route, 'path') and target_route in route.path:
            found = True
            methods = ', '.join(sorted(route.methods)) if hasattr(route, 'methods') else 'N/A'
            print(f"  ✅ ENCONTRADA: {methods} {route.path}")
            break
    
    if not found:
        print(f"  ❌ ROTA NÃO ENCONTRADA: {target_route}")
        print("\n🔍 Verificando rotas similares:")
        for route in app.routes:
            if hasattr(route, 'path') and '/auth/' in route.path:
                methods = ', '.join(sorted(route.methods)) if hasattr(route, 'methods') else 'N/A'
                print(f"    {methods} {route.path}")

except ImportError as e:
    print(f"❌ Erro de importação: {e}")
except Exception as e:
    print(f"❌ Erro ao carregar aplicação: {e}")
