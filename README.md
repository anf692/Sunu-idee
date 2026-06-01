````md
# Sunu-Idées

##  Description

**Sunu-Idées** est une boîte à idées numérique, anonyme et collaborative permettant aux apprenants, formateurs et membres du staff de proposer, consulter, modifier et supprimer des idées de manière simple et instantanée.

L'application repose sur le principe de l'intelligence collective et ne nécessite aucune authentification. Toutes les données sont sauvegardées localement grâce au **LocalStorage** afin de garantir leur persistance même après la fermeture du navigateur.

---

## Objectifs du projet

- Permettre à chaque utilisateur de soumettre une idée.
- Afficher dynamiquement toutes les idées sous forme de cartes.
- Modifier une idée existante.
- Supprimer une idée devenue inutile ou déjà traitée.
- Sauvegarder automatiquement les données dans le navigateur.
- Offrir une expérience fluide sans rechargement de page.

---

## 🛠️ Technologies utilisées

- HTML5
- CSS3
- Bootstrap 5
- JavaScript (Vanilla JS)
- LocalStorage

---

## Fonctionnalités

###  CREATE - Ajouter une idée

Un formulaire permet de soumettre une nouvelle idée contenant :

- Titre
- Catégorie
- Description

Catégories disponibles :

-  Pédagogie
-  Événement
-  Vie de campus
-  Amélioration technique

---

###  READ - Afficher les idées

Toutes les idées sont affichées sous forme de cartes dynamiques.

Chaque carte affiche :

- Le titre
- La catégorie
- La description
- Une couleur spécifique selon la catégorie

---

###  UPDATE - Modifier une idée

Chaque carte possède un bouton **Éditer** permettant de :

- Modifier le titre
- Modifier la description

Les changements sont immédiatement enregistrés dans le LocalStorage.

---

### DELETE - Supprimer une idée

Chaque carte possède un bouton **Supprimer** permettant de :

- Retirer définitivement une idée
- Mettre à jour automatiquement le LocalStorage

---

##  Persistance des données

Les idées sont enregistrées dans le navigateur grâce au **LocalStorage**.

Ainsi :

 Les idées restent disponibles après actualisation de la page.

 Les idées sont conservées après fermeture du navigateur.

---

## Structure du projet

```text
sunu-idees/
│
├── index.html
├── style.css
├── app.js
└── README.md
````

---

##  Installation

1. Cloner le projet :

```bash
git clone https://github.com/votre-compte/sunu-idees.git
```

2. Ouvrir le dossier :

```bash
cd sunu-idees
```

3. Lancer l'application :

```bash
Ouvrir index.html dans le navigateur
```

---

## Aperçu

L'application se présente sous la forme :

* D'un formulaire de soumission d'idées
* D'un tableau d'affichage dynamique
* De cartes colorées représentant les différentes catégories

---


## Auteur

Projet réalisé dans le cadre de la formation Développeur Front-End chez Simplon.

