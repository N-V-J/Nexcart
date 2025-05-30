@echo off
echo NexCart Docker Development Setup
echo ================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build and start services
echo Building and starting Docker containers...
docker-compose up --build -d

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run migrations
echo Running database migrations...
docker-compose exec backend python manage.py migrate

REM Create superuser (if not exists)
echo Creating superuser...
docker-compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Superuser already created by migration') if not User.objects.filter(username='nvj').exists() else print('Superuser nvj already exists')"

REM Show running containers
echo Docker containers status:
docker-compose ps

echo.
echo Setup complete!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/api
echo Django Admin: http://localhost:8000/admin
echo.
echo Superuser credentials:
echo Username: nvj
echo Password: 0.123456789
echo.
echo To stop containers: docker-compose down
echo To view logs: docker-compose logs -f

pause
