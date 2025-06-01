import { useState, useEffect, useCallback } from 'react';
import { MealPlan, Recipe, MealType } from '@/types/recipe';
import { 
  getMealPlans, 
  addMealPlan, 
  updateMealPlan, 
  removeMealPlan, 
  getMealPlansForDateRange 
} from '@/utils/storage';

export const useMealPlan = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMealPlans = useCallback(() => {
    setIsLoading(true);
    try {
      const plans = getMealPlans();
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMealPlans();
  }, [loadMealPlans]);

  const addRecipeToMealPlan = useCallback((
    recipe: Recipe,
    date: string,
    mealType: MealType,
    servings: number = 4,
    notes?: string
  ) => {
    const mealPlanData = {
      date,
      mealType,
      recipe,
      servings,
      notes,
    };
    
    const newId = addMealPlan(mealPlanData);
    if (newId) {
      loadMealPlans();
      return newId;
    }
    return null;
  }, [loadMealPlans]);

  const updateMealPlanById = useCallback((id: string, updates: Partial<MealPlan>) => {
    updateMealPlan(id, updates);
    loadMealPlans();
  }, [loadMealPlans]);

  const removeMealPlanById = useCallback((id: string) => {
    removeMealPlan(id);
    loadMealPlans();
  }, [loadMealPlans]);

  const getMealPlansForDate = useCallback((date: string) => {
    return mealPlans.filter(plan => plan.date === date);
  }, [mealPlans]);

  const getMealPlansForWeek = useCallback((startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return getMealPlansForDateRange(startDateStr, endDateStr);
  }, []);

  const moveMealPlan = useCallback((planId: string, newDate: string, newMealType: MealType) => {
    updateMealPlan(planId, { date: newDate, mealType: newMealType });
    loadMealPlans();
  }, [loadMealPlans]);

  return {
    mealPlans,
    isLoading,
    addRecipeToMealPlan,
    updateMealPlanById,
    removeMealPlanById,
    getMealPlansForDate,
    getMealPlansForWeek,
    moveMealPlan,
    refreshMealPlans: loadMealPlans,
  };
}; 