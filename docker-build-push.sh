#!/bin/bash

echo "NexCart Docker Build and Push to Docker Hub"
echo "============================================"

# Configuration
DOCKER_USERNAME=""
BACKEND_IMAGE_NAME="nexcart-backend"
FRONTEND_IMAGE_NAME="nexcart-frontend"
VERSION="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Get Docker Hub username
if [ -z "$DOCKER_USERNAME" ]; then
    echo -n "Enter your Docker Hub username: "
    read DOCKER_USERNAME
fi

if [ -z "$DOCKER_USERNAME" ]; then
    print_error "Docker Hub username is required!"
    exit 1
fi

# Get version tag
echo -n "Enter version tag (default: latest): "
read INPUT_VERSION
if [ ! -z "$INPUT_VERSION" ]; then
    VERSION="$INPUT_VERSION"
fi

print_status "Building and pushing images with tag: $VERSION"

# Login to Docker Hub
print_status "Logging in to Docker Hub..."
docker login
if [ $? -ne 0 ]; then
    print_error "Docker Hub login failed!"
    exit 1
fi

print_success "Successfully logged in to Docker Hub"

# Build and push backend
print_status "Building backend image..."
docker build -t $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$VERSION ./nexcart_backend
if [ $? -ne 0 ]; then
    print_error "Backend build failed!"
    exit 1
fi

print_success "Backend image built successfully"

print_status "Pushing backend image to Docker Hub..."
docker push $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$VERSION
if [ $? -ne 0 ]; then
    print_error "Backend push failed!"
    exit 1
fi

print_success "Backend image pushed successfully"

# Build and push frontend
print_status "Building frontend image..."
docker build -t $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$VERSION ./nexcart-frontend-new
if [ $? -ne 0 ]; then
    print_error "Frontend build failed!"
    exit 1
fi

print_success "Frontend image built successfully"

print_status "Pushing frontend image to Docker Hub..."
docker push $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$VERSION
if [ $? -ne 0 ]; then
    print_error "Frontend push failed!"
    exit 1
fi

print_success "Frontend image pushed successfully"

# Tag as latest if not already latest
if [ "$VERSION" != "latest" ]; then
    print_status "Tagging images as latest..."
    
    docker tag $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$VERSION $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:latest
    docker tag $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$VERSION $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:latest
    
    docker push $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:latest
    docker push $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:latest
    
    print_success "Images tagged and pushed as latest"
fi

# Create docker-compose file for Docker Hub images
print_status "Creating docker-compose.hub.yml for Docker Hub images..."

cat > docker-compose.hub.yml << EOF
version: '3.8'

services:
  # Django Backend (using Docker Hub image)
  backend:
    image: $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$VERSION
    container_name: nexcart_backend_hub
    environment:
      - DEBUG=\${DEBUG:-False}
      - SECRET_KEY=\${SECRET_KEY}
      - DATABASE_URL=\${DATABASE_URL}
      - ALLOWED_HOSTS=\${ALLOWED_HOSTS:-localhost,127.0.0.1}
      - CORS_ALLOWED_ORIGINS=\${CORS_ALLOWED_ORIGINS:-http://localhost:3000}
      - STRIPE_PUBLIC_KEY=\${STRIPE_PUBLIC_KEY:-}
      - STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY:-}
    volumes:
      - media_files:/app/media
      - static_files:/app/staticfiles
    ports:
      - "8000:8000"
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn --bind 0.0.0.0:8000 nexcart_backend.wsgi:application"

  # React Frontend (using Docker Hub image)
  frontend:
    image: $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$VERSION
    container_name: nexcart_frontend_hub
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  media_files:
  static_files:
EOF

print_success "docker-compose.hub.yml created successfully"

echo ""
print_success "All images pushed to Docker Hub successfully!"
echo ""
print_status "Docker Hub Images:"
echo "  Backend:  $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$VERSION"
echo "  Frontend: $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$VERSION"
echo ""
print_status "To use these images:"
echo "  docker-compose -f docker-compose.hub.yml --env-file .env up -d"
echo ""
print_status "To pull images on another machine:"
echo "  docker pull $DOCKER_USERNAME/$BACKEND_IMAGE_NAME:$VERSION"
echo "  docker pull $DOCKER_USERNAME/$FRONTEND_IMAGE_NAME:$VERSION"
