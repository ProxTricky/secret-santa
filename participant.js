// Récupérer les données de l'événement et du participant
window.addEventListener('DOMContentLoaded', () => {
    createSnowflakes();
    loadParticipantData();
});

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

// Charger les données du participant
function loadParticipantData() {
    // Récupérer l'ID du participant depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const participantId = urlParams.get('id');
    
    if (!participantId) {
        showError('Lien invalide. Veuillez utiliser le lien fourni par l\'organisateur.');
        return;
    }
    
    // Charger les données depuis le serveur
    fetch(`/api/participant/${participantId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Participant non trouvé');
            }
            return response.json();
        })
        .then(data => {
            displayParticipantInfo(data.pairing, data.eventData);
        })
        .catch(error => {
            console.error('Erreur:', error);
            showError('Erreur lors du chargement des données. L\'événement n\'est peut-être pas encore configuré.');
        });
}

// Afficher les informations du participant
function displayParticipantInfo(pairing, eventData) {
    // Nom du participant
    document.getElementById('participantName').textContent = pairing.giver.name;
    
    // Détails de l'événement
    document.getElementById('eventNameDisplay').textContent = eventData.name;
    document.getElementById('eventLocationDisplay').textContent = eventData.location;
    
    // Formater la date et l'heure
    const eventDate = new Date(eventData.date + 'T' + eventData.time);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const formattedDate = eventDate.toLocaleDateString('fr-FR', options);
    document.getElementById('eventDateDisplay').textContent = formattedDate;
    
    document.getElementById('budgetDisplay').textContent = eventData.budget;
    
    // Instructions supplémentaires
    if (eventData.instructions && eventData.instructions.trim() !== '') {
        document.getElementById('instructionsSection').classList.remove('hidden');
        document.getElementById('instructionsDisplay').textContent = eventData.instructions;
    }
    
    // Bouton de révélation
    const revealBtn = document.getElementById('revealBtn');
    const revealContent = document.getElementById('revealContent');
    const recipientName = document.getElementById('recipientName');
    
    revealBtn.addEventListener('click', () => {
        recipientName.textContent = pairing.receiver.name;
        revealBtn.style.display = 'none';
        document.querySelector('.mystery-text').style.display = 'none';
        revealContent.classList.remove('hidden');
        
        // Animation de confettis (effet visuel)
        createConfetti();
    });
}

// Créer un effet de confettis
function createConfetti() {
    const colors = ['#c41e3a', '#165b33', '#ffd700', '#ffffff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        // Animer le confetti
        const duration = Math.random() * 3 + 2;
        const endLeft = parseFloat(confetti.style.left) + (Math.random() - 0.5) * 100;
        
        confetti.animate([
            { 
                top: '-10px', 
                left: confetti.style.left,
                opacity: 1,
                transform: 'rotate(0deg)'
            },
            { 
                top: '100vh', 
                left: endLeft + '%',
                opacity: 0,
                transform: 'rotate(' + (Math.random() * 720) + 'deg)'
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // Supprimer le confetti après l'animation
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

// Afficher une erreur
function showError(message) {
    const container = document.querySelector('.participant-card');
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">😕</div>
            <h2 style="color: var(--primary-color); margin-bottom: 1rem;">Oups !</h2>
            <p style="color: #666; font-size: 1.1rem;">${message}</p>
        </div>
    `;
}
