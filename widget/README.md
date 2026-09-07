# Widget « Outil de veille »

Widget personnalisé Grist (Custom Widget Builder `@berhalak/custom-widget-builder`)
qui fournit l'interface de l'outil de veille au-dessus des tables du document JDR.

## Fichiers

| Fichier | Rôle |
|---|---|
| `_html.html` | Gabarit + styles (charte Au Carré, contrastes AA). Copié dans l'option `_html` du widget. |
| `_js.js` | Logique : chargement des 3 tables, filtres espace / balise / recherche, tri par date, création de ressource, bascule favori. Copié dans l'option `_js`. |

Ces deux fichiers sont la **source de vérité**. Le widget dans Grist en est une copie.

## Fonctionnalités (couverture user stories)

- **US1 / US2** — formulaire « Partager une ressource » : titre, description, type, lien, balises
- **US3** — balises multiples issues de la table `Balises`
- **US4** — barre de recherche (sur l'index `Recherche`) + filtres par balise
- **US5** — étoile favori sur chaque carte + onglet « Favoris » (réversible)
- **US7 / US8** — auteur et date affichés sur chaque carte, tri récent / ancien
- Espaces **Commun** / **Personnel** (case « garder dans mon espace personnel »)

## Accès requis

`full` — nécessaire pour créer une ressource (`AddRecord`) et modifier les
favoris (`UpdateRecord` sur `Utilisateurs`). À régler dans le panneau créateur
du widget, ou via `grist_set_custom_widget_settings(access="full")`.

## Utilisateur courant

Le widget n'a pas accès à l'identité Grist du visiteur : un sélecteur
« Connecté·e : » en en-tête choisit l'utilisateur actif, mémorisé dans les
options du widget (`meId`). À remplacer par une vraie identification si l'outil
sort de Grist.

## Déploiement

Deux voies possibles, même source (`_html.html` + `_js.js`) :

### A. Code intégré au document Grist *(en place actuellement)*

Widget « Custom Widget Builder » (`@berhalak/custom-widget-builder`) sur la page
**Veille**, `widget_id 17`, accès **Full**. Le code est stocké dans le document
(options `_html` / `_js`). Mise à jour : recopier le contenu des deux fichiers via
`grist_set_custom_widget_options`. Rendu live, aucune dépendance externe.

### B. Hébergé sur GitHub Pages

`docs/index.html` = concaténation autoportante de `_html.html` + `_js.js` +
`grist-plugin-api.js`. URL à coller dans Grist (widget personnalisé → URL,
accès *Full*) :

```
https://najib-hdry.github.io/aucarre-veille/
```

Mise à jour : `bash build.sh`, puis `git commit` + `git push` → Pages rebâtit en ~1 min.

## Limites connues

- Pièces jointes (`Fichiers`) : à ajouter directement dans Grist, le widget ne
  gère que les liens.
- Pas de dark mode dédié : la charte impose un thème clair unique, lisible dans
  les deux apparences de Grist.
