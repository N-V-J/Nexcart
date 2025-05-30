@echo off
echo NexCart Deployment from Docker Hub
echo ==================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo [INFO] Please create a .env file with your configuration.
    echo [INFO] You can copy .env.dockerhub as a template:
    echo   copy .env.dockerhub .env
    echo Then edit .env with your actual values.
    exit /b 1
)

REM Check if docker-compose.hub.yml exists
if not exist "docker-compose.hub.yml" (
    echo [ERROR] docker-compose.hub.yml not found!
    echo [INFO] Please run the build script first to create this file:
    echo   docker-build-push.bat
    echo [INFO] Or copy the template and update with your Docker Hub username:
    echo   copy docker-compose.hub.template.yml docker-compose.hub.yml
    exit /b 1
)

echo [INFO] Loading environment variables from .env file...

REM Check for required environment variables in .env
findstr /B "DATABASE_URL=" .env >nul
if %errorlevel% neq 0 (
    echo [ERROR] DATABASE_URL not found in .env file!
    echo [INFO] Please add your database URL to the .env file.
    exit /b 1
)

findstr /B "SECRET_KEY=" .env >nul
if %errorlevel% neq 0 (
    echo [ERROR] SECRET_KEY not found in .env file!
    echo [INFO] Please add a secure secret key to the .env file.
    exit /b 1
)

echo [INFO] Environment configuration validated

REM Pull latest images
echo [INFO] Pulling latest images from Docker Hub...
docker-compose -f docker-compose.hub.yml pull

if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull images from Docker Hub!
    echo [INFO] Make sure the images exist and you have access to them.
    exit /b 1
)

echo [SUCCESS] Images pulled successfully

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose -f docker-compose.hub.yml down

REM Start services
echo [INFO] Starting services from Docker Hub images...
docker-compose -f docker-compose.hub.yml up -d

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services!
    echo [INFO] Checking logs...
    docker-compose -f docker-compose.hub.yml logs
    exit /b 1
)

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 20 /nobreak >nul

REM Check if backend is running
docker-compose -f docker-compose.hub.yml ps | findstr "nexcart_backend_hub.*Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Backend container failed to start!
    echo [INFO] Checking logs...
    docker-compose -f docker-compose.hub.yml logs backend
    exit /b 1
)

echo [SUCCESS] Backend service is running

REM Check if frontend is running
docker-compose -f docker-compose.hub.yml ps | findstr "nexcart_frontend_hub.*Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Frontend container failed to start!
    echo [INFO] Checking logs...
    docker-compose -f docker-compose.hub.yml logs frontend
    exit /b 1
)

echo [SUCCESS] Frontend service is running

REM Test database connection
echo [INFO] Testing database connection...
docker-compose -f docker-compose.hub.yml exec backend python test_db_connection.py

if %errorlevel% equ 0 (
    echo [SUCCESS] Database connection successful
) else (
    echo [WARNING] Database connection test failed, but services are running
)

REM Show running containers
echo [INFO] Container status:
docker-compose -f docker-compose.hub.yml ps

echo.
echo [SUCCESS] Deployment completed successfully!
echo.
echo [INFO] Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000/api
echo   Django Admin: http://localhost:8000/admin
echo.
echo [INFO] Superuser credentials:
echo   Username: nvj
echo   Password: 0.123456789
echo.
echo [INFO] Useful commands:
echo   View logs: docker-compose -f docker-compose.hub.yml logs -f
echo   Stop services: docker-compose -f docker-compose.hub.yml down
echo   Update images: docker-compose -f docker-compose.hub.yml pull ^&^& docker-compose -f docker-compose.hub.yml up -d

pause
