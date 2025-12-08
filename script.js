// Variables globales
let participants = [];
let eventData = null;
let pairings = [];
let publicUrl = '';
let drawHistory = []; // Historique des tirages

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
    
    // Sauvegarder l'ancien tirage dans l'historique si il existe
    if (pairings.length > 0 && eventData) {
        const confirmed = confirm('Un tirage existe déjà. Voulez-vous créer un nouveau tirage ? L\'ancien sera conservé dans l\'historique.');
        if (!confirmed) return;
        
        drawHistory.push({
            date: new Date().toISOString(),
            eventData: { ...eventData },
            pairings: [...pairings],
            participants: [...participants]
        });
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
    
    // Mettre à jour le bouton d'historique
    updateHistoryButton();
});

// Algorithme de tirage au sort amélioré (évite les chaînes 1→2→3→1)
function generateSecretSantaPairings(participants) {
    let validPairing = false;
    let attempts = 0;
    let result = [];
    
    // Essayer jusqu'à obtenir un tirage valide et vraiment aléatoire
    while (!validPairing && attempts < 1000) {
        // Créer une copie des participants pour les receivers
        const receivers = [...participants];
        result = [];
        validPairing = true;
        
        // Pour chaque donneur
        for (let i = 0; i < participants.length; i++) {
            const giver = participants[i];
            
            // Filtrer les receivers possibles (pas soi-même et pas déjà assigné)
            let availableReceivers = receivers.filter(r => r.id !== giver.id);
            
            if (availableReceivers.length === 0) {
                validPairing = false;
                break;
            }
            
            // Choisir un receiver aléatoire parmi les disponibles
            const randomIndex = Math.floor(Math.random() * availableReceivers.length);
            const receiver = availableReceivers[randomIndex];
            
            // Ajouter le pairing
            result.push({
                giver: giver,
                receiver: receiver
            });
            
            // Retirer ce receiver de la liste disponible
            const receiverIndex = receivers.findIndex(r => r.id === receiver.id);
            receivers.splice(receiverIndex, 1);
        }
        
        // Vérifier qu'on n'a pas une simple rotation (1→2→3→1)
        if (validPairing && isSimpleRotation(result)) {
            validPairing = false;
        }
        
        attempts++;
    }
    
    if (!validPairing) {
        alert('❌ Erreur lors du tirage au sort. Veuillez réessayer.');
        return [];
    }
    
    console.log('🎲 Tirage généré après', attempts, 'tentative(s)');
    return result;
}

