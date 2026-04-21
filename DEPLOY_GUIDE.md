# 🚀 Guide de Déploiement - Dnosp-PF

Pour héberger votre application en ligne, vous avez plusieurs options. Voici les recommandations basées sur les technologies utilisées (Next.js, Prisma, WebRTC, Socket.io).

## 1. Choix de l'hébergement (Recommandé)

Étant donné que votre application utilise **SQLite** (fichiers locaux) et **Socket.io** (connexion persistante), je vous recommande des plateformes qui gèrent les serveurs d'arrière-plan et les volumes persistants :

### Option A : Render.com (Recommandé pour Next.js + SQLite)
Render est idéal car il permet de connecter directement votre dépôt GitHub et de gérer un volume persistant pour votre base de données SQLite.

1. Créez un compte sur [Render.com](https://render.com).
2. Cliquez sur **"New +"** > **"Web Service"**.
3. Connectez votre dépôt GitHub `dnospPF`.
4. **Configuration :**
   - **Name** : `dnosp-pf`
   - **Runtime** : `Docker` (Plus simple pour gérer Prisma et SQLite ensemble)
   - **Plan** : `Starter` (ou Free, mais le Free s'éteint après 15 min d'inactivité)
5. **Variables d'environnement (Advanced) :**
   - `DATABASE_URL` : `file:/app/data/prod.db`
   - `NEXTAUTH_SECRET` : Cliquez sur "Generate" ou mettez une phrase secrète.
   - `NEXTAUTH_URL` : L'URL de votre site (ex: `https://dnosp-pf.onrender.com`).
6. **Disques (Volumes) :**
   - Allez dans l'onglet **"Disks"**.
   - Cliquez sur **"Add Disk"**.
   - **Name** : `database-data`
   - **Mount Path** : `/app/data`
   - **Size** : `1 GB`
   - *Répétez l'opération pour les uploads si nécessaire avec le Mount Path `/app/uploads`.*

---

### Option B : Railway.app
Railway est aussi une excellente alternative à Render, avec un déploiement très rapide depuis GitHub.
1. Connectez votre GitHub sur [Railway.app](https://railway.app).
2. Créez un nouveau projet à partir de votre dépôt.
3. Railway détectera automatiquement le `Dockerfile`.
4. Ajoutez un **Volume** monté sur `/app/data` pour SQLite.

---

### Option C : VPS (DigitalOcean, OVH)
Si vous préférez un VPS :
1. Installez Docker sur votre serveur.
2. Clonez le dépôt.
3. Lancez avec Docker Compose (recommandé pour gérer le volume).

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
