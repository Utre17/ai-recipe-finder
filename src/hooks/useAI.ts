import { useState, useEffect, useCallback } from 'react';
import { 
  UserPreferences, 
  AIRecipeRecommendation,
  getAIRecipeRecommendations,
  getAIMealPlanSuggestion,
  modifyRecipeWithAI,
  getAIShoppingListOptimization
} from '@/utils/ai';
import { Recipe } from '@/types/recipe';

const PREFERENCES_KEY = 'ai-recipe-finder-preferences';

const defaultPreferences: UserPreferences = {
  favoriteIngredients: [],
  dietaryRestrictions: [],
  dislikedIngredients: [],
  preferredCuisines: [],
  cookingSkillLevel: 'beginner',
  timeAvailable: 30,
  recentMeals: [],
};

export const useAI = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecipeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);

  // Get AI recipe recommendations
  const getRecommendations = useCallback(async (count: number = 3) => {
    setIsLoading(true);
    try {
      const recommendations = await getAIRecipeRecommendations(preferences, count);
      setAiRecommendations(recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [preferences]);

  // Get AI meal plan
  const getMealPlan = useCallback(async (days: number = 7) => {
    setIsLoading(true);
    try {
      return await getAIMealPlanSuggestion(preferences, days);
    } catch (error) {
      console.error('Error getting AI meal plan:', error);
      return {
        mealPlan: 'Unable to generate meal plan at this time.',
        explanation: 'Please try again later.'
      };
    } finally {
      setIsLoading(false);
    }
  }, [preferences]);

  // Modify recipe with AI
  const modifyRecipe = useCallback(async (recipe: Recipe, modifications: string[]) => {
    setIsLoading(true);
    try {
      return await modifyRecipeWithAI(recipe, modifications);
    } catch (error) {
      console.error('Error modifying recipe:', error);
      return {
        modifiedRecipe: 'Unable to modify recipe at this time.',
        changes: 'Please try again later.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimize shopping list with AI
  const optimizeShoppingList = useCallback(async (
    ingredients: string[], 
    shoppingPreferences: { budget?: 'low' | 'medium' | 'high'; storeType?: string } = {}
  ) => {
    setIsLoading(true);
    try {
      return await getAIShoppingListOptimization(ingredients, shoppingPreferences);
    } catch (error) {
      console.error('Error optimizing shopping list:', error);
      return {
        optimizedList: ingredients.join('\n- '),
        tips: ['Unable to optimize at this time.']
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a meal to recent meals (for better recommendations)
  const addToRecentMeals = useCallback((mealTitle: string) => {
    const recentMeals = [...preferences.recentMeals];
    
    // Add to beginning and limit to 10 recent meals
    recentMeals.unshift(mealTitle);
    if (recentMeals.length > 10) {
      recentMeals.pop();
    }
    
    updatePreferences({ recentMeals });
  }, [preferences.recentMeals, updatePreferences]);

  return {
    preferences,
    updatePreferences,
    aiRecommendations,
    isLoading,
    getRecommendations,
    getMealPlan,
    modifyRecipe,
    optimizeShoppingList,
    addToRecentMeals,
  };
}; 