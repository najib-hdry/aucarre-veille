# Au Carré — Outil de veille documentaire

Application interne qui remplace le suivi de veille fait sur Slack : publier,
catégoriser et retrouver des ressources (articles, docs techniques, vidéos, liens).

## Contexte

- **Client** : Au Carré
- **Utilisateur unique** : chaque membre publie *et* consulte (pas de rôle séparé)
- **Contraintes transverses** : accessibilité RGAA, éco-conception, documentation
  permettant la maintenance en autonomie par le client

## Stack

- **Données** : [Grist](https://www.getgrist.com/) — document « JDR »
- **Code** : GitHub

## Documentation

- [`MODELE-DONNEES.md`](MODELE-DONNEES.md) — modèle de données : tables, relations,
  formules, couverture des user stories, requêtes types, points ouverts

## Specs (hors dépôt)

Les user stories et la maquette de l'écran d'accueil sont fournies séparément
(`user-stories-outil-veille.md.pdf`, `Écran d'accueil.pdf`, design canvas).

## État

| Étape | Statut |
|---|---|
| Modèle de données Grist | ✅ Fait |
| Application (front RGAA + API Grist) | ⏳ À venir |
| Documentation technique | ⏳ À venir |
