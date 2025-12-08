FROM node:18-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le serveur
COPY server.js ./

# Créer le dossier public et copier les fichiers
RUN mkdir -p public
COPY admin.html public/
COPY login.html public/
COPY participant.html public/
COPY styles.css public/
COPY script.js public/
COPY participant.js public/

# Créer le dossier pour les données
RUN mkdir -p /data && chown -R node:node /data

# Utiliser l'utilisateur non-root
USER node

# Exposer le port 3000
EXPOSE 3000

# Variable d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_FILE=/data/secret-santa.json

# Démarrer le serveur
CMD ["node", "server.js"]
