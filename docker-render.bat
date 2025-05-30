@echo off
echo NexCart Docker Setup with Render Database
echo ==========================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found!
    echo Please create a .env file with your Render database configuration.
    echo You can copy .env.render as a template:
    echo   copy .env.render .env
    echo Then edit .env with your actual Render database URL and other settings.
    exit /b 1
)

REM Check if DATABASE_URL is set in .env
findstr /B "DATABASE_URL=" .env >nul
if %errorlevel% neq 0 (
    echo Error: DATABASE_URL not found in .env file!
    echo Please add your Render PostgreSQL database URL to the .env file:
    echo   DATABASE_URL=postgresql://username:password@hostname:port/database_name
    exit /b 1
)

echo Loading environment variables from .env file...

REM Test database connection first
echo Testing database connection...
cd nexcart_backend
python test_db_connection.py
if %errorlevel% neq 0 (
    echo Error: Database connection test failed!
    echo Please check your DATABASE_URL and ensure the Render database is accessible.
    cd ..
    exit /b 1
)
cd ..

REM Build and start services
echo Building and starting Docker containers with Render database...
docker-compose up --build -d

REM Wait for backend to be ready
echo Waiting for backend service to be ready...
timeout /t 15 /nobreak >nul

REM Check if backend is running
docker-compose ps | findstr "nexcart_backend.*Up" >nul
if %errorlevel% neq 0 (
    echo Error: Backend container failed to start!
    echo Checking logs...
    docker-compose logs backend
    exit /b 1
)

REM Run migrations
echo Running database migrations...
docker-compose exec backend python manage.py migrate

if %errorlevel% equ 0 (
    echo ✓ Migrations completed successfully!
) else (
    echo Error: Migration failed!
    echo Checking logs...
    docker-compose logs backend
    exit /b 1
)

REM Check superuser
echo Checking superuser status...
docker-compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('✓ Superuser nvj already exists') if User.objects.filter(username='nvj').exists() else print('⚠ Superuser nvj not found - may need to run migrations again')"

REM Show running containers
echo Docker containers status:
docker-compose ps

echo.
echo Setup complete!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/api
echo Django Admin: http://localhost:8000/admin
echo.
echo Database: Render PostgreSQL (external)
echo.
echo Superuser credentials:
echo Username: nvj
echo Password: 0.123456789
echo.
echo To stop containers: docker-compose down
echo To view logs: docker-compose logs -f
echo To test database connection: cd nexcart_backend && python test_db_connection.py

pause
