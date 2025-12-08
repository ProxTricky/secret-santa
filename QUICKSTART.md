# 🎅 Secret Santa - Démarrage Rapide

## 🚀 Déploiement en 5 minutes

### 1️⃣ Configurer les identifiants
```bash
cp .env.example .env
nano .env  # Modifiez ADMIN_USERNAME et ADMIN_PASSWORD
```

### 2️⃣ Lancer l'application
**Linux/Mac :**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows :**
```powershell
.\deploy.bat
```

### 3️⃣ Configurer Nginx (sur votre serveur Proxmox)
```bash
# Copier la config
sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/santa.proxtricky.fr
sudo ln -s /etc/nginx/sites-available/santa.proxtricky.fr /etc/nginx/sites-enabled/

# Obtenir le certificat SSL
sudo certbot --nginx -d santa.proxtricky.fr

# Recharger Nginx
sudo systemctl reload nginx
```

### 4️⃣ Accéder à l'application
- **URL :** https://santa.proxtricky.fr
- **Identifiants :** Ceux définis dans `.env`

## 📚 Documentation Complète

- **README.md** - Vue d'ensemble et fonctionnalités
- **DEPLOY-PROXMOX.md** - Guide détaillé pour Proxmox
- **.env.example** - Template des variables d'environnement

## 🎯 Architecture

```
Internet → Nginx Reverse Proxy → Docker (Port 3000) → Node.js App
                 ↓
            santa.proxtricky.fr
                 ↓
            Volume Docker (/data/secret-santa.json)
```

## 🔐 Sécurité

- ✅ Authentification admin obligatoire
- ✅ HTTPS via Nginx + Let's Encrypt
- ✅ Mots de passe en variables d'environnement
- ✅ Données stockées sur le serveur (volume persistant)

## 📱 Utilisation

1. **Admin** : Connectez-vous sur https://santa.proxtricky.fr
2. **Créez l'événement** et ajoutez les participants
3. **Générez le tirage** au sort
4. **Partagez les liens** avec chaque participant
5. **Participants** : Cliquez sur le lien pour voir votre attribution

## 🛠️ Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Sauvegarder
docker cp secret-santa:/data/secret-santa.json ./backup.json
```

## 🎄 Créé par Gurvan Pincepoche

Joyeuses fêtes ! 🎅
