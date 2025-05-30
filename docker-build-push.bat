@echo off
echo NexCart Docker Build and Push to Docker Hub
echo ============================================

REM Configuration
set DOCKER_USERNAME=
set BACKEND_IMAGE_NAME=nexcart-backend
set FRONTEND_IMAGE_NAME=nexcart-frontend
set VERSION=latest

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Get Docker Hub username
if "%DOCKER_USERNAME%"=="" (
    set /p DOCKER_USERNAME="Enter your Docker Hub username: "
)

if "%DOCKER_USERNAME%"=="" (
    echo [ERROR] Docker Hub username is required!
    exit /b 1
)

REM Get version tag
set /p INPUT_VERSION="Enter version tag (default: latest): "
if not "%INPUT_VERSION%"=="" (
    set VERSION=%INPUT_VERSION%
)

echo [INFO] Building and pushing images with tag: %VERSION%

REM Login to Docker Hub
echo [INFO] Logging in to Docker Hub...
docker login
if %errorlevel% neq 0 (
    echo [ERROR] Docker Hub login failed!
    exit /b 1
)

echo [SUCCESS] Successfully logged in to Docker Hub

REM Build and push backend
echo [INFO] Building backend image...
docker build -t %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:%VERSION% ./nexcart_backend
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed!
    exit /b 1
)

echo [SUCCESS] Backend image built successfully

echo [INFO] Pushing backend image to Docker Hub...
docker push %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:%VERSION%
if %errorlevel% neq 0 (
    echo [ERROR] Backend push failed!
    exit /b 1
)

echo [SUCCESS] Backend image pushed successfully

REM Build and push frontend
echo [INFO] Building frontend image...
docker build -t %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:%VERSION% ./nexcart-frontend-new
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    exit /b 1
)

echo [SUCCESS] Frontend image built successfully

echo [INFO] Pushing frontend image to Docker Hub...
docker push %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:%VERSION%
if %errorlevel% neq 0 (
    echo [ERROR] Frontend push failed!
    exit /b 1
)

echo [SUCCESS] Frontend image pushed successfully

REM Tag as latest if not already latest
if not "%VERSION%"=="latest" (
    echo [INFO] Tagging images as latest...
    
    docker tag %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:%VERSION% %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:latest
    docker tag %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:%VERSION% %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:latest
    
    docker push %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:latest
    docker push %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:latest
    
    echo [SUCCESS] Images tagged and pushed as latest
)

REM Create docker-compose file for Docker Hub images
echo [INFO] Creating docker-compose.hub.yml for Docker Hub images...

(
echo version: '3.8'
echo.
echo services:
echo   # Django Backend ^(using Docker Hub image^)
echo   backend:
echo     image: %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:%VERSION%
echo     container_name: nexcart_backend_hub
echo     environment:
echo       - DEBUG=${DEBUG:-False}
echo       - SECRET_KEY=${SECRET_KEY}
echo       - DATABASE_URL=${DATABASE_URL}
echo       - ALLOWED_HOSTS=${ALLOWED_HOSTS:-localhost,127.0.0.1}
echo       - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://localhost:3000}
echo       - STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY:-}
echo       - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
echo     volumes:
echo       - media_files:/app/media
echo       - static_files:/app/staticfiles
echo     ports:
echo       - "8000:8000"
echo     command: ^>
echo       sh -c "python manage.py migrate ^&^&
echo              python manage.py collectstatic --noinput ^&^&
echo              gunicorn --bind 0.0.0.0:8000 nexcart_backend.wsgi:application"
echo.
echo   # React Frontend ^(using Docker Hub image^)
echo   frontend:
echo     image: %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:%VERSION%
echo     container_name: nexcart_frontend_hub
echo     ports:
echo       - "3000:80"
echo     depends_on:
echo       - backend
echo.
echo volumes:
echo   media_files:
echo   static_files:
) > docker-compose.hub.yml

echo [SUCCESS] docker-compose.hub.yml created successfully

echo.
echo [SUCCESS] All images pushed to Docker Hub successfully!
echo.
echo [INFO] Docker Hub Images:
echo   Backend:  %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:%VERSION%
echo   Frontend: %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:%VERSION%
echo.
echo [INFO] To use these images:
echo   docker-compose -f docker-compose.hub.yml --env-file .env up -d
echo.
echo [INFO] To pull images on another machine:
echo   docker pull %DOCKER_USERNAME%/%BACKEND_IMAGE_NAME%:%VERSION%
echo   docker pull %DOCKER_USERNAME%/%FRONTEND_IMAGE_NAME%:%VERSION%

pause
