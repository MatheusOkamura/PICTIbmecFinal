#!/bin/bash

# Build script para Azure Static Web Apps
echo "Starting build process..."

# Navegar para o diretório frontend
cd frontend

# Instalar dependências
echo "Installing dependencies..."
npm ci

# Build do projeto
echo "Building project..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "build" ]; then
    echo "Build completed successfully!"
    ls -la build/
else
    echo "Build failed - build directory not found"
    exit 1
fi
