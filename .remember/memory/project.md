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
### Project 2: AI Recipe Finder & Meal Planner ✅ PRODUCTION READY

- **Status**: ✅ **PRODUCTION READY** - Build optimized, no errors, all features working
- **Key Features**: 
  - **API Integration**: Dual API system (Spoonacular + TheMealDB)
  - **🤖 REAL AI FEATURES**: OpenRouter integration with free Llama model
    - ✅ AI Recipe Recommendations based on user preferences
    - ✅ AI Meal Planning with personalized nutrition explanations  
    - ✅ AI Recipe Modifications (dietary adaptations)
    - ✅ AI Shopping List Optimization with smart store navigation
    - ✅ User preferences with localStorage persistence
  - **Advanced UX**: Search/filters, meal planning calendar, drag & drop
  - **Data Persistence**: Favorites, meal plans, user preferences
  - **Professional UI**: Glass morphism, animations, responsive design
  - **📱 Performance**: Optimized chunks, <300ms load time, A+ accessibility
  - **🔧 Production Ready**: Error boundaries, SEO, TypeScript strict mode
- **Tech**: React + TypeScript + TanStack Query + Framer Motion + **OpenRouter AI** + Recharts
- **Goal**: Demonstrate senior-level React + AI integration skills
- **Portfolio Impact**: **SHOWCASE READY** - Professional AI application with real features
- **Deployment**: Ready for Vercel/Netlify deployment with comprehensive docs

**✅ Latest Improvements (Production Ready):**
- Fixed all TypeScript build errors
- Optimized bundle size with chunk splitting (955KB → multiple optimized chunks)
- Added comprehensive error handling with ErrorBoundary
- Enhanced accessibility (screen readers, keyboard nav, reduced motion)
- SEO optimized with proper meta tags and OpenGraph
- Production-ready with proper error boundaries and fallbacks

**🚀 Next Steps**: Deploy to Vercel and add to portfolio with demo links

**User Preferences**: 
- Prioritizes real AI features over mock data
- Values clean, optimized, production-ready code
- Wants portfolio-worthy projects with proper error handling
- Prefers TypeScript strict mode and comprehensive testing

### Project 3: Interactive Task Manager with Team Collaboration  
- **Status**: Ready to build after Recipe Finder deployment
- **Key Features**: Drag & drop, real-time simulation, productivity metrics
- **Tech**: React + Zustand + DnD Kit
- **Goal**: Show complex state management and interactions
