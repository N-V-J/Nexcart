# NexCart Docker Setup

This guide explains how to run the NexCart application using Docker containers.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Development Environment Options

#### Option 1: Local Database (Traditional)
Use local PostgreSQL database in Docker:

**Linux/macOS:**
```bash
chmod +x docker-dev.sh
./docker-dev.sh
```

**Windows:**
```cmd
docker-dev.bat
```

#### Option 2: Render Database (Recommended)
Use external PostgreSQL database hosted on Render:

1. **Set up Render database** (see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md))
2. **Configure environment**:
   ```bash
   cp .env.render .env
   # Edit .env with your Render database URL
   ```
3. **Run setup**:

   **Linux/macOS:**
   ```bash
   chmod +x docker-render.sh
   ./docker-render.sh
   ```

   **Windows:**
   ```cmd
   docker-render.bat
   ```

#### Option 3: Docker Hub Images (Production)
Use pre-built images from Docker Hub:

1. **Build and push to Docker Hub** (see [DOCKERHUB_DEPLOYMENT.md](DOCKERHUB_DEPLOYMENT.md)):

   **Linux/macOS:**
   ```bash
   chmod +x docker-build-push.sh
   ./docker-build-push.sh
   ```

   **Windows:**
   ```cmd
   docker-build-push.bat
   ```

2. **Deploy from Docker Hub**:

   **Linux/macOS:**
   ```bash
   chmod +x docker-deploy-hub.sh
   ./docker-deploy-hub.sh
   ```

   **Windows:**
   ```cmd
   docker-deploy-hub.bat
   ```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### Manual Setup

If you prefer to run commands manually:

1. **Build and start containers**:
   ```bash
   docker-compose up --build -d
   ```

2. **Run migrations**:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Access the application** at the URLs mentioned above.

## Production Deployment

For production deployment, use the production Docker Compose file:

1. **Copy and configure environment variables**:
   ```bash
   cp .env.docker .env
   # Edit .env with your production values
   ```

2. **Deploy with production configuration**:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Docker Configurations

The application provides multiple Docker Compose configurations:

### `docker-compose.yml` (Render Database)
- **backend**: Django REST API connected to external Render database
- **frontend**: React application with Nginx
- **Use case**: Development/production with Render PostgreSQL

### `docker-compose.local.yml` (Local Database)
- **db**: Local PostgreSQL database container
- **backend**: Django REST API connected to local database
- **frontend**: React application with Nginx
- **Use case**: Traditional local development

### `docker-compose.prod.yml` (Production with Render)
- **backend**: Django REST API (with Gunicorn) connected to Render database
- **frontend**: React application (built and served by Nginx)
- **nginx**: Reverse proxy for routing requests
- **Use case**: Production deployment with external database

## Useful Commands

### Container Management
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access Django shell
docker-compose exec backend python manage.py shell

# Access database
docker-compose exec db psql -U postgres -d nexcart_db
```

### Development
```bash
# Install new Python packages
docker-compose exec backend pip install package-name
docker-compose exec backend pip freeze > requirements.txt

# Install new Node packages
docker-compose exec frontend npm install package-name
```

## Environment Variables

Key environment variables for Docker deployment:

### Database
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

### Django
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DATABASE_URL`: Complete database URL

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key

## Volumes

The Docker setup uses the following volumes:
- `postgres_data`: PostgreSQL data persistence
- `media_files`: User uploaded files
- `static_files`: Django static files

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000, 8000, or 5432 are in use, modify the port mappings in `docker-compose.yml`

2. **Database connection issues**: Ensure the database container is healthy before starting the backend:
   ```bash
   docker-compose logs db
   ```

3. **Permission issues**: On Linux/macOS, you might need to adjust file permissions:
   ```bash
   sudo chown -R $USER:$USER .
   ```

4. **Container build failures**: Clear Docker cache and rebuild:
   ```bash
   docker system prune -a
   docker-compose up --build
   ```

### Logs and Debugging

View detailed logs for troubleshooting:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f
```

## Default Credentials

The application comes with a pre-configured superuser:
- **Username**: nvj
- **Password**: 0.123456789

This superuser is created automatically via Django migration during the first run.

## Security Notes

For production deployment:
1. Change the default SECRET_KEY
2. Set DEBUG=False
3. Configure proper ALLOWED_HOSTS
4. Use strong database passwords
5. Set up SSL/TLS certificates
6. Configure proper CORS origins
