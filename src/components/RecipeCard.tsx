import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Heart, Star, DollarSign } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/storage';
import { stripHtml } from '@/utils/sanitize';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const [isLiked, setIsLiked] = useState(isFavorite(recipe.id));

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe);
    }
    setIsLiked(!isLiked);
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer card-hover"
      onClick={() => onSelect(recipe)}
    >
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all ${
            isLiked 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        {recipe.diets.length > 0 && (
          <div className="absolute top-4 left-4">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {recipe.diets[0]}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.readyInMinutes} min</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
          
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{formatPrice(recipe.pricePerServing)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">
              {(recipe.spoonacularScore / 20).toFixed(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Health Score: {recipe.healthScore}
            </span>
          </div>
        </div>

        {recipe.cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recipe.cuisines.slice(0, 2).map((cuisine, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {cuisine}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-600 text-sm line-clamp-3">
          {stripHtml(recipe.summary)}
        </p>
      </div>
    </motion.div>
  );
}; 