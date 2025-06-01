import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChefHat, X } from 'lucide-react';
import { getFavorites } from '@/utils/storage';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';

export const Header: React.FC = () => {
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  const handleShowFavorites = () => {
    setFavorites(getFavorites());
    setShowFavorites(true);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Recipe Finder</span>
            </div>
            
            <nav className="flex items-center gap-6">
              <button
                onClick={handleShowFavorites}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/50 hover:bg-white/70 transition-colors border border-white/20"
              >
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Favorites</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {getFavorites().length}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Favorites Modal */}
      <AnimatePresence>
        {showFavorites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFavorites(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text">Your Favorite Recipes</h2>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No favorite recipes yet</p>
                    <p className="text-gray-400">Start exploring and add some recipes to your favorites!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(recipe => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onSelect={() => {
                          setShowFavorites(false);
                          // Handle recipe selection
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 