# 🦊 Lingly Academy

> Apprendre une langue n’a jamais été aussi simple, interactif et motivant.

Lingly Academy est une plateforme éducative moderne développée en **React**, permettant aux utilisateurs d’apprendre des langues et de se préparer à différents examens internationaux (IELTS, TOEFL, etc.) à travers une interface fluide, animée et intuitive.

---

##  Démo du projet

![Preview](./preview.png)

---

##  Fonctionnalités

 Interface moderne et responsive  
 Cours organisés par niveaux (A1 → C2)  
 Section dédiée aux examens (IELTS, etc.)  
 Exercices gratuits pour tous les utilisateurs  
 Mise en avant de vrais contenus pédagogiques  
 Design UI soigné avec palette personnalisée  
 Navigation fluide entre sections  

---

##  Technologies utilisées

-  React.js
-  CSS3 (variables + design system personnalisé)
-  JavaScript ES6+
-  Hooks React (useState)
-  Assets statiques (images / mascotte / logo)

---

##  Structure du projet

src/
├── firebase/
│   └── config.js
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── student/
│   │   ├── Student.css
│   │   ├── StudentLayout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MyCourses.jsx
│   │   ├── Planning.jsx
│   │   └── Results.jsx
│   ├── Auth.css
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Navbar.jsx   ← remplacer l'ancien
│   └── ...
└── App.jsx          ← remplacer par la nouvelle version             

##  Installation et lancement

```bash
# 1. Cloner le projet
git clone https://github.com/ton-username/lingly-academy.git

# 2. Accéder au dossier
cd lingly-academy

# 3. Installer les dépendances
npm install

# 4. Lancer le projet
npm run dev

Objectif du projet

Ce projet a été développé dans un but éducatif pour :

améliorer les compétences en développement web
créer une interface utilisateur réaliste
simuler une vraie plateforme e-learning
pratiquer React et la structuration de composants
 Améliorations possibles
 Système d’authentification (Firebase)
 Dashboard étudiant / professeur
 Système de quiz interactifs
 Multilingue (FR / EN / AR)
 Backend + base de données
 Auteur

Projet développé par [TAHANOUT IHSENE KHADIDJA]
