@echo off
echo 🧪 Lancement en mode développement local...

REM Build de l'image
echo 🔨 Build de l'image Docker...
docker-compose -f docker-compose.simple.yml build

REM Démarrer le conteneur
echo 🚀 Démarrage du conteneur...
docker-compose -f docker-compose.simple.yml up -d

echo.
echo ✅ Secret Santa disponible sur :
echo    http://localhost:8080
echo.
echo Pour arrêter : docker-compose -f docker-compose.simple.yml down
echo Pour voir les logs : docker-compose -f docker-compose.simple.yml logs -f
pause
