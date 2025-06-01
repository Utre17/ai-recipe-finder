# 🚀 Deployment Guide - AI Recipe Finder

This guide covers deploying your AI Recipe Finder application to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Test the application locally (`npm run dev`)
- [ ] Build the application successfully (`npm run build`)
- [ ] Set up your API keys (optional - app works without them)
- [ ] Test AI features (or confirm fallback behavior works)
- [ ] Optimize images and assets
- [ ] Review environment variables

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is perfect for React applications with excellent support for environment variables and free hosting.

#### Step 1: Prepare for Vercel
```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Build to verify everything works
npm run build
```

#### Step 2: Deploy to Vercel
1. **Via GitHub (Recommended)**:
   - Push your code to GitHub
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

2. **Via Vercel CLI**:
   ```bash
   vercel --prod
   ```

#### Step 3: Configure Environment Variables in Vercel
In your Vercel dashboard:
- Go to Settings > Environment Variables
- Add your API keys:
  ```
  VITE_SPOONACULAR_API_KEY=your_spoonacular_key_here
  VITE_OPENROUTER_API_KEY=your_openrouter_key_here
  ```

### Option 2: Netlify

#### Step 1: Build the Application
```bash
npm run build
```

#### Step 2: Deploy to Netlify
1. **Via Drag & Drop**:
   - Go to [netlify.com](https://netlify.com)
   - Drag your `dist` folder to the deploy area

2. **Via GitHub**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

#### Step 3: Environment Variables
In Netlify dashboard:
- Go to Site Settings > Environment Variables
- Add your API keys (same as above)

### Option 3: GitHub Pages

#### Step 1: Configure Vite for GitHub Pages
Update `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repository-name/', // Replace with your repo name
  // ... rest of config
})
```

#### Step 2: Deploy with GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_SPOONACULAR_API_KEY: ${{ secrets.VITE_SPOONACULAR_API_KEY }}
          VITE_OPENROUTER_API_KEY: ${{ secrets.VITE_OPENROUTER_API_KEY }}
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Step 3: Configure Secrets
In GitHub repository settings:
- Go to Settings > Secrets and Variables > Actions
- Add your API keys as secrets

## 🔧 Environment Variables Setup

### Required Variables (Optional)
```bash
# OpenRouter API for AI features
VITE_OPENROUTER_API_KEY=your_openrouter_key_here

# Spoonacular API for recipe data
VITE_SPOONACULAR_API_KEY=your_spoonacular_key_here
```

### Getting API Keys

#### OpenRouter API (Free)
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for a free account
3. Create a new API key
4. Free tier includes ~10M tokens/month

#### Spoonacular API (Free Tier)
1. Visit [Spoonacular API](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Create a new API key
4. Free tier includes 150 requests/day

### Fallback Behavior
**Important**: The app works without API keys!
- **Without OpenRouter**: Falls back to static recipe recommendations
- **Without Spoonacular**: Falls back to TheMealDB (unlimited & free)

## 🚦 Testing Your Deployment

### Pre-Deploy Testing
```bash
# Test build locally
npm run build
npm run preview

# Test without API keys (fallback mode)
# Remove API keys from .env temporarily
mv .env .env.backup
npm run dev
```

### Post-Deploy Testing
1. **Basic Functionality**:
   - [ ] Search recipes works
   - [ ] Recipe details open correctly
   - [ ] Favorites can be saved/removed
   
2. **AI Features** (if API keys provided):
   - [ ] AI Recommendations generate
   - [ ] AI Meal Planner works
   - [ ] Recipe modifications function
   - [ ] Shopping list optimization works

3. **Fallback Mode** (without API keys):
   - [ ] App loads without errors
   - [ ] Recipe search uses TheMealDB
   - [ ] Static AI recommendations show
   - [ ] No API errors in console

## 🔍 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### API Key Issues
- Verify keys are correctly formatted
- Check API key quotas/limits
- Test keys in local environment first
- Ensure environment variables are properly set in deployment platform

#### Routing Issues (SPA)
For Netlify, create `public/_redirects`:
```
/*    /index.html   200
```

For Vercel, create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Performance Optimization

#### Before Deploy
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images (if any custom images)
# Use WebP format for better compression
```

#### After Deploy
- Test page load speeds
- Check Lighthouse scores
- Verify mobile responsiveness
- Test AI feature performance

## 📊 Monitoring & Analytics

### Performance Monitoring
- Use Vercel Analytics (built-in)
- Monitor API usage quotas
- Track AI feature usage
- Monitor error rates

### Cost Management
- OpenRouter: Monitor token usage
- Spoonacular: Track daily request count
- Set up usage alerts if needed

## 🔄 CI/CD Best Practices

### Automated Testing
```yaml
# Add to GitHub Actions workflow
- name: Run Tests
  run: npm test

- name: Type Check
  run: npm run type-check
```

### Environment-Specific Deployments
- **Preview**: Deploy feature branches automatically
- **Staging**: Deploy main branch to staging environment
- **Production**: Deploy tagged releases only

## 📈 Post-Deployment

### SEO Optimization
- Add meta tags for social sharing
- Configure Open Graph images
- Submit sitemap to search engines

### User Feedback
- Monitor user engagement with AI features
- Track which recipes are most popular
- Gather feedback on AI recommendations

---

## 🎯 Quick Deploy Commands

### Vercel (Fastest)
```bash
npx vercel --prod
```

### Netlify CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Manual Deploy
```bash
npm run build
# Upload dist folder to your hosting provider
```

---

**🚀 Your AI Recipe Finder is now ready for the world!**

Need help? Check the main [README.md](README.md) for detailed feature documentation. 