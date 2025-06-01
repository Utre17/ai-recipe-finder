import OpenAI from 'openai';
import { Recipe } from '@/types/recipe';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Configure OpenAI client to use OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Use free Llama model - great for recipe tasks
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

export interface AIRecipeRecommendation {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryTags: string[];
}

export interface UserPreferences {
  favoriteIngredients: string[];
  dietaryRestrictions: string[];
  dislikedIngredients: string[];
  preferredCuisines: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable: number; // minutes
  recentMeals: string[];
}

export const getAIRecipeRecommendations = async (
  preferences: UserPreferences,
  count: number = 3
): Promise<AIRecipeRecommendation[]> => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `You are a professional chef AI assistant. Based on the user's preferences, suggest ${count} personalized recipes.

User Preferences:
- Favorite ingredients: ${preferences.favoriteIngredients.join(', ') || 'None specified'}
- Dietary restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Disliked ingredients: ${preferences.dislikedIngredients.join(', ') || 'None'}
- Preferred cuisines: ${preferences.preferredCuisines.join(', ') || 'Any'}
- Cooking skill: ${preferences.cookingSkillLevel}
- Time available: ${preferences.timeAvailable} minutes
- Recent meals (avoid similar): ${preferences.recentMeals.join(', ') || 'None'}

Please respond with a JSON array of ${count} recipe objects, each with:
{
  "title": "Recipe Name",
  "description": "Brief appealing description",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "cookingTime": number_in_minutes,
  "difficulty": "easy|medium|hard",
  "cuisine": "cuisine_type",
  "dietaryTags": ["tag1", "tag2", ...]
}

Ensure recipes are diverse, match preferences, and avoid recent meals. Only return valid JSON.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Parse the JSON response
    const recipes = JSON.parse(content);
    return Array.isArray(recipes) ? recipes : [recipes];
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Return fallback recommendations
    return getFallbackRecommendations(preferences, count);
  }
};

export const getAIMealPlanSuggestion = async (
  preferences: UserPreferences,
  days: number = 7
): Promise<{ mealPlan: string; explanation: string }> => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `You are a nutrition and meal planning expert. Create a ${days}-day meal plan for someone with these preferences:

- Dietary restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Preferred cuisines: ${preferences.preferredCuisines.join(', ') || 'Varied'}
- Cooking skill: ${preferences.cookingSkillLevel}
- Time per meal: ${preferences.timeAvailable} minutes max
- Favorite ingredients to include: ${preferences.favoriteIngredients.join(', ') || 'Flexible'}
- Ingredients to avoid: ${preferences.dislikedIngredients.join(', ') || 'None'}

Please provide:
1. A detailed meal plan with breakfast, lunch, dinner for ${days} days
2. An explanation of the nutritional balance and why this plan works

Format as JSON:
{
  "mealPlan": "Day 1:\nBreakfast: ...\nLunch: ...\nDinner: ...\n\nDay 2: ...",
  "explanation": "This meal plan provides balanced nutrition because..."
}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error getting AI meal plan:', error);
    return {
      mealPlan: `Sample 7-day meal plan:\n\nDay 1:\nBreakfast: Oatmeal with berries\nLunch: Caesar salad\nDinner: Grilled chicken with vegetables\n\nDay 2:\nBreakfast: Greek yogurt with granola\nLunch: Quinoa bowl\nDinner: Pasta with marinara sauce\n\n... (continue for remaining days)`,
      explanation: 'This meal plan provides balanced nutrition with a variety of proteins, carbohydrates, and vegetables.'
    };
  }
};

export const modifyRecipeWithAI = async (
  recipe: Recipe,
  modifications: string[]
): Promise<{ modifiedRecipe: string; changes: string }> => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `You are a chef AI assistant. Modify this recipe to be ${modifications.join(', ')}:

Original Recipe:
Title: ${recipe.title}
Ingredients: ${recipe.extendedIngredients.map(ing => ing.original).join(', ')}
Instructions: ${recipe.instructions || 'See analyzedInstructions'}
Servings: ${recipe.servings}
Cooking Time: ${recipe.readyInMinutes} minutes

Please provide the modified recipe and explain what changes were made.

Format as JSON:
{
  "modifiedRecipe": "Modified Title\n\nIngredients:\n- ingredient 1\n- ingredient 2\n\nInstructions:\n1. Step 1\n2. Step 2\n\nServings: X\nTime: Y minutes",
  "changes": "Explanation of what was changed and why"
}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error modifying recipe with AI:', error);
    return {
      modifiedRecipe: `Modified ${recipe.title}\n\nThis is a placeholder for the modified recipe.`,
      changes: 'AI modification service is currently unavailable.'
    };
  }
};

export const getAIShoppingListOptimization = async (
  ingredients: string[],
  preferences: { budget?: 'low' | 'medium' | 'high'; storeType?: string }
): Promise<{ optimizedList: string; tips: string[] }> => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `You are a smart shopping assistant. Optimize this shopping list for efficiency and ${preferences.budget || 'medium'} budget:

Ingredients needed: ${ingredients.join(', ')}
Budget preference: ${preferences.budget || 'medium'}
Store type: ${preferences.storeType || 'regular grocery store'}

Please provide:
1. An organized shopping list grouped by store sections
2. Money-saving tips and substitutions
3. Quantity recommendations for best value

Format as JSON:
{
  "optimizedList": "PRODUCE:\n- item 1\n- item 2\n\nDAIRY:\n- item 3\n\nMEAT:\n- item 4",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error optimizing shopping list:', error);
    return {
      optimizedList: ingredients.join('\n- '),
      tips: ['Buy seasonal produce for better prices', 'Check for sales and coupons', 'Consider generic brands']
    };
  }
};

// Fallback recommendations when AI is not available
const getFallbackRecommendations = (_preferences: UserPreferences, count: number): AIRecipeRecommendation[] => {
  const fallbackRecipes: AIRecipeRecommendation[] = [
    {
      title: 'Quick Vegetable Stir Fry',
      description: 'A healthy and colorful vegetable stir fry perfect for any skill level',
      ingredients: ['mixed vegetables', 'soy sauce', 'garlic', 'ginger', 'oil'],
      instructions: ['Heat oil in pan', 'Add garlic and ginger', 'Add vegetables', 'Stir fry for 5-7 minutes', 'Add soy sauce'],
      cookingTime: 15,
      difficulty: 'easy',
      cuisine: 'Asian',
      dietaryTags: ['vegetarian', 'vegan', 'quick']
    },
    {
      title: 'Classic Pasta with Marinara',
      description: 'Simple and delicious pasta dish that never goes out of style',
      ingredients: ['pasta', 'marinara sauce', 'garlic', 'basil', 'parmesan cheese'],
      instructions: ['Boil pasta', 'Heat sauce with garlic', 'Combine pasta and sauce', 'Garnish with basil and cheese'],
      cookingTime: 20,
      difficulty: 'easy',
      cuisine: 'Italian',
      dietaryTags: ['vegetarian']
    },
    {
      title: 'Grilled Chicken Salad',
      description: 'Light and nutritious salad with perfectly grilled chicken',
      ingredients: ['chicken breast', 'mixed greens', 'tomatoes', 'cucumber', 'olive oil', 'lemon'],
      instructions: ['Season and grill chicken', 'Prepare salad ingredients', 'Make dressing', 'Combine and serve'],
      cookingTime: 25,
      difficulty: 'medium',
      cuisine: 'Mediterranean',
      dietaryTags: ['high-protein', 'low-carb']
    }
  ];

  return fallbackRecipes.slice(0, count);
}; 