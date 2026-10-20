@echo off
REM =============================================================================
REM Script de Configuración de Ramas Git por Participante - POS Elite Pro
REM Equipo: Juan Urbina, Daniel Rodríguez, Maykelis Meléndez
REM =============================================================================

echo =======================================================
echo Creando y verificando ramas de trabajo del equipo...
echo =======================================================

git checkout main 2>nul || git checkout -b main

git branch -f feature/juan-urbina-api-backend main
git branch -f feature/daniel-rodriguez-pos-frontend main
git branch -f feature/maykelis-melendez-devops-ci-cd main

echo.
echo Ramas creadas exitosamente:
git branch -a -v

echo.
echo Instrucciones de uso:
echo   - Juan Urbina:       git checkout feature/juan-urbina-api-backend
echo   - Daniel Rodriguez:  git checkout feature/daniel-rodriguez-pos-frontend
echo   - Maykelis Melendez: git checkout feature/maykelis-melendez-devops-ci-cd
echo =======================================================
