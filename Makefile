# Makefile for Tenneco Project Docker Management
# Provides convenient shortcuts for common Docker commands

.PHONY: help build up down restart logs clean install dev prod

# Default target
help:
	@echo "Tenneco Project - Docker Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make install     - Initial setup (copy env files)"
	@echo "  make build       - Build all Docker images"
	@echo "  make up          - Start all services (detached)"
	@echo "  make dev         - Start all services with logs"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs (all services)"
	@echo "  make logs-client - View client logs"
	@echo "  make logs-admin  - View admin logs"
	@echo "  make logs-db     - View MongoDB logs"
	@echo "  make clean       - Stop and remove containers + volumes"
	@echo "  make ps          - Show running containers"
	@echo "  make shell-client - Access client container shell"
	@echo "  make shell-admin  - Access admin container shell"
	@echo "  make shell-db     - Access MongoDB shell"
	@echo "  make rebuild      - Clean rebuild (no cache)"
	@echo ""

# Initial setup
install:
	@echo "Setting up environment files..."
	@if [ ! -f .env ]; then \
		cp docker.env.example .env; \
		echo "Created .env from docker.env.example"; \
		echo "⚠️  IMPORTANT: Edit .env and update the following:"; \
		echo "  - PAYLOAD_SECRET (generate with: openssl rand -base64 32)"; \
		echo "  - S3_ACCESS_KEY_ID"; \
		echo "  - S3_SECRET_ACCESS_KEY"; \
		echo "  - MONGO_PASSWORD"; \
	else \
		echo ".env already exists, skipping..."; \
	fi

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start services (detached)
up:
	@echo "Starting services in detached mode..."
	docker-compose up -d
	@echo ""
	@echo "Services started! Access at:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Admin:    http://localhost:3001/admin"
	@echo "  API:      http://localhost:3001/api"
	@echo ""
	@echo "Run 'make logs' to view logs"

# Start services with logs
dev:
	@echo "Starting services with logs..."
	docker-compose up

# Stop services
down:
	@echo "Stopping services..."
	docker-compose down

# Restart services
restart:
	@echo "Restarting services..."
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

logs-client:
	docker-compose logs -f client

logs-admin:
	docker-compose logs -f admin

logs-db:
	docker-compose logs -f mongodb

# Clean up (removes volumes - deletes data!)
clean:
	@echo "⚠️  WARNING: This will remove all containers and volumes (database data will be lost!)"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "Cleanup complete!"; \
	else \
		echo "Cleanup cancelled."; \
	fi

# Show running containers
ps:
	docker-compose ps

# Access container shells
shell-client:
	docker-compose exec client sh

shell-admin:
	docker-compose exec admin sh

shell-db:
	docker-compose exec mongodb mongosh -u admin -p changeme123

# Rebuild without cache
rebuild:
	@echo "Rebuilding from scratch (no cache)..."
	docker-compose build --no-cache
	docker-compose up -d

# Production build
prod: install build up
	@echo "Production environment started!"
