# TripLog

## Présentation du projet

TripLog est une application de carnet de voyage numérique qui permet aux utilisateurs de s’inscrire, de se connecter, de créer des voyages, d'ajouter des étapes à leurs voyages, et d'explorer différentes villes. Le projet est divisé en deux parties principales : un backend Node.js/Express pour gérer les données et les API, et un frontend React pour l’interface utilisateur. L’application utilise également Swagger pour la documentation de l’API et intègre des fonctionnalités d’authentification sécurisée.

## Structure du projet

- `triplog_back/`
  - `app.js`, `index.js` : point d’entrée du serveur.
  - `controllers/` : logique métier pour les utilisateurs, voyages, étapes et villes.
  - `models/` : modèles de données (User, Trip, Step).
  - `routes/` : routes API pour les ressources.
  - `middlewares/` : gestion de l’authentification.
  - `services/` : appels vers des API externes.
  - `config/` : configuration de la base de données et Swagger.

- `triplog-front/`
  - `src/` : code source React.
  - `components/` : composants réutilisables de l’interface.
  - `pages/` : pages de l’application.
  - `context/` : gestion de l’authentification.
  - `hooks/` : hooks personnalisés pour les fonctionnalités.
  - `api/axios.js` : configuration des requêtes HTTP.
  - `i18n/` : traduction et internationalisation.

## Fonctionnalités principales

- Inscription et connexion des utilisateurs
- Gestion des voyages et des étapes
- Recherche de villes
- Affichage des détails d’un voyage (étapes, villes, metéo, devises, etc.)
- Authentification et sécurité des routes

## Prérequis

- Node.js (version 20+ recommandée)
- npm
- Base de données (ex. MongoDB, PostgreSQL) selon la configuration du backend

## Installation et lancement

### 1. Backend

1. Ouvrir un terminal dans `triplog_back/`
2. Installer les dépendances :

```bash
cd triplog_back
npm install
```

3. Configurer la base de données et les variables d’environnement selon le fichier de configuration du backend.

4. Lancer le serveur :

```bash
npm start
```

Le backend démarrera normalement sur `http://localhost:3000` ou le port configuré.

5. Accéder à la documentation Swagger pour tester les API :

```http://localhost:3000/swagger```

### 2. Frontend

1. Ouvrir un terminal dans `triplog-front/`
2. Installer les dépendances :

```bash
cd triplog-front
npm install
```

3. Lancer l’application React :

```bash
npm run dev
```

Le frontend démarrera normalement sur `http://localhost:5173` ou le port Vite configuré.

## Utilisation

1. Démarrer le backend.
2. Démarrer le frontend.
3. Ouvrir le navigateur sur l’adresse indiquée par Vite.
4. S’inscrire ou se connecter pour accéder au tableau de bord et aux voyages.

## Tests

Le frontend contient des tests dans `triplog-front/src/tests/`.

Pour lancer les tests frontend :

```bash
cd triplog-front
npm test
```