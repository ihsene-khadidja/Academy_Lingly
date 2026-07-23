<div align="center">

#  LINGL — Plateforme d'Apprentissage en Ligne

**Une plateforme e-learning moderne connectant étudiants et administrateurs**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#-licence)

[Démo](#) · [Signaler un bug](../../issues) · [Proposer une fonctionnalité](../../issues)

</div>

---

##  Aperçu

**LINGL** est une application web développée avec **React** et **Vite**, offrant deux espaces distincts :

-  **Espace Étudiant** — inscription, connexion, consultation des cours, planning, résultats d'examens et tarifs.
-  **Espace Administrateur** — gestion des leçons, du planning et des étudiants depuis un tableau de bord dédié.

L'authentification est gérée via **Firebase**, tandis que **Supabase** est utilisé comme backend pour le stockage et la gestion des données.

---

##  Fonctionnalités

| Espace | Fonctionnalités |
|--------|------------------|
|  Étudiant | Connexion / Inscription, Tableau de bord, Mes cours, Planning, Résultats d'examens, Tarifs, Contact |
| Administrateur | Tableau de bord, Gestion des leçons, Gestion du planning, Gestion des étudiants |
|  Authentification | Connexion sécurisée via Firebase (`AuthContext`) |
|  Backend | Stockage et requêtes de données via Supabase |

---

##  Stack technique

- **Frontend** : React + Vite (HMR ultra-rapide)
- **Authentification** : Firebase
- **Base de données / Stockage** : Supabase
- **Style** : CSS modulaire par page/composant
- **Linting** : ESLint

---

##  Structure du projet

```
src/
├── contexts/
│   └── AuthContext.jsx        # Gestion de l'authentification globale
├── firebase/
│   └── config.js              # Configuration Firebase
├── pages/
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Lessons.jsx
│   │   ├── Schedule.jsx
│   │   └── Students.jsx
│   └── student/
│   |   ├── StudentLayout.jsx
│   |   ├── Dashboard.jsx
│   |   ├── InfoEleve.jsx
│   |   ├── MyCourses.jsx
│   |   ├── Planning.jsx
│   |   ├── Results.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Courses.jsx
│   ├── Examens.jsx
│   ├── Tarifs.jsx
│   ├── Contact.jsx
│   └── Navbar.jsx
├── services/
│   └── supabase.js            # Client Supabase
├── utils/
│   └── uploadToSupabase.js    # Utilitaire d'upload de fichiers
├── App.jsx
└── index.css
```

---

##  Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- Un compte [Firebase](https://firebase.google.com/)
- Un compte [Supabase](https://supabase.com/)

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-utilisateur/lingl.git
   cd lingl
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env` à la racine du projet :
   ```env
   VITE_FIREBASE_API_KEY=votre_cle_api
   VITE_FIREBASE_AUTH_DOMAIN=votre_domaine
   VITE_FIREBASE_PROJECT_ID=votre_projet_id

   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   L'application sera disponible sur `http://localhost:5173`.

5. **Build pour la production**
   ```bash
   npm run build
   ```

---

##  Scripts disponibles

| Commande | Description |
|----------|--------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Génère la version de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le code avec ESLint |

---

##  Contribuer

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

##  Licence

Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">



</div>
