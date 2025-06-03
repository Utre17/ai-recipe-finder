import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingCart, 
  Check, 
  Download, 
  Share,
} from 'lucide-react';
import { ShoppingList, ShoppingListItem, MealPlan } from '@/types/recipe';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlans: MealPlan[];
  initialName?: string;
}

type SortOption = 'aisle' | 'recipe' | 'alphabetical';
type FilterOption = 'all' | 'checked' | 'unchecked';

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  mealPlans,
  initialName = 'Weekly Meal Plan',
}) => {
  console.log('[ShoppingListModal] mealPlans:', mealPlans);
  const listName = initialName;
  const [sortBy, setSortBy] = useState<SortOption>('aisle');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Helper to generate shopping list in memory from mealPlans
  const inMemoryList = useMemo(() => {
    const ingredientMap = new Map<string, {
      amount: number;
      unit: string;
      recipes: string[];
      aisle?: string;
    }>();
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
    const items: ShoppingListItem[] = Array.from(ingredientMap.entries()).map(([ingredient, data]) => ({
      id: ingredient,
      ingredient,
      amount: Math.round(data.amount * 100) / 100,
      unit: data.unit,
      checked: false,
      recipes: data.recipes,
      aisle: data.aisle,
    }));
    return {
      id: 'in-memory',
      name: listName,
      dateCreated: new Date().toISOString(),
      items,
      totalItems: items.length,
      checkedItems: 0,
    } as ShoppingList;
  }, [mealPlans, listName]);

  // Toggle item checked state (in memory only)
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setCheckedState({}); // Reset when mealPlans change
  }, [mealPlans]);
  const handleToggleItem = (itemId: string) => {
    setCheckedState(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Organize items for display
  const organizedItems = useMemo(() => {
    if (!inMemoryList) return {};
    let filteredItems = inMemoryList.items.map(i => ({
      ...i,
      isChecked: checkedState[i.id] === true,
    }));
    if (filterBy === 'checked') {
      filteredItems = filteredItems.filter(item => item.isChecked);
    } else if (filterBy === 'unchecked') {
      filteredItems = filteredItems.filter(item => !item.isChecked);
    }
    const grouped: Record<string, typeof filteredItems> = {};
    filteredItems.forEach(item => {
      let groupKey = '';
      switch (sortBy) {
        case 'aisle':
          groupKey = item.aisle || 'Other';
          break;
        case 'recipe':
          groupKey = item.recipes[0] || 'Other';
          break;
        case 'alphabetical':
          groupKey = item.ingredient.charAt(0).toUpperCase();
          break;
      }
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(item);
    });
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.ingredient.localeCompare(b.ingredient));
    });
    return grouped;
  }, [inMemoryList, sortBy, filterBy, checkedState]);

  // Export and share functions (use inMemoryList)
  const exportList = () => {
    const listText = Object.entries(organizedItems)
      .map(([group, items]) => {
        const itemsText = items
          .map(item => `${item.isChecked ? '✓' : '○'} ${item.amount} ${item.unit} ${item.ingredient}`)
          .join('\n');
        return `${group.toUpperCase()}\n${itemsText}`;
      })
      .join('\n\n');
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inMemoryList.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const shareList = async () => {
    const listText = Object.entries(organizedItems)
      .map(([group, items]) => {
        const itemsText = items
          .map(item => `• ${item.amount} ${item.unit} ${item.ingredient}`)
          .join('\n');
        return `${group}\n${itemsText}`;
      })
      .join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({
          title: inMemoryList.name,
          text: listText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(listText);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold gradient-text">Shopping List</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{inMemoryList.name}</h3>
                <p className="text-gray-500 text-sm">
                  {Object.values(checkedState).filter(Boolean).length} of {inMemoryList.totalItems} items completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportList}
                  className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Export List"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={shareList}
                  className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  title="Share List"
                >
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="aisle">Aisle</option>
                  <option value="recipe">Recipe</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="all">All Items</option>
                  <option value="unchecked">To Buy</option>
                  <option value="checked">Completed</option>
                </select>
              </div>
            </div>
          </div>
          {/* Shopping List Items */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {Object.entries(organizedItems).map(([group, items]) => (
                <div key={group}>
                  <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    {group}
                  </h4>
                  <div className="space-y-2">
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          item.isChecked
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleItem(item.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                            item.isChecked
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-primary'
                          }`}
                        >
                          {item.isChecked ? (
                            <Check className="w-4 h-4" />
                          ) : null}
                        </button>
                        <div className={`flex-1 ${item.isChecked ? 'line-through text-gray-500' : ''}`}>
                          <div className="font-medium">
                            {item.amount} {item.unit} {item.ingredient}
                          </div>
                          <div className="text-sm text-gray-500">
                            Used in: {item.recipes.join(', ')}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 