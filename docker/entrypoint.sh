#!/bin/bash
# Entrypoint for development container

log() { echo -e "\033[0;34m[ENTRYPOINT]\033[0m $1"; }

log "Starting Pharma Cold Track dev container..."

case "$1" in
    "frontend")
        log "Starting frontend dev server..."
        cd /app/frontend_vite
        if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
            log "Installing dependencies..."
            npm install
        fi
        npm run dev -- --host 0.0.0.0
        ;;
    "lambda")
        log "Lambda package built during build phase. Ready for local testing."
        /bin/bash
        ;;
    "infra")
        log "Starting Terraform environment..."
        /bin/bash
        ;;
    *)
        log "Usage: docker run ... [frontend|lambda|infra]"
        log "Commands available:"
        log "  frontend : Start React dev server"
        log "  lambda   : Enter container with Lambda environment"
        log "  infra    : Enter container with Terraform environment"
        /bin/bash
        ;;
esac