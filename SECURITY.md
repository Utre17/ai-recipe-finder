# 🔒 Security Considerations

## ⚠️ API Key Exposure Warning

**IMPORTANT**: This application currently exposes OpenRouter and Spoonacular API keys in the client bundle due to the `dangerouslyAllowBrowser: true` setting.

### Current Security Status
- ❌ **API keys are exposed in client bundle**
- ❌ **Rate limits and billing at risk from public access**
- ❌ **Suitable for portfolio/demo purposes ONLY**

## 🛡️ Production Security Recommendations

### 1. Move API Calls to Server-Side

For production deployment, implement one of these solutions:

#### Option A: Serverless Functions (Recommended)
```typescript
// /api/ai/recommendations.ts (Vercel/Netlify)
export default async function handler(req: Request) {
  const { preferences } = await req.json();
  
  // OpenRouter API call with server-side key
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    // ...
  });
  
  return new Response(JSON.stringify(data));
}
```

#### Option B: Express API Server
```typescript
// server/routes/ai.ts
app.post('/api/ai/recommendations', async (req, res) => {
  const { preferences } = req.body;
  
  // OpenRouter API call with server-side key
  const response = await openai.chat.completions.create({
    // API key from server environment
  });
  
  res.json(response);
});
```

### 2. Environment Variable Security

#### Development (.env.local)
```bash
# Client-side (exposed) - for development only
VITE_OPENROUTER_API_KEY=sk-or-v1-...

# Server-side (secure)
OPENROUTER_API_KEY=sk-or-v1-...
SPOONACULAR_API_KEY=...
```

#### Production
- Use platform-specific secret management (Vercel Env Vars, Railway Secrets, etc.)
- Never commit API keys to git
- Use different keys for development/production

### 3. Rate Limiting & Protection

Implement server-side rate limiting:

```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const aiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many AI requests, please try again later.'
});

app.use('/api/ai/', aiLimit);
```

### 4. API Key Validation

```typescript
// Server-side API key validation
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};
```

## 🏗️ Migration Path to Production

### Phase 1: Immediate (Portfolio Safe)
- ✅ Mask API key previews in logs (DONE)
- ✅ Add security warnings (DONE)
- ✅ Document limitations (DONE)

### Phase 2: Server-Side Migration
1. Create API routes for AI functions
2. Move OpenRouter calls to server
3. Update client to call internal APIs
4. Remove `dangerouslyAllowBrowser: true`

### Phase 3: Production Hardening
1. Implement authentication
2. Add rate limiting
3. Set up monitoring
4. Configure CORS properly

## 📝 Current Implementation Notes

The current client-side implementation:
- Uses `dangerouslyAllowBrowser: true` for OpenRouter
- Exposes API keys in the browser bundle
- Is acceptable for portfolio demonstrations
- Shows technical capability with real AI integration

## 🎯 Portfolio Value

Despite the security limitations, this implementation demonstrates:
- ✅ Real API integration skills
- ✅ Error handling and fallbacks
- ✅ TypeScript proficiency
- ✅ Modern React patterns
- ✅ Understanding of security implications

## 🔗 Recommended Reading

- [OpenRouter Security Best Practices](https://openrouter.ai/docs/security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [API Security Checklist](https://github.com/shieldfy/API-Security-Checklist) 