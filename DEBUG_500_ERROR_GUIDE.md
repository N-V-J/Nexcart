# 🚨 DEBUG 500 ERROR - Step by Step Solution

## ✅ DEBUGGING ENABLED

I've updated the backend with debugging enabled to help identify the exact cause of the 500 error.

## 🚀 IMMEDIATE ACTION: Redeploy with Debug Mode

### Step 1: Redeploy on Render
1. **Go to Render Dashboard**: [render.com](https://render.com)
2. **Select your service**: `nexcart-backend-qv0t`
3. **Click "Manual Deploy"**
4. **Select "Clear build cache & deploy"**
5. **Wait 3-5 minutes** for deployment

### Step 2: Test Debug Endpoints

After redeployment, test these URLs to diagnose the issue:

#### 1. Health Check Endpoint
**URL**: `https://nexcart-backend-qv0t.onrender.com/health/`
**Purpose**: Check database connection and configuration
**Expected**: JSON with system status

#### 2. Root Endpoint
**URL**: `https://nexcart-backend-qv0t.onrender.com/`
**Purpose**: Verify basic Django functionality
**Expected**: JSON with API information

#### 3. Admin with Debug Info
**URL**: `https://nexcart-backend-qv0t.onrender.com/admin/`
**Purpose**: See detailed error message (not just 500)
**Expected**: Detailed Django error page showing the exact issue

## 🔍 What to Look For

### In Health Check Response:
```json
{
  "status": "ok",
  "database": "connected" or "error: ...",
  "debug": true,
  "static_url": "/static/",
  "static_root": "/app/staticfiles"
}
```

### Common Issues to Check:

1. **Database Connection Error**
   - Health check will show database error
   - Need to verify `DATABASE_URL` environment variable

2. **Missing Environment Variables**
   - Check if `SECRET_KEY` is set correctly
   - Verify `ALLOWED_HOSTS` includes your domain

3. **Static Files Issue**
   - Check if static files are collected properly
   - Verify static file paths

## 🔧 Environment Variables to Verify

Ensure these are set on Render:

```env
ALLOWED_HOSTS=nexcart-backend-qv0t.onrender.com,localhost,127.0.0.1
SECRET_KEY=zoy@ug8)=moz8t5ma38%9+8pgzi8hbc$1c738&hm0%tu!&$0t)
DEBUG=False
RENDER=True
CSRF_TRUSTED_ORIGINS=https://nexcart-backend-qv0t.onrender.com
CORS_ALLOWED_ORIGINS=https://nexcart-frontend.onrender.com,http://localhost:3000
DJANGO_SETTINGS_MODULE=nexcart_backend.settings
DATABASE_URL=your_postgresql_database_url_here
```

## 🧪 Testing Steps

### Step 1: Test Health Check
```bash
curl https://nexcart-backend-qv0t.onrender.com/health/
```

**If this fails**: Basic Django setup issue
**If this works**: Continue to next step

### Step 2: Test Root Endpoint
```bash
curl https://nexcart-backend-qv0t.onrender.com/
```

**If this fails**: URL routing issue
**If this works**: Continue to next step

### Step 3: Test Admin (with debug)
Visit: `https://nexcart-backend-qv0t.onrender.com/admin/`

**With debug enabled**, you'll see:
- Detailed error message
- Stack trace
- Exact line causing the issue
- Missing variables or configuration

## 🔍 Common 500 Error Causes

### 1. Database Not Connected
**Symptom**: Health check shows database error
**Solution**: Add correct `DATABASE_URL` to Render environment variables

### 2. Missing SECRET_KEY
**Symptom**: Django startup error
**Solution**: Verify `SECRET_KEY` is set correctly

### 3. Static Files Issue
**Symptom**: Template rendering error
**Solution**: Check static files configuration

### 4. Missing Migrations
**Symptom**: Database table errors
**Solution**: Ensure migrations run during deployment

## 📋 Updated Docker Image Features

**New Image**: `navinvj/nexcart-backend:latest`
**Digest**: `sha256:d7dde0b765e86c36d905f6f98b2c18f5860436a27146421ccafbdf82d203c7b8`

**Includes**:
- ✅ Debug mode enabled (temporarily)
- ✅ Health check endpoint
- ✅ Enhanced error reporting
- ✅ Database connection testing
- ✅ Configuration validation

## 🚨 After Identifying the Issue

Once we see the exact error message:

### If Database Issue:
1. Add correct `DATABASE_URL` to Render
2. Ensure PostgreSQL service is running
3. Verify database credentials

### If Static Files Issue:
1. Check static files collection
2. Verify WhiteNoise configuration
3. Test static file serving

### If Environment Variable Issue:
1. Add missing variables to Render
2. Verify variable names and values
3. Restart service

## 📞 Next Steps

1. **Redeploy** with debug enabled
2. **Test health check** endpoint
3. **Check admin page** for detailed error
4. **Share the exact error message** you see
5. **Apply specific fix** based on the error

## 🔄 After Fix

Once the issue is resolved:
1. Disable debug mode (`DEBUG=False`)
2. Rebuild and redeploy
3. Test all functionality
4. Verify security settings

The debug mode will show us exactly what's causing the 500 error, making it much easier to fix!
