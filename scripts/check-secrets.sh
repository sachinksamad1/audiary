#!/bin/sh

# Patterns to block (primarily .env files)
# Matches .env, .env.local, .env.production, etc., but EXCLUDES .env.example
FORBIDDEN_ENV_PATTERN='\.env(\..*)?$'

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)

# Flag for tracking violations
FOUND_FORBIDDEN=0

for file in $STAGED_FILES; do
  # Skip the check script itself and any .example files
  if [ "$file" = "scripts/check-secrets.sh" ] || echo "$file" | grep -qE "\.example$"; then
    continue
  fi

  # 1. Specifically targeting .env files while avoiding .env.example (already handled by continue)
  if echo "$file" | grep -qE "$FORBIDDEN_ENV_PATTERN"; then
    # Double check if it's not a documentation or example (safety fallback)
    if ! echo "$file" | grep -qE "\.example$|documentation/"; then
        echo "\033[31mError: You are trying to commit an environment file: $file\033[0m"
        FOUND_FORBIDDEN=1
    fi
  fi
  
  # 2. Check for other potential sensitive file names
  if echo "$file" | grep -qE "((secrets?|credentials?|config/local)(\..+)?)$"; then
    # Only block if it doesn't match safety patterns
    if ! echo "$file" | grep -qE "\.example$|scripts/|docs/|tests?/|package\.json|pnpm-lock\.yaml"; then
        echo "\033[33mWarning: You are trying to commit a potential secret file: $file\033[0m"
        FOUND_FORBIDDEN=1
    fi
  fi
done

if [ $FOUND_FORBIDDEN -eq 1 ]; then
  echo "\033[31mCommit blocked. Please remove sensitive files from staging or use --no-verify if you are absolutely sure.\033[0m"
  exit 1
fi

exit 0
