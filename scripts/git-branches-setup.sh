#!/bin/bash
# =============================================================================
# Script de Configuración de Ramas Git por Participante - POS Elite Pro
# Equipo: Juan Urbina, Daniel Rodríguez, Maykelis Meléndez
# =============================================================================

echo "======================================================="
echo "🌿 Creando y verificando ramas de trabajo del equipo..."
echo "======================================================="

# Asegurar que estamos en main
git checkout main 2>/dev/null || git checkout -b main

# Crear ramas para cada participante
git branch -f feature/juan-urbina-api-backend main
git branch -f feature/daniel-rodriguez-pos-frontend main
git branch -f feature/maykelis-melendez-devops-ci-cd main

echo ""
echo "✅ Ramas creadas exitosamente:"
git branch -a -v

echo ""
echo "Instrucciones de uso:"
echo "  - Juan Urbina:      git checkout feature/juan-urbina-api-backend"
echo "  - Daniel Rodríguez: git checkout feature/daniel-rodriguez-pos-frontend"
echo "  - Maykelis Meléndez:git checkout feature/maykelis-melendez-devops-ci-cd"
echo "======================================================="
