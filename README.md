# 🤖 AI Recipe Finder & Meal Planner

A modern, AI-powered React application for discovering recipes, planning meals, and optimizing your cooking experience. Built with React, TypeScript, Tailwind CSS, and featuring real AI integration through OpenRouter.

## ✨ Features

### 🔍 Smart Recipe Discovery
- **Recipe Search**: Search by ingredients, recipe name, or dietary requirements
- **Advanced Filtering**: Filter by diet, cuisine, cooking time, meal type, and more
- **Beautiful Recipe Cards**: Responsive cards with images, ratings, and key information
- **Detailed Recipe View**: Complete ingredients list, step-by-step instructions, and nutrition info

### 🤖 AI-Powered Features
- **AI Recipe Recommendations**: Personalized suggestions based on your dietary preferences and cooking skills
- **AI Meal Planning**: Generate complete meal plans with nutritional explanations
- **AI Recipe Modifications**: Adapt any recipe for dietary restrictions (vegan, gluten-free, keto, etc.)
- **AI Shopping Optimization**: Smart shopping lists with store navigation and money-saving tips
- **User Preference Learning**: AI remembers your preferences and improves suggestions over time

### 📅 Meal Planning & Organization
- **Interactive Calendar**: Drag & drop meal planning with weekly/monthly views
- **Smart Shopping Lists**: Auto-generated lists organized by store sections
- **Nutritional Dashboard**: Track your nutrition with beautiful charts and analytics
- **Favorites System**: Save your favorite recipes with localStorage persistence

### 🎨 Modern User Experience
- **Mobile-First Design**: Fully responsive across all devices
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Loading States**: Professional skeletons and loading indicators
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3.4.0 + Custom CSS variables
- **State Management**: TanStack Query for server state + React hooks for local state
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **AI Integration**: OpenRouter API with Meta-Llama/Llama-3.2-3B-Instruct (free model)
- **APIs**: Spoonacular API (primary) + TheMealDB API (fallback)

## 📦 Installation & Setup

### 1. Clone and Install
```bash
cd ai-recipe-finder
npm install
```

### 2. Environment Configuration
```bash
# Copy the example env file
cp env.example .env

# Edit .env and add your API keys (both optional):
VITE_SPOONACULAR_API_KEY=your_spoonacular_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

#### 🔑 API Keys (Both Optional)

**OpenRouter API (for AI features)**:
- Get your free API key from [OpenRouter](https://openrouter.ai/keys)
- Free tier: ~10M tokens/month with Meta-Llama model
- **Features without key**: Falls back to static recipe suggestions

**Spoonacular API (for recipe data)**:
- Get your free API key from [Spoonacular](https://spoonacular.com/food-api)
- Free tier: 150 requests/day
- **Features without key**: Uses TheMealDB API (unlimited & free)

### 3. Start Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🎯 Usage Guide

### Basic Recipe Search
1. **Search Recipes**: Enter ingredients or recipe names in the search bar
2. **Apply Filters**: Click the filter button to refine by diet, cuisine, cooking time, etc.
3. **Browse Results**: View recipe cards with ratings, cooking time, and dietary tags
4. **View Details**: Click any recipe card to see full details, ingredients, and instructions
5. **Save Favorites**: Click the heart icon to save recipes to your favorites

### AI-Powered Features

#### 🤖 AI Recipe Recommendations
1. Navigate to **"AI Recommendations"** tab
2. Configure your preferences (dietary restrictions, cooking skill, time available)
3. Click **"Generate AI Recommendations"** for personalized suggestions
4. View AI-generated recipes with difficulty levels and cooking tips

#### 🍽️ AI Meal Planning
1. Go to **"AI Meal Planner"** tab
2. Select your preferred meal plan duration (3, 7, or 14 days)
3. Click **"Generate AI Meal Plan"** for a complete nutrition-optimized plan
4. Export your meal plan or regenerate for new suggestions

#### ✨ AI Recipe Modifications
1. Open any recipe in detail view
2. Click the **AI Sparkles button** in the header
3. Select dietary modifications (vegetarian, gluten-free, keto, etc.)
4. Get AI-adapted recipes with explanations of changes

#### 🛒 AI Shopping Optimization
1. Create a shopping list from your meal plans
2. Click the **AI Sparkles button** in the shopping list
3. Get optimized shopping routes and money-saving tips

### Traditional Meal Planning
1. **Plan Meals**: Use the interactive calendar to drag & drop recipes
2. **Generate Shopping Lists**: Auto-create organized shopping lists from meal plans
3. **Track Nutrition**: View nutritional analysis with charts and recommendations

## 🔧 Configuration Options

### AI Model Selection
The app uses Meta-Llama/Llama-3.2-3B-Instruct (free) by default. You can modify the model in `src/utils/ai.ts`:

```typescript
// Use different OpenRouter models
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free'; // Free
// const MODEL = 'openai/gpt-3.5-turbo'; // Paid, higher quality
```

### API Fallback Behavior
- **With Spoonacular**: Rich recipe data with nutrition info
- **Without Spoonacular**: Falls back to TheMealDB (free, basic data)
- **With OpenRouter**: Full AI features
- **Without OpenRouter**: Static fallback recommendations

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── AIRecommendations.tsx    # AI recipe suggestions
│   ├── AIMealPlanner.tsx        # AI meal planning
│   ├── RecipeModal.tsx          # Recipe details with AI modifications
│   ├── ShoppingListModal.tsx    # Shopping with AI optimization
│   ├── Header.tsx               # Navigation with favorites
│   ├── SearchBar.tsx           # Search input with filters
│   ├── FilterPanel.tsx         # Advanced filtering
│   ├── RecipeGrid.tsx          # Recipe results grid
│   └── ...                     # Other UI components
├── hooks/               # Custom React hooks
│   ├── useAI.ts        # AI functionality and preferences
│   ├── useMealPlan.ts  # Meal planning state
│   └── useShoppingList.ts # Shopping list management
├── utils/
│   ├── ai.ts           # OpenRouter AI integration
│   ├── api.ts          # Recipe API integration  
│   ├── storage.ts      # localStorage utilities
│   └── cn.ts           # Tailwind className utility
└── types/
    └── recipe.ts       # TypeScript interfaces
```

