import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, ChefHat } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { SearchFilters, Recipe } from '@/types/recipe';
import { searchRecipes, getRandomRecipes } from '@/utils/api';

interface RecipeGridProps {
  filters: SearchFilters;
  onRecipeSelect: (recipe: Recipe) => void;
  onRecipeResults?: (recipes: Recipe[]) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({ 
  filters, 
  onRecipeSelect,
  onRecipeResults 
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      if (!filters.query.trim() && !filters.diet && !filters.cuisine) {
        // Show random recipes when no filters are applied
        const randomRecipes = await getRandomRecipes(12);
        const result = {
          results: randomRecipes,
          offset: 0,
          number: randomRecipes.length,
          totalResults: randomRecipes.length,
        };
        onRecipeResults?.(randomRecipes);
        return result;
      }
      const result = await searchRecipes(filters);
      onRecipeResults?.(result.results);
      return result;
    },
    enabled: true,
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" count={12} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg text-gray-600 mb-2">Something went wrong</p>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ChefHat className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 mb-2">No recipes found</p>
        <p className="text-gray-500">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {!filters.query.trim() && !filters.diet && !filters.cuisine 
            ? 'Featured Recipes' 
            : 'Search Results'
          }
        </h2>
        <span className="text-gray-500">
          {data.totalResults} recipe{data.totalResults !== 1 ? 's' : ''} found
        </span>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {data.results.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <RecipeCard 
              recipe={recipe} 
              onSelect={onRecipeSelect}
            />
          </motion.div>
        ))}
      </motion.div>

      {data.results.length < data.totalResults && (
        <div className="flex justify-center pt-8">
          <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all font-medium">
            Load More Recipes
          </button>
        </div>
      )}
    </div>
  );
}; 