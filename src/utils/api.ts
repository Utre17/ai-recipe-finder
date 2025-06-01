import { Recipe, SearchFilters, ApiResponse } from '@/types/recipe';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

// Debug logging
console.log('🔑 API Configuration:', {
  hasSpoonacularKey: !!API_KEY,
  keyLength: API_KEY?.length || 0,
  keyPreview: API_KEY ? `${API_KEY.substring(0, 8)}...` : 'Not set'
});

// Fallback to TheMealDB API if Spoonacular is not available
const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const searchRecipes = async (filters: SearchFilters): Promise<ApiResponse<Recipe>> => {
  try {
    if (!API_KEY) {
      console.log('🔄 Using TheMealDB fallback API (no Spoonacular key)');
      // Fallback to TheMealDB API
      return await searchMealDBRecipes(filters);
    }

    console.log('🚀 Using Spoonacular API with key');
    const params = new URLSearchParams({
      apiKey: API_KEY,
      query: filters.query,
      number: '12',
      addRecipeInformation: 'true',
      fillIngredients: 'true',
    });

    if (filters.diet) params.append('diet', filters.diet);
    if (filters.intolerances) params.append('intolerances', filters.intolerances);
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.type) params.append('type', filters.type);
    if (filters.maxReadyTime) params.append('maxReadyTime', filters.maxReadyTime.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await fetch(`${BASE_URL}/complexSearch?${params}`);
    
    if (!response.ok) {
      console.error('❌ Spoonacular API error:', response.status, response.statusText);
      if (response.status === 401) {
        console.error('🔑 401 Unauthorized - Check your Spoonacular API key');
        // Fallback to TheMealDB on auth error
        console.log('🔄 Falling back to TheMealDB API');
        return await searchMealDBRecipes(filters);
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching recipes:', error);
    console.log('🔄 Attempting TheMealDB fallback');
    return await searchMealDBRecipes(filters);
  }
};

export const getRecipeDetails = async (id: number): Promise<Recipe> => {
  try {
    if (!API_KEY) {
      throw new Error('API key not configured');
    }

    const response = await fetch(
      `${BASE_URL}/${id}/information?apiKey=${API_KEY}&includeNutrition=true`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
};

// Fallback TheMealDB API functions
const searchMealDBRecipes = async (filters: SearchFilters): Promise<ApiResponse<Recipe>> => {
  try {
    let endpoint = `${MEALDB_BASE_URL}/search.php?s=${filters.query}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`MealDB API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.meals) {
      return {
        results: [],
        offset: 0,
        number: 0,
        totalResults: 0,
      };
    }

    // Transform MealDB format to our Recipe interface
    const recipes: Recipe[] = data.meals.map((meal: any) => ({
      id: parseInt(meal.idMeal),
      title: meal.strMeal,
      image: meal.strMealThumb,
      imageType: 'jpg',
      readyInMinutes: 30, // Default value
      servings: 4, // Default value
      spoonacularScore: 85, // Default value
      healthScore: 75, // Default value
      pricePerServing: 250, // Default value
      cuisines: meal.strArea ? [meal.strArea] : [],
      dishTypes: meal.strCategory ? [meal.strCategory] : [],
      diets: [],
      occasions: [],
      analyzedInstructions: [{
        name: '',
        steps: meal.strInstructions ? 
          meal.strInstructions.split('.').filter((step: string) => step.trim()).map((step: string, index: number) => ({
            number: index + 1,
            step: step.trim(),
            ingredients: [],
            equipment: [],
          })) : []
      }],
      extendedIngredients: Array.from({ length: 20 }, (_, i) => i + 1)
        .map(num => ({
          ingredient: meal[`strIngredient${num}`],
          measure: meal[`strMeasure${num}`],
        }))
        .filter(item => item.ingredient && item.ingredient.trim())
        .map((item, index) => ({
          id: index + 1,
          aisle: '',
          image: '',
          consistency: '',
          name: item.ingredient,
          nameClean: item.ingredient,
          original: `${item.measure} ${item.ingredient}`.trim(),
          originalName: item.ingredient,
          amount: 1,
          unit: item.measure || '',
          meta: [],
          measures: {
            us: { amount: 1, unitShort: '', unitLong: '' },
            metric: { amount: 1, unitShort: '', unitLong: '' },
          },
        })),
      summary: meal.strInstructions ? meal.strInstructions.substring(0, 200) + '...' : '',
      instructions: meal.strInstructions || '',
    }));

    return {
      results: recipes,
      offset: 0,
      number: recipes.length,
      totalResults: recipes.length,
    };
  } catch (error) {
    console.error('Error with MealDB API:', error);
    throw error;
  }
};

export const getRandomRecipes = async (count: number = 12): Promise<Recipe[]> => {
  try {
    if (!API_KEY) {
      // Fallback to MealDB random recipes
      const recipes: Recipe[] = [];
      for (let i = 0; i < count; i++) {
        const response = await fetch(`${MEALDB_BASE_URL}/random.php`);
        const data = await response.json();
        if (data.meals && data.meals[0]) {
          const meal = data.meals[0];
          recipes.push({
            id: parseInt(meal.idMeal),
            title: meal.strMeal,
            image: meal.strMealThumb,
            imageType: 'jpg',
            readyInMinutes: 30,
            servings: 4,
            spoonacularScore: 85,
            healthScore: 75,
            pricePerServing: 250,
            cuisines: meal.strArea ? [meal.strArea] : [],
            dishTypes: meal.strCategory ? [meal.strCategory] : [],
            diets: [],
            occasions: [],
            analyzedInstructions: [],
            extendedIngredients: [],
            summary: meal.strInstructions ? meal.strInstructions.substring(0, 200) + '...' : '',
            instructions: meal.strInstructions || '',
          });
        }
      }
      return recipes;
    }

    const response = await fetch(
      `${BASE_URL}/random?apiKey=${API_KEY}&number=${count}&addRecipeInformation=true`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.recipes || [];
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    throw error;
  }
}; 