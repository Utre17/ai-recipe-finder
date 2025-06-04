import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Edit } from 'lucide-react';
import { MealPlan, MealType, Recipe } from '@/types/recipe';

interface MealSlotProps {
  id: string;
  mealPlans: MealPlan[];
  date: Date;
  mealType: MealType;
  onRemoveMeal: (mealId: string) => void;
  onRecipeSelect?: (recipe: Recipe) => void;
  onEditServingSize?: (mealPlan: MealPlan) => void;
}

export const MealSlot: React.FC<MealSlotProps> = ({
  id,
  mealPlans,
  date: _date,
  mealType: _mealType,
  onRemoveMeal,
  onRecipeSelect,
  onEditServingSize,
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: {
      type: 'meal-slot',
      date: _date,
      mealType: _mealType,
    },
  });

  // Debug logging
  React.useEffect(() => {
    console.log('🎯 MealSlot mounted:', id, 'for', _mealType);
    if (isOver && active) {
      console.log('🟢 Recipe is hovering over meal slot:', id, 'Active ID:', active.id);
    }
  }, [isOver, active, id, _mealType]);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-3 rounded-2xl border-2 border-dashed transition-all duration-200 ${
        isOver
          ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
      } ${mealPlans.length === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
    >
      {/* Drop zone indicator when dragging over */}
      {isOver && (
        <div className="absolute inset-0 bg-primary/5 rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="text-primary font-medium text-sm">
            📌 Drop recipe here
          </div>
        </div>
      )}

      <AnimatePresence>
        {mealPlans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col items-center justify-center h-full min-h-[96px] ${
              isOver ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <Plus className={`w-6 h-6 mb-2 ${isOver ? 'animate-bounce' : ''}`} />
            <span className="text-sm text-center">
              {isOver ? 'Drop here!' : 'Drop recipe here'}
            </span>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {mealPlans.map((mealPlan, index) => (
              <motion.div
                key={mealPlan.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-center h-full"
                onClick={() => onRecipeSelect?.(mealPlan.recipe)}
              >
                {/* Editable indicator */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Editable"></div>

                {/* Action Buttons */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Edit Serving Size Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditServingSize?.(mealPlan);
                    }}
                    className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 z-10 shadow-md hover:shadow-lg transition-all"
                    title="Edit serving size"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMeal(mealPlan.id);
                    }}
                    className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10 shadow-md hover:shadow-lg transition-all"
                    title="Remove from meal plan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Recipe Image */}
                <div className="flex items-start gap-3">
                  <img
                    src={mealPlan.recipe.image}
                    alt={mealPlan.recipe.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight">
                      {mealPlan.recipe.title}
                    </h4>
                    {/* Servings and Edit Row - always inside card, perfectly centered */}
                    <div className="flex justify-center items-center gap-2 mt-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full font-medium text-gray-700">
                        <span className="text-base">🍽️</span>
                        <span className="text-sm font-semibold">{mealPlan.servings}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditServingSize?.(mealPlan);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 focus:outline-none px-1"
                        title="Edit servings"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs font-medium">Edit</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{mealPlan.recipe.readyInMinutes}m</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 text-blue-500 text-xs">
                        (click to edit)
                      </div>
                    </div>

                    {mealPlan.notes && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {mealPlan.notes}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Debug info in development */}
      {import.meta.env.DEV && isOver && (
        <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 rounded pointer-events-none">
          Drop Zone: {id}
        </div>
      )}
    </div>
  );
}; 