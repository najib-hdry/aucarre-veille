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

## Mettre à jour le code déployé

```
# via MCP Grist (widget_id = 17 sur la page « Veille »)
grist_set_custom_widget_options(doc_id=<JDR>, widget_id=17,
  options={ "_js": "<contenu de _js.js>" })          # ou "_html"
```

Le rendu se met à jour en direct, sans recharger.

## Limites connues

- Pièces jointes (`Fichiers`) : à ajouter directement dans Grist, le widget ne
  gère que les liens.
- Pas de dark mode dédié : la charte impose un thème clair unique, lisible dans
  les deux apparences de Grist.
