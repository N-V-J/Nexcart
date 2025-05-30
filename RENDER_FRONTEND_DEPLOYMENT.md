# Deploy NexCart Frontend Docker Image on Render

This guide shows how to deploy the pre-built Docker image `navinvj/nexcart-frontend:latest` on Render.

## 🚀 Quick Deployment Steps

### Prerequisites
- Backend already deployed at `https://nexcart-backend.onrender.com`
- Docker image `navinvj/nexcart-frontend:latest` available on Docker Hub

### Step 1: Deploy Frontend Web Service

1. **Login to Render**: Go to [render.com](https://render.com)
2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Select "Deploy an existing image from a registry"
   - **Image URL**: `navinvj/nexcart-frontend:latest`
   - **Name**: `nexcart-frontend`
   - **Region**: Same as your backend

3. **Configure Service**:
   - **Instance Type**: Free tier or paid
   - **Auto-Deploy**: Yes (recommended)

### Step 2: Configure Environment Variables

The frontend Docker image is pre-built with production settings, but you can override the API URL if needed:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | `https://nexcart-backend.onrender.com/api` | ❌ Optional* |
| `VITE_STRIPE_PUBLIC_KEY` | Your Stripe public key | ❌ Optional |
| `VITE_APP_NAME` | `NexCart` | ❌ Optional |

*Note: The frontend image is built with the API URL, but you can override it if your backend URL is different.

### Step 3: Deploy and Test

1. **Deploy**: Click "Create Web Service"
2. **Monitor**: Watch the deployment logs
3. **Test**: Once deployed, test your application

## 🔧 Frontend Configuration Details

### Docker Image Specifications:
- **Base Image**: Nginx Alpine (multi-stage build)
- **Size**: ~25MB
- **Port**: 80
- **Features**: 
  - Gzip compression
  - Security headers
  - SPA routing support
  - Static asset caching

### Built-in Features:
- ✅ React + Vite optimized build
- ✅ Ant Design UI components
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Responsive design
- ✅ Production optimizations

## 🧪 Testing Your Deployment

After deployment, test these features:

### Core Functionality:
1. **Homepage**: `https://nexcart-frontend.onrender.com/`
2. **Product Listing**: Browse products
3. **User Authentication**: Login/Register
4. **Shopping Cart**: Add/remove items
5. **Checkout Process**: Place orders
6. **Admin Panel**: `https://nexcart-frontend.onrender.com/admin`

### API Integration:
- Verify frontend connects to backend
- Test user registration/login
- Check product data loading
- Confirm order placement works

## 🔗 Backend Integration

### API Endpoints Used:
- **Authentication**: `/api/auth/`
- **Products**: `/api/products/`
- **Categories**: `/api/categories/`
- **Orders**: `/api/orders/`
- **Users**: `/api/users/`
- **Cart**: `/api/cart/`

### CORS Configuration:
Ensure your backend CORS settings include:
```bash
CORS_ALLOWED_ORIGINS=https://nexcart-frontend.onrender.com
```

## 🐛 Troubleshooting

### Common Issues:

1. **Frontend Loads but API Calls Fail**:
   - Check backend CORS settings
   - Verify backend URL is correct
   - Ensure backend is running

2. **404 Errors on Page Refresh**:
   - This is handled by nginx configuration
   - All routes redirect to index.html for SPA

3. **Static Assets Not Loading**:
   - Check browser console for errors
   - Verify image paths are correct

4. **Slow Loading**:
   - Frontend uses gzip compression
   - Static assets are cached for 1 year

### Checking Logs:
1. Go to Render dashboard
2. Click on your frontend service
3. View "Logs" tab for nginx access logs

### Testing Locally:
```bash
# Test the Docker image locally
docker run -p 3000:80 navinvj/nexcart-frontend:latest

# Access at http://localhost:3000
```

## 🔄 Updates and Redeployment

### Automatic Updates:
- Render will automatically redeploy when you push new images to Docker Hub
- Enable "Auto-Deploy" in service settings

### Manual Updates:
1. Push new image to Docker Hub: `docker push navinvj/nexcart-frontend:latest`
2. Go to Render dashboard
3. Click "Manual Deploy" → "Deploy latest commit"

### Building New Images:
If you need to rebuild the frontend image:
```bash
cd nexcart-frontend-new
docker build -t navinvj/nexcart-frontend:latest .
docker push navinvj/nexcart-frontend:latest
```

## 📊 Performance Optimization

### Built-in Optimizations:
- **Vite Build**: Optimized production build
- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Unused code removal
- **Minification**: CSS and JS minification
- **Gzip Compression**: Nginx gzip enabled
- **Caching**: Static assets cached for 1 year

### Monitoring:
- Monitor response times in Render dashboard
- Check Core Web Vitals in browser dev tools
- Use Lighthouse for performance audits

## 🔒 Security Features

### Built-in Security:
- **Security Headers**: XSS protection, content type sniffing prevention
- **HTTPS**: Render provides free SSL certificates
- **CSP**: Content Security Policy headers
- **Frame Options**: Clickjacking protection

### Best Practices:
- Keep dependencies updated
- Use environment variables for sensitive data
- Enable HTTPS redirects in Render

## 💰 Cost Optimization

### Free Tier:
- 750 hours/month for web services
- Services sleep after 15 minutes of inactivity
- Good for development and testing

### Paid Plans:
- No sleep mode
- Better performance
- Custom domains
- More bandwidth

## 🌐 Custom Domain Setup

1. **Add Custom Domain** in Render dashboard
2. **Configure DNS** with your domain provider
3. **SSL Certificate** automatically provisioned
4. **Update CORS** in backend to include custom domain

## 📱 Mobile Responsiveness

The frontend is built with responsive design:
- ✅ Mobile-first approach
- ✅ Ant Design responsive components
- ✅ Touch-friendly interface
- ✅ Optimized for all screen sizes

## 🔗 Complete Application URLs

After both services are deployed:

- **Frontend**: `https://nexcart-frontend.onrender.com`
- **Backend**: `https://nexcart-backend.onrender.com`
- **Admin Panel**: `https://nexcart-frontend.onrender.com/admin`
- **API Documentation**: `https://nexcart-backend.onrender.com/api/`

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify backend is running
3. Test API endpoints directly
4. Check browser console for errors
5. Review CORS configuration
