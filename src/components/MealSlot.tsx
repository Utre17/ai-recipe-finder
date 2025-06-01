import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Users } from 'lucide-react';
import { MealPlan, MealType } from '@/types/recipe';

interface MealSlotProps {
  id: string;
  mealPlans: MealPlan[];
  date: Date;
  mealType: MealType;
  onRemoveMeal: (mealId: string) => void;
}

export const MealSlot: React.FC<MealSlotProps> = ({
  id,
  mealPlans,
  date: _date,
  mealType: _mealType,
  onRemoveMeal,
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
    if (isOver && active) {
      console.log('🐛 Recipe is over meal slot:', id, 'Active:', active.id);
    }
  }, [isOver, active, id]);

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
                className="group relative bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all"
              >
                {/* Remove Button */}
                <button
                  onClick={() => onRemoveMeal(mealPlan.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  title="Remove from meal plan"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Recipe Image */}
                <div className="flex items-start gap-3">
                  <img
                    src={mealPlan.recipe.image}
                    alt={mealPlan.recipe.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight">
                      {mealPlan.recipe.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{mealPlan.recipe.readyInMinutes}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{mealPlan.servings}</span>
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