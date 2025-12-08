@echo off
echo 🎅 Déploiement du Secret Santa...

REM Vérifier que le fichier .env existe
if not exist .env (
    echo ⚠️  Fichier .env non trouvé!
    echo � Création depuis .env.example...
    copy .env.example .env
    echo.
    echo 🔐 IMPORTANT: Modifiez le fichier .env avec vos identifiants!
    echo    Puis relancez ce script.
    pause
    exit /b 1
)

REM Build de l'image
echo 🔨 Build de l'image Docker...
docker-compose build

REM Arrêter les anciens conteneurs
echo 🛑 Arrêt des anciens conteneurs...
docker-compose down

REM Démarrer les services
echo 🚀 Démarrage des services...
docker-compose up -d

REM Afficher les informations
echo.
echo ✅ Secret Santa démarré avec succès!
echo.
echo 📍 Application disponible sur:
echo    - Local: http://localhost:3000
echo    - Domaine: https://santa.proxtricky.fr (après configuration nginx)
echo.
echo 🔐 Identifiants admin définis dans le fichier .env
echo.
echo 📋 Commandes utiles:
echo    - Voir les logs: docker-compose logs -f
echo    - Arrêter: docker-compose down
echo    - Redémarrer: docker-compose restart
echo.
echo 🎄 Joyeuses fêtes ! - Créé par Gurvan Pincepoche 🎄
pause
