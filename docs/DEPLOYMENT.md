# Deployment Guide

## Overview

This guide covers deploying the Text-to-Speech converter to production environments. The application consists of a React frontend and Supabase Edge Functions backend.

## Prerequisites

- Completed [Setup Guide](./SETUP.md)
- Production AWS account with Polly access
- Domain name (optional but recommended)
- SSL certificate (handled automatically by most platforms)

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent React support with automatic deployments.

#### 1. Prepare for Deployment

```bash
# Build the application
npm run build

# Test the build locally
npm run preview
```

#### 2. Deploy to Vercel

**Method A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? text-to-speech-converter
# - Directory? ./
# - Override settings? No
```

**Method B: GitHub Integration**

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy

#### 3. Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Option 2: Netlify

Netlify offers great static site hosting with form handling.

#### 1. Build and Deploy

**Method A: Drag and Drop**

```bash
# Build the application
npm run build

# The dist/ folder contains your built application
# Drag and drop this folder to Netlify
```

**Method B: Git Integration**

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables in Site Settings
7. Deploy

#### 2. Configure Environment Variables

1. Go to Site Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 3: AWS S3 + CloudFront

For AWS-native deployment with global CDN.

#### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-tts-app-bucket

# Enable static website hosting
aws s3 website s3://your-tts-app-bucket \
  --index-document index.html \
  --error-document index.html
```

#### 2. Build and Upload

```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-tts-app-bucket --delete

# Set public read permissions
aws s3api put-bucket-policy \
  --bucket your-tts-app-bucket \
  --policy file://bucket-policy.json
```

**bucket-policy.json:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-tts-app-bucket/*"
    }
  ]
}
```

#### 3. Configure CloudFront

1. Create CloudFront distribution
2. Set origin to your S3 bucket
3. Configure custom error pages for SPA routing
4. Enable compression
5. Set up SSL certificate

## Backend Deployment (Supabase Edge Functions)

### 1. Automatic Deployment

Edge Functions are automatically deployed when you connect your project to Supabase.

### 2. Manual Deployment (if needed)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy text-to-speech
```

### 3. Environment Variables

Set these in your Supabase project dashboard:

1. Go to Project Settings → Edge Functions
2. Add environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

## Production Configuration

### 1. Environment Variables

Create production environment files:

**.env.production:**

```env
VITE_TTS_API_URL=https://your-api-gateway-id.execute-api.region.amazonaws.com
```

### 2. Build Optimization

**vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  // Enable compression
  server: {
    compress: true
  }
});
```

### 3. Performance Optimization

**Add to index.html:**

```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- DNS prefetch for external resources -->
<link rel="dns-prefetch" href="//your-project.supabase.co">

<!-- Security headers -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

## Monitoring and Analytics

### 1. Error Tracking

**Install Sentry:**

```bash
npm install @sentry/react @sentry/tracing
```

**Configure Sentry:**

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 2. Analytics

**Google Analytics 4:**

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Performance Monitoring

**Web Vitals:**

```typescript
// src/utils/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Security Considerations

### 1. Environment Variables

- Never commit sensitive data to version control
- Use different keys for development and production
- Regularly rotate API keys
- Monitor usage for unusual activity

### 2. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://your-project.supabase.co;">
```

### 3. HTTPS Enforcement

Ensure all platforms enforce HTTPS:

- **Vercel:** Automatic HTTPS
- **Netlify:** Automatic HTTPS
- **CloudFront:** Configure SSL certificate

## Backup and Recovery

### 1. Code Backup

- Use Git with remote repositories
- Tag releases for easy rollback
- Maintain staging environment

### 2. Configuration Backup

```bash
# Export environment variables
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env.backup
echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env.backup

# Store securely (not in version control)
```

### 3. Database Backup

Supabase automatically backs up your data, but you can also:

```sql
-- Export configuration if using database storage
SELECT * FROM app_config;
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   - Verify variables are set in deployment platform
   - Check variable names match exactly
   - Ensure no trailing spaces

3. **CORS Errors**
   - Verify Supabase URL is correct
   - Check Edge Function CORS configuration
   - Ensure anon key has proper permissions

4. **404 Errors on Refresh**
   - Configure SPA routing redirects
   - Set up catch-all route to index.html

### Performance Issues

1. **Slow Loading**
   - Enable compression
   - Optimize images
   - Use CDN for static assets

2. **Large Bundle Size**
   - Analyze bundle with `npm run build -- --analyze`
   - Implement code splitting
   - Remove unused dependencies

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Update major versions carefully
npm outdated
```

### 2. Monitoring

- Set up uptime monitoring
- Monitor AWS costs
- Track error rates
- Monitor performance metrics

### 3. Scaling Considerations

- Monitor Supabase usage limits
- Consider AWS Polly rate limits
- Plan for traffic spikes
- Implement caching strategies

This deployment guide ensures your Text-to-Speech converter runs reliably in production with proper monitoring, security, and performance optimization.