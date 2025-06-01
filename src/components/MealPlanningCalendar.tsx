import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { 
  Calendar, 
  ShoppingCart, 
  BarChart3, 
  ArrowLeft, 
  ArrowRight
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Recipe, MealPlan, MealType } from '@/types/recipe';
import { useMealPlan } from '@/hooks/useMealPlan';
import { MealSlot } from './MealSlot';
import { DraggableRecipeCard } from './DraggableRecipeCard';

interface MealPlanningCalendarProps {
  recipes?: Recipe[];
  onAddRecipe?: (recipe: Recipe, date: string, mealType: MealType) => void;
  onGenerateShoppingList?: (mealPlans: MealPlan[]) => void;
  onViewNutrition?: (mealPlans: MealPlan[]) => void;
  onNavigateToSearch?: () => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

// Test recipes for debugging when no search results are available
const TEST_RECIPES: Recipe[] = [
  {
    id: 999001,
    title: "Test Pasta Recipe",
    image: "https://via.placeholder.com/312x231/8B5CF6/FFFFFF?text=Test+Pasta",
    imageType: "jpg",
    readyInMinutes: 30,
    servings: 4,
    spoonacularScore: 85,
    healthScore: 75,
    pricePerServing: 250,
    cuisines: ["Italian"],
    dishTypes: ["main course"],
    diets: ["vegetarian"],
    occasions: [],
    analyzedInstructions: [{
      name: "",
      steps: [
        { number: 1, step: "Cook pasta", ingredients: [], equipment: [] },
        { number: 2, step: "Add sauce", ingredients: [], equipment: [] }
      ]
    }],
    extendedIngredients: [
      {
        id: 1,
        aisle: "Pasta and Rice",
        image: "",
        consistency: "",
        name: "pasta",
        nameClean: "pasta",
        original: "1 pound pasta",
        originalName: "pasta",
        amount: 1,
        unit: "pound",
        meta: [],
        measures: {
          us: { amount: 1, unitShort: "lb", unitLong: "pound" },
          metric: { amount: 454, unitShort: "g", unitLong: "grams" }
        }
      }
    ],
    summary: "A simple test pasta recipe",
    instructions: "Cook pasta and add sauce"
  },
  {
    id: 999002,
    title: "Test Salad Recipe",
    image: "https://via.placeholder.com/312x231/10B981/FFFFFF?text=Test+Salad",
    imageType: "jpg",
    readyInMinutes: 15,
    servings: 2,
    spoonacularScore: 90,
    healthScore: 95,
    pricePerServing: 150,
    cuisines: ["Mediterranean"],
    dishTypes: ["salad"],
    diets: ["vegetarian", "vegan", "gluten free"],
    occasions: [],
    analyzedInstructions: [{
      name: "",
      steps: [
        { number: 1, step: "Mix vegetables", ingredients: [], equipment: [] },
        { number: 2, step: "Add dressing", ingredients: [], equipment: [] }
      ]
    }],
    extendedIngredients: [
      {
        id: 2,
        aisle: "Produce",
        image: "",
        consistency: "",
        name: "lettuce",
        nameClean: "lettuce",
        original: "2 cups lettuce",
        originalName: "lettuce",
        amount: 2,
        unit: "cups",
        meta: [],
        measures: {
          us: { amount: 2, unitShort: "cups", unitLong: "cups" },
          metric: { amount: 120, unitShort: "g", unitLong: "grams" }
        }
      }
    ],
    summary: "A simple test salad recipe",
    instructions: "Mix vegetables and add dressing"
  }
];

export const MealPlanningCalendar: React.FC<MealPlanningCalendarProps> = ({
  recipes = [],
  onAddRecipe,
  onGenerateShoppingList,
  onViewNutrition,
  onNavigateToSearch,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);
  
  const { 
    mealPlans, 
    addRecipeToMealPlan, 
    removeMealPlanById, 
    moveMealPlan 
  } = useMealPlan();

  // Use test recipes if no recipes are provided for debugging
  const availableRecipes = recipes.length > 0 ? recipes : (import.meta.env.DEV ? TEST_RECIPES : []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const weekDays = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), 
    [weekStart]
  );

  const weekMealPlans = useMemo(() => {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    
    return mealPlans.filter(plan => 
      plan.date >= weekStartStr && plan.date <= weekEndStr
    );
  }, [mealPlans, weekStart]);

