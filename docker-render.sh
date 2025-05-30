#!/bin/bash

echo "NexCart Docker Setup with Render Database"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with your Render database configuration."
    echo "You can copy .env.render as a template:"
    echo "  cp .env.render .env"
    echo "Then edit .env with your actual Render database URL and other settings."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env; then
    echo "Error: DATABASE_URL not found in .env file!"
    echo "Please add your Render PostgreSQL database URL to the .env file:"
    echo "  DATABASE_URL=postgresql://username:password@hostname:port/database_name"
    exit 1
fi

echo "Loading environment variables from .env file..."
export $(cat .env | grep -v '^#' | xargs)

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is empty!"
    echo "Please set your Render PostgreSQL database URL in the .env file."
    exit 1
fi

echo "Database URL configured: ${DATABASE_URL%%@*}@***"

# Test database connection first
echo "Testing database connection..."
cd nexcart_backend
python test_db_connection.py
if [ $? -ne 0 ]; then
    echo "Error: Database connection test failed!"
    echo "Please check your DATABASE_URL and ensure the Render database is accessible."
    exit 1
fi
cd ..

# Build and start services
echo "Building and starting Docker containers with Render database..."
docker-compose up --build -d

# Wait for backend to be ready
echo "Waiting for backend service to be ready..."
sleep 15

# Check if backend is running
if ! docker-compose ps | grep -q "nexcart_backend.*Up"; then
    echo "Error: Backend container failed to start!"
    echo "Checking logs..."
    docker-compose logs backend
    exit 1
fi

# Run migrations
echo "Running database migrations..."
docker-compose exec backend python manage.py migrate

if [ $? -eq 0 ]; then
    echo "✓ Migrations completed successfully!"
else
    echo "Error: Migration failed!"
    echo "Checking logs..."
    docker-compose logs backend
    exit 1
fi

# Check superuser
echo "Checking superuser status..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if User.objects.filter(username='nvj').exists():
    print('✓ Superuser nvj already exists')
else:
    print('⚠ Superuser nvj not found - may need to run migrations again')
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
echo "Database: Render PostgreSQL (external)"
echo ""
echo "Superuser credentials:"
echo "Username: nvj"
echo "Password: 0.123456789"
echo ""
echo "To stop containers: docker-compose down"
echo "To view logs: docker-compose logs -f"
echo "To test database connection: cd nexcart_backend && python test_db_connection.py"
