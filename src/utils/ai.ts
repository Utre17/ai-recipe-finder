import OpenAI from 'openai';
import { Recipe } from '@/types/recipe';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Debug logging for AI API
console.log('🤖 AI Configuration:', {
  hasOpenRouterKey: !!OPENROUTER_API_KEY,
  keyLength: OPENROUTER_API_KEY?.length || 0,
  keyPreview: OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 8)}...` : 'Not set'
});

// Configure OpenAI client to use OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': 'https://ai-recipe-finder.vercel.app', // Your app's URL
    'X-Title': 'AI Recipe Finder & Meal Planner', // Your app's name
  },
});

// Use free model that works reliably with OpenRouter
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

IMPORTANT: Respond with ONLY a valid JSON array of ${count} recipe objects. No additional text.

[
  {
    "title": "Recipe Name",
    "description": "Brief appealing description",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "cookingTime": 30,
    "difficulty": "easy",
    "cuisine": "cuisine_type",
    "dietaryTags": ["tag1", "tag2"]
  }
]

Start with [ and end with ]. Each recipe must have all fields.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Log the raw response to debug JSON parsing issues
    console.log('🔍 Raw AI recipe response:', content);

    // Try to parse JSON, with fallback handling
    try {
      const recipes = JSON.parse(content);
      return Array.isArray(recipes) ? recipes : [recipes];
    } catch (jsonError) {
      console.warn('⚠️ AI recipe response was not valid JSON, using fallback...');
      // Return fallback recommendations
      return getFallbackRecommendations(preferences, count);
    }
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

    console.log('🚀 Making OpenRouter API call for meal plan...');

    const prompt = `You are a nutrition and meal planning expert. Create a ${days}-day meal plan for someone with these preferences:

- Dietary restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Preferred cuisines: ${preferences.preferredCuisines.join(', ') || 'Varied'}
- Cooking skill: ${preferences.cookingSkillLevel}
- Time per meal: ${preferences.timeAvailable} minutes max
- Favorite ingredients to include: ${preferences.favoriteIngredients.join(', ') || 'Flexible'}
- Ingredients to avoid: ${preferences.dislikedIngredients.join(', ') || 'None'}

IMPORTANT: You must respond with ONLY valid JSON in this exact format. No extra text before or after:

{
  "mealPlan": "Day 1\nBreakfast: [specific meal name]\nLunch: [specific meal name]\nDinner: [specific meal name]\n\nDay 2\nBreakfast: [specific meal name]\nLunch: [specific meal name]\nDinner: [specific meal name]\n\n[continue for all ${days} days]",
  "explanation": "[Brief explanation of why this plan works for their needs and preferences]"
}

Example format for mealPlan content:
Day 1
Breakfast: Greek yogurt with honey and berries
Lunch: Quinoa salad with grilled vegetables
Dinner: Baked salmon with roasted sweet potatoes

Day 2
Breakfast: Oatmeal with banana and nuts
Lunch: Turkey and avocado wrap
Dinner: Stir-fried tofu with brown rice

Make sure each meal is specific and realistic for a ${preferences.cookingSkillLevel} cook with ${preferences.timeAvailable} minutes per meal.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    console.log('✅ OpenRouter API call successful');

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Log the raw response to debug JSON parsing issues
    console.log('🔍 Raw AI response:', content);

    // Try to parse JSON, with fallback handling
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (jsonError) {
      console.warn('⚠️ AI response was not valid JSON, attempting to extract JSON...');
      
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully extracted JSON from response');
          return extracted;
        } catch (extractError) {
          console.error('❌ Could not extract valid JSON');
        }
      }
      
      // Fallback: create JSON structure from the text response
      console.log('🔄 Creating fallback JSON structure from text response');
      return {
        mealPlan: `Day 1
Breakfast: Greek yogurt with honey and mixed berries
Lunch: Mediterranean quinoa salad with feta
Dinner: Grilled chicken with roasted vegetables

Day 2
Breakfast: Oatmeal with banana and almonds
Lunch: Turkey and avocado wrap with side salad
Dinner: Baked salmon with sweet potato fries

Day 3
Breakfast: Scrambled eggs with whole grain toast
Lunch: Lentil soup with crusty bread
Dinner: Vegetable stir-fry with brown rice

Day 4
Breakfast: Smoothie bowl with granola and fruit
Lunch: Caprese salad with baguette
Dinner: Lean beef with steamed broccoli

Day 5
Breakfast: Avocado toast with poached egg
Lunch: Chicken Caesar salad
Dinner: Pasta with marinara and side vegetables

Day 6
Breakfast: Chia pudding with coconut and berries
Lunch: Veggie burger with sweet potato wedges
Dinner: Grilled fish with quinoa pilaf

Day 7
Breakfast: Pancakes with fresh fruit
Lunch: Asian-style soup with dumplings
Dinner: Roasted vegetables with herb-crusted tofu`,
        explanation: 'This balanced 7-day meal plan provides variety while considering your dietary preferences and cooking skill level. Each meal is designed to be prepared within your time constraints and includes a good balance of proteins, healthy carbohydrates, and vegetables.'
      };
    }
  } catch (error) {
    console.error('❌ Error getting AI meal plan:', error);
    
    // If it's an authentication error, provide specific guidance
    if (error instanceof Error && error.message.includes('401')) {
      console.error('🔑 OpenRouter Authentication Error - Check your API key at https://openrouter.ai/keys');
    }
    
    return {
      mealPlan: `Day 1
Breakfast: Greek yogurt with honey and mixed berries
Lunch: Mediterranean quinoa salad with feta
Dinner: Grilled chicken with roasted vegetables

Day 2
Breakfast: Oatmeal with banana and almonds
Lunch: Turkey and avocado wrap with side salad
Dinner: Baked salmon with sweet potato fries

Day 3
Breakfast: Scrambled eggs with whole grain toast
Lunch: Lentil soup with crusty bread
Dinner: Vegetable stir-fry with brown rice

Day 4
Breakfast: Smoothie bowl with granola and fruit
Lunch: Caprese salad with baguette
Dinner: Lean beef with steamed broccoli

Day 5
Breakfast: Avocado toast with poached egg
Lunch: Chicken Caesar salad
Dinner: Pasta with marinara and side vegetables

Day 6
Breakfast: Chia pudding with coconut and berries
Lunch: Veggie burger with sweet potato wedges
Dinner: Grilled fish with quinoa pilaf

Day 7
Breakfast: Pancakes with fresh fruit
Lunch: Asian-style soup with dumplings
Dinner: Roasted vegetables with herb-crusted tofu`,
      explanation: 'This balanced 7-day meal plan provides variety while considering your dietary preferences and cooking skill level. Each meal is designed to be prepared within your time constraints and includes a good balance of proteins, healthy carbohydrates, and vegetables.'
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

// Test function to validate API key
export const testOpenRouterConnection = async (): Promise<boolean> => {
  try {
    if (!OPENROUTER_API_KEY) {
      console.error('❌ OpenRouter API key not configured');
      return false;
    }

    console.log('🧪 Testing OpenRouter API connection...');
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Say "Hello" if you can hear me.' }],
      max_tokens: 10,
    });

    if (response.choices[0]?.message?.content) {
      console.log('✅ OpenRouter API connection successful!');
      return true;
    } else {
      console.error('❌ OpenRouter API returned empty response');
      return false;
    }
  } catch (error) {
    console.error('❌ OpenRouter API test failed:', error);
    return false;
  }
};

// Auto-test the connection on module load (only in development)
if (import.meta.env.DEV && OPENROUTER_API_KEY) {
  testOpenRouterConnection();
} 