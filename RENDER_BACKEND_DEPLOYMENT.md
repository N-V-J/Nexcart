# NexCart Backend Deployment on Render

This guide will help you deploy the NexCart Django backend to Render.com.

## 🚀 Quick Deployment Steps

### Step 1: Create PostgreSQL Database on Render

1. **Sign up/Login to Render**: Go to [render.com](https://render.com)
2. **Create PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - **Name**: `nexcart-db`
   - **Database**: `nexcart_db`
   - **User**: `nexcart_user` (avoid "postgres")
   - **Region**: Choose closest to your users
   - **Plan**: Free tier or paid plan
3. **Copy Database URL**: After creation, copy the "External Database URL"

### Step 2: Deploy Backend Web Service

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - **Connect Repository**: Connect your GitHub repository `https://github.com/N-V-J/Nexcart.git`
   - **Name**: `nexcart-backend`
   - **Environment**: `Python 3`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: Leave empty (we'll use build commands to navigate)

2. **Configure Build & Start Commands**:
   - **Build Command**: 
     ```bash
     cd nexcart_backend && pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command**:
     ```bash
     cd nexcart_backend && python manage.py migrate && gunicorn --bind 0.0.0.0:$PORT --workers 3 nexcart_backend.wsgi:application
     ```

3. **Set Environment Variables**:
   - `DATABASE_URL`: Paste your PostgreSQL database URL
   - `SECRET_KEY`: Generate a secure secret key
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `nexcart-backend.onrender.com`
   - `CORS_ALLOWED_ORIGINS`: `https://nexcart-frontend.onrender.com`
   - `RENDER`: `True`
   - `DJANGO_SETTINGS_MODULE`: `nexcart_backend.settings`

### Step 3: Deploy and Test

1. **Deploy**: Click "Create Web Service"
2. **Monitor Logs**: Watch the deployment logs for any errors
3. **Test API**: Once deployed, test your API endpoints

## 🔧 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://nexcart_user:password@host:port/nexcart_db` | Your Render PostgreSQL URL |
| `SECRET_KEY` | `your-secure-secret-key` | Django secret key (generate new one) |
| `DEBUG` | `False` | Production debug setting |
| `ALLOWED_HOSTS` | `nexcart-backend.onrender.com` | Your Render app domain |
| `CORS_ALLOWED_ORIGINS` | `https://nexcart-frontend.onrender.com` | Frontend domain for CORS |
| `RENDER` | `True` | Enables Render-specific settings |
| `DJANGO_SETTINGS_MODULE` | `nexcart_backend.settings` | Django settings module |

## 🧪 Testing Your Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://nexcart-backend.onrender.com/api/`
2. **Admin Panel**: `https://nexcart-backend.onrender.com/admin/`
3. **API Endpoints**: 
   - Products: `https://nexcart-backend.onrender.com/api/products/`
   - Users: `https://nexcart-backend.onrender.com/api/users/`

## 🔐 Admin Access

The superuser is created automatically:
- **Username**: `nvj`
- **Password**: `0.123456789`
- **Admin URL**: `https://nexcart-backend.onrender.com/admin/`

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `requirements.txt`
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **Static Files**: Ensure `collectstatic` runs in build command
4. **CORS Errors**: Check `CORS_ALLOWED_ORIGINS` includes your frontend domain

### Checking Logs:
- Go to your Render dashboard
- Click on your web service
- View "Logs" tab for detailed error messages

## 📝 Next Steps

After backend deployment:
1. Deploy your React frontend
2. Update frontend API URL to point to your backend
3. Test the complete application
4. Set up custom domain (optional)

## 🔄 Updates and Redeployment

To update your backend:
1. Push changes to your GitHub repository
2. Render will automatically redeploy
3. Monitor logs for successful deployment

Your backend will be available at: `https://nexcart-backend.onrender.com`
