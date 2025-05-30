# Deploy NexCart Backend Docker Image on Render

This guide shows how to deploy the pre-built Docker image `navinvj/nexcart-backend:latest` on Render.

## 🚀 Quick Deployment Steps

### Step 1: Create PostgreSQL Database

1. **Login to Render**: Go to [render.com](https://render.com)
2. **Create Database**:
   - Click "New +" → "PostgreSQL"
   - **Name**: `nexcart-db`
   - **Database**: `nexcart_db`
   - **User**: `nexcart_user`
   - **Region**: Choose your preferred region
   - **Plan**: Free tier or paid plan
3. **Copy Database URL**: Save the "External Database URL" for later

### Step 2: Deploy Docker Image

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Select "Deploy an existing image from a registry"
   - **Image URL**: `navinvj/nexcart-backend:latest`
   - **Name**: `nexcart-backend`
   - **Region**: Same as your database

2. **Configure Service**:
   - **Instance Type**: Free tier or paid
   - **Auto-Deploy**: Yes (recommended)

### Step 3: Set Environment Variables

Add these environment variables in the Render dashboard:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your PostgreSQL URL from Step 1 | ✅ Yes |
| `SECRET_KEY` | `django-insecure-nexcart-production-key-change-this` | ✅ Yes |
| `DEBUG` | `False` | ✅ Yes |
| `ALLOWED_HOSTS` | `nexcart-backend.onrender.com` | ✅ Yes |
| `CORS_ALLOWED_ORIGINS` | `https://nexcart-frontend.onrender.com` | ✅ Yes |
| `RENDER` | `True` | ✅ Yes |
| `DJANGO_SETTINGS_MODULE` | `nexcart_backend.settings` | ✅ Yes |
| `STRIPE_PUBLIC_KEY` | Your Stripe public key | ❌ Optional |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | ❌ Optional |

### Step 4: Deploy and Test

1. **Deploy**: Click "Create Web Service"
2. **Monitor**: Watch the deployment logs
3. **Test**: Once deployed, test your endpoints

## 🔧 Environment Variables Details

### Required Variables:

```bash
# Database connection
DATABASE_URL=postgresql://nexcart_user:password@host:port/nexcart_db

# Django security
SECRET_KEY=your-very-secure-secret-key-here

# Production settings
DEBUG=False
ALLOWED_HOSTS=nexcart-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://nexcart-frontend.onrender.com

# Render specific
RENDER=True
DJANGO_SETTINGS_MODULE=nexcart_backend.settings
```

### Optional Variables:

```bash
# Stripe payments
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
```

## 🧪 Testing Your Deployment

After deployment, test these URLs:

1. **API Root**: `https://nexcart-backend.onrender.com/api/`
2. **Admin Panel**: `https://nexcart-backend.onrender.com/admin/`
3. **Health Check**: `https://nexcart-backend.onrender.com/api/health/`

### API Endpoints:
- **Products**: `https://nexcart-backend.onrender.com/api/products/`
- **Categories**: `https://nexcart-backend.onrender.com/api/categories/`
- **Users**: `https://nexcart-backend.onrender.com/api/users/`
- **Orders**: `https://nexcart-backend.onrender.com/api/orders/`

## 🔐 Admin Access

Default superuser credentials:
- **Username**: `nvj`
- **Password**: `0.123456789`
- **Admin URL**: `https://nexcart-backend.onrender.com/admin/`

## 🐛 Troubleshooting

### Common Issues:

1. **Service Won't Start**:
   - Check environment variables are set correctly
   - Verify `DATABASE_URL` format
   - Check deployment logs for errors

2. **Database Connection Failed**:
   - Ensure database is running
   - Verify `DATABASE_URL` is correct
   - Check database region matches service region

3. **Static Files Not Loading**:
   - Docker image includes static files
   - Check if `ALLOWED_HOSTS` includes your domain

4. **CORS Errors**:
   - Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
   - Ensure no trailing slashes in URLs

### Checking Logs:
1. Go to Render dashboard
2. Click on your web service
3. View "Logs" tab for detailed information

### Manual Commands:
If you need to run Django commands, you can use Render's shell:
1. Go to your service dashboard
2. Click "Shell" tab
3. Run commands like:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py collectstatic
   ```

## 🔄 Updates and Redeployment

### Automatic Updates:
- Render will automatically redeploy when you push new images to Docker Hub
- Enable "Auto-Deploy" in service settings

### Manual Updates:
1. Push new image to Docker Hub: `navinvj/nexcart-backend:latest`
2. Go to Render dashboard
3. Click "Manual Deploy" → "Deploy latest commit"

## 📊 Monitoring

### Service Health:
- Monitor service status in Render dashboard
- Set up alerts for downtime
- Check resource usage

### Database Monitoring:
- Monitor database connections
- Check storage usage
- Review query performance

## 💰 Cost Optimization

### Free Tier Limits:
- Web service: 750 hours/month
- Database: 1GB storage, 97 hours/month
- Services sleep after 15 minutes of inactivity

### Paid Plans:
- Consider upgrading for production use
- Better performance and uptime
- No sleep mode

## 🔗 Next Steps

After successful backend deployment:

1. **Deploy Frontend**: Deploy your React frontend to Render
2. **Update Frontend Config**: Point frontend to your backend URL
3. **Custom Domain**: Set up custom domain (optional)
4. **SSL Certificate**: Render provides free SSL
5. **Monitoring**: Set up monitoring and alerts

Your backend will be available at:
**https://nexcart-backend.onrender.com**

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review deployment logs
3. Verify environment variables
4. Test database connectivity