  const getMealPlansForDay = (date: Date, mealType: MealType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return weekMealPlans.filter(plan => 
      plan.date === dateStr && plan.mealType === mealType
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdStr = active.id.toString();
    setActiveId(activeIdStr);
    
    console.log('🐛 Drag started with ID:', activeIdStr);
    console.log('🐛 Available recipes:', availableRecipes.map(r => ({ id: r.id, title: r.title })));
    console.log('🐛 Active data:', active.data);
    
    // Check if dragging a recipe from the sidebar (format: "recipe-123")
    if (activeIdStr.startsWith('recipe-')) {
      const recipeId = activeIdStr.replace('recipe-', '');
      const recipe = availableRecipes.find(r => r.id.toString() === recipeId);
      if (recipe) {
        console.log('🐛 Found recipe for drag:', recipe.title);
        setDraggedRecipe(recipe);
        return;
      } else {
        console.log('🐛 Recipe not found for ID:', recipeId, 'Available recipes:', availableRecipes.map(r => r.id));
      }
    }
    
    // Check if it's an existing meal plan being moved
    const existingPlan = mealPlans.find(plan => plan.id === activeIdStr);
    if (existingPlan) {
      console.log('🐛 Found existing meal plan:', existingPlan.recipe.title);
      setDraggedRecipe(existingPlan.recipe);
    } else {
      console.log('🐛 No recipe or meal plan found for ID:', activeIdStr);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('🐛 Drag ended - Active:', active?.id, 'Over:', over?.id);
    
    if (!over) {
      console.log('🐛 No drop target found');
      setActiveId(null);
      setDraggedRecipe(null);
      return;
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    // Parse the drop target (format: "date-mealtype" e.g., "2024-01-15-lunch")
    const dropTargetParts = overIdStr.split('-');
    
    // Handle cases where the drop target might have more than 2 parts due to date format
    let targetDate = '';
    let targetMealType = '';
    
    if (dropTargetParts.length >= 4) {
      // Format: "2024-01-15-lunch"
      targetDate = `${dropTargetParts[0]}-${dropTargetParts[1]}-${dropTargetParts[2]}`;
      targetMealType = dropTargetParts[3];
    } else if (dropTargetParts.length === 2) {
      // Fallback format: "date-mealtype"
      targetDate = dropTargetParts[0];
      targetMealType = dropTargetParts[1];
    }
    
    console.log('🐛 Parsed drop target - Date:', targetDate, 'MealType:', targetMealType);
    
    if (!targetDate || !MEAL_TYPES.includes(targetMealType as MealType)) {
      console.log('🐛 Invalid drop target format');
      setActiveId(null);
      setDraggedRecipe(null);
      return;
    }

    // If dragging a recipe from sidebar
    if (draggedRecipe) {
      // Check if it's a new recipe being added
      if (activeIdStr.startsWith('recipe-')) {
        console.log('🐛 Adding new recipe to meal plan:', draggedRecipe.title, targetDate, targetMealType);
        addRecipeToMealPlan(draggedRecipe, targetDate, targetMealType as MealType);
        onAddRecipe?.(draggedRecipe, targetDate, targetMealType as MealType);
      } else {
        // It's an existing meal plan being moved
        const existingPlan = mealPlans.find(plan => plan.id === activeIdStr);
        if (existingPlan) {
          console.log('🐛 Moving existing meal plan:', existingPlan.recipe.title);
          moveMealPlan(activeIdStr, targetDate, targetMealType as MealType);
        }
      }
    }

    setActiveId(null);
    setDraggedRecipe(null);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const generateShoppingList = () => {
    if (onGenerateShoppingList) {
      onGenerateShoppingList(weekMealPlans);
    }
  };

  const viewNutrition = () => {
    if (onViewNutrition) {
      onViewNutrition(weekMealPlans);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold gradient-text">Meal Planning</h2>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-xl hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="px-4 py-2 font-semibold min-w-[200px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-xl hover:bg-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            Today
          </button>
          
          <button
            onClick={generateShoppingList}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            Shopping List
          </button>
          
          <button
            onClick={viewNutrition}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            Nutrition
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Calendar Grid */}
        <div className="grid grid-cols-8 gap-4">
          {/* Meal Type Header */}
          <div className=""></div>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className="text-center">
              <div className="font-semibold text-gray-600 mb-1">{day}</div>
              <div className={`text-2xl font-bold ${
                isSameDay(weekDays[index], new Date()) 
                  ? 'text-primary' 
                  : 'text-gray-800'
              }`}>
                {format(weekDays[index], 'd')}
              </div>
            </div>
          ))}

          {/* Meal Rows */}
          {MEAL_TYPES.map(mealType => (
            <React.Fragment key={mealType}>
              {/* Meal Type Label */}
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-semibold text-gray-700 capitalize">{mealType}</span>
              </div>
              
              {/* Day Columns */}
              {weekDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayMeals = getMealPlansForDay(day, mealType);
                
                return (
                  <MealSlot
                    key={`${dateStr}-${mealType}`}
                    id={`${dateStr}-${mealType}`}
                    mealPlans={dayMeals}
                    date={day}
                    mealType={mealType}
                    onRemoveMeal={removeMealPlanById}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeId && draggedRecipe ? (
            <div className="transform rotate-6 scale-105 opacity-90">
              <DraggableRecipeCard recipe={draggedRecipe} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Recipe Sidebar - Always visible for dragging */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          📋 Drag Recipes to Calendar
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({availableRecipes.length} recipes available)
          </span>
        </h3>
        
        {availableRecipes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {availableRecipes.slice(0, 12).map(recipe => (
              <DraggableRecipeCard 
                key={`recipe-${recipe.id}`} 
                recipe={recipe}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Recipes Available</h4>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              You need to search for recipes first before you can add them to your meal plan.
            </p>
            <button
              onClick={() => {
                if (onNavigateToSearch) {
                  onNavigateToSearch();
                } else {
                  console.log('Navigate to search view');
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              🔍 Search for Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 