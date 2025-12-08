// Variables globales
let participants = [];
let eventData = null;
let pairings = [];
let publicUrl = '';

// Éléments du DOM
const participantNameInput = document.getElementById('participantName');
const participantEmailInput = document.getElementById('participantEmail');
const addParticipantBtn = document.getElementById('addParticipant');
const participantsList = document.getElementById('participantsList');
const participantCount = document.getElementById('participantCount');
const generatePairingsBtn = document.getElementById('generatePairings');
const pairingsResult = document.getElementById('pairingsResult');
const linksList = document.getElementById('linksList');

// Charger les données sauvegardées au démarrage
window.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();  // Attendre que la config soit chargée
    loadData();
    updateParticipantsList();
    checkGenerateButton();
    createSnowflakes();
    
    // Bouton de déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

// Charger la configuration (URL publique)
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            publicUrl = config.publicUrl;
            console.log('📍 URL publique configurée:', publicUrl);
        }
    } catch (error) {
        console.error('Erreur chargement config:', error);
        publicUrl = window.location.origin;
        console.log('📍 URL publique par défaut:', publicUrl);
    }
}

// Fonction de déconnexion
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        sessionStorage.removeItem('adminAuthenticated');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        window.location.href = 'login.html';
    }
}

// Créer des flocons de neige animés
function createSnowflakes() {
    const snowContainer = document.querySelector('.snow-container');
    const snowflakeCount = 50;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.innerHTML = '❄';
        snowflake.style.position = 'absolute';
        snowflake.style.color = 'rgba(255, 255, 255, 0.6)';
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = Math.random() * 10 + 10 + 's';
        snowflake.style.animationDelay = Math.random() * 10 + 's';
        snowflake.style.animation = 'snowfall ' + (Math.random() * 10 + 10) + 's linear infinite';
        snowflake.style.animationDelay = Math.random() * 10 + 's';
        snowContainer.appendChild(snowflake);
    }
}

// Ajouter un participant
addParticipantBtn.addEventListener('click', () => {
    const name = participantNameInput.value.trim();
    const email = participantEmailInput.value.trim();
    
    if (name === '') {
        alert('⚠️ Veuillez entrer un nom de participant');
        return;
    }
    
    // Vérifier si le participant existe déjà
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('⚠️ Ce participant existe déjà dans la liste');
        return;
    }
    
    const participant = {
        id: Date.now(),
        name: name,
        email: email || null
    };
    
    participants.push(participant);
    participantNameInput.value = '';
    participantEmailInput.value = '';
    
    updateParticipantsList();
    saveData();
    checkGenerateButton();
    
    // Animation de confirmation
    participantNameInput.focus();
});

// Permettre d'ajouter avec la touche Entrée
participantNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addParticipantBtn.click();
    }
});

participantEmailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addParticipantBtn.click();
    }
});

