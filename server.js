const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || '/data/secret-santa.json';

// Identifiants admin (à définir via variables d'environnement)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SecretSanta2024!';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-santa-session-key-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Mettre à true si HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Fonction pour lire les données
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Fichier n'existe pas, retourner données vides
            return {
                participants: [],
                eventData: null,
                pairings: []
            };
        }
        throw error;
    }
}

// Fonction pour écrire les données
async function writeData(data) {
    // Créer le dossier si nécessaire
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Middleware d'authentification
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Non authentifié' });
    }
}

// Routes d'authentification
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Identifiants incorrects' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
    res.json({ authenticated: !!req.session.authenticated });
});

// Routes de données (protégées)
app.get('/api/data', requireAuth, async (req, res) => {
    try {
        const data = await readData();
        res.json(data);
    } catch (error) {
        console.error('Erreur lecture données:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/data', requireAuth, async (req, res) => {
    try {
        await writeData(req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur écriture données:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route publique pour les participants (lecture seule)
app.get('/api/participant/:id', async (req, res) => {
    try {
        const data = await readData();
        const participantId = req.params.id;
        
        // Trouver le pairing pour ce participant
        const pairing = data.pairings.find(p => p.giver.id == participantId);
        
        if (!pairing) {
            return res.status(404).json({ error: 'Participant non trouvé' });
        }
        
        res.json({
            eventData: data.eventData,
            pairing: pairing
        });
    } catch (error) {
        console.error('Erreur lecture participant:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour servir les fichiers HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/participant', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'participant.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🎅 Serveur Secret Santa démarré sur le port ${PORT}`);
    console.log(`📁 Fichier de données: ${DATA_FILE}`);
    console.log(`👤 Admin: ${ADMIN_USERNAME}`);
});
