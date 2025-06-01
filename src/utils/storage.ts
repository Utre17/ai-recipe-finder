import { Recipe, MealPlan, ShoppingList, RecipeCollection, UserPreferences } from '@/types/recipe';

const FAVORITES_KEY = 'recipe-finder-favorites';
const MEAL_PLANS_KEY = 'recipe-finder-meal-plans';
const SHOPPING_LISTS_KEY = 'recipe-finder-shopping-lists';
const COLLECTIONS_KEY = 'recipe-finder-collections';
const PREFERENCES_KEY = 'recipe-finder-preferences';

export const getFavorites = (): Recipe[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

export const addToFavorites = (recipe: Recipe): void => {
  try {
    const favorites = getFavorites();
    const isAlreadyFavorite = favorites.some(fav => fav.id === recipe.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, recipe];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
};

export const removeFromFavorites = (recipeId: number): void => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};

export const isFavorite = (recipeId: number): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === recipeId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const clearFavorites = (): void => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
};

// Meal Planning Functions
export const getMealPlans = (): MealPlan[] => {
  try {
    const stored = localStorage.getItem(MEAL_PLANS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading meal plans:', error);
    return [];
  }
};

export const addMealPlan = (mealPlan: Omit<MealPlan, 'id'>): string => {
  try {
    const mealPlans = getMealPlans();
    const newMealPlan: MealPlan = {
      ...mealPlan,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updatedMealPlans = [...mealPlans, newMealPlan];
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updatedMealPlans));
    return newMealPlan.id;
  } catch (error) {
    console.error('Error adding meal plan:', error);
    return '';
  }
};

export const updateMealPlan = (id: string, updates: Partial<MealPlan>): void => {
  try {
    const mealPlans = getMealPlans();
    const updatedMealPlans = mealPlans.map(plan => 
      plan.id === id ? { ...plan, ...updates } : plan
    );
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updatedMealPlans));
  } catch (error) {
    console.error('Error updating meal plan:', error);
  }
};

export const removeMealPlan = (id: string): void => {
  try {
    const mealPlans = getMealPlans();
    const updatedMealPlans = mealPlans.filter(plan => plan.id !== id);
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updatedMealPlans));
  } catch (error) {
    console.error('Error removing meal plan:', error);
  }
};

export const getMealPlansForDateRange = (startDate: string, endDate: string): MealPlan[] => {
  try {
    const mealPlans = getMealPlans();
    return mealPlans.filter(plan => plan.date >= startDate && plan.date <= endDate);
  } catch (error) {
    console.error('Error filtering meal plans:', error);
    return [];
  }
};

// Shopping List Functions
export const getShoppingLists = (): ShoppingList[] => {
  try {
    const stored = localStorage.getItem(SHOPPING_LISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading shopping lists:', error);
    return [];
  }
};

export const createShoppingList = (name: string, mealPlans: MealPlan[]): string => {
  try {
    const ingredientMap = new Map<string, {
      amount: number;
      unit: string;
      recipes: string[];
      aisle?: string;
    }>();

    // Aggregate ingredients from all meal plans
    mealPlans.forEach(plan => {
      plan.recipe.extendedIngredients.forEach(ingredient => {
        const key = ingredient.nameClean || ingredient.name;
        const existing = ingredientMap.get(key);
        
        if (existing) {
          existing.amount += ingredient.amount * plan.servings;
          if (!existing.recipes.includes(plan.recipe.title)) {
            existing.recipes.push(plan.recipe.title);
          }
        } else {
          ingredientMap.set(key, {
            amount: ingredient.amount * plan.servings,
            unit: ingredient.unit,
            recipes: [plan.recipe.title],
            aisle: ingredient.aisle,
          });
        }
      });
    });

    const items = Array.from(ingredientMap.entries()).map(([ingredient, data]) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ingredient,
      amount: Math.round(data.amount * 100) / 100, // Round to 2 decimal places
      unit: data.unit,
      checked: false,
      recipes: data.recipes,
      aisle: data.aisle,
    }));

    const shoppingList: ShoppingList = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      dateCreated: new Date().toISOString(),
      items,
      totalItems: items.length,
      checkedItems: 0,
    };

    const shoppingLists = getShoppingLists();
    const updatedLists = [...shoppingLists, shoppingList];
    localStorage.setItem(SHOPPING_LISTS_KEY, JSON.stringify(updatedLists));
    return shoppingList.id;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return '';
  }
};

export const updateShoppingList = (id: string, updates: Partial<ShoppingList>): void => {
  try {
    const shoppingLists = getShoppingLists();
    const updatedLists = shoppingLists.map(list => 
      list.id === id ? { ...list, ...updates } : list
    );
    localStorage.setItem(SHOPPING_LISTS_KEY, JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error updating shopping list:', error);
  }
};

export const toggleShoppingListItem = (listId: string, itemId: string): void => {
  try {
    const shoppingLists = getShoppingLists();
    const updatedLists = shoppingLists.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        const checkedItems = updatedItems.filter(item => item.checked).length;
        return { ...list, items: updatedItems, checkedItems };
      }
      return list;
    });
    localStorage.setItem(SHOPPING_LISTS_KEY, JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error toggling shopping list item:', error);
  }
};

// Collections Functions
export const getCollections = (): RecipeCollection[] => {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading collections:', error);
    return [];
  }
};

export const createCollection = (collection: Omit<RecipeCollection, 'id' | 'dateCreated'>): string => {
  try {
    const collections = getCollections();
    const newCollection: RecipeCollection = {
      ...collection,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString(),
    };
    const updatedCollections = [...collections, newCollection];
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updatedCollections));
    return newCollection.id;
  } catch (error) {
    console.error('Error creating collection:', error);
    return '';
  }
};

export const addRecipeToCollection = (collectionId: string, recipe: Recipe): void => {
  try {
    const collections = getCollections();
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        const isAlreadyInCollection = collection.recipes.some(r => r.id === recipe.id);
        if (!isAlreadyInCollection) {
          return { ...collection, recipes: [...collection.recipes, recipe] };
        }
      }
      return collection;
    });
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updatedCollections));
  } catch (error) {
    console.error('Error adding recipe to collection:', error);
  }
};

// User Preferences Functions
export const getUserPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      measurementSystem: 'metric',
      defaultServings: 4,
      nutritionalGoals: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
        fiber: 25,
        sugar: 50,
      },
      favoriteApiSource: 'spoonacular',
      autoGenerateShoppingList: true,
    };
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return {
      theme: 'system',
      measurementSystem: 'metric',
      defaultServings: 4,
      nutritionalGoals: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
        fiber: 25,
        sugar: 50,
      },
      favoriteApiSource: 'spoonacular',
      autoGenerateShoppingList: true,
    };
  }
};

export const updateUserPreferences = (updates: Partial<UserPreferences>): void => {
  try {
    const currentPreferences = getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...updates };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences));
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}; 