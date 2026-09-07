#!/usr/bin/env bash
# Régénère docs/index.html (widget autoportant pour GitHub Pages)
# à partir de widget/_html.html + widget/_js.js
set -euo pipefail
cd "$(dirname "$0")"

{
  cat <<'HTML'
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Outil de veille — Au Carré</title>
<script src="https://docs.getgrist.com/grist-plugin-api.js"></script>
</head>
<body>
HTML
  # <style> ... on insère les @font-face auto-hébergés juste après l'ouverture
  head -n 1 widget/_html.html
  cat widget/_fonts.css
  tail -n +2 widget/_html.html
  echo '<script>'
  cat widget/_js.js
  echo '</script>'
  cat <<'HTML'
</body>
</html>
HTML
} > docs/index.html

echo "docs/index.html régénéré ($(wc -l < docs/index.html) lignes)"
