#!/bin/bash

# Docker Swarm deployment script for Zillow NZ backend

set -e

echo "🚀 Deploying Zillow NZ Backend to Docker Swarm"

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.production file not found"
    exit 1
fi

# Check if swarm is initialized
if ! docker info | grep -q "Swarm: active"; then
    echo "⚠️  Docker Swarm is not initialized. Initializing..."
    docker swarm init
fi

# Create secrets (if they don't exist)
echo "🔐 Creating Docker secrets..."
echo "$POSTGRES_PASSWORD" | docker secret create postgres_password - 2>/dev/null || echo "Secret postgres_password already exists"
echo "$REDIS_PASSWORD" | docker secret create redis_password - 2>/dev/null || echo "Secret redis_password already exists"
echo "$AUTH_SECRET" | docker secret create auth_secret - 2>/dev/null || echo "Secret auth_secret already exists"
echo "$STRIPE_SECRET_KEY" | docker secret create stripe_secret - 2>/dev/null || echo "Secret stripe_secret already exists"

# Deploy stack
echo "📦 Deploying stack..."
docker stack deploy -c docker-compose.prod.yml zillow-nz

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Show status
echo "📊 Service status:"
docker stack services zillow-nz

echo "✅ Deployment complete!"
echo ""
echo "To check logs: docker service logs -f zillow-nz_backend"
echo "To scale: docker service scale zillow-nz_backend=5"
echo "To update: docker service update --image ${DOCKER_USERNAME}/zillow-nz-backend:latest zillow-nz_backend"
