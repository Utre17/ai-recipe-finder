import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Heart, Star, DollarSign, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/storage';
import { useAI } from '@/hooks/useAI';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const isLiked = isFavorite(recipe.id);
  const [showAIModifications, setShowAIModifications] = useState(false);
  const [aiModification, setAiModification] = useState<{ modifiedRecipe: string; changes: string } | null>(null);
  const [selectedModifications, setSelectedModifications] = useState<string[]>([]);
  
  const { modifyRecipe, isLoading: aiLoading } = useAI();

  const handleFavoriteToggle = () => {
    if (isLiked) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe);
    }
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const handleAIModify = async () => {
    if (selectedModifications.length === 0) return;
    
    const modification = await modifyRecipe(recipe, selectedModifications);
    setAiModification(modification);
  };

  const modificationOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'low-carb',
    'high-protein',
    'dairy-free',
    'keto-friendly',
    'low-sodium',
    'heart-healthy',
    'quick (30 min or less)'
  ];

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
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handleFavoriteToggle}
              className={`absolute top-4 left-4 p-2 backdrop-blur-md rounded-full transition-all ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShowAIModifications(true)}
              className="absolute top-4 left-16 p-2 bg-purple-500/80 text-white backdrop-blur-md rounded-full hover:bg-purple-600/80 transition-all"
              title="AI Modify Recipe"
            >
              <Sparkles className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-3xl font-bold text-white mb-2">{recipe.title}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{recipe.readyInMinutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>{(recipe.spoonacularScore / 20).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  <span>{formatPrice(recipe.pricePerServing)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.diets.map((diet, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {diet}
                </span>
              ))}
              {recipe.cuisines.map((cuisine, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {cuisine}
                </span>
              ))}
            </div>

            {/* Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">About This Recipe</h2>
              <div 
                className="text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              />
            </div>

            {/* Ingredients & Instructions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Ingredients
                </h3>
                <div className="space-y-3">
                  {recipe.extendedIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{ingredient.original}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-bold mb-4">Instructions</h3>
                <div className="space-y-4">
                  {recipe.analyzedInstructions[0]?.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {step.number}
                      </div>
                      <p className="text-gray-700 pt-1">{step.step}</p>
                    </div>
                  )) || (
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Nutrition Info */}
            {recipe.nutrition && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 gradient-text">Nutrition Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recipe.nutrition.nutrients.slice(0, 8).map((nutrient, index) => (
                    <div key={index} className="text-center">
                      <div className="font-bold text-lg text-gray-800">
                        {Math.round(nutrient.amount)}
                        <span className="text-sm text-gray-600">{nutrient.unit}</span>
                      </div>
                      <div className="text-sm text-gray-600">{nutrient.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      {/* AI Modifications Modal */}
      <AnimatePresence>
        {showAIModifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
            onClick={() => setShowAIModifications(false)}
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
                    <h3 className="text-xl font-bold">AI Recipe Modifications</h3>
                  </div>
                  <button
                    onClick={() => setShowAIModifications(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {!aiModification ? (
                  <>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">How would you like to modify this recipe?</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Select the dietary preferences or restrictions you'd like AI to adapt this recipe for:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {modificationOptions.map((option) => (
                          <label key={option} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-purple-300 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedModifications.includes(option)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedModifications([...selectedModifications, option]);
                                } else {
                                  setSelectedModifications(selectedModifications.filter(mod => mod !== option));
                                }
                              }}
                              className="text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700 capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAIModify}
                      disabled={selectedModifications.length === 0 || aiLoading}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>AI is modifying your recipe...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Modify Recipe with AI</span>
                        </div>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">✨ Your Modified Recipe:</h4>
                      <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                          {aiModification.modifiedRecipe}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">📝 What Changed:</h4>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {aiModification.changes}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setAiModification(null);
                          setSelectedModifications([]);
                        }}
                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                      >
                        Try Different Modifications
                      </button>
                      <button
                        onClick={() => setShowAIModifications(false)}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}; 