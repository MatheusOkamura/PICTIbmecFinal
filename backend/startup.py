"""
Arquivo de inicialização para Azure App Service
"""
from main import app

# Azure App Service procura por uma variável chamada 'app'
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
