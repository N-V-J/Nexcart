#!/bin/bash

# Test NexCart Docker Hub Image Deployment
echo "Testing navinvj/nexcart-backend Docker image..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull the latest image
echo "Pulling latest image from Docker Hub..."
docker pull navinvj/nexcart-backend:latest

# Check if .env.render.dockerhub exists
if [ ! -f ".env.render.dockerhub" ]; then
    echo "Error: .env.render.dockerhub file not found!"
    echo "Please create this file with your Render database configuration."
    exit 1
fi

# Load environment variables
echo "Loading environment variables..."
export $(cat .env.render.dockerhub | grep -v '^#' | xargs)

# Test run the container
echo "Starting container for testing..."
docker run -d \
  --name nexcart-backend-test \
  --env-file .env.render.dockerhub \
  -p 8000:8000 \
  navinvj/nexcart-backend:latest

# Wait for container to start
echo "Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q "nexcart-backend-test"; then
    echo "✅ Container is running successfully!"
    echo "🌐 Backend available at: http://localhost:8000"
    echo "🔧 Admin panel at: http://localhost:8000/admin/"
    echo "📡 API endpoints at: http://localhost:8000/api/"
    echo ""
    echo "To stop the test container, run:"
    echo "docker stop nexcart-backend-test && docker rm nexcart-backend-test"
else
    echo "❌ Container failed to start!"
    echo "Checking logs..."
    docker logs nexcart-backend-test
    docker rm nexcart-backend-test
    exit 1
fi
