# Modèle de données — Outil de veille documentaire « Au Carré »

Document Grist : **JDR** (`39uHeZg7H14EbouMRqo5aV`)
Dernière mise à jour : 2026-08-31

## 1. Vue d'ensemble

L'outil remplace le suivi de veille fait sur Slack : chaque membre publie des
**ressources** (article, doc, vidéo, lien), les décrit, les **balise**, et les
retrouve par recherche / filtre / favoris.

Type d'utilisateur unique : tout le monde publie **et** consulte (pas de rôle séparé).

```
Utilisateurs ──< Ressources >── Balises        (Auteur = Ref, Balises = RefList)
Utilisateurs ──< Favoris (RefList) >── Ressources
Utilisateurs ──< Consultations >── Ressources   (journal optionnel, US6)
```

Choix d'implémentation orientés **éco-conception** : 4 tables seulement, relations
many-to-many portées par des colonnes `RefList` natives Grist (pas de table de
jonction), champ d'index de recherche pré-calculé pour éviter les requêtes lourdes
côté application.

## 2. Tables

### `Utilisateurs`
Membres de l'équipe. Sert à résoudre l'auteur d'une ressource (US7) et à stocker
les favoris de chacun (US5).

| Colonne | Type | Notes |
|---|---|---|
| `Nom` | Text | Nom affiché, ex. « Jessica Martin » |
| `Email` | Text | Identifiant de connexion |
| `Initiales` | Text — *formule* | `"".join([p[0] for p in ($Nom or "").split()][:2]).upper()` → avatar « JM » |
| `Actif` | Bool — *trigger `True`* | Décocher pour désactiver un compte sans le supprimer |
| `Favoris` | RefList → `Ressources` | Ressources mises en favori. Toggle = ajout/retrait d'un id (US5, réversible) |

### `Balises`
Liste **prédéfinie** de catégories, maintenue en autonomie par le client (US3).
⚠️ *La liste exacte reste à valider avec le client — valeurs actuelles issues de la maquette.*

| Colonne | Type | Notes |
|---|---|---|
| `Nom` | Text | Slug court en minuscules, ex. `eco-conception` — sert de clé et d'affichage `#tag` |
| `Libelle` | Text | Libellé lisible, ex. « Éco-conception » |
| `Actif` | Bool — *trigger `True`* | Décocher pour retirer la balise des propositions sans casser l'historique |
| `Nb_ressources` | Int — *formule* | `len(Ressources.lookupRecords(Balises=CONTAINS($id)))` |

Valeurs seed : `rgaa`, `eco-conception`, `design`, `process`, `no-code`, `grist`,
`veille`, `a11y`, `marque`, `perf`, `slack`.

### `Ressources`
Le « post ». Format unique quel que soit le type de contenu (US1).

| Colonne | Type | Notes |
|---|---|---|
| `Titre` | Text | Obligatoire |
| `Description` | Text (wrap) | Texte libre — pourquoi c'est utile (US2). Obligatoire |
| `Type` | Choice | `Article`, `Doc technique`, `Charte`, `Outil`, `Tip`, `Vidéo`, `Document` |
| `Lien` | Text (hyperlink) | URL externe (US1) |
| `Fichiers` | Attachments | Document / vidéo joint (US1) |
| `Balises` | RefList → `Balises` | 1..n catégories (US3) |
| `Auteur` | Ref → `Utilisateurs` | Propriétaire, obligatoire (US7) |
| `Date_publication` | DateTime — *trigger `NOW()`* | Horodatage de création (US8), tri récent/ancien |
| `Visibilite` | Choice | `Commun` (toute l'équipe) / `Personnel` (espace privé de l'auteur) — case « garder dans mon espace personnel » |
| `Nb_favoris` | Int — *formule* | `len(Utilisateurs.lookupRecords(Favoris=CONTAINS($id)))` |
| `Recherche` | Text — *formule* | Titre + description + type + auteur + balises, en minuscules. Index plein-texte pour US4 |

**Règle métier (contrôle applicatif)** : au moins un de `Lien` ou `Fichiers`
doit être renseigné.

### `Consultations` *(optionnelle — US6, à clarifier)*
Journal des consultations pour le « suivi personnel ». À n'activer que si le
client confirme le besoin d'un historique de lecture. Prévoir une purge
(ex. > 12 mois) pour l'éco-conception.

| Colonne | Type | Notes |
|---|---|---|
| `Utilisateur` | Ref → `Utilisateurs` | |
| `Ressource` | Ref → `Ressources` | |
| `Date` | DateTime — *trigger `NOW()`* | |

## 3. Couverture des user stories

| US | Besoin | Couverture modèle |
|---|---|---|
| US1 | Publier article/doc/vidéo/lien | `Ressources.Type` + `Lien` / `Fichiers` |
| US2 | Décrire un post | `Ressources.Description` |
| US3 | Catégoriser (liste prédéfinie, multi) | `Balises` + `Ressources.Balises` (RefList) |
| US4 | Recherche titre / description / mots-clés + filtre catégorie | `Ressources.Recherche` (index) + filtre sur `Balises` |
| US5 | Favoris, vue dédiée, réversible | `Utilisateurs.Favoris` (RefList) |
| US6 | Suivi personnel | Mes posts = filtre `Auteur` ; historique lecture = `Consultations` (optionnel) |
| US7 | Voir le propriétaire | `Ressources.Auteur` → `Utilisateurs.Nom` |
| US8 | Voir la date + tri | `Ressources.Date_publication` |

## 4. Requêtes types (application)

```sql
-- Espace commun, tri du plus récent
SELECT * FROM Ressources WHERE Visibilite = 'Commun' ORDER BY Date_publication DESC;

-- Espace personnel de l'utilisateur courant
SELECT * FROM Ressources WHERE Auteur = :userId AND Visibilite = 'Personnel'
ORDER BY Date_publication DESC;

-- Recherche plein-texte + filtre balise
SELECT * FROM Ressources
WHERE Recherche LIKE '%' || lower(:q) || '%'
ORDER BY Date_publication DESC;
-- filtre balise : garder les lignes dont Balises contient :baliseId (côté app)

-- Favoris de l'utilisateur : lire Utilisateurs.Favoris (:userId) puis charger ces Ressources
```

## 5. Points ouverts (RDV client)

1. Liste exacte des balises prédéfinies.
2. Contenu attendu du « suivi personnel » (US6) → garder ou non `Consultations`.
3. Une ressource = 1 ou plusieurs balises ? *(modèle actuel : plusieurs)*
4. Historisation : durée de conservation, versionning des fichiers ?
5. Volumétrie (utilisateurs, posts/mois) pour dimensionner l'hébergement.
