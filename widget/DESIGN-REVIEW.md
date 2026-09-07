# Revue design — widget « Outil de veille »

Revue au niveau du code source (le widget ne s'affiche qu'à l'intérieur de Grist,
avec les données du document — un rendu isolé n'a pas de contenu à évaluer).
Référentiel : checklist gstack `/design-review` + RGAA 4.1.

## Score

| Axe | Avant | Après |
|---|---|---|
| Hiérarchie visuelle | C | B |
| Typographie | C+ | B |
| Espacement / layout | B− | B+ |
| Couleur / contraste | B | A− |
| États d'interaction | B+ | A− |
| Responsive | B | B+ |
| AI slop | B | B (police système assumée) |

## Corrigé (commit `e545b53`)

| # | Constat | Correction |
|---|---|---|
| 1 | La grille de ressources se lit **à plat** : carte blanche sur fond crème, bordure `#DFDCD4` à peine visible (~1,3:1). | Ombre au repos + ombre au survol, bordure `#D5D1C8`. |
| 2 | Cibles tactiles sous 44 px : onglets (~34), puces balises (~30), favori 30×30, sélecteurs. | Portées à 40–44 px (RGAA 2.5.5, ergonomie mobile). |
| 3 | Couleur de placeholder par défaut sur fond sombre `#1A2C3E` → sous le seuil AA. | `::placeholder` explicite `#8B97A3` (formulaire) / `#5B6873` (recherche). |
| 4 | Le formulaire sombre occupe tout le premier écran sur un panneau étroit ; les ressources passent sous la ligne de flottaison. | Formulaire en `<details open>` : repliable au clavier, **sans JavaScript**. |
| 5 | Échelle de titres irrégulière (ratios 1,6 / 1,25 / 1,07) ; titres de carte en 700. | h1 30 / h2 19 / carte 16-600. |
| 6 | Valeurs d'espacement hors trame (18, 22, 26 px). | Ramenées sur 4 px (16 / 20 / 24). |
| 7 | Eyebrow « RECHERCHE » au-dessus du h1 : redondant, et privé de sa police mono d'origine il ne signifiait plus rien. | Supprimé. |
| 8 | Bouton « Envoyer » peu explicite. | « Publier la ressource ». Apostrophes typographiques. |

## 2ᵉ passe (revue contre la maquette hi-fi)

| # | Constat | Correction |
|---|---|---|
| 9 | Favori rendu avec le glyphe `★` (dingbat) — se recolore mal, taille incohérente. | Étoile **SVG** (contour / plein), hérite de `currentColor`. |
| 10 | Bouton « Effacer » toujours visible dans la barre alors que la recherche est instantanée. | Masqué tant que le champ est vide (`hidden`), réapparaît à la saisie. |
| 11 | Accueil impersonnel après le retrait du « Bonjour Jessica » de la maquette. | Ligne « Bonjour {prénom}, » réintroduite (mono, teal), alimentée par le sélecteur d'utilisateur. |
| 12 | Libellés éditoriaux (type de carte, « Balises », méta auteur/date) en sans-serif → perdent le signal de la charte. | Passés en `--mono` (pile avec IBM Plex Mono en tête). |
| 13 | Hairlines incohérentes (`#EFEDE7`, `#DFDCD4`, `#C4C0B6`, `#D5D1C8` mélangés). | Deux jetons : `--line` (bordures) et `--hair` (filets internes / fonds de balise). |
| 14 | Coins de carte à 2 px (ni francs ni ronds) ; `.brand .sub` encombre l'en-tête étroit. | Cartes à angle franc ; `.sub` masqué < 640 px. |
| 15 | Liens de carte ouvrant un nouvel onglet sans indication (RGAA 3.1). | `title` + mention lecteur d'écran « (nouvel onglet) ». |
| 16 | Contrôles de formulaire natifs non calés sur un thème. | `color-scheme:light` sur `.app`. |

## Écarts assumés

- **Police système** (`-apple-system…`) au lieu de DM Sans / IBM Plex Mono de la
  maquette. Repère « AI slop #11 » signalé, mais deux exigences non
  fonctionnelles priment : éco-conception (zéro requête de police) et RGPD
  (pas de CDN Google Fonts, problématique en secteur public FR). Auto-héberger
  un sous-ensemble woff2 reste possible si la charte l'impose.
- **Coins de carte francs** (radius 2 px) + **barre de recherche pilule** (999 px) :
  contraste de formes volontaire, repris de la maquette, pas une incohérence.

## Non couvert / à faire dans Grist

- Pièces jointes (`Fichiers`) : upload non géré par le widget.
- Identité de l'utilisateur : sélecteur manuel faute d'API d'identité Grist côté widget.
- Skeleton de chargement : « Chargement… » simple (choix éco pour un widget).
