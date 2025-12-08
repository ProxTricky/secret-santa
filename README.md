# 🎅 Secret Santa - Site Web

Un site web moderne et élégant pour organiser votre Secret Santa en français !

**Créé par Gurvan Pincepoche** 🎄

## ✨ Fonctionnalités

### 🔐 Authentification Admin
- **Page de connexion sécurisée** : Protège l'accès à l'interface d'administration
- **Identifiants configurables** : Définis via variables d'environnement
- **Session persistante** : Reste connecté pendant la session

### Interface d'Administration
- **Création d'événement** : Définissez le nom, la date, l'heure, le lieu et le budget
- **Gestion des participants** : Ajoutez et supprimez facilement des participants
- **Tirage au sort automatique** : Génération aléatoire des attributions (personne ne se tire elle-même)
- **Génération de liens personnalisés** : Chaque participant reçoit un lien unique
- **Copie facile** : Bouton pour copier rapidement les liens

### Page Participant
- **Informations de l'événement** : Date, heure, lieu, budget
- **Révélation du cadeau** : Bouton pour découvrir à qui offrir un cadeau
- **Animation festive** : Confettis et animations lors de la révélation
- **Design responsive** : Fonctionne sur mobile, tablette et ordinateur

### � Stockage Persistant
- **Backend Node.js** : API REST pour gérer les données
- **Stockage serveur** : Fichier JSON persistant dans un volume Docker
- **Pas de perte de données** : Les données survivent aux redémarrages

## 🚀 Déploiement sur Proxmox

### Prérequis

- Serveur Proxmox avec Docker installé
- Nginx comme reverse proxy
- Nom de domaine `santa.proxtricky.fr` pointant vers votre serveur
- Certificat SSL (Let's Encrypt recommandé)

### Installation Rapide

1. **Cloner le projet sur votre serveur Proxmox**
   ```bash
   cd /opt
   git clone <votre-repo> secret-santa
   cd secret-santa
   ```

2. **Configurer les identifiants**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Modifiez les valeurs :
   ```bash
   ADMIN_USERNAME=votre_nom_utilisateur
   ADMIN_PASSWORD=VotreMotDePasseSuperSecure123!
   SESSION_SECRET=une-chaine-aleatoire-tres-longue-et-securisee
   ```

3. **Déployer l'application**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Configurer Nginx Reverse Proxy**
   ```bash
   sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/santa.proxtricky.fr
   sudo ln -s /etc/nginx/sites-available/santa.proxtricky.fr /etc/nginx/sites-enabled/
   ```
   
   Éditez le fichier si nécessaire :
   ```bash
   sudo nano /etc/nginx/sites-available/santa.proxtricky.fr
   ```

5. **Obtenir un certificat SSL avec Certbot**
   ```bash
   sudo certbot --nginx -d santa.proxtricky.fr
   ```

6. **Redémarrer Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 🌐 Accès

- **Administration** : https://santa.proxtricky.fr
- **Connexion avec les identifiants** définis dans `.env`

## 🛠️ Gestion

### Voir les logs
```bash
docker-compose logs -f
```

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Mettre à jour
```bash
git pull
docker-compose build
docker-compose up -d
```

### Sauvegarder les données
```bash
# Les données sont dans le volume Docker
docker cp secret-santa:/data/secret-santa.json ./backup-$(date +%Y%m%d).json
```

### Restaurer les données
```bash
docker cp ./backup-YYYYMMDD.json secret-santa:/data/secret-santa.json
docker-compose restart
```

## 📋 Architecture

```
┌─────────────────────────────────────┐
│   Nginx Reverse Proxy (Proxmox)    │
│   santa.proxtricky.fr               │
│   SSL/HTTPS                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Docker Container (Port 3000)      │
│   ┌─────────────────────────────┐   │
│   │   Node.js + Express         │   │
│   │   - API REST                │   │
│   │   - Sessions                │   │
│   │   - Authentification        │   │
│   └─────────────────────────────┘   │
│   ┌─────────────────────────────┐   │
│   │   Volume persistant         │   │
│   │   /data/secret-santa.json   │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🔧 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `ADMIN_USERNAME` | Nom d'utilisateur admin | `admin` |
| `ADMIN_PASSWORD` | Mot de passe admin | `SecretSanta2024!` |
| `SESSION_SECRET` | Secret pour les sessions | (à changer) |
| `PORT` | Port de l'application | `3000` |
| `DATA_FILE` | Chemin du fichier de données | `/data/secret-santa.json` |

## 🎨 Design

- **Moderne et élégant** : Interface avec dégradés, ombres et animations
- **Thème festif** : Flocons de neige animés, couleurs de Noël
- **Animations** : Transitions fluides, effets de survol, confettis
- **Responsive** : S'adapte automatiquement à tous les écrans

## � Structure du Projet

```
secret-santa/
├── server.js                    # Backend Node.js + Express
├── package.json                 # Dépendances Node.js
├── Dockerfile                   # Image Docker
├── docker-compose.yml           # Configuration Docker Compose
├── .env.example                 # Template variables d'environnement
├── nginx-reverse-proxy.conf     # Config Nginx pour Proxmox
├── deploy.sh / deploy.bat       # Scripts de déploiement
├── index.html                   # Interface admin
├── login.html                   # Page de connexion
├── participant.html             # Page participant
├── styles.css                   # Styles CSS
├── script.js                    # Logique admin
├── participant.js               # Logique participant
└── README.md                    # Cette documentation
```

## 🔒 Sécurité

- ✅ Authentification requise pour l'admin
- ✅ Sessions sécurisées avec Express
- ✅ HTTPS via Nginx reverse proxy
- ✅ Mots de passe configurables via variables d'environnement
- ✅ Headers de sécurité HTTP
- ✅ Utilisateur non-root dans le conteneur Docker

## 🎁 Utilisation

1. **Connectez-vous** à https://santa.proxtricky.fr
2. **Remplissez** les informations de l'événement
3. **Ajoutez** tous les participants (minimum 3)
4. **Générez** le tirage au sort
5. **Copiez** les liens et envoyez-les à chaque participant
6. Les participants **cliquent** sur leur lien pour voir leur attribution

## 🎄 Joyeuses fêtes !

Créé avec ❤️ par **Gurvan Pincepoche**
