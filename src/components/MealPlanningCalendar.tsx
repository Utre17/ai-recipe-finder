import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
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
  ArrowRight,
  Search,
  Users,
  Plus,
  Minus
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Recipe, MealPlan, MealType } from '@/types/recipe';
import { MealSlot } from './MealSlot';
import { DraggableRecipeCard } from './DraggableRecipeCard';
import { motion, AnimatePresence } from 'framer-motion';

interface MealPlanningCalendarProps {
  recipes?: Recipe[];
  onAddRecipe?: (recipe: Recipe, date: string, mealType: MealType) => void;
  onGenerateShoppingList?: (mealPlans: MealPlan[]) => void;
  onViewNutrition?: (mealPlans: MealPlan[]) => void;
  onNavigateToSearch?: () => void;
  onSearchRecipes?: (query: string) => void;
  onRecipeSelect?: (recipe: Recipe) => void;
  isSearching?: boolean;
  mealPlans: MealPlan[];
  addRecipeToMealPlan: (...args: any[]) => any;
  updateMealPlanById: (...args: any[]) => any;
  removeMealPlanById: (...args: any[]) => any;
  moveMealPlan: (...args: any[]) => any;
  refreshMealPlans: () => void;
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
  onSearchRecipes,
  onRecipeSelect,
  isSearching,
  mealPlans,
  addRecipeToMealPlan,
  updateMealPlanById,
  removeMealPlanById,
  moveMealPlan,
  refreshMealPlans
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Serving size selection state
  const [showServingSizeModal, setShowServingSizeModal] = useState(false);
  const [pendingRecipeAdd, setPendingRecipeAdd] = useState<{
    recipe: Recipe;
    date: string;
    mealType: MealType;
  } | null>(null);
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null);
  const [selectedServings, setSelectedServings] = useState(4);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Use test recipes if no recipes are provided for debugging
  const availableRecipes = recipes.length > 0 ? recipes : (import.meta.env.DEV ? TEST_RECIPES : []);

  const sensors = useSensors(
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
    const activeIdStr = String(active.id);
    setActiveId(activeIdStr);
    
    // Check if dragging a recipe card
    if (activeIdStr.startsWith('recipe-')) {
      const recipeId = parseInt(activeIdStr.replace('recipe-', ''));
      const recipe = availableRecipes.find(r => r.id === recipeId);
      if (recipe) {
        setDraggedRecipe(recipe);
      }
    }
    
    // Check if dragging an existing meal plan
    if (activeIdStr.startsWith('meal-')) {
      const existingPlan = mealPlans.find(plan => `meal-${plan.id}` === activeIdStr);
      if (existingPlan) {
        setDraggedRecipe(existingPlan.recipe);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear drag state
    setActiveId(null);
    setDraggedRecipe(null);

    if (!over) {
      return;
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    console.log('🎯 Drop target ID:', overIdStr);

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
    
    console.log('📅 Parsed drop target - Date:', targetDate, 'MealType:', targetMealType);
    console.log('🍽️ Valid meal types:', MEAL_TYPES);
    
    if (!targetDate || !MEAL_TYPES.includes(targetMealType as MealType)) {
      console.log('❌ Invalid drop target format or meal type');
      return;
    }

    // If dragging a recipe from sidebar
    if (draggedRecipe) {
      // Check if it's a new recipe being added
      if (activeIdStr.startsWith('recipe-')) {
        console.log('🍽️ Opening serving size selection for:', draggedRecipe.title);
        setPendingRecipeAdd({
          recipe: draggedRecipe,
          date: targetDate,
          mealType: targetMealType as MealType
        });
        setSelectedServings(draggedRecipe.servings || 4); // Default to recipe's original serving size
        setModalMode('add');
        setShowServingSizeModal(true);
      } else {
        // It's an existing meal plan being moved
        const planId = activeIdStr.replace('meal-', '');
        const existingPlan = mealPlans.find(plan => String(plan.id) === planId);
        if (existingPlan) {
          console.log('[MealPlanningCalendar] Moving existing meal plan:', existingPlan.recipe.title, 'to', targetDate, targetMealType);
          moveMealPlan(planId, targetDate, targetMealType as MealType);
          refreshMealPlans();
          console.log('[MealPlanningCalendar] Called refreshMealPlans after move.');
          console.log('✅ Meal plan moved successfully');
        }
      }
    } else {
      console.log('❌ No dragged recipe found');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const generateShoppingList = () => {
    console.log('🛒 Generate shopping list clicked');
    console.log('📊 All meal plans:', mealPlans.length);
    console.log('📊 Week meal plans:', weekMealPlans.length);
    console.log('📋 Meal plans details:', mealPlans);
    
    if (onGenerateShoppingList) {
      // Pass all meal plans instead of just the week's meal plans
      onGenerateShoppingList(mealPlans);
    }
  };

  const viewNutrition = () => {
    console.log('📊 View nutrition clicked');
    console.log('📊 All meal plans:', mealPlans.length);
    console.log('📊 Week meal plans:', weekMealPlans.length);
    
    if (onViewNutrition) {
      // Pass all meal plans instead of just the week's meal plans
      onViewNutrition(mealPlans);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !onSearchRecipes) return;
    
    try {
      await onSearchRecipes(searchQuery.trim());
      setSearchQuery('');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleConfirmServingSize = () => {
    if (modalMode === 'add' && pendingRecipeAdd) {
      console.log('[MealPlanningCalendar] Adding recipe:', pendingRecipeAdd.recipe.title, pendingRecipeAdd.date, pendingRecipeAdd.mealType, selectedServings);
      addRecipeToMealPlan(
        pendingRecipeAdd.recipe, 
        pendingRecipeAdd.date, 
        pendingRecipeAdd.mealType,
        selectedServings
      );
      refreshMealPlans();
      console.log('[MealPlanningCalendar] Called refreshMealPlans after add.');
      onAddRecipe?.(pendingRecipeAdd.recipe, pendingRecipeAdd.date, pendingRecipeAdd.mealType);
      console.log('✅ Recipe added successfully with', selectedServings, 'servings');
    } else if (modalMode === 'edit' && editingMealPlan) {
      console.log('[MealPlanningCalendar] Updating serving size for:', editingMealPlan.recipe.title, 'from', editingMealPlan.servings, 'to', selectedServings);
      updateMealPlanById(editingMealPlan.id, { servings: selectedServings });
      refreshMealPlans();
      console.log('[MealPlanningCalendar] Called refreshMealPlans after edit.');
      console.log('✅ Serving size updated successfully');
    }
    
    // Reset modal state
    setShowServingSizeModal(false);
    setPendingRecipeAdd(null);
    setEditingMealPlan(null);
    setSelectedServings(4);
    setModalMode('add');
  };

  const handleCancelServingSize = () => {
    console.log('❌ Serving size modal canceled');
    setShowServingSizeModal(false);
    setPendingRecipeAdd(null);
    setEditingMealPlan(null);
    setSelectedServings(4);
    setModalMode('add');
  };

  const adjustServings = (direction: 'increase' | 'decrease') => {
    setSelectedServings(prev => {
      if (direction === 'increase') {
        return Math.min(prev + 1, 20); // Max 20 servings
      } else {
        return Math.max(prev - 1, 1); // Min 1 serving
      }
    });
  };

  const handleEditServingSize = (mealPlan: MealPlan) => {
    console.log('✏️ Editing serving size for:', mealPlan.recipe.title, 'current:', mealPlan.servings);
    setEditingMealPlan(mealPlan);
    setSelectedServings(mealPlan.servings);
    setModalMode('edit');
    setShowServingSizeModal(true);
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
                    onRecipeSelect={onRecipeSelect}
                    onEditServingSize={handleEditServingSize}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Recipe Sidebar - Always visible for dragging */}
        <div className="mt-8 border-t pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              📋 Drag Recipes to Calendar
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({availableRecipes.length} recipes available)
              </span>
              {activeId && (
                <span className="ml-2 text-green-600 font-medium">🎯 Dragging...</span>
              )}
            </h3>
            
            {/* Search for more recipes */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for more recipes... (Press Enter)"
                  className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  disabled={isSearching}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e as any);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {isSearching && (
                <div className="text-sm text-gray-500">Searching...</div>
              )}
            </form>
          </div>
          
          {availableRecipes.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableRecipes.slice(0, 12).map(recipe => (
                  <DraggableRecipeCard 
                    key={`recipe-${recipe.id}`} 
                    recipe={recipe}
                  />
                ))}
              </div>
              
              {availableRecipes.length > 12 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Showing 12 of {availableRecipes.length} recipes
                  </p>
                  <button
                    onClick={() => {
                      // Could expand to show more recipes
                      console.log('Show more recipes functionality');
                    }}
                    className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View all recipes →
                  </button>
                </div>
              )}
            </>
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

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeId && draggedRecipe ? (
            <div className="transform rotate-6 scale-105 opacity-90 pointer-events-none">
              <DraggableRecipeCard recipe={draggedRecipe} isDragging />
            </div>
          ) : activeId ? (
            <div className="bg-primary text-white px-4 py-2 rounded-lg font-medium pointer-events-none">
              Dragging: {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {/* Serving Size Selection Modal */}
      <AnimatePresence>
        {showServingSizeModal && (pendingRecipeAdd || editingMealPlan) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelServingSize}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {modalMode === 'add' ? 'Choose Serving Size' : 'Edit Serving Size'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {modalMode === 'add' ? (
                    <>How many servings of <span className="font-semibold text-primary">{pendingRecipeAdd?.recipe.title}</span> would you like to add?</>
                  ) : (
                    <>How many servings of <span className="font-semibold text-primary">{editingMealPlan?.recipe.title}</span> would you like?</>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => adjustServings('decrease')}
                  disabled={selectedServings <= 1}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{selectedServings}</div>
                  <div className="text-sm text-gray-500">
                    {selectedServings === 1 ? 'serving' : 'servings'}
                  </div>
                </div>
                
                <button
                  onClick={() => adjustServings('increase')}
                  disabled={selectedServings >= 20}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original recipe:</span>
                  <span className="font-medium">
                    {modalMode === 'add' ? pendingRecipeAdd?.recipe.servings : editingMealPlan?.recipe.servings} servings
                  </span>
                </div>
                {modalMode === 'edit' && editingMealPlan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current meal plan:</span>
                    <span className="font-medium">{editingMealPlan.servings} servings</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{modalMode === 'add' ? 'Your selection:' : 'New amount:'}</span>
                  <span className="font-medium text-primary">{selectedServings} servings</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Meal type:</span>
                  <span className="font-medium capitalize">
                    {modalMode === 'add' ? pendingRecipeAdd?.mealType : editingMealPlan?.mealType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {modalMode === 'add' 
                      ? format(new Date(pendingRecipeAdd?.date || ''), 'MMM d, yyyy')
                      : format(new Date(editingMealPlan?.date || ''), 'MMM d, yyyy')
                    }
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelServingSize}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmServingSize}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg text-white rounded-xl font-medium transition-all"
                >
                  {modalMode === 'add' ? 'Add to Meal Plan' : 'Update Serving Size'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 