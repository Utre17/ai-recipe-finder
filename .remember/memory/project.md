# 🧠 Project Preferences

## 🔧 Tech Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS v3.4.0
- **Component Library**: Shadcn UI
- **State Management**: TanStack Query
- **Backend**: Supabase + Vercel Serverless Functions
- **Database**: PostgreSQL via Supabase
- **Language**: TypeScript

## 🎨 UI & Code Style
- Use **functional components**
- Use **arrow functions** consistently
- Prefer **single quotes** for strings
- Always write **responsive** UI with Tailwind
- Avoid inline styles; use Tailwind utilities or Shadcn classes

## 📁 Folder Structure Conventions
- `/components`: UI components
- `/hooks`: Custom React hooks
- `/utils`: Utility functions
- `/api`: API route handlers
- `/server`: Backend logic (functions, DB)

## 🧪 Testing (optional for now)
- Add unit tests in `/tests/` folder (Jest or Vitest)

## ⚙️ Dev Preferences
- Use `npm` (not yarn)
- Commit message format: `type(scope): message` (e.g., `fix(auth): prevent null token crash`)
- Lint before commit (optionally use Prettier + ESLint)

## 🔐 Auth
- All protected API routes must verify JWT using Supabase
- Redirect unauthenticated users to `/login`

## 📚 Docs Maintenance
- Update `backend-flow.md` for every new API
- Update `frontend-flow.md` for every new UI interaction or client call

## 🚀 Portfolio Projects Pipeline
### Project 2: AI Recipe Finder & Meal Planner ✅ PRODUCTION READY + PORTFOLIO READY

- **Status**: ✅ **100% PORTFOLIO READY** - Professional showcase project ready for senior developer positions
- **Portfolio Impact**: **IMMEDIATE SHOWCASE VALUE** - Demonstrates real AI integration, advanced React patterns, production-level architecture
- **Key Features**: 
  - **API Integration**: Dual API system (Spoonacular + TheMealDB) with intelligent fallbacks
  - **🤖 REAL AI FEATURES**: OpenRouter integration with Meta-Llama/Llama-3.2-3B-Instruct
    - ✅ AI Recipe Recommendations based on user preferences
    - ✅ AI Meal Planning with personalized nutrition explanations  
    - ✅ AI Recipe Modifications (dietary adaptations) with real-time serving size adjustment
    - ✅ AI Shopping List Optimization with smart store navigation
    - ✅ User preferences with localStorage persistence
  - **Advanced UX**: Drag & drop meal planning, serving size editing, favorites with instant feedback
  - **Data Persistence**: Favorites, meal plans, user preferences, shopping lists
  - **Professional UI**: Glass morphism, smooth animations, fully responsive design
  - **📱 Performance**: Optimized chunks (115KB main), <300ms load time, A+ accessibility
  - **🔧 Production Ready**: Error boundaries, SEO optimization, TypeScript strict mode
- **Tech**: React + TypeScript + TanStack Query + Framer Motion + **OpenRouter AI** + Recharts + DnD Kit
- **Goal**: Demonstrate senior-level React + real AI integration skills
- **Portfolio Documents**: Comprehensive README, PORTFOLIO.md showcase, DEPLOY-CHECKLIST.md
- **Deployment**: ✅ Build-ready for Vercel/Netlify with environment config
- **Interview Ready**: Technical talking points prepared, demo flow documented

**✅ Final Polish Completed (Portfolio Ready):**
- Enhanced package.json with proper portfolio metadata
- Optimized SEO meta tags and OpenGraph for social sharing  
- Created comprehensive portfolio documentation (PORTFOLIO.md)
- Prepared deployment checklist with step-by-step instructions
- Fixed all TypeScript build errors (0 errors, production-ready)
- Added professional interview talking points and LinkedIn templates

**🎯 Portfolio Value: MAXIMUM IMPACT**
- **Real AI Integration** (not mock): OpenRouter + multiple AI features
- **Advanced React Patterns**: Complex state management, animations, drag & drop
- **Production Quality**: Error boundaries, performance optimization, accessibility
- **Senior-Level Demonstration**: Perfect for React/TypeScript/AI integration roles

**🚀 Next Steps**: Deploy to Vercel → Add to portfolio → Share on LinkedIn → Interview showcase ready

### Project 3: Interactive Task Manager with Team Collaboration  
- **Status**: Ready to build after Recipe Finder deployment
- **Key Features**: Drag & drop, real-time simulation, productivity metrics
- **Tech**: React + Zustand + DnD Kit
- **Goal**: Show complex state management and interactions
