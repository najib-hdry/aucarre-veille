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
