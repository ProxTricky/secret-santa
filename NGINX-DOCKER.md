# 🚀 Déploiement avec Nginx dans Docker

## Étape 1 : Configuration initiale

Sur votre serveur, modifiez le fichier `.env` :
```bash
cd /opt/secret-santa
nano .env
```

Ajoutez votre email pour Let's Encrypt :
```bash
ADMIN_USERNAME=gurvan
ADMIN_PASSWORD=VotreMotDePasseSuperSecure123!
SESSION_SECRET=une-chaine-aleatoire-longue
CERTBOT_EMAIL=votre-email@example.com  # ← VOTRE EMAIL
```

## Étape 2 : Modifier docker-compose.yml pour l'email

Éditez le docker-compose.yml pour remplacer l'email :
```bash
nano docker-compose.yml
```

Cherchez la ligne :
```yaml
command: certonly --webroot --webroot-path=/var/www/html --email votre-email@example.com
```

Remplacez par votre vraie adresse email.

## Étape 3 : Lancer sans SSL d'abord

```bash
# Commentez temporairement le service certbot dans docker-compose.yml
# Ou lancez juste app + nginx
docker-compose up -d secret-santa nginx
```

Testez : http://santa.proxtricky.fr (HTTP seulement pour l'instant)

## Étape 4 : Obtenir le certificat SSL

```bash
# Lancer Certbot pour obtenir le certificat
docker-compose run --rm certbot
```

## Étape 5 : Activer HTTPS

Éditez `nginx-docker.conf` :
```bash
nano nginx-docker.conf
```

1. **Décommentez** la section HTTPS (server 443)
2. **Commentez** la section HTTP location / 
3. **Décommentez** la redirection HTTPS dans le server 80

## Étape 6 : Redémarrer Nginx

```bash
docker-compose restart nginx
```

## ✅ Accès final

https://santa.proxtricky.fr

---

## 🔄 Renouvellement automatique SSL

Ajoutez un cron job :
```bash
crontab -e
```

Ajoutez :
```
0 3 * * * cd /opt/secret-santa && docker-compose run --rm certbot renew && docker-compose restart nginx
```

Cela renouvellera le certificat tous les jours à 3h du matin.
