# Netlify Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Firebase Project**: Your Firebase configuration should be ready

## Deployment Steps

### 1. Connect to Netlify

1. Log in to your Netlify dashboard
2. Click "New site from Git"
3. Choose GitHub and authorize Netlify
4. Select your repository

### 2. Build Configuration

Netlify will automatically detect the configuration from `netlify.toml`. The settings are:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 3. Environment Variables

In your Netlify site dashboard, go to **Site settings > Environment variables** and add:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_APP_ID=your_app_id_here  
VITE_FIREBASE_PROJECT_ID=your_project_id_here
```

### 4. Firebase Configuration for Production

In your Firebase console:

1. Go to **Authentication > Settings > Authorized domains**
2. Add your Netlify domain (e.g., `your-site-name.netlify.app`)
3. After deployment, also add any custom domain you configure

### 5. Admin Account Setup

To access the admin panel after deployment:

1. Visit your deployed site
2. Sign up with: `ayatullahiayobami@gmail.com` / `Wahab@1234`
3. The system will automatically recognize this email as an admin account

## Accessing Features

- **Homepage**: Browse products and categories
- **Admin Panel**: `/admin` (requires admin login)
- **Seller Dashboard**: `/seller` (requires seller account)
- **Authentication**: Built-in Firebase Auth with Google sign-in

## File Structure for Deployment

```
├── netlify.toml           # Netlify configuration
├── netlify/functions/     # Serverless functions
│   └── api.ts            # Main API handler
├── dist/                 # Built frontend (auto-generated)
└── .env.example          # Environment variables template
```

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all environment variables are set in Netlify
2. **API Not Working**: Ensure Firebase configuration is correct
3. **Authentication Issues**: Verify authorized domains in Firebase console
4. **Admin Access**: Confirm email `ayatullahiayobami@gmail.com` is used for sign-up

### Support

If you encounter issues:
1. Check Netlify function logs in the dashboard
2. Verify Firebase configuration
3. Ensure all environment variables are properly set

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Firebase authentication works
- [ ] Admin can access `/admin` panel
- [ ] Product catalog displays properly
- [ ] Shopping cart functionality works
- [ ] Firebase domain is authorized