---
description: Deploy Apna Thela to Vercel
---

# Deploy Apna Thela to Vercel

This workflow guides you through deploying the Apna Thela application to Vercel.

## Prerequisites

1. Neon PostgreSQL database created
2. DATABASE_URL connection string ready
3. Vercel account created

## Steps

### 1. Setup Database

```bash
# Visit https://neon.tech and create a new project
# Copy the DATABASE_URL connection string
```

### 2. Install Vercel CLI

// turbo
```bash
npm install -g vercel
```

### 3. Login to Vercel

```bash
vercel login
```

### 4. Navigate to Project Directory

// turbo
```bash
cd BhashaBazaar
```

### 5. Install Dependencies

// turbo
```bash
npm install
```

### 6. Test Local Build

```bash
npm run build
```

### 7. Deploy to Vercel (Preview)

```bash
vercel
```

### 8. Add Environment Variables

```bash
vercel env add DATABASE_URL
# Paste your Neon DATABASE_URL when prompted

vercel env add NODE_ENV
# Enter: production
```

### 9. Deploy to Production

```bash
vercel --prod
```

### 10. Verify Deployment

```bash
# Visit the URL provided by Vercel
# Test the following:
# - Homepage loads
# - Voice input works
# - Language switching works
# - Inventory management works
# - PWA install prompt appears on mobile
```

## Troubleshooting

### Build Fails
- Run `npm run check` to find TypeScript errors
- Fix errors and redeploy

### Database Connection Issues
- Verify DATABASE_URL is correct in Vercel dashboard
- Check Neon database is active
- Ensure connection pooling is enabled

### API Routes 404
- Check vercel.json routing configuration
- Verify dist/index.js was built correctly

## Alternative: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Set Root Directory to `BhashaBazaar`
4. Add environment variables in Vercel dashboard
5. Deploy

## Success Criteria

✅ Application accessible via Vercel URL
✅ Database connected and working
✅ Voice features functional
✅ PWA installable on mobile
✅ All 6 languages working
