# Gestion des Assignments - Application Angular

## Description

Ce projet est une application web développée avec **Angular** (frontend) et **Node.js** (backend) pour gérer des assignments (devoirs) dans un contexte académique. L'application permet à un administrateur (`LineoL`) de créer, modifier, et supprimer des assignments, et aux utilisateurs réguliers de consulter les assignments qui leur sont attribués. Elle inclut une interface utilisateur moderne avec Angular Material, une sidebar pour la navigation, et un backend connecté à une base de données MongoDB.

---

## Fonctionnalités Implémentées

### 1. Frontend (Angular)
- **Architecture Standalone** : L'application utilise des composants standalone (pas de `NgModule`), ce qui simplifie la structure du projet.
- **Authentification Simple** :
  - Page de connexion (`/login`) et d'inscription (`/signup`) pour les utilisateurs.
  - Gestion de l'état de connexion avec `AuthService` utilisant le `localStorage` et un `BehaviorSubject` pour une mise à jour réactive.
- **Sidebar (Barre de navigation latérale)** :
  - Implémentée avec `MatSidenav` d'Angular Material.
  - Contient des liens dynamiques :
    - "Assignments" (toujours visible).
    - "Créer un compte" et "Connexion" (visibles si l'utilisateur n'est pas connecté).
    - "Déconnexion" (visible si l'utilisateur est connecté).
  - Mise à jour réactive après connexion/déconnexion grâce à un Observable.
- **Gestion des Assignments** (`AssignmentsComponent`) :
  - Liste des assignments dans un tableau (`MatTable`) avec les colonnes : titre, description, date de création, créateur, assigné à, matière, note, remarques, et actions.
  - Création d'assignments (réservée à l'admin `LineoL`) via un formulaire.
  - Modification d'assignments via une boîte de dialogue (`MatDialog`).
  - Suppression d'assignments avec confirmation.
- **Interface Utilisateur** :
  - Utilisation d'Angular Material pour les composants (tableau, formulaires, sidebar, boîtes de dialogue, notifications).
  - Notifications avec `MatSnackBar` pour confirmer les actions (création, modification, suppression).

### 2. Backend (Node.js)
- **API REST** :
  - Endpoints pour gérer les utilisateurs (`/api/users`) et les assignments (`/api/assignments`).
  - `GET /api/assignments?nom=<nom>` : Récupère les assignments créés par l'admin (`LineoL`) ou assignés à un utilisateur.
  - `POST /api/assignments` : Crée un nouvel assignment.
  - `PUT /api/assignments/:id` : Met à jour un assignment existant (réservé à l'admin).
  - `DELETE /api/assignments/:id` : Supprime un assignment (réservé à l'admin).
- **Base de Données** :
  - MongoDB utilisé pour stocker les utilisateurs et les assignments.
  - Collections : `Users` (utilisateurs) et `Assignments` (assignments).
- **Sécurité** :
  - Vérification que seul l'admin (`LineoL`) peut créer, modifier, ou supprimer des assignments.

---

## Prérequis

Pour exécuter cette application sur votre machine, vous devez avoir les outils suivants installés :

- **Node.js** (version 18 ou supérieure) : [Télécharger](https://nodejs.org/)
- **Angular CLI** (version 17 ou supérieure) : Installez-le globalement avec :
  ```bash
  npm install -g @angular/cli
  
