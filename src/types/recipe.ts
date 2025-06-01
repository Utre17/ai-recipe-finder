export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  spoonacularScore: number;
  healthScore: number;
  pricePerServing: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  analyzedInstructions: AnalyzedInstruction[];
  extendedIngredients: ExtendedIngredient[];
  summary: string;
  instructions: string;
  nutrition?: NutritionInfo;
}

export interface ExtendedIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: {
    us: Measure;
    metric: Measure;
  };
}

export interface Measure {
  amount: number;
  unitShort: string;
  unitLong: string;
}

export interface AnalyzedInstruction {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
  ingredients: Ingredient[];
  equipment: Equipment[];
  length?: {
    number: number;
    unit: string;
  };
}

export interface Ingredient {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface Equipment {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface NutritionInfo {
  nutrients: Nutrient[];
  caloricBreakdown: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface SearchFilters {
  query: string;
  diet?: string;
  intolerances?: string;
  cuisine?: string;
  type?: string;
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
  sort?: string;
}

export interface ApiResponse<T> {
  results: T[];
  offset: number;
  number: number;
  totalResults: number;
}

// New interfaces for advanced features
export interface MealPlan {
  id: string;
  date: string; // YYYY-MM-DD format
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: Recipe;
  servings: number;
  notes?: string;
}

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  amount: number;
  unit: string;
  checked: boolean;
  recipes: string[]; // Recipe titles that use this ingredient
  aisle?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  dateCreated: string;
  items: ShoppingListItem[];
  totalItems: number;
  checkedItems: number;
}

export interface RecipeCollection {
  id: string;
  name: string;
  description: string;
  recipes: Recipe[];
  color: string;
  icon: string;
  dateCreated: string;
}

export interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface DailyNutrition {
  date: string;
  meals: MealPlan[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  goals: NutritionalGoals;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  measurementSystem: 'metric' | 'imperial';
  defaultServings: number;
  nutritionalGoals: NutritionalGoals;
  favoriteApiSource: 'spoonacular' | 'mealdb';
  autoGenerateShoppingList: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'; 