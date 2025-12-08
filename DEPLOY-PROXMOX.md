# Guide de Déploiement Proxmox - Secret Santa

## 📋 Prérequis

- Serveur Proxmox avec accès SSH
- Docker et Docker Compose installés
- Nginx configuré comme reverse proxy
- Domaine `santa.proxtricky.fr` pointant vers votre serveur
- Certbot pour les certificats SSL

## 🔧 Installation de Docker sur Proxmox (si nécessaire)

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installation de Docker Compose
sudo apt install docker-compose -y

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
```

## 📦 Déploiement de l'Application

### 1. Transférer les fichiers sur le serveur

Option A - Via Git (recommandé) :
```bash
ssh user@votre-serveur.proxtricky.fr
cd /opt
sudo git clone <url-de-votre-repo> secret-santa
cd secret-santa
```

Option B - Via SCP depuis votre PC :
```powershell
# Depuis Windows PowerShell
scp -r "g:\Users\gurvan\Desktop\secret santa\*" user@serveur:/opt/secret-santa/
```

### 2. Configuration des identifiants

```bash
cd /opt/secret-santa

# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos identifiants
nano .env
```

Contenu du fichier `.env` :
```bash
ADMIN_USERNAME=gurvan
ADMIN_PASSWORD=VotreMotDePasseTreSecure2024!
SESSION_SECRET=$(openssl rand -base64 32)
```

### 3. Déployer l'application

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement
./deploy.sh
```

L'application sera accessible sur `http://localhost:3000`

### 4. Configuration du Reverse Proxy Nginx

```bash
# Copier la configuration
sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/santa.proxtricky.fr

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/santa.proxtricky.fr /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t
```

### 5. Obtenir un certificat SSL

```bash
# Installer Certbot si nécessaire
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat
sudo certbot --nginx -d santa.proxtricky.fr

# Le renouvellement automatique est configuré par défaut
```

### 6. Recharger Nginx

```bash
sudo systemctl reload nginx
```

## ✅ Vérification

Votre application devrait maintenant être accessible sur :
- **https://santa.proxtricky.fr**

## 🔐 Première Connexion

1. Allez sur https://santa.proxtricky.fr
2. Utilisez les identifiants définis dans `.env`
3. Créez votre premier événement Secret Santa !

## 🛠️ Maintenance

### Voir les logs de l'application
```bash
cd /opt/secret-santa
docker-compose logs -f
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Arrêter l'application
```bash
docker-compose down
```

### Mettre à jour l'application
```bash
git pull
docker-compose build
docker-compose up -d
```

### Sauvegarder les données
```bash
# Les données sont dans le volume Docker
docker cp secret-santa:/data/secret-santa.json ./backup-$(date +%Y%m%d-%H%M%S).json
```

### Restaurer une sauvegarde
```bash
docker cp ./backup-YYYYMMDD-HHMMSS.json secret-santa:/data/secret-santa.json
docker-compose restart
```

## 🔍 Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
docker-compose logs

# Vérifier que le port 3000 n'est pas utilisé
sudo netstat -tulpn | grep 3000
```

### Nginx retourne 502 Bad Gateway
```bash
# Vérifier que le conteneur tourne
docker ps | grep secret-santa

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/santa.proxtricky.fr.error.log

# Vérifier la connexion au conteneur
curl http://localhost:3000
```

### Impossible de se connecter
```bash
# Vérifier les identifiants dans .env
cat .env

# Redémarrer l'application
docker-compose restart
```

### Certificat SSL expiré
```bash
# Renouveler manuellement
sudo certbot renew

# Recharger Nginx
sudo systemctl reload nginx
```

## 🔄 Configuration Avancée

### Changer le port de l'application
Éditez `docker-compose.yml` :
```yaml
ports:
  - "8080:3000"  # Changer 8080 par le port souhaité
```

Puis dans `nginx-reverse-proxy.conf` :
```nginx
proxy_pass http://localhost:8080;
```

### Activer les logs de debug
Éditez `.env` :
```bash
NODE_ENV=development
```

## 📊 Monitoring

### Vérifier l'utilisation des ressources
```bash
docker stats secret-santa
```

### Vérifier l'espace disque du volume
```bash
docker volume inspect secret-santa_santa-data
```

## 🎄 Support

Pour toute question, contactez **Gurvan Pincepoche**

Joyeuses fêtes ! 🎅
