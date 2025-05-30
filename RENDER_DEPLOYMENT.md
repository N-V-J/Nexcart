# NexCart Deployment with Render Database

This guide explains how to deploy NexCart using a PostgreSQL database hosted on Render.

## 🗄️ Setting Up Render PostgreSQL Database

### Step 1: Create PostgreSQL Database on Render

1. **Sign up/Login to Render**: Go to [render.com](https://render.com) and create an account or login.

2. **Create a new PostgreSQL database**:
   - Click "New +" button
   - Select "PostgreSQL"
   - Choose a name for your database (e.g., `nexcart-db`)
   - Select a region close to your users
   - Choose the free tier or paid plan based on your needs

3. **Get database connection details**:
   - After creation, go to your database dashboard
   - Copy the "External Database URL" (it looks like: `postgresql://username:password@hostname:port/database_name`)

### Step 2: Configure Environment Variables

1. **Copy the Render environment template**:
   ```bash
   cp .env.render .env
   ```

2. **Edit the .env file** with your actual values:
   ```env
   # Replace with your actual Render PostgreSQL database URL
   DATABASE_URL=postgresql://username:password@hostname:port/database_name
   
   # Set a strong secret key for production
   SECRET_KEY=your-very-secure-secret-key-here
   
   # Configure allowed hosts (add your domain)
   ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com,your-render-app.onrender.com
   
   # Configure CORS origins (add your frontend URL)
   CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   
   # Add your Stripe keys
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

## 🐳 Docker Setup with Render Database

### Quick Start

**Windows:**
```cmd
docker-render.bat
```

**Linux/macOS:**
```bash
chmod +x docker-render.sh
./docker-render.sh
```

### Manual Setup

1. **Test database connection**:
   ```bash
   cd nexcart_backend
   python test_db_connection.py
   ```

2. **Start containers with Render database**:
   ```bash
   docker-compose up --build -d
   ```

3. **Run migrations**:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

## 🚀 Deployment Options

### Option 1: Local Development with Render Database

Use the main `docker-compose.yml` which connects to your Render database:

```bash
# With environment file
docker-compose --env-file .env up --build -d

# Or export variables and run
export $(cat .env | grep -v '^#' | xargs)
docker-compose up --build -d
```

### Option 2: Local Development with Local Database

Use the local development setup if you want to develop with a local database:

```bash
docker-compose -f docker-compose.local.yml up --build -d
```

### Option 3: Production Deployment

For production deployment with Render database:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env up --build -d
```

## 🔧 Database Management

### Running Migrations

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create migrations for model changes
docker-compose exec backend python manage.py makemigrations

# Check migration status
docker-compose exec backend python manage.py showmigrations
```

### Managing Superuser

The superuser is created automatically via migration, but you can also create one manually:

```bash
# Create superuser interactively
docker-compose exec backend python manage.py createsuperuser

# Or use the pre-configured superuser:
# Username: nvj
# Password: 0.123456789
```

### Database Operations

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# Test database connection
docker-compose exec backend python test_db_connection.py

# Backup database (from Render dashboard)
# Render provides automated backups for paid plans
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Test connection
   cd nexcart_backend
   python test_db_connection.py
   ```
   - Check if DATABASE_URL is correct
   - Verify database is running on Render
   - Check network connectivity

2. **Migration Errors**
   ```bash
   # Check migration status
   docker-compose exec backend python manage.py showmigrations
   
   # Reset migrations (use with caution)
   docker-compose exec backend python manage.py migrate --fake-initial
   ```

3. **Container Startup Issues**
   ```bash
   # Check logs
   docker-compose logs backend
   
   # Restart containers
   docker-compose restart
   ```

### Environment Variables

Make sure these are set in your `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Render PostgreSQL URL | `postgresql://user:pass@host:port/db` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `https://yourdomain.com` |

## 📊 Monitoring

### Database Monitoring

1. **Render Dashboard**: Monitor database performance, connections, and storage usage
2. **Application Logs**: Check Django logs for database-related errors
3. **Connection Testing**: Use the provided test script regularly

### Performance Tips

1. **Connection Pooling**: Render PostgreSQL includes connection pooling
2. **Indexing**: Ensure proper database indexes for your queries
3. **Query Optimization**: Monitor slow queries in Render dashboard
4. **Caching**: Consider adding Redis for caching (also available on Render)

## 🔒 Security

### Database Security

1. **Use strong passwords**: Render generates secure passwords by default
2. **Limit connections**: Configure connection limits if needed
3. **SSL connections**: Render enforces SSL connections by default
4. **Regular backups**: Enable automated backups on Render

### Application Security

1. **Environment variables**: Never commit sensitive data to version control
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure proper CORS origins
4. **Secret key**: Use a strong, unique secret key

## 📈 Scaling

### Database Scaling

1. **Vertical scaling**: Upgrade to higher-tier plans on Render
2. **Connection limits**: Monitor and adjust connection limits
3. **Read replicas**: Available on higher-tier Render plans

### Application Scaling

1. **Multiple containers**: Scale backend containers horizontally
2. **Load balancing**: Use Nginx or cloud load balancers
3. **CDN**: Use CDN for static files and media

## 💰 Cost Optimization

### Render PostgreSQL Pricing

1. **Free tier**: Limited storage and connections
2. **Paid tiers**: Better performance and features
3. **Monitoring**: Track usage to optimize costs

### Tips

1. **Connection pooling**: Reduces connection overhead
2. **Query optimization**: Reduces CPU usage
3. **Regular cleanup**: Remove old data and logs
4. **Monitoring**: Track resource usage patterns
