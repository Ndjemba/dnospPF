# 🚀 Guide de Déploiement - Dnosp-PF

Pour héberger votre application en ligne, vous avez plusieurs options. Voici les recommandations basées sur les technologies utilisées (Next.js, Prisma, WebRTC, Socket.io).

## 1. Choix de l'hébergement (Recommandé)

Étant donné que votre application utilise **SQLite** (fichiers locaux) et **Socket.io** (connexion persistante), je vous recommande des plateformes qui gèrent les serveurs d'arrière-plan et les volumes persistants :

### Option A : Render.com (Simple)
1. Créez un compte sur [Render.com](https://render.com).
2. Créez un nouveau **"Web Service"**.
3. Connectez votre dépôt GitHub.
4. **Configuration :**
   - Runtime : `Node`
   - Build Command : `npm install && npx prisma generate && npm run build`
   - Start Command : `npx prisma db push && npm start`
5. **Important :** Ajoutez un **"Disk"** (Volume) de 1 Go monté sur `/app/data` et `/app/uploads` pour ne pas perdre vos fichiers et votre base de données à chaque redémarrage.

### Option B : VPS (DigitalOcean, OVH, AWS) - Plus de contrôle
Si vous voulez un contrôle total, louez un petit serveur Linux (Ubuntu).
1. Installez Docker.
2. Utilisez le `Dockerfile` fourni ci-dessous.
3. Configurez un nom de domaine avec Nginx et SSL (Certbot).

---

## 2. Variables d'environnement indispensables

Lors du déploiement, vous devez configurer ces variables dans l'interface de votre hébergeur :

- `DATABASE_URL` : `file:./data/prod.db`
- `NEXTAUTH_SECRET` : Une phrase très longue et aléatoire (ex: `votre_cle_secrete_123!`).
- `NEXTAUTH_URL` : L'URL finale de votre site (ex: `https://dnosp-pf.onrender.com`).
- `NODE_ENV` : `production`

---

## 3. Dockerfile (Pour déploiement pro)

Si votre hébergeur supporte Docker, créez un fichier nommé `Dockerfile` à la racine :

```dockerfile
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD npx prisma db push && npm start
```

## 4. Points d'attention pour la mise en ligne

1. **Base de données** : Pour un usage avec des milliers d'utilisateurs, il faudra migrer de SQLite vers **PostgreSQL** (Prisma le permet facilement en changeant juste une ligne dans `schema.prisma`).
2. **Stockage des fichiers** : Actuellement, les fichiers vont dans le dossier `uploads/`. En ligne, assurez-vous que ce dossier est sur un volume persistant, sinon ils disparaîtront à chaque mise à jour.
3. **WebRTC** : Le partage d'écran et la vidéo utilisent des serveurs publics par défaut. Pour une fiabilité maximale en entreprise, il faudra peut-être ajouter un serveur **TURN** (ex: Twilio Video ou Coturn).