## 🌟 AI Features Deep Dive

### Personalized Recommendations
- **Learning System**: Tracks your recipe preferences and recent meals
- **Dietary Intelligence**: Understands complex dietary restrictions
- **Skill-Based Suggestions**: Recipes matched to your cooking experience
- **Time-Aware Planning**: Suggests recipes based on available cooking time

### Smart Meal Planning
- **Nutritional Balance**: AI ensures meals meet dietary requirements
- **Variety Optimization**: Prevents repetitive meal suggestions
- **Cooking Workflow**: Plans prep sequences for efficient cooking
- **Seasonal Awareness**: Suggests seasonal ingredients when possible

### Recipe Adaptation
- **Ingredient Substitution**: Smart swaps for dietary restrictions
- **Portion Scaling**: Automatic recipe scaling for different serving sizes
- **Cooking Method Changes**: Adapts cooking techniques (oven to air fryer, etc.)
- **Nutritional Optimization**: Maintains taste while improving health metrics

## 🚀 Performance & Optimization

- **Query Caching**: 5-minute cache for API responses
- **Lazy Loading**: Efficient image and component loading
- **Optimistic Updates**: Instant UI feedback for favorites
- **Error Boundaries**: Graceful error handling throughout the app
- **Mobile Optimization**: Responsive design with touch-friendly interactions

## 🌍 Browser Support

- Chrome 90+
- Firefox 90+ 
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-ai-feature`)
3. Commit your changes (`git commit -m 'Add amazing AI feature'`)
4. Push to the branch (`git push origin feature/amazing-ai-feature`)
5. Open a Pull Request

## 🔮 Future Enhancements

- [ ] Image recognition for ingredient identification
- [ ] Voice-controlled recipe reading
- [ ] Social recipe sharing and reviews
- [ ] Integration with grocery delivery services
- [ ] Cooking video generation
- [ ] Progressive Web App (PWA) features
- [ ] Multi-language support
- [ ] Recipe cost analysis and budgeting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for democratizing AI access
- [Spoonacular API](https://spoonacular.com/food-api) for comprehensive recipe data
- [TheMealDB](https://www.themealdb.com/api.php) for free recipe API
- [Meta](https://ai.meta.com/) for the Llama 3.2 language model
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Built with ❤️ for food lovers and AI enthusiasts alike!**

> *This project demonstrates real AI integration in a practical application, showcasing modern React development patterns, thoughtful UX design, and the power of free AI models for portfolio projects.* #   a i - r e c i p e - f i n d e r  
 