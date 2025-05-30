# 🎯 User Registration Setup Complete!

## ✅ WHAT I'VE FIXED

I've updated your frontend to properly connect to your deployed backend for user registration.

### 1. Fixed API URLs
- **Registration**: Now uses environment variable `VITE_API_URL`
- **Login**: Also updated to use environment variable
- **Fallback**: Defaults to localhost for development

### 2. Updated Docker Images
- **Frontend**: `navinvj/nexcart-frontend:latest` with API fixes
- **Backend**: Already configured with user registration endpoint

## 🚀 DEPLOYMENT STEPS

### Step 1: Update Frontend Environment Variables

1. **Go to Render Dashboard**: [render.com](https://render.com)
2. **Select your frontend service**: `nexcart-frontend`
3. **Click "Environment" tab**
4. **Add this variable**:

```env
Key: VITE_API_URL
Value: https://nexcart-backend-qv0t.onrender.com/api
```

### Step 2: Redeploy Frontend

1. **Click "Manual Deploy"**
2. **Select "Clear build cache & deploy"**
3. **Wait 3-5 minutes** for deployment

### Step 3: Test User Registration

After frontend redeployment, test:

**Registration URL**: `https://nexcart-frontend.onrender.com/register`

## 🧪 Testing User Registration

### 1. Fill Registration Form
- **First Name**: Test
- **Last Name**: User
- **Email**: test@example.com
- **Username**: testuser123
- **Phone**: +1234567890
- **Password**: testpassword123
- **Confirm Password**: testpassword123
- **Agree to Terms**: ✓

### 2. Expected Flow
1. **Submit Form** → Shows loading spinner
2. **Success Message** → "Registration successful! Please log in."
3. **Redirect** → Automatically goes to login page
4. **Login** → Use the same username/password to login

### 3. Backend Verification
Check if user was created in Django admin:
- **URL**: `https://nexcart-backend-qv0t.onrender.com/admin/`
- **Login**: `nvj` / `0.123456789`
- **Go to**: Users section
- **Check**: New user should appear in the list

## 🔍 API Endpoints Used

### Registration Endpoint
- **URL**: `https://nexcart-backend-qv0t.onrender.com/api/users/`
- **Method**: POST
- **Data**: User registration information

### Login Endpoint
- **URL**: `https://nexcart-backend-qv0t.onrender.com/api/token/`
- **Method**: POST
- **Data**: Username and password

## 📋 Registration Form Fields

The form collects:
- ✅ **First Name** (required)
- ✅ **Last Name** (required)
- ✅ **Email** (required, validated)
- ✅ **Username** (required, min 3 chars)
- ✅ **Phone Number** (required)
- ✅ **Password** (required, min 8 chars)
- ✅ **Confirm Password** (must match)
- ✅ **Terms Agreement** (required)

## 🔧 Backend User Model

Your backend supports these user fields:
- `username` (unique)
- `email` (unique)
- `first_name`
- `last_name`
- `phone_number`
- `password` (hashed)
- `avatar` (optional)
- `is_active` (default: true)
- `date_joined`

## 🚨 Troubleshooting

### If Registration Fails:

#### 1. Check Frontend Environment
- Verify `VITE_API_URL` is set correctly
- Ensure frontend is redeployed after adding environment variable

#### 2. Check Backend API
Test registration endpoint directly:
```bash
curl -X POST https://nexcart-backend-qv0t.onrender.com/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "confirm_password": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "phone_number": "1234567890"
  }'
```

#### 3. Check CORS Settings
Ensure backend CORS allows frontend domain:
```env
CORS_ALLOWED_ORIGINS=https://nexcart-frontend.onrender.com
```

#### 4. Check Browser Console
- Open browser dev tools
- Look for network errors
- Check API response messages

## ✅ Success Indicators

Registration is working when:
- ✅ Form submits without errors
- ✅ Success message appears
- ✅ Redirects to login page
- ✅ Can login with new credentials
- ✅ User appears in Django admin
- ✅ No CORS errors in browser console

## 🔄 Updated Images

### Frontend Image
- **Image**: `navinvj/nexcart-frontend:latest`
- **Digest**: `sha256:600321bcec7d04890ce1e92b4e8142eebdc0fe3c05f22c36b0bfce2dec4d07b8`
- **Features**: Environment variable API URLs

### Backend Image
- **Image**: `navinvj/nexcart-backend:latest`
- **Features**: User registration endpoint, automatic migrations

## 📞 Next Steps

1. **Add frontend environment variable** (`VITE_API_URL`)
2. **Redeploy frontend** service
3. **Test user registration** at `/register`
4. **Verify in Django admin** that users are created
5. **Test login** with new user credentials

Your user registration system should work perfectly once you add the environment variable and redeploy the frontend!