// Vérifier si le tirage est une simple rotation (1→2→3→1)
function isSimpleRotation(pairings) {
    if (pairings.length <= 3) return false; // Acceptable pour 3 participants
    
    // Suivre la chaîne depuis le premier participant
    let current = pairings[0].giver;
    let chainLength = 0;
    const visited = new Set();
    
    while (chainLength < pairings.length) {
        visited.add(current.id);
        const pairing = pairings.find(p => p.giver.id === current.id);
        current = pairing.receiver;
        chainLength++;
        
        // Si on revient au début
        if (current.id === pairings[0].giver.id) {
            // C'est une rotation simple si tous les participants sont dans une seule chaîne
            return chainLength === pairings.length;
        }
    }
    
    return false;
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
    
    // Ajouter les boutons d'action
    const actionsDiv = document.createElement('div');
    actionsDiv.style.marginTop = '2rem';
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '1rem';
    actionsDiv.style.justifyContent = 'center';
    actionsDiv.innerHTML = `
        <button class="btn btn-secondary" onclick="resetCurrentDraw()" style="background: #e74c3c;">
            🔄 Nouveau tirage
        </button>
        <button class="btn btn-secondary" onclick="showHistory()" id="historyBtn" style="background: #3498db;">
            📜 Historique (${drawHistory.length})
        </button>
    `;
    linksList.appendChild(actionsDiv);
    
    // Scroll vers les résultats
    pairingsResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Réinitialiser le tirage actuel
function resetCurrentDraw() {
    if (!confirm('Voulez-vous vraiment créer un nouveau tirage ? Le tirage actuel sera archivé.')) {
        return;
    }
    
    // Sauvegarder dans l'historique
    if (pairings.length > 0 && eventData) {
        drawHistory.push({
            date: new Date().toISOString(),
            eventData: { ...eventData },
            pairings: [...pairings],
            participants: [...participants]
        });
    }
    
    // Réinitialiser
    pairings = [];
    pairingsResult.classList.add('hidden');
    saveData();
    
    alert('✅ Prêt pour un nouveau tirage ! Modifiez les informations si nécessaire et cliquez sur "Générer les pairings".');
}

// Afficher l'historique
function showHistory() {
    if (drawHistory.length === 0) {
        alert('📜 Aucun tirage dans l\'historique.');
        return;
    }
    
    let html = '<div style="max-height: 60vh; overflow-y: auto;">';
    html += '<h3 style="margin-top: 0;">📜 Historique des tirages</h3>';
    
    drawHistory.forEach((draw, index) => {
        const date = new Date(draw.date);
        const dateStr = date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div style="background: #f8f9fa; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border-left: 4px solid #e74c3c;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${draw.eventData.name}</strong>
                    <small style="color: #666;">${dateStr}</small>
                </div>
                <div style="font-size: 0.9em; color: #666;">
                    ${draw.participants.length} participants • Budget: ${draw.eventData.budget}€
                </div>
                <div style="margin-top: 0.5rem;">
                    <button class="btn btn-secondary" onclick="restoreDraw(${index})" style="font-size: 0.9em; padding: 0.4rem 0.8rem;">
                        ↩️ Restaurer
                    </button>
                    <button class="btn btn-secondary" onclick="deleteDraw(${index})" style="font-size: 0.9em; padding: 0.4rem 0.8rem; background: #e74c3c;">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Créer une modal personnalisée
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    modalContent.innerHTML = html + `
        <button class="btn" onclick="this.closest('[style*=fixed]').remove()" style="width: 100%; margin-top: 1rem;">
            Fermer
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fermer en cliquant sur le fond
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Restaurer un tirage de l'historique
function restoreDraw(index) {
    if (!confirm('Voulez-vous restaurer ce tirage ? Le tirage actuel sera perdu si non sauvegardé.')) {
        return;
    }
    
    const draw = drawHistory[index];
    
    // Restaurer les données
    participants = [...draw.participants];
    eventData = { ...draw.eventData };
    pairings = [...draw.pairings];
    
    // Mettre à jour l'interface
    document.getElementById('eventName').value = eventData.name || '';
    document.getElementById('eventDate').value = eventData.date || '';
    document.getElementById('eventTime').value = eventData.time || '';
    document.getElementById('eventLocation').value = eventData.location || '';
    document.getElementById('budget').value = eventData.budget || '';
    document.getElementById('instructions').value = eventData.instructions || '';
    
    updateParticipantsList();
    displayPairings();
    saveData();
    
    // Fermer la modal
    document.querySelector('[style*="position: fixed"]').remove();
    
    alert('✅ Tirage restauré !');
}

// Supprimer un tirage de l'historique
function deleteDraw(index) {
    if (!confirm('Voulez-vous vraiment supprimer ce tirage de l\'historique ?')) {
        return;
    }
    
    drawHistory.splice(index, 1);
    saveData();
    
    // Rafraîchir l'affichage de l'historique
    document.querySelector('[style*="position: fixed"]').remove();
    showHistory();
}

// Mettre à jour le bouton d'historique
function updateHistoryButton() {
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.innerHTML = `📜 Historique (${drawHistory.length})`;
    }
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
        pairings: pairings,
        drawHistory: drawHistory // Sauvegarder l'historique
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
            drawHistory = data.drawHistory || []; // Charger l'historique
            
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
            
            console.log('📜 Historique chargé:', drawHistory.length, 'tirage(s)');
        }
    } catch (error) {
        console.error('Erreur chargement:', error);
    }
}
