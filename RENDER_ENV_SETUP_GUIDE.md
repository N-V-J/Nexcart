# Render Frontend Environment Variables Setup Guide

## 🚀 Quick Setup (Essential Variables Only)

### Step 1: Copy Essential Variables
```env
VITE_API_URL=https://nexcart-backend.onrender.com/api
VITE_APP_NAME=NexCart
VITE_APP_DESCRIPTION=Modern E-Commerce Platform
NODE_ENV=production
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key_here
VITE_DEFAULT_CURRENCY=INR
VITE_CURRENCY_SYMBOL=₹
VITE_ENABLE_CART=true
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_REVIEWS=true
VITE_SUPPORT_EMAIL=support@nexcart.com
VITE_SUPPORT_PHONE=+91-1234567890
```

### Step 2: Add to Render Dashboard

1. **Go to Render Dashboard**: [render.com](https://render.com)
2. **Select your frontend service**: `nexcart-frontend`
3. **Click "Environment" tab**
4. **Add each variable**:
   - Click "Add Environment Variable"
   - Enter Key (e.g., `VITE_API_URL`)
   - Enter Value (e.g., `https://nexcart-backend.onrender.com/api`)
   - Repeat for all variables
5. **Click "Save Changes"**
6. **Service will automatically redeploy**

## 📋 Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Your backend API URL | ✅ Yes |
| `VITE_APP_NAME` | Application name | ✅ Yes |
| `NODE_ENV` | Environment mode | ✅ Yes |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe payment key | ❌ Optional |
| `VITE_DEFAULT_CURRENCY` | Currency code | ❌ Optional |
| `VITE_CURRENCY_SYMBOL` | Currency symbol | ❌ Optional |

## 🔧 Advanced Configuration

For complete configuration, use the variables from `render-frontend-env.txt` file.

### Categories:
- **API Configuration**: Backend URLs and endpoints
- **Payment**: Stripe integration
- **Branding**: Colors, logos, app info
- **Features**: Enable/disable functionality
- **Analytics**: Google Analytics, Facebook Pixel
- **Social Media**: Social platform links
- **SEO**: Meta tags and descriptions
- **Performance**: Optimization settings
- **Security**: Security headers and policies
- **Localization**: Language and currency
- **UI/UX**: User interface preferences

## 🎯 Deployment Priority

### Phase 1 (Immediate - Essential):
```env
VITE_API_URL=https://nexcart-backend.onrender.com/api
VITE_APP_NAME=NexCart
NODE_ENV=production
```

### Phase 2 (Soon - Important):
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_DEFAULT_CURRENCY=INR
VITE_CURRENCY_SYMBOL=₹
VITE_SUPPORT_EMAIL=support@nexcart.com
```

### Phase 3 (Later - Enhancement):
```env
VITE_GA_TRACKING_ID=G-...
VITE_PRIMARY_COLOR=#1890ff
VITE_FACEBOOK_URL=https://facebook.com/nexcart
```

## 🔄 Update Process

To update environment variables:
1. Go to Render Dashboard
2. Select your service
3. Environment tab
4. Edit existing or add new variables
5. Save changes
6. Service auto-redeploys

## 🧪 Testing

After adding variables, test:
1. **Frontend loads**: Check if app loads correctly
2. **API connection**: Verify backend communication
3. **Features work**: Test cart, wishlist, etc.
4. **Payments**: Test Stripe integration (if configured)

## 🚨 Important Notes

- **Replace placeholder values** with your actual data
- **Keep sensitive data secure** (API keys, tokens)
- **Test in staging** before production deployment
- **Monitor logs** for any configuration errors

## 📞 Troubleshooting

### Common Issues:
1. **App won't load**: Check `VITE_API_URL` is correct
2. **API errors**: Verify backend is running
3. **Payment issues**: Check `VITE_STRIPE_PUBLIC_KEY`
4. **Features missing**: Verify feature flags are `true`

### Debug Steps:
1. Check Render service logs
2. Verify environment variables are set
3. Test API endpoints directly
4. Check browser console for errors
