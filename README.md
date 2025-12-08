# 🎅 Secret Santa - Application Web

Une application web moderne et élégante pour organiser vos tirages au sort de Secret Santa, entièrement en français !

## 🎯 À propos

Cette application permet de gérer facilement des événements Secret Santa avec une interface d'administration complète et des liens personnalisés pour chaque participant. Déployable sur n'importe quel serveur avec Docker.

## ✨ Fonctionnalités

### 🔐 Authentification Admin
- **Page de connexion sécurisée** : Protège l'accès à l'interface d'administration
- **Identifiants configurables** : Définis via variables d'environnement
- **Session persistante** : Reste connecté pendant la session

### 🎁 Interface d'Administration
- **Création d'événement** : Définissez le nom, la date, l'heure, le lieu et le budget
- **Gestion des participants** : Ajoutez et supprimez facilement des participants
- **Tirage au sort amélioré** : Algorithme aléatoire évitant les chaînes simples (1→2→3→1)
- **Historique des tirages** : Créez plusieurs tirages et naviguez dans l'historique
- **Génération de liens personnalisés** : Chaque participant reçoit un lien unique
- **Copie facile** : Bouton pour copier rapidement les liens

### 📱 Page Participant
- **Informations de l'événement** : Date, heure, lieu, budget
- **Révélation du cadeau** : Bouton pour découvrir à qui offrir un cadeau
- **Animation festive** : Confettis et animations lors de la révélation
- **Design responsive** : Fonctionne sur mobile, tablette et ordinateur

### � Stockage Persistant
- **Backend Node.js** : API REST pour gérer les données
- **Stockage serveur** : Fichier JSON persistant dans un volume Docker
- **Pas de perte de données** : Les données survivent aux redémarrages

## 🚀 Déploiement avec Docker

### Prérequis

- Serveur avec Docker et Docker Compose installés
- (Optionnel) Reverse proxy (Nginx, Traefik, Caddy) pour HTTPS
- (Optionnel) Nom de domaine pointant vers votre serveur

### Installation Rapide

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/secret-santa.git
   cd secret-santa
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Modifiez les valeurs :
   ```env
   # Identifiants administrateur
   ADMIN_USERNAME=votre_nom_utilisateur
   ADMIN_PASSWORD=VotreMotDePasseSuperSecure123!
   
   # Secret pour les sessions (générez une chaîne aléatoire)
   SESSION_SECRET=une-chaine-aleatoire-tres-longue-et-securisee
   
   # URL publique de votre application (pour la génération des liens)
   PUBLIC_URL=http://votre-domaine.com
   # ou simplement: PUBLIC_URL=http://192.168.1.100:3000
   ```

3. **Démarrer l'application**
   ```bash
   docker compose up -d
   ```
   
   L'application sera accessible sur `http://localhost:3000`

### 🌐 Configuration avec Reverse Proxy (Optionnel)

Un fichier exemple `nginx-reverse-proxy.conf` est fourni pour configurer Nginx comme reverse proxy avec HTTPS.

## 🛠️ Gestion

### Voir les logs
```bash
docker compose logs -f
```

### Arrêter l'application
```bash
docker compose down
```

### Redémarrer l'application
```bash
docker compose restart
```

### Mettre à jour
```bash
git pull
docker compose build --no-cache
docker compose up -d
```

### Sauvegarder les données
```bash
# Les données sont dans le volume Docker
docker cp secret-santa:/data/secret-santa.json ./backup-$(date +%Y%m%d).json
```

### Restaurer les données
```bash
docker cp ./backup-YYYYMMDD.json secret-santa:/data/secret-santa.json
docker compose restart
```

## 📋 Architecture

```
┌─────────────────────────────────────┐
│   Reverse Proxy (Optionnel)        │
│   votre-domaine.com                 │
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
| `PUBLIC_URL` | URL publique de l'application | `http://localhost:3000` |
| `PORT` | Port de l'application | `3000` |
| `DATA_FILE` | Chemin du fichier de données | `/data/secret-santa.json` |

## 🎨 Design

- **Moderne et élégant** : Interface avec dégradés, ombres et animations
- **Thème festif** : Flocons de neige animés, couleurs de Noël
- **Animations** : Transitions fluides, effets de survol, confettis
- **Responsive** : S'adapte automatiquement à tous les écrans

## 📁 Structure du Projet

```
secret-santa/
├── server.js                    # Backend Node.js + Express
├── package.json                 # Dépendances Node.js
├── Dockerfile                   # Image Docker
├── docker-compose.yml           # Configuration Docker Compose
├── .env.example                 # Template variables d'environnement
├── nginx-reverse-proxy.conf     # Config Nginx exemple
├── admin.html                   # Interface admin
├── login.html                   # Page de connexion
├── participant.html             # Page participant
├── styles.css                   # Styles CSS
├── script.js                    # Logique admin
├── participant.js               # Logique participant
└── README.md                    # Documentation
```

## 🔒 Sécurité

- ✅ Authentification requise pour l'admin
- ✅ Sessions sécurisées avec Express
- ✅ HTTPS via Nginx reverse proxy
- ✅ Mots de passe configurables via variables d'environnement
- ✅ Headers de sécurité HTTP
- ✅ Utilisateur non-root dans le conteneur Docker

## 🎁 Utilisation

1. **Connectez-vous** à l'interface admin (http://localhost:3000 ou votre domaine)
2. **Entrez vos identifiants** configurés dans le fichier `.env`
3. **Remplissez** les informations de l'événement (nom, date, lieu, budget)
4. **Ajoutez** tous les participants (minimum 3 personnes)
5. **Générez** le tirage au sort avec l'algorithme aléatoire
6. **Copiez** les liens personnalisés et envoyez-les aux participants
7. Les participants **ouvrent** leur lien unique pour découvrir leur attribution

## � Fonctionnalités Avancées

- **Nouveau tirage** : Créez plusieurs tirages pour le même événement
- **Historique** : Consultez et restaurez les tirages précédents
- **Algorithme intelligent** : Évite les suites simples (1→2→3→1) pour plus d'aléatoire

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🎄 Joyeuses fêtes !

Profitez de vos échanges de cadeaux ! 🎁
