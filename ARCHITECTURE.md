# 🎅 Secret Santa - Architecture Complète

## 📂 Structure du Projet

```
secret-santa/
│
├── 📄 Backend (Node.js + Express)
│   ├── server.js              # Serveur API REST
│   ├── package.json           # Dépendances
│   └── .env                   # Configuration (à créer)
│
├── 🎨 Frontend (HTML/CSS/JS)
│   ├── login.html             # Page de connexion
│   ├── admin.html             # Interface administrateur
│   ├── participant.html       # Page participant
│   ├── styles.css             # Styles et animations
│   ├── script.js              # Logique admin
│   └── participant.js         # Logique participant
│
├── 🐳 Docker
│   ├── Dockerfile             # Image Node.js Alpine
│   ├── docker-compose.yml     # Configuration production
│   └── docker-compose.simple.yml  # Configuration dev locale
│
├── 🌐 Nginx
│   ├── nginx-reverse-proxy.conf   # Config pour Proxmox
│   └── nginx.conf             # Config standalone (non utilisé)
│
├── 📜 Scripts de Déploiement
│   ├── deploy.sh              # Déploiement Linux/Mac
│   ├── deploy.bat             # Déploiement Windows
│   ├── dev.sh                 # Développement local Linux/Mac
│   └── dev.bat                # Développement local Windows
│
├── 📚 Documentation
│   ├── README.md              # Documentation principale
│   ├── QUICKSTART.md          # Guide de démarrage rapide
│   ├── DEPLOY-PROXMOX.md      # Guide Proxmox détaillé
│   └── ARCHITECTURE.md        # Ce fichier
│
└── ⚙️ Configuration
    ├── .env.example           # Template variables d'environnement
    ├── .gitignore             # Fichiers à ignorer (Git)
    └── .dockerignore          # Fichiers à ignorer (Docker)
```