// Mettre à jour la liste des participants
function updateParticipantsList() {
    participantsList.innerHTML = '';
    
    if (participants.length === 0) {
        participantsList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Aucun participant pour le moment. Ajoutez-en pour commencer !</p>';
    } else {
        participants.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
                <div class="participant-info">
                    <strong>${participant.name}</strong>
                    ${participant.email ? `<small>${participant.email}</small>` : ''}
                </div>
                <button class="btn-remove" onclick="removeParticipant(${participant.id})">×</button>
            `;
            participantsList.appendChild(item);
        });
    }
    
    // Mettre à jour le compteur
    const count = participants.length;
    participantCount.textContent = `${count} participant${count > 1 ? 's' : ''}`;
}

// Supprimer un participant
function removeParticipant(id) {
    if (confirm('Êtes-vous sûr de vouloir retirer ce participant ?')) {
        participants = participants.filter(p => p.id !== id);
        updateParticipantsList();
        saveData();
        checkGenerateButton();
        
        // Réinitialiser le tirage si un participant est retiré
        if (pairings.length > 0) {
            if (confirm('Le tirage existant sera annulé. Voulez-vous continuer ?')) {
                pairings = [];
                pairingsResult.classList.add('hidden');
                saveData();
            } else {
                // Annuler la suppression
                return;
            }
        }
    }
}

// Vérifier si le bouton de génération doit être activé
function checkGenerateButton() {
    const eventName = document.getElementById('eventName').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventLocation = document.getElementById('eventLocation').value.trim();
    const budget = document.getElementById('budget').value;
    
    const isEventValid = eventName && eventDate && eventTime && eventLocation && budget;
    const hasEnoughParticipants = participants.length >= 3;
    
    generatePairingsBtn.disabled = !(isEventValid && hasEnoughParticipants);
}

// Écouter les changements dans le formulaire
['eventName', 'eventDate', 'eventTime', 'eventLocation', 'budget'].forEach(id => {
    document.getElementById(id).addEventListener('input', checkGenerateButton);
});

// Générer les pairings (tirage au sort)
generatePairingsBtn.addEventListener('click', () => {
    if (participants.length < 3) {
        alert('⚠️ Il faut au minimum 3 participants pour faire un Secret Santa');
        return;
    }
    
    // Récupérer les données de l'événement
    eventData = {
        name: document.getElementById('eventName').value.trim(),
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value.trim(),
        budget: document.getElementById('budget').value,
        instructions: document.getElementById('instructions').value.trim()
    };
    
    // Générer les pairings
    pairings = generateSecretSantaPairings(participants);
    
    // Sauvegarder
    saveData();
    
    // Afficher les résultats
    displayPairings();
});

// Algorithme de tirage au sort
function generateSecretSantaPairings(participants) {
    const shuffled = [...participants];
    let validPairing = false;
    let attempts = 0;
    let result = [];
    
    // Essayer jusqu'à obtenir un tirage valide (personne ne se tire elle-même)
    while (!validPairing && attempts < 1000) {
        // Mélanger le tableau
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Vérifier que personne ne s'est tiré soi-même
        validPairing = true;
        result = participants.map((giver, index) => {
            const receiver = shuffled[index];
            if (giver.id === receiver.id) {
                validPairing = false;
            }
            return {
                giver: giver,
                receiver: receiver
            };
        });
        
        attempts++;
    }
    
    if (!validPairing) {
        alert('❌ Erreur lors du tirage au sort. Veuillez réessayer.');
        return [];
    }
    
    return result;
}

// Afficher les pairings
function displayPairings() {
    linksList.innerHTML = '';
    pairingsResult.classList.remove('hidden');
    
    pairings.forEach(pairing => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        
        // Créer un lien unique pour chaque participant
        const participantLink = createParticipantLink(pairing.giver.id);
        
        linkItem.innerHTML = `
            <strong>${pairing.giver.name}</strong>
            <div class="link-url">
                <input type="text" readonly value="${participantLink}" id="link-${pairing.giver.id}">
                <button class="btn-copy" onclick="copyLink(${pairing.giver.id})">📋 Copier</button>
            </div>
        `;
        
        linksList.appendChild(linkItem);
    });
    
    // Scroll vers les résultats
    pairingsResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Créer un lien personnalisé pour un participant
function createParticipantLink(participantId) {
    // Utiliser l'URL publique configurée, sinon construire depuis origin
    let baseUrl = publicUrl;
    
    if (!baseUrl) {
        // Fallback: utiliser window.location.origin (sans le path)
        baseUrl = window.location.origin;
    }
    
    const link = `${baseUrl}/participant.html?id=${participantId}`;
    console.log('🔗 Lien généré:', link);
    return link;
}

// Copier un lien
function copyLink(participantId) {
    const input = document.getElementById(`link-${participantId}`);
    input.select();
    input.setSelectionRange(0, 99999); // Pour mobile
    
    navigator.clipboard.writeText(input.value).then(() => {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copié !';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        alert('Erreur lors de la copie : ' + err);
    });
}

// Sauvegarder les données dans le localStorage
function saveData() {
    const data = {
        participants: participants,
        eventData: eventData,
        pairings: pairings
    };
    
    // Sauvegarder sur le serveur
    fetch('/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(err => {
        console.error('Erreur sauvegarde:', err);
        alert('⚠️ Erreur lors de la sauvegarde des données');
    });
}

// Charger les données du localStorage
async function loadData() {
    try {
        const response = await fetch('/api/data');
        if (response.ok) {
            const data = await response.json();
            participants = data.participants || [];
            eventData = data.eventData || null;
            pairings = data.pairings || [];
            
            // Restaurer les données de l'événement
            if (eventData) {
                document.getElementById('eventName').value = eventData.name || '';
                document.getElementById('eventDate').value = eventData.date || '';
                document.getElementById('eventTime').value = eventData.time || '';
                document.getElementById('eventLocation').value = eventData.location || '';
                document.getElementById('budget').value = eventData.budget || '';
                document.getElementById('instructions').value = eventData.instructions || '';
            }
            
            // Afficher les pairings s'ils existent
            if (pairings.length > 0) {
                displayPairings();
            }
        }
    } catch (error) {
        console.error('Erreur chargement:', error);
    }
}
