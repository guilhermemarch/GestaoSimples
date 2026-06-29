#!/usr/bin/env bash
# Helper: commit with author/date without touching git config.
# Usage: team-commit.sh <author> <date_iso> <message> <file>...
set -euo pipefail

AUTHOR="${1:?author key required}"
DATE="${2:?date required}"
MSG="${3:?message required}"
shift 3

declare -A NAMES=(
  [guilherme]="Guilherme"
  [joao]="João"
  [thiago]="Thiago"
  [andrei]="Andrei"
)
declare -A EMAILS=(
  [guilherme]="c0mbedforn1ght@gmail.com"
  [joao]="joaowesolowskim@gmail.com"
  [thiago]="thiagoruiz397@gmail.com"
  [andrei]="andreibertolo9@gmail.com"
)

export GIT_AUTHOR_NAME="${NAMES[$AUTHOR]}"
export GIT_AUTHOR_EMAIL="${EMAILS[$AUTHOR]}"
export GIT_COMMITTER_NAME="${GIT_AUTHOR_NAME}"
export GIT_COMMITTER_EMAIL="${GIT_AUTHOR_EMAIL}"
export GIT_AUTHOR_DATE="${DATE}"
export GIT_COMMITTER_DATE="${DATE}"

git add -- "$@"
git commit -m "${MSG}"
