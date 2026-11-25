#!/usr/bin/env bash
# One-time GitHub setup for the Brain9 repository. Run by the team lead (repo admin)
# AFTER the infrastructure pull request has been merged into main.
#
#   ./scripts/setup-github.sh
#
# It is safe to run again: every step creates-or-updates.
# Requires: gh (authenticated as a repository admin).
set -euo pipefail

REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
echo "Configuring $REPO"

# ---------------------------------------------------------------- repository settings
gh api -X PATCH "repos/$REPO" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=true \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=false >/dev/null
echo "✓ merge settings (squash for features, merge commit for the release PR)"

# ---------------------------------------------------------------- staging branch
if gh api "repos/$REPO/branches/staging" >/dev/null 2>&1; then
  echo "✓ staging branch exists"
else
  main_sha="$(gh api "repos/$REPO/git/ref/heads/main" --jq .object.sha)"
  gh api -X POST "repos/$REPO/git/refs" -f ref="refs/heads/staging" -f sha="$main_sha" >/dev/null
  echo "✓ staging branch created from main"
fi

# ---------------------------------------------------------------- labels
label() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null; }
label "module:identity"  "1f4e8c" "Users, login, privacy, centers, devices"
label "module:booking"   "1e6b3e" "Schedules, time slots, bookings"
label "module:content"   "6a3da8" "Courses, exercises, patterns"
label "module:engine"    "a32a20" "3x3 grid, playing, results"
label "module:analytics" "7a4f00" "Metrics, trends, levels, recommendations"
label "infra"            "464a55" "CI/CD, tooling, shared code, hot files"
label "cross-module"     "e07800" "Needs agreement between lanes"
label "type:feature"     "0e8a16" "New capability"
label "type:bug"         "d73a4a" "Something is wrong"
label "type:chore"       "c5def5" "Maintenance"
label "type:docs"        "0075ca" "Documentation"
label "blocked"          "000000" "Waiting on someone else"
for n in 1 2 3 4 5 6; do label "sprint-$n" "ededed" "Sprint $n"; done
echo "✓ labels"

# ---------------------------------------------------------------- environments
lead_id="$(gh api user --jq .id)"
gh api -X PUT "repos/$REPO/environments/staging" >/dev/null
gh api -X PUT "repos/$REPO/environments/production" --input - >/dev/null <<JSON
{ "reviewers": [ { "type": "User", "id": $lead_id } ] }
JSON
echo "✓ environments (production requires approval from $(gh api user --jq .login))"

# ---------------------------------------------------------------- branch protection
protect() {
  gh api -X PUT "repos/$REPO/branches/$1/protection" --input - >/dev/null <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["target-guard", "check", "migrations"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
  echo "✓ branch protection: $1"
}
protect main
protect staging

cat <<'NEXT'

Done. Still to do by hand (docs/deployment.md):
  1. gh secret set VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID
  2. gh variable set STAGING_DOMAIN --body "<your staging alias>"
  3. gh variable set DEPLOY_ENABLED --body true     (turns the deploy workflows on)
  4. Create the GitHub Project board and link this repository
NEXT
