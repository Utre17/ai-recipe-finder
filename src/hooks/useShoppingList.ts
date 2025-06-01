import { useState, useEffect, useCallback } from 'react';
import { ShoppingList, MealPlan } from '@/types/recipe';
import { 
  getShoppingLists, 
  createShoppingList, 
  updateShoppingList, 
  toggleShoppingListItem 
} from '@/utils/storage';

export const useShoppingList = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShoppingLists = useCallback(() => {
    setIsLoading(true);
    try {
      const lists = getShoppingLists();
      setShoppingLists(lists);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShoppingLists();
  }, [loadShoppingLists]);

  const generateShoppingListFromMealPlans = useCallback((
    name: string,
    mealPlans: MealPlan[]
  ) => {
    const newListId = createShoppingList(name, mealPlans);
    if (newListId) {
      loadShoppingLists();
      return newListId;
    }
    return null;
  }, [loadShoppingLists]);

  const updateShoppingListById = useCallback((id: string, updates: Partial<ShoppingList>) => {
    updateShoppingList(id, updates);
    loadShoppingLists();
  }, [loadShoppingLists]);

  const toggleItemById = useCallback((listId: string, itemId: string) => {
    toggleShoppingListItem(listId, itemId);
    loadShoppingLists();
  }, [loadShoppingLists]);

  const deleteShoppingList = useCallback((id: string) => {
    try {
      const lists = getShoppingLists();
      const updatedLists = lists.filter(list => list.id !== id);
      localStorage.setItem('recipe-finder-shopping-lists', JSON.stringify(updatedLists));
      loadShoppingLists();
    } catch (error) {
      console.error('Error deleting shopping list:', error);
    }
  }, [loadShoppingLists]);

  const getShoppingListById = useCallback((id: string) => {
    // Always fetch fresh data from localStorage to ensure we get the latest
    const freshLists = getShoppingLists();
    return freshLists.find(list => list.id === id);
  }, []);

  return {
    shoppingLists,
    isLoading,
    generateShoppingListFromMealPlans,
    updateShoppingListById,
    toggleItemById,
    deleteShoppingList,
    getShoppingListById,
    refreshShoppingLists: loadShoppingLists,
  };
}; 