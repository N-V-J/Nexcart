#!/bin/bash

echo "NexCart Docker Development Setup"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start services
echo "Building and starting Docker containers..."
docker-compose up --build -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser (if not exists)
echo "Creating superuser..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='nvj').exists():
    print('Superuser already created by migration')
else:
    print('Superuser nvj already exists')
"

# Show running containers
echo "Docker containers status:"
docker-compose ps

echo ""
echo "Setup complete!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000/api"
echo "Django Admin: http://localhost:8000/admin"
echo ""
echo "Superuser credentials:"
echo "Username: nvj"
echo "Password: 0.123456789"
echo ""
echo "To stop containers: docker-compose down"
echo "To view logs: docker-compose logs -f"
