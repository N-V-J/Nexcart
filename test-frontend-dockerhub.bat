@echo off
echo Testing navinvj/nexcart-frontend Docker image...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Pull the latest image
echo Pulling latest frontend image from Docker Hub...
docker pull navinvj/nexcart-frontend:latest

REM Test run the container
echo Starting frontend container for testing...
docker run -d --name nexcart-frontend-test -p 3000:80 navinvj/nexcart-frontend:latest

REM Wait for container to start
echo Waiting for container to start...
timeout /t 5 /nobreak >nul

REM Check if container is running
docker ps | findstr "nexcart-frontend-test" >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend container is running successfully!
    echo 🌐 Frontend available at: http://localhost:3000
    echo 📱 Test the following features:
    echo    - Homepage and navigation
    echo    - Product listing and details
    echo    - User authentication
    echo    - Shopping cart functionality
    echo    - Admin panel at: http://localhost:3000/admin
    echo.
    echo 📡 Note: API calls will go to the configured backend URL
    echo    Make sure your backend is running for full functionality
    echo.
    echo To stop the test container, run:
    echo docker stop nexcart-frontend-test ^&^& docker rm nexcart-frontend-test
) else (
    echo ✗ Frontend container failed to start!
    echo Checking logs...
    docker logs nexcart-frontend-test
    docker rm nexcart-frontend-test
    exit /b 1
)
