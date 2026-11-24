# MediaAlternatives Root Justfile
# Use 'just --list' to see all available commands

set shell := ["bash", "-c"]

# ──────────────────────────────────────────────
# General
# ──────────────────────────────────────────────

# List available recipes
default:
    @just --list

# Show current git status
status:
    git status

# Show recent commits (last 10)
log:
    git log --oneline -10

# ──────────────────────────────────────────────
# Issue Tracking (bd)
# ──────────────────────────────────────────────

# Sync issues with git
bd-sync:
    bd sync

# Show unblocked ready work
bd-ready:
    bd ready

# Create a new issue (run `bd create "Title" --type task --priority 2`)
bd-create title="":
    bd create {{title}}

# Close an issue by ID
bd-close id="":
    bd close {{id}}

# ──────────────────────────────────────────────
# Git Workflow
# ──────────────────────────────────────────────

# Pull latest changes with rebase
pull:
    git pull --rebase

# Push to remote
push:
    git push

# Stage all, commit, and push (usage: just commit msg="your message")
commit msg="":
    git add -A
    git commit -m "{{msg}}"
    git push

# ──────────────────────────────────────────────
# Frontend (delegates to frontend-app/)
# ──────────────────────────────────────────────

# Install frontend dependencies
install:
    cd frontend-app && pnpm install

# Start frontend dev server
dev:
    cd frontend-app && pnpm dev

# Build frontend for production
build:
    cd frontend-app && pnpm build

# Build frontend for Vercel
build-vercel:
    cd frontend-app && pnpm build:vercel

# Start frontend production server
start:
    cd frontend-app && pnpm start

# Run frontend lint
lint:
    cd frontend-app && pnpm lint

# Run frontend type checking
type-check:
    cd frontend-app && pnpm type-check

# Run frontend tests
test:
    cd frontend-app && pnpm test

# Run all frontend quality checks
check: lint type-check test

# Clean frontend build artifacts
clean:
    cd frontend-app && pnpm clean

# ──────────────────────────────────────────────
# Cloudflare Worker Failover (temporary)
# ──────────────────────────────────────────────

# Worker name used by the temporary failover deployment
cf_worker := "medialternatives-failover"

# Tail all live failover Worker logs as JSON
cf-tail:
    cd frontend-app && pnpm exec wrangler tail {{cf_worker}} --env-file /dev/null --format json

# Tail only failed failover Worker invocations as JSON
cf-tail-errors:
    cd frontend-app && pnpm exec wrangler tail {{cf_worker}} --env-file /dev/null --status error --format json

# List failover Worker deployments
cf-deployments:
    cd frontend-app && pnpm exec wrangler deployments list --env-file /dev/null

# List failover Worker versions
cf-versions:
    cd frontend-app && pnpm exec wrangler versions list --env-file /dev/null

# Redeploy the failover Worker with Wrangler debug logging
cf-deploy-debug:
    cd frontend-app && WRANGLER_LOG=debug pnpm exec wrangler deploy --env-file /dev/null

# ──────────────────────────────────────────────
# Session End Workflow
# ──────────────────────────────────────────────

# Full session end: pull, sync, push, verify
land:
    @echo "=== Landing the plane ==="
    git pull --rebase
    bd sync
    git push
    git status
    @echo "=== Done ==="
