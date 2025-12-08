@echo off
echo 🧪 Tests de vérification du projet Secret Santa
echo ===============================================
echo.

setlocal enabledelayedexpansion
set PASS=0
set FAIL=0

echo 📁 Vérification des fichiers principaux...
call :test_file "admin.html"
call :test_file "login.html"
call :test_file "participant.html"
call :test_file "styles.css"
call :test_file "script.js"
call :test_file "participant.js"
call :test_file "server.js"
call :test_file "package.json"

echo.
echo 🐳 Vérification des fichiers Docker...
call :test_file "Dockerfile"
call :test_file "docker-compose.yml"
call :test_file ".dockerignore"

echo.
echo ⚙️ Vérification de la configuration...
call :test_file ".env.example"
call :test_file ".gitignore"
call :test_file "nginx-reverse-proxy.conf"

echo.
echo 📜 Vérification des scripts...
call :test_file "deploy.sh"
call :test_file "deploy.bat"
call :test_file "dev.sh"
call :test_file "dev.bat"

echo.
echo 📚 Vérification de la documentation...
call :test_file "README.md"
call :test_file "QUICKSTART.md"
call :test_file "DEPLOY-PROXMOX.md"
call :test_file "ARCHITECTURE.md"

echo.
echo 🔍 Vérification de la configuration...

if exist ".env" (
    echo ✓ Fichier .env configuré
    set /a PASS+=1
) else (
    echo ⚠ Fichier .env non configuré (normal si pas encore déployé^)
)

where docker >nul 2>nul
if %errorlevel% equ 0 (
    echo ✓ Docker installé
    set /a PASS+=1
) else (
    echo ⚠ Docker non installé
)

where docker-compose >nul 2>nul
if %errorlevel% equ 0 (
    echo ✓ Docker Compose installé
    set /a PASS+=1
) else (
    echo ⚠ Docker Compose non installé
)

echo.
echo ===============================================
echo 📊 Résultats: %PASS% réussis, %FAIL% échoués
echo.

if %FAIL% equ 0 (
    echo ✅ Tous les tests sont passés !
    echo 🚀 Vous pouvez lancer le déploiement avec deploy.bat
    pause
    exit /b 0
) else (
    echo ❌ Certains fichiers sont manquants
    pause
    exit /b 1
)

:test_file
if exist "%~1" (
    echo ✓ %~1
    set /a PASS+=1
) else (
    echo ✗ %~1 - MANQUANT
    set /a FAIL+=1
)
exit /b 0
