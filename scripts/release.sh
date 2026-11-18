#!/bin/bash
# Публікація нової версії NOBODY · Моя робота.
# Використання: scripts/release.sh <zip> <версія> "що нового; ще пункт"
# Приклад:     scripts/release.sh NOBODY-mac-1.0.4-apple-silicon.zip 1.0.4 "Виправлено нагадування; Новий звіт"
# Потрібні: node, gh (gh auth login), права на запис у репозиторій.
set -euo pipefail

REPO="${NOBODY_REPO:-sh809506654-sketch/nobody-updates}"
ZIP="${1:-}"; VERSION="${2:-}"; NOTES="${3:-}"

if [ -z "$ZIP" ] || [ -z "$VERSION" ]; then
  echo "Використання: scripts/release.sh <zip> <версія> \"що нового; ще пункт\"" >&2
  exit 2
fi
if ! printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Версія має бути виду 1.0.4" >&2; exit 2
fi
if [ ! -f "$ZIP" ]; then echo "Немає файлу $ZIP" >&2; exit 2; fi

ASSET="NOBODY-mac-$VERSION-apple-silicon.zip"
TAG="v$VERSION"
URL="https://github.com/$REPO/releases/download/$TAG/$ASSET"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Перевіряємо, що в zip саме ця версія.
if command -v unzip >/dev/null 2>&1; then
  unzip -p "$ZIP" "NOBODY.app/Contents/Resources/app/package.json" | grep -q "\"version\": \"$VERSION\"" \
    || { echo "У zip не версія $VERSION (package.json)" >&2; exit 1; }
fi

cp "$ZIP" "$WORK/$ASSET"
node "$DIR/make-latest-json.js" "$WORK/$ASSET" "$VERSION" "$URL" "$NOTES" > "$WORK/latest.json"
echo "latest.json:"; cat "$WORK/latest.json"

BODY="$WORK/notes.md"
{
  echo "Що нового:"
  printf '%s' "$NOTES" | tr ';' '\n' | sed -e 's/^ *//' -e '/^$/d' -e 's/^/- /'
  echo
  echo "Оновлення ставиться кнопкою «Оновити програму» (з версії 1.0.3). Перед встановленням програма робить резервну копію даних."
} > "$BODY"

gh release create "$TAG" "$WORK/$ASSET" "$WORK/latest.json" \
  --repo "$REPO" --title "NOBODY $VERSION" --notes-file "$BODY" --latest

echo "Готово: https://github.com/$REPO/releases/tag/$TAG"
