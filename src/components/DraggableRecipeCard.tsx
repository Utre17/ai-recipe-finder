import React, { useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Clock, Users, GripVertical } from 'lucide-react';
import { Recipe } from '@/types/recipe';

interface DraggableRecipeCardProps {
  recipe: Recipe;
  isDragging?: boolean;
}

export const DraggableRecipeCard: React.FC<DraggableRecipeCardProps> = ({
  recipe,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: {
      type: 'recipe',
      recipe,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 9999,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
  } : {
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
  };

  // Debug logging
  useEffect(() => {
    console.log('🔧 Recipe card mounted:', recipe.title, 'ID: recipe-' + recipe.id);
    if (isBeingDragged) {
      console.log('🐛 Recipe card is being dragged:', recipe.title);
    }
  }, [isBeingDragged, recipe.title, recipe.id]);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isBeingDragged ? 0.8 : 1, 
        scale: isBeingDragged ? 1.05 : 1,
      }}
      whileHover={{ scale: 1.02 }}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-md border-2 cursor-grab active:cursor-grabbing transition-all touch-manipulation select-none ${
        isDragging || isBeingDragged
          ? 'border-primary shadow-lg rotate-3 z-50' 
          : 'border-transparent hover:border-primary/20 hover:shadow-lg'
      }`}
    >
      {/* Drag Handle for Mobile */}
      <div
        className="block md:hidden absolute top-2 left-2 z-20"
        {...listeners}
        {...attributes}
        tabIndex={0}
        aria-label="Drag to move"
        title="Drag to move"
        style={{ touchAction: 'none' }}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 flex items-center justify-center border border-gray-200 shadow">
          <GripVertical className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      {/* Drag Handle for Desktop (hidden, whole card is draggable) */}
      <div className="hidden md:block absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1">
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Recipe Image */}
      <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        {/* Quick Info Badge */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded px-2 py-1">
              <Clock className="w-3 h-3" />
              <span>{recipe.readyInMinutes}m</span>
            </div>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded px-2 py-1">
              <Users className="w-3 h-3" />
              <span>{recipe.servings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-3 pointer-events-none">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight">
          {recipe.title}
        </h3>
        
        {/* Diet Tags */}
        {recipe.diets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.diets.slice(0, 2).map((diet, index) => (
              <span
                key={index}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
              >
                {diet}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Drag Instruction Overlay */}
      {(isDragging || isBeingDragged) && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center text-primary font-medium">
            <div className="text-lg">📅</div>
            <div className="text-xs">Drop on calendar</div>
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {import.meta.env.DEV && isBeingDragged && (
        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 pointer-events-none">
          Dragging ID: recipe-{recipe.id}
        </div>
      )}
    </motion.div>
  );
}; 