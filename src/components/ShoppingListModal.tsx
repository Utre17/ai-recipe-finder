import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingCart, 
  Check, 
  Download, 
  Share,
  Sparkles,
  Loader2
} from 'lucide-react';
import { ShoppingList, ShoppingListItem, MealPlan } from '@/types/recipe';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useAI } from '@/hooks/useAI';

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
  const [listName, setListName] = useState(initialName);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('aisle');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOptimization, setAiOptimization] = useState<{ optimizedList: string; tips: string[] } | null>(null);
  const [showAiOptimization, setShowAiOptimization] = useState(false);

  const { 
    generateShoppingListFromMealPlans, 
    toggleItemById
  } = useShoppingList();
  
  const { optimizeShoppingList, isLoading: aiLoading } = useAI();

  const generateList = async () => {
    setIsGenerating(true);
    try {
      const listId = generateShoppingListFromMealPlans(listName, mealPlans);
      if (listId) {
        // You would fetch the created list here in a real app
        // For now, we'll create a mock list for display
        const mockList: ShoppingList = {
          id: listId,
          name: listName,
          dateCreated: new Date().toISOString(),
          items: [], // This would be populated by the hook
          totalItems: 0,
          checkedItems: 0,
        };
        setCurrentList(mockList);
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
    }
    setIsGenerating(false);
  };

  const organizedItems = useMemo(() => {
    if (!currentList) return {};

    let filteredItems = currentList.items;
    
    // Apply filter
    if (filterBy === 'checked') {
      filteredItems = filteredItems.filter(item => item.checked);
    } else if (filterBy === 'unchecked') {
      filteredItems = filteredItems.filter(item => !item.checked);
    }

    // Group by sort option
    const grouped: Record<string, ShoppingListItem[]> = {};

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

    // Sort within groups
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.ingredient.localeCompare(b.ingredient));
    });

    return grouped;
  }, [currentList, sortBy, filterBy]);

  const handleToggleItem = (itemId: string) => {
    if (!currentList) return;
    toggleItemById(currentList.id, itemId);
    
    // Update local state
    setCurrentList(prev => {
      if (!prev) return prev;
      const updatedItems = prev.items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      const checkedItems = updatedItems.filter(item => item.checked).length;
      return { ...prev, items: updatedItems, checkedItems };
    });
  };

  const exportList = () => {
    if (!currentList) return;
    
    const listText = Object.entries(organizedItems)
      .map(([group, items]) => {
        const itemsText = items
          .map(item => `${item.checked ? '✓' : '○'} ${item.amount} ${item.unit} ${item.ingredient}`)
          .join('\n');
        return `${group.toUpperCase()}\n${itemsText}`;
      })
      .join('\n\n');

    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentList.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareList = async () => {
    if (!currentList) return;
    
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
          title: currentList.name,
          text: listText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(listText);
      // You could show a toast notification here
    }
  };

  const handleAIOptimize = async () => {
    if (!currentList) return;
    
    const ingredients = currentList.items.map(item => `${item.amount} ${item.unit} ${item.ingredient}`);
    const optimization = await optimizeShoppingList(ingredients, { 
      budget: 'medium', 
      storeType: 'grocery store' 
    });
    setAiOptimization(optimization);
    setShowAiOptimization(true);
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

            {!currentList ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                
                <button
                  onClick={generateList}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Shopping List'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{currentList.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {currentList.checkedItems} of {currentList.totalItems} items completed
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAIOptimize}
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-50"
                    title="AI Optimize List"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
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
            )}
          </div>

          {/* Controls */}
          {currentList && (
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
          )}

          {/* Shopping List Items */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {!currentList ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Generate your shopping list to get started</p>
                <p className="text-gray-400">We'll organize ingredients from your meal plans</p>
              </div>
            ) : (
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
                            item.checked 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <button
                            onClick={() => handleToggleItem(item.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                              item.checked
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {item.checked ? (
                              <Check className="w-4 h-4" />
                            ) : null}
                          </button>
                          
                          <div className={`flex-1 ${item.checked ? 'line-through text-gray-500' : ''}`}>
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
            )}
          </div>
        </motion.div>
      </motion.div>
      
      {/* AI Optimization Modal */}
      <AnimatePresence>
        {showAiOptimization && aiOptimization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
            onClick={() => setShowAiOptimization(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="text-xl font-bold">AI Optimized Shopping List</h3>
                  </div>
                  <button
                    onClick={() => setShowAiOptimization(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Optimized Shopping Route:</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                      {aiOptimization.optimizedList}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">💡 AI Shopping Tips:</h4>
                  <div className="space-y-2">
                    {aiOptimization.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}; 