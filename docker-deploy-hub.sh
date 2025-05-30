#!/bin/bash

echo "NexCart Deployment from Docker Hub"
echo "=================================="

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

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_status "Please create a .env file with your configuration."
    print_status "You can copy .env.dockerhub as a template:"
    echo "  cp .env.dockerhub .env"
    echo "Then edit .env with your actual values."
    exit 1
fi

# Check if docker-compose.hub.yml exists
if [ ! -f "docker-compose.hub.yml" ]; then
    print_error "docker-compose.hub.yml not found!"
    print_status "Please run the build script first to create this file:"
    echo "  ./docker-build-push.sh"
    print_status "Or copy the template and update with your Docker Hub username:"
    echo "  cp docker-compose.hub.template.yml docker-compose.hub.yml"
    exit 1
fi

print_status "Loading environment variables from .env file..."
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in .env file!"
    print_status "Please add your database URL to the .env file."
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    print_error "SECRET_KEY not found in .env file!"
    print_status "Please add a secure secret key to the .env file."
    exit 1
fi

print_status "Environment configuration validated"

# Pull latest images
print_status "Pulling latest images from Docker Hub..."
docker-compose -f docker-compose.hub.yml pull

if [ $? -ne 0 ]; then
    print_error "Failed to pull images from Docker Hub!"
    print_status "Make sure the images exist and you have access to them."
    exit 1
fi

print_success "Images pulled successfully"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.hub.yml down

# Start services
print_status "Starting services from Docker Hub images..."
docker-compose -f docker-compose.hub.yml up -d

if [ $? -ne 0 ]; then
    print_error "Failed to start services!"
    print_status "Checking logs..."
    docker-compose -f docker-compose.hub.yml logs
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 20

# Check if backend is running
if ! docker-compose -f docker-compose.hub.yml ps | grep -q "nexcart_backend_hub.*Up"; then
    print_error "Backend container failed to start!"
    print_status "Checking logs..."
    docker-compose -f docker-compose.hub.yml logs backend
    exit 1
fi

print_success "Backend service is running"

# Check if frontend is running
if ! docker-compose -f docker-compose.hub.yml ps | grep -q "nexcart_frontend_hub.*Up"; then
    print_error "Frontend container failed to start!"
    print_status "Checking logs..."
    docker-compose -f docker-compose.hub.yml logs frontend
    exit 1
fi

print_success "Frontend service is running"

# Test database connection
print_status "Testing database connection..."
docker-compose -f docker-compose.hub.yml exec backend python test_db_connection.py

if [ $? -eq 0 ]; then
    print_success "Database connection successful"
else
    print_warning "Database connection test failed, but services are running"
fi

# Show running containers
print_status "Container status:"
docker-compose -f docker-compose.hub.yml ps

echo ""
print_success "Deployment completed successfully!"
echo ""
print_status "Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000/api"
echo "  Django Admin: http://localhost:8000/admin"
echo ""
print_status "Superuser credentials:"
echo "  Username: nvj"
echo "  Password: 0.123456789"
echo ""
print_status "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.hub.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.hub.yml down"
echo "  Update images: docker-compose -f docker-compose.hub.yml pull && docker-compose -f docker-compose.hub.yml up -d"
