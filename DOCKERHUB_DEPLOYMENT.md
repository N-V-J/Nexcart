# NexCart Docker Hub Deployment Guide

This guide explains how to build, push, and deploy NexCart using Docker Hub images.

## 🐳 Prerequisites

- Docker Desktop installed and running
- Docker Hub account ([sign up here](https://hub.docker.com/))
- Git repository with NexCart code

## 🚀 Quick Start

### Step 1: Build and Push to Docker Hub

**Windows:**
```cmd
docker-build-push.bat
```

**Linux/macOS:**
```bash
chmod +x docker-build-push.sh
./docker-build-push.sh
```

### Step 2: Deploy from Docker Hub

**Windows:**
```cmd
docker-deploy-hub.bat
```

**Linux/macOS:**
```bash
chmod +x docker-deploy-hub.sh
./docker-deploy-hub.sh
```

## 📋 Manual Process

### Building and Pushing Images

1. **Login to Docker Hub:**
   ```bash
   docker login
   ```

2. **Build backend image:**
   ```bash
   docker build -t yourusername/nexcart-backend:latest ./nexcart_backend
   ```

3. **Build frontend image:**
   ```bash
   docker build -t yourusername/nexcart-frontend:latest ./nexcart-frontend-new
   ```

4. **Push images:**
   ```bash
   docker push yourusername/nexcart-backend:latest
   docker push yourusername/nexcart-frontend:latest
   ```

### Deploying from Docker Hub

1. **Configure environment:**
   ```bash
   cp .env.dockerhub .env
   # Edit .env with your actual values
   ```

2. **Update docker-compose.hub.yml:**
   ```yaml
   services:
     backend:
       image: yourusername/nexcart-backend:latest
     frontend:
       image: yourusername/nexcart-frontend:latest
   ```

3. **Deploy:**
   ```bash
   docker-compose -f docker-compose.hub.yml up -d
   ```

## 🔧 Configuration Files

### Environment Variables (.env)

```env
# Database (Render PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Django
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Stripe
STRIPE_PUBLIC_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
```

### Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.hub.yml` | Generated by build script |
| `docker-compose.hub.template.yml` | Template for manual setup |
| `docker-compose.hub.prod.yml` | Production with Nginx |

## 🏗️ Image Architecture

### Backend Image (nexcart-backend)
- **Base:** Python 3.11 slim
- **Size:** ~200MB
- **Includes:** Django app, dependencies, static files
- **Port:** 8000
- **User:** Non-root (appuser)

### Frontend Image (nexcart-frontend)
- **Base:** Nginx Alpine (multi-stage build)
- **Size:** ~25MB
- **Includes:** Built React app, Nginx config
- **Port:** 80
- **Features:** Gzip, security headers, SPA routing

## 📊 Image Tags and Versioning

### Tagging Strategy

- `latest` - Latest stable version
- `v1.0.0` - Semantic versioning
- `main` - Latest from main branch
- `dev` - Development builds

### Example Tags

```bash
# Latest stable
yourusername/nexcart-backend:latest
yourusername/nexcart-frontend:latest

# Version specific
yourusername/nexcart-backend:v1.0.0
yourusername/nexcart-frontend:v1.0.0

# Branch specific
yourusername/nexcart-backend:main
yourusername/nexcart-frontend:main
```

## 🔄 CI/CD with GitHub Actions

### Setup

1. **Add secrets to GitHub repository:**
   - `DOCKERHUB_USERNAME` - Your Docker Hub username
   - `DOCKERHUB_TOKEN` - Docker Hub access token

2. **Workflow triggers:**
   - Push to main/master branch
   - Git tags (v*)
   - Pull requests (build only)

### Workflow Features

- Multi-platform builds
- Automatic tagging
- Cache optimization
- Artifact generation

## 🌐 Deployment Options

### Option 1: Simple Deployment
```bash
docker-compose -f docker-compose.hub.yml up -d
```

### Option 2: Production with Nginx
```bash
docker-compose -f docker-compose.hub.prod.yml up -d
```

### Option 3: Cloud Deployment
Use the Docker Hub images with any cloud provider:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Render

## 🔍 Troubleshooting

### Common Issues

1. **Image not found:**
   ```bash
   # Check if image exists
   docker pull yourusername/nexcart-backend:latest
   ```

2. **Permission denied:**
   ```bash
   # Login to Docker Hub
   docker login
   ```

3. **Build failures:**
   ```bash
   # Check build logs
   docker build --no-cache -t test ./nexcart_backend
   ```

### Debugging

```bash
# Check running containers
docker-compose -f docker-compose.hub.yml ps

# View logs
docker-compose -f docker-compose.hub.yml logs -f

# Access container shell
docker-compose -f docker-compose.hub.yml exec backend bash
```

## 📈 Performance Optimization

### Image Size Optimization

1. **Multi-stage builds** (already implemented)
2. **Minimal base images** (Alpine/slim)
3. **Layer caching** in CI/CD
4. **Dependency optimization**

### Runtime Optimization

1. **Resource limits:**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

2. **Health checks:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

## 🔒 Security Best Practices

### Image Security

1. **Non-root user** (implemented)
2. **Minimal attack surface**
3. **Regular base image updates**
4. **Vulnerability scanning**

### Deployment Security

1. **Environment variables** for secrets
2. **Network isolation**
3. **HTTPS in production**
4. **Regular updates**

## 💰 Cost Optimization

### Docker Hub Limits

- **Free tier:** 200 container pulls per 6 hours
- **Pro tier:** Unlimited pulls
- **Team tier:** Advanced features

### Optimization Tips

1. **Use specific tags** instead of `latest`
2. **Implement layer caching**
3. **Minimize image rebuilds**
4. **Use multi-stage builds**

## 📚 Additional Resources

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [GitHub Actions Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [NexCart Documentation](./README.md)
