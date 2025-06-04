import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, ShoppingCart, Sparkles, Plus } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { RecipeGrid } from '@/components/RecipeGrid';
import { RecipeModal } from '@/components/RecipeModal';
import { BackgroundBlobs } from '@/components/BackgroundBlobs';
import { Header } from '@/components/Header';
import { MealPlanningCalendar } from '@/components/MealPlanningCalendar';
import { ShoppingListModal } from '@/components/ShoppingListModal';
import { NutritionDashboard } from '@/components/NutritionDashboard';
import { AIRecommendations } from '@/components/AIRecommendations';
import { AIMealPlanner } from '@/components/AIMealPlanner';
import { SearchFilters, Recipe, MealPlan, MealType } from '@/types/recipe';
import { useMealPlan } from '@/hooks/useMealPlan';
import { AIRecipeRecommendation } from '@/utils/ai';
import { searchRecipes } from '@/utils/api';

type ViewMode = 'search' | 'planning' | 'ai-recommendations' | 'ai-meal-planner';

const App: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  const mealPlanHook = useMealPlan();
  const { mealPlans, addRecipeToMealPlan, updateMealPlanById, removeMealPlanById, moveMealPlan, refreshMealPlans } = mealPlanHook;

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  const handleAddRecipeToMealPlan = (recipe: Recipe, date: string, mealType: MealType) => {
    // This will be handled by the MealPlanningCalendar component
    console.log('Added recipe to meal plan:', { recipe: recipe.title, date, mealType });
  };

  const handleGenerateShoppingList = (_mealPlans: MealPlan[]) => {
    setShowShoppingModal(true);
  };

  const handleViewNutrition = (_mealPlans: MealPlan[]) => {
    setShowNutritionModal(true);
  };

  const handleRecipeResults = (recipes: Recipe[]) => {
    setSearchResults(recipes);
  };

  const handleMealPlannerSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const searchFilters = { query };
      const apiResponse = await searchRecipes(searchFilters);
      
      // Merge new recipes with existing ones, avoiding duplicates
      const newRecipes = apiResponse.results;
      const combinedRecipes = [...searchResults];
      
      newRecipes.forEach((newRecipe: Recipe) => {
        if (!combinedRecipes.find(existing => existing.id === newRecipe.id)) {
          combinedRecipes.push(newRecipe);
        }
      });
      
      setSearchResults(combinedRecipes);
      console.log(`🔍 Added ${newRecipes.length} new recipes from search: "${query}"`);
    } catch (error) {
      console.error('Error searching for recipes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAIRecipeSelect = (recommendation: AIRecipeRecommendation) => {
    // Convert AI recommendation to Recipe format for modal display
    const mockRecipe: Recipe = {
      id: Date.now(), // Generate a unique ID
      title: recommendation.title,
      image: 'https://via.placeholder.com/312x231/8B5CF6/FFFFFF?text=AI+Recipe',
      imageType: 'jpg',
      readyInMinutes: recommendation.cookingTime,
      servings: 4,
      spoonacularScore: 85,
      healthScore: 75,
      pricePerServing: 250,
      cuisines: [recommendation.cuisine],
      dishTypes: [],
      diets: recommendation.dietaryTags,
      occasions: [],
      analyzedInstructions: [{
        name: '',
        steps: recommendation.instructions.map((instruction, index) => ({
          number: index + 1,
          step: instruction,
          ingredients: [],
          equipment: [],
        }))
      }],
      extendedIngredients: recommendation.ingredients.map((ingredient, index) => ({
        id: index + 1,
        aisle: '',
        image: '',
        consistency: '',
        name: ingredient,
        nameClean: ingredient,
        original: ingredient,
        originalName: ingredient,
        amount: 1,
        unit: '',
        meta: [],
        measures: {
          us: { amount: 1, unitShort: '', unitLong: '' },
          metric: { amount: 1, unitShort: '', unitLong: '' },
        },
      })),
      summary: recommendation.description,
      instructions: recommendation.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n'),
    };
    setSelectedRecipe(mockRecipe);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <BackgroundBlobs />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl font-bold gradient-text mb-2 sm:mb-4">
              AI Recipe Finder & Meal Planner
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover delicious recipes, plan your meals, and track your nutrition all in one place
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex-wrap">
              <button
                onClick={() => setViewMode('search')}
                className={`w-full sm:w-auto flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'search'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                🔍 Search Recipes
              </button>
              <button
                onClick={() => setViewMode('ai-recommendations')}
                className={`w-full sm:w-auto flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'ai-recommendations'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Recommendations
              </button>
              <button
                onClick={() => setViewMode('ai-meal-planner')}
                className={`w-full sm:w-auto flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'ai-meal-planner'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                AI Meal Planner
              </button>
              <button
                onClick={() => setViewMode('planning')}
                className={`w-full sm:w-auto flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'planning'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Meal Planning
              </button>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {viewMode === 'search' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-4xl mx-auto mb-8"
                >
                  <SearchBar 
                    onSearch={handleSearch}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    showFilters={showFilters}
                  />
                  
                  <FilterPanel 
                    isOpen={showFilters}
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <RecipeGrid 
                    filters={filters}
                    onRecipeSelect={handleRecipeSelect}
                    onRecipeResults={handleRecipeResults}
                  />
                </motion.div>
              </>
            )}

            {viewMode === 'planning' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MealPlanningCalendar
                  recipes={searchResults}
                  onAddRecipe={handleAddRecipeToMealPlan}
                  onGenerateShoppingList={handleGenerateShoppingList}
                  onViewNutrition={handleViewNutrition}
                  onNavigateToSearch={() => setViewMode('search')}
                  onSearchRecipes={handleMealPlannerSearch}
                  onRecipeSelect={handleRecipeSelect}
                  isSearching={isSearching}
                  mealPlans={mealPlans}
                  addRecipeToMealPlan={addRecipeToMealPlan}
                  updateMealPlanById={updateMealPlanById}
                  removeMealPlanById={removeMealPlanById}
                  moveMealPlan={moveMealPlan}
                  refreshMealPlans={refreshMealPlans}
                />
              </motion.div>
            )}

            {viewMode === 'ai-recommendations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AIRecommendations onRecipeSelect={handleAIRecipeSelect} />
              </motion.div>
            )}

            {viewMode === 'ai-meal-planner' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AIMealPlanner />
              </motion.div>
            )}
          </motion.div>

          {/* Quick Action Buttons */}
          <div>
            {/* Desktop (sm and up) */}
            <div className="hidden sm:flex fixed bottom-8 right-8 flex-col gap-3 z-40">
              {viewMode === 'search' && searchResults.length > 0 && (
                <>
                  <button
                    onClick={() => setViewMode('planning')}
                    className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    title="Go to Meal Planning"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="hidden sm:inline">Plan Meals</span>
                  </button>
                  {mealPlans.length > 0 && (
                    <>
                      <button
                        onClick={() => handleGenerateShoppingList(mealPlans)}
                        className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        title="Generate Shopping List"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="hidden sm:inline">Shopping</span>
                      </button>
                      <button
                        onClick={() => handleViewNutrition(mealPlans)}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        title="View Nutrition Dashboard"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="hidden sm:inline">Nutrition</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            {/* Mobile (below sm): single FAB */}
            <div className="sm:hidden fixed bottom-6 right-6 z-50">
              {viewMode === 'search' && searchResults.length > 0 && (
                <>
                  <button
                    onClick={() => setShowFabMenu((v) => !v)}
                    className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-3xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    aria-label="Open quick actions"
                  >
                    <Plus className={`w-8 h-8 transition-transform ${showFabMenu ? 'rotate-45' : ''}`} />
                  </button>
                  {/* Expanded menu */}
                  {showFabMenu && (
                    <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 animate-fade-in z-50">
                      <button
                        onClick={() => { setViewMode('planning'); setShowFabMenu(false); }}
                        className="w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-xl"
                        title="Go to Meal Planning"
                      >
                        <Calendar className="w-6 h-6" />
                      </button>
                      {mealPlans.length > 0 && (
                        <>
                          <button
                            onClick={() => { handleGenerateShoppingList(mealPlans); setShowFabMenu(false); }}
                            className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center text-xl"
                            title="Generate Shopping List"
                          >
                            <ShoppingCart className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => { handleViewNutrition(mealPlans); setShowFabMenu(false); }}
                            className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-xl"
                            title="View Nutrition Dashboard"
                          >
                            <BarChart3 className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Modals */}
        {selectedRecipe && (
          <RecipeModal 
            recipe={selectedRecipe}
            onClose={handleCloseModal}
          />
        )}

        {console.log('[App] mealPlans passed to modals:', mealPlans)}
        <ShoppingListModal
          isOpen={showShoppingModal}
          onClose={() => setShowShoppingModal(false)}
          mealPlans={mealPlans}
        />

        <NutritionDashboard
          isOpen={showNutritionModal}
          onClose={() => setShowNutritionModal(false)}
          mealPlans={mealPlans}
        />
      </div>
    </div>
  );
};

export default App; 