#!/bin/bash

echo "🧪 Tests de vérification du projet Secret Santa"
echo "==============================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASS=0
FAIL=0

# Fonction de test
test_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1 - MANQUANT"
        ((FAIL++))
    fi
}

test_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1/ - MANQUANT"
        ((FAIL++))
    fi
}

echo "📁 Vérification des fichiers principaux..."
test_file "admin.html"
test_file "login.html"
test_file "participant.html"
test_file "styles.css"
test_file "script.js"
test_file "participant.js"
test_file "server.js"
test_file "package.json"

echo ""
echo "🐳 Vérification des fichiers Docker..."
test_file "Dockerfile"
test_file "docker-compose.yml"
test_file ".dockerignore"

echo ""
echo "⚙️ Vérification de la configuration..."
test_file ".env.example"
test_file ".gitignore"
test_file "nginx-reverse-proxy.conf"

echo ""
echo "📜 Vérification des scripts..."
test_file "deploy.sh"
test_file "deploy.bat"
test_file "dev.sh"
test_file "dev.bat"

echo ""
echo "📚 Vérification de la documentation..."
test_file "README.md"
test_file "QUICKSTART.md"
test_file "DEPLOY-PROXMOX.md"
test_file "ARCHITECTURE.md"

echo ""
echo "🔍 Vérification de la configuration..."

# Vérifier si .env existe
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Fichier .env configuré"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Fichier .env non configuré (normal si pas encore déployé)"
fi

# Vérifier si Docker est installé
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker installé"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Docker non installé"
fi

# Vérifier si Docker Compose est installé
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose installé"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Docker Compose non installé"
fi

echo ""
echo "==============================================="
echo "📊 Résultats: ${GREEN}${PASS} réussis${NC}, ${RED}${FAIL} échoués${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
    echo "🚀 Vous pouvez lancer le déploiement avec ./deploy.sh"
    exit 0
else
    echo -e "${RED}❌ Certains fichiers sont manquants${NC}"
    exit 1
fi
