#!/bin/bash

# Test NexCart Frontend Docker Hub Image
echo "Testing navinvj/nexcart-frontend Docker image..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull the latest image
echo "Pulling latest frontend image from Docker Hub..."
docker pull navinvj/nexcart-frontend:latest

# Test run the container
echo "Starting frontend container for testing..."
docker run -d \
  --name nexcart-frontend-test \
  -p 3000:80 \
  navinvj/nexcart-frontend:latest

# Wait for container to start
echo "Waiting for container to start..."
sleep 5

# Check if container is running
if docker ps | grep -q "nexcart-frontend-test"; then
    echo "✅ Frontend container is running successfully!"
    echo "🌐 Frontend available at: http://localhost:3000"
    echo "📱 Test the following features:"
    echo "   - Homepage and navigation"
    echo "   - Product listing and details"
    echo "   - User authentication"
    echo "   - Shopping cart functionality"
    echo "   - Admin panel at: http://localhost:3000/admin"
    echo ""
    echo "📡 Note: API calls will go to the configured backend URL"
    echo "   Make sure your backend is running for full functionality"
    echo ""
    echo "To stop the test container, run:"
    echo "docker stop nexcart-frontend-test && docker rm nexcart-frontend-test"
else
    echo "❌ Frontend container failed to start!"
    echo "Checking logs..."
    docker logs nexcart-frontend-test
    docker rm nexcart-frontend-test
    exit 1
fi
