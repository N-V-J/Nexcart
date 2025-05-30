@echo off
echo Testing navinvj/nexcart-backend Docker image...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Pull the latest image
echo Pulling latest image from Docker Hub...
docker pull navinvj/nexcart-backend:latest

REM Check if .env.render.dockerhub exists
if not exist ".env.render.dockerhub" (
    echo Error: .env.render.dockerhub file not found!
    echo Please create this file with your Render database configuration.
    exit /b 1
)

REM Test run the container
echo Starting container for testing...
docker run -d --name nexcart-backend-test --env-file .env.render.dockerhub -p 8000:8000 navinvj/nexcart-backend:latest

REM Wait for container to start
echo Waiting for container to start...
timeout /t 10 /nobreak >nul

REM Check if container is running
docker ps | findstr "nexcart-backend-test" >nul
if %errorlevel% equ 0 (
    echo ✓ Container is running successfully!
    echo 🌐 Backend available at: http://localhost:8000
    echo 🔧 Admin panel at: http://localhost:8000/admin/
    echo 📡 API endpoints at: http://localhost:8000/api/
    echo.
    echo To stop the test container, run:
    echo docker stop nexcart-backend-test ^&^& docker rm nexcart-backend-test
) else (
    echo ✗ Container failed to start!
    echo Checking logs...
    docker logs nexcart-backend-test
    docker rm nexcart-backend-test
    exit /b 1
)
