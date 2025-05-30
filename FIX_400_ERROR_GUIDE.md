# Fix Bad Request (400) Error - NexCart Backend

## 🚨 Problem
Getting "Bad Request (400)" error when accessing:
`https://nexcart-backend-qv0t.onrender.com/admin/`

## 🔧 Solution

### Step 1: Update Environment Variables on Render

1. **Go to Render Dashboard**: [render.com](https://render.com)
2. **Select your backend service**: `nexcart-backend-qv0t`
3. **Click "Environment" tab**
4. **Add/Update these variables**:

```env
ALLOWED_HOSTS=nexcart-backend-qv0t.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://nexcart-frontend.onrender.com,http://localhost:3000
CSRF_TRUSTED_ORIGINS=https://nexcart-backend-qv0t.onrender.com
DEBUG=False
RENDER=True
SECRET_KEY=your-secure-secret-key-here
DATABASE_URL=your-postgresql-database-url
```

### Step 2: Save and Redeploy

1. **Click "Save Changes"**
2. **Wait 2-3 minutes** for automatic redeployment
3. **Test admin URL**: `https://nexcart-backend-qv0t.onrender.com/admin/`

## 🔍 Root Cause Analysis

The 400 error occurs because:

1. **ALLOWED_HOSTS mismatch**: Django's `ALLOWED_HOSTS` setting doesn't include your Render domain
2. **CSRF protection**: Django's CSRF middleware blocks requests from untrusted origins
3. **Missing environment variables**: Required settings not configured on Render

## 📋 Complete Environment Variables for Backend

Copy these to your Render backend service:

```env
# Required - Domain Configuration
ALLOWED_HOSTS=nexcart-backend-qv0t.onrender.com,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://nexcart-backend-qv0t.onrender.com

# Required - CORS Configuration
CORS_ALLOWED_ORIGINS=https://nexcart-frontend.onrender.com,http://localhost:3000

# Required - Django Configuration
SECRET_KEY=django-insecure-nexcart-production-key-change-this-to-secure-random-string
DEBUG=False
RENDER=True

# Required - Database
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Optional - Django Settings
DJANGO_SETTINGS_MODULE=nexcart_backend.settings
DJANGO_LOG_LEVEL=INFO

# Optional - Stripe (for payments)
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

## 🧪 Testing Steps

After updating environment variables:

### 1. Test Admin Panel
- URL: `https://nexcart-backend-qv0t.onrender.com/admin/`
- Should show Django admin login page
- Login with: `nvj` / `0.123456789`

### 2. Test API Endpoints
- API Root: `https://nexcart-backend-qv0t.onrender.com/api/`
- Products: `https://nexcart-backend-qv0t.onrender.com/api/products/`
- Users: `https://nexcart-backend-qv0t.onrender.com/api/users/`

### 3. Test CORS
- Access from frontend domain
- Check browser console for CORS errors

## 🚨 Common Issues & Solutions

### Issue 1: Still getting 400 error
**Solution**: Check Render service logs
1. Go to Render dashboard
2. Click your service
3. View "Logs" tab
4. Look for specific error messages

### Issue 2: CSRF verification failed
**Solution**: Add CSRF trusted origins
```env
CSRF_TRUSTED_ORIGINS=https://nexcart-backend-qv0t.onrender.com,https://nexcart-frontend.onrender.com
```

### Issue 3: Database connection error
**Solution**: Verify DATABASE_URL
- Check PostgreSQL service is running
- Verify connection string format
- Test database connectivity

### Issue 4: Static files not loading
**Solution**: Check static files configuration
```env
RENDER=True
```

## 🔄 If Problem Persists

### 1. Check Service Logs
```bash
# In Render dashboard, check logs for:
- Django startup errors
- Database connection issues
- Missing environment variables
- CORS/CSRF errors
```

### 2. Verify Environment Variables
- All required variables are set
- No typos in variable names
- Correct domain names
- Proper URL formats

### 3. Test Locally
```bash
# Test with same environment variables locally
docker run -e ALLOWED_HOSTS=nexcart-backend-qv0t.onrender.com \
  -e DEBUG=False \
  -p 8000:8000 \
  navinvj/nexcart-backend:latest
```

### 4. Manual Deployment
If auto-deploy fails:
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

## 📞 Support

If you still encounter issues:

1. **Check Render Status**: [status.render.com](https://status.render.com)
2. **Review Django Documentation**: [docs.djangoproject.com](https://docs.djangoproject.com)
3. **Check Service Logs**: Look for specific error messages
4. **Test API Endpoints**: Verify which endpoints work/fail

## ✅ Success Indicators

You'll know it's fixed when:
- ✅ Admin panel loads without 400 error
- ✅ Can login to Django admin
- ✅ API endpoints return data (not 400)
- ✅ No CORS errors in browser console
- ✅ Frontend can communicate with backend

## 🔗 Updated URLs

After fixing, your application URLs will be:
- **Backend**: `https://nexcart-backend-qv0t.onrender.com`
- **Admin**: `https://nexcart-backend-qv0t.onrender.com/admin/`
- **API**: `https://nexcart-backend-qv0t.onrender.com/api/`
- **Frontend**: Update `VITE_API_URL` to point to your backend