## 🏗️ Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│             DNS: santa.proxtricky.fr                        │
│             Pointe vers IP du serveur Proxmox               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVEUR PROXMOX                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Nginx Reverse Proxy (Port 80/443)            │   │
│  │  - Gestion SSL/HTTPS (Let's Encrypt)                 │   │
│  │  - Redirection HTTP → HTTPS                          │   │
│  │  - Headers de sécurité                               │   │
│  │  - Proxy vers application                            │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Docker Container: secret-santa                 │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Node.js + Express (Port 3000)                │  │   │
│  │  │                                                 │  │   │
│  │  │  ├─ Routes Publiques:                          │  │   │
│  │  │  │  GET  /                 → login.html        │  │   │
│  │  │  │  GET  /participant?id=X → données participant│ │   │
│  │  │  │  POST /api/auth/login   → authentification  │  │   │
│  │  │  │                                              │  │   │
│  │  │  └─ Routes Protégées (auth requise):           │  │   │
│  │  │     GET  /admin            → admin.html        │  │   │
│  │  │     GET  /api/data         → lecture données   │  │   │
│  │  │     POST /api/data         → sauvegarde données│  │   │
│  │  │     POST /api/auth/logout  → déconnexion       │  │   │
│  │  │                                                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Volume Docker Persistant                     │  │   │
│  │  │   /data/secret-santa.json                      │  │   │
│  │  │                                                 │  │   │
│  │  │   Contient:                                     │  │   │
│  │  │   - Liste des participants                      │  │   │
│  │  │   - Données de l'événement                      │  │   │
│  │  │   - Attributions (pairings)                     │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### 1️⃣ Administrateur

```
[Admin] → https://santa.proxtricky.fr
    ↓
[Nginx] → HTTPS, authentification SSL
    ↓
[Node.js] → GET / → login.html
    ↓
[Admin entre identifiants]
    ↓
[Node.js] → POST /api/auth/login
    ↓
[Vérification: username & password vs .env]
    ↓
[Session créée] → Redirection /admin
    ↓
[Node.js] → GET /admin → admin.html
    ↓
[Admin crée événement + participants]
    ↓
[JavaScript] → POST /api/data
    ↓
[Node.js] → Sauvegarde dans /data/secret-santa.json
    ↓
[Génération des liens uniques pour chaque participant]
```

### 2️⃣ Participant

```
[Participant] → Clic sur lien unique
    ↓
https://santa.proxtricky.fr/participant?id=123456789
    ↓
[Nginx] → HTTPS
    ↓
[Node.js] → GET /participant → participant.html
    ↓
[JavaScript] → GET /api/participant/123456789
    ↓
[Node.js] → Lecture de /data/secret-santa.json
    ↓
[Recherche du pairing pour cet ID]
    ↓
[Retour JSON avec eventData + pairing]
    ↓
[Affichage des infos événement]
    ↓
[Bouton "Révéler" → Affiche le nom du destinataire]
    ↓
[Animation confettis 🎉]
```

## 🔐 Sécurité

### Couches de Sécurité

1. **Nginx (Reverse Proxy)**
   - HTTPS obligatoire (certificat Let's Encrypt)
   - Redirection automatique HTTP → HTTPS
   - Headers de sécurité (HSTS, X-Frame-Options, etc.)

2. **Node.js (Application)**
   - Sessions Express avec secret
   - Authentification requise pour routes admin
   - Validation des identifiants
   - Utilisateur non-root dans Docker

3. **Docker**
   - Isolation du processus
   - Volume persistant séparé
   - Pas de privilèges root
   - Image Alpine légère

4. **Configuration**
   - Identifiants en variables d'environnement
   - Fichier .env non versionné
   - Secrets session aléatoires

### Séparation des Rôles

| Rôle | Accès | Actions |
|------|-------|---------|
| **Admin** | Login requis | Créer événement, gérer participants, générer tirage |
| **Participant** | Lien unique | Voir événement, révéler son attribution |
| **Public** | Aucun | Redirection vers login |

## 💾 Stockage des Données

### Format JSON
```json
{
  "participants": [
    {
      "id": 1638901234567,
      "name": "Alice",
      "email": "alice@example.com"
    }
  ],
  "eventData": {
    "name": "Secret Santa Famille",
    "date": "2025-12-24",
    "time": "18:00",
    "location": "Chez grand-mère",
    "budget": "30",
    "instructions": "Cadeaux faits maison privilégiés"
  },
  "pairings": [
    {
      "giver": { "id": 123, "name": "Alice" },
      "receiver": { "id": 456, "name": "Bob" }
    }
  ]
}
```

### Persistance
- **Volume Docker** : `santa-data:/data`
- **Fichier** : `/data/secret-santa.json`
- **Sauvegarde automatique** : À chaque modification via API
- **Survie** : Redémarrages, mises à jour, recreate du conteneur

## 🚀 Déploiement

### Environnements

1. **Développement Local**
   - `docker-compose.simple.yml`
   - Port 8080
   - Pas de SSL
   - Volumes montés en lecture seule

2. **Production (Proxmox)**
   - `docker-compose.yml`
   - Port 3000 (interne)
   - SSL via Nginx
   - Volume persistant
   - Variables d'environnement depuis .env

## 🛠️ Technologies Utilisées

### Backend
- **Node.js 18** (Alpine)
- **Express.js** - Framework web
- **express-session** - Gestion des sessions
- **body-parser** - Parse JSON
- **cors** - Cross-Origin Resource Sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Design moderne avec animations
- **JavaScript Vanilla** - Aucune dépendance

### Infrastructure
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **Let's Encrypt** - Certificats SSL
- **Proxmox** - Virtualisation

## 📊 Performances

- **Image Docker** : ~150 MB (Node.js Alpine)
- **RAM** : ~50 MB (Node.js process)
- **CPU** : Minimal (application stateless)
- **Stockage** : <1 MB (fichier JSON)
- **Temps de démarrage** : <2 secondes

## 🎨 Design System

### Couleurs
- **Primary** : `#c41e3a` (Rouge Noël)
- **Secondary** : `#165b33` (Vert sapin)
- **Gold** : `#ffd700` (Doré)
- **Gradients** : Bleu foncé pour le fond

### Animations
- Flocons de neige tombant
- Confettis lors de la révélation
- Transitions fluides
- Effets de survol

## 📈 Évolutions Futures Possibles

- [ ] Envoi automatique des liens par email
- [ ] Interface multilingue (EN, ES, DE)
- [ ] Wishlist pour chaque participant
- [ ] Rappels par email avant l'événement
- [ ] Export PDF du récapitulatif
- [ ] Thèmes personnalisables
- [ ] Support multi-événements
- [ ] Application mobile (PWA)

---

**Créé avec ❤️ par Gurvan Pincepoche** 🎄
