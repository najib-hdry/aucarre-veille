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

## Sources

| Fichier | Rôle |
|---|---|
| `_html.html` | gabarit + styles |
| `_js.js` | logique |
| `_fonts.css` | `@font-face` auto-hébergés (DM Sans + IBM Plex Mono, sous-ensemble latin, base64) — généré, ~90 Ko |

`bash build.sh` assemble les trois en `docs/index.html` (autoportant, avec `grist-plugin-api.js`).

## Déploiement *(en place)*

Widget « Custom Widget Builder » sur la page **Veille**, `widget_id 17`, accès **Full**,
pointé sur l'URL **GitHub Pages** :

```
https://najib-hdry.github.io/aucarre-veille/
```

Les polices de la charte étant inlinées (~90 Ko), l'hébergement Pages (chargé une
fois puis mis en cache) est préférable au stockage dans le document Grist.

Mise à jour : modifier `_html.html` / `_js.js`, `bash build.sh`, `git push` →
Pages rebâtit en ~1 min.

### Variante sans hébergement

Repointer le widget sur le Custom Widget Builder et coller `_html.html` (fonts
comprises) + `_js.js` dans les options `_html` / `_js` via
`grist_set_custom_widget_options`. Rendu live, mais alourdit le document.

## Régénérer `_fonts.css`

Télécharger les woff2 latin depuis Google Fonts (DM Sans variable, IBM Plex Mono
400/500) et les encoder en base64 dans des règles `@font-face` (licence OFL,
redistribution autorisée). Aucune requête runtime vers un CDN (RGPD).

## Limites connues

- Pièces jointes (`Fichiers`) : à ajouter directement dans Grist, le widget ne
  gère que les liens.
- Pas de dark mode dédié : la charte impose un thème clair unique, lisible dans
  les deux apparences de Grist.
