import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Heart, Star, DollarSign, ChefHat, Sparkles, Loader2, Plus, Minus, Edit } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { isFavorite, addToFavorites, removeFromFavorites } from '@/utils/storage';
import { useAI } from '@/hooks/useAI';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  const [isLiked, setIsLiked] = useState(() => isFavorite(recipe.id));
  const [showAIModifications, setShowAIModifications] = useState(false);
  const [aiModification, setAiModification] = useState<{ modifiedRecipe: string; changes: string } | null>(null);
  const [selectedModifications, setSelectedModifications] = useState<string[]>([]);
  
  // Serving size editing state
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [isEditingServings, setIsEditingServings] = useState(false);
  
  const { modifyRecipe, isLoading: aiLoading } = useAI();

  const handleFavoriteToggle = () => {
    if (isLiked) {
      removeFromFavorites(recipe.id);
      setIsLiked(false);
    } else {
      addToFavorites(recipe);
      setIsLiked(true);
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

  const adjustServings = (direction: 'increase' | 'decrease') => {
    setCurrentServings(prev => {
      if (direction === 'increase') {
        return Math.min(prev + 1, 20); // Max 20 servings
      } else {
        return Math.max(prev - 1, 1); // Min 1 serving
      }
    });
  };

  const toggleServingEdit = () => {
    if (isEditingServings) {
      // If we're closing edit mode, we could save the preference here
      setIsEditingServings(false);
    } else {
      setIsEditingServings(true);
    }
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
    <>
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

              <motion.button
                onClick={handleFavoriteToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute top-4 left-4 p-2 backdrop-blur-md rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
                title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-6 h-6 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🤖 AI Modify button clicked');
                  setShowAIModifications(true);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 left-16 p-2 bg-purple-500/90 text-white backdrop-blur-md rounded-full hover:bg-purple-600/90 transition-all duration-200 shadow-lg"
                title="🤖 AI Modify Recipe - Make it vegetarian, gluten-free, keto, etc."
              >
                <Sparkles className="w-6 h-6" />
              </motion.button>

              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-bold text-white mb-2">{recipe.title}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    <span>{recipe.readyInMinutes} min</span>
                  </div>
                  
                  {/* Interactive Serving Size */}
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Users className="w-5 h-5" />
                    {isEditingServings ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustServings('decrease')}
                          disabled={currentServings <= 1}
                          className="w-6 h-6 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[60px] text-center font-semibold">
                          {currentServings} serving{currentServings !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => adjustServings('increase')}
                          disabled={currentServings >= 20}
                          className="w-6 h-6 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={toggleServingEdit}
                          className="ml-1 p-1 bg-green-500/80 hover:bg-green-600/80 rounded transition-colors"
                          title="Done editing"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{currentServings} serving{currentServings !== 1 ? 's' : ''}</span>
                        <button
                          onClick={toggleServingEdit}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                          title="Edit serving size"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span>{(recipe.spoonacularScore / 20).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    <span>{formatPrice(recipe.pricePerServing * currentServings / recipe.servings)}</span>
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
                    {recipe.extendedIngredients.map((ingredient, index) => {
                      // Parse and scale ingredient amounts
                      const scaleFactor = currentServings / recipe.servings;
                      let scaledText = ingredient.original;
                      
                      // Try to extract and scale numeric amounts
                      if (ingredient.amount) {
                        const scaledAmount = Math.round(ingredient.amount * scaleFactor * 100) / 100;
                        const unitText = ingredient.unit ? ` ${ingredient.unit}` : '';
                        scaledText = `${scaledAmount}${unitText} ${ingredient.name}`;
                      }
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-700">{scaledText}</span>
                            {currentServings !== recipe.servings && (
                              <div className="text-xs text-blue-600 mt-1">
                                Scaled for {currentServings} serving{currentServings !== 1 ? 's' : ''} 
                                {ingredient.amount && (
                                  <span className="text-gray-500 ml-1">
                                    (original: {ingredient.amount} {ingredient.unit})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                  <h3 className="text-xl font-bold mb-4 gradient-text">
                    Nutrition Information
                    {currentServings !== recipe.servings && (
                      <span className="text-sm font-normal text-blue-600 ml-2">
                        (for {currentServings} serving{currentServings !== 1 ? 's' : ''})
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recipe.nutrition.nutrients.slice(0, 8).map((nutrient, index) => {
                      const scaleFactor = currentServings / recipe.servings;
                      const scaledAmount = Math.round(nutrient.amount * scaleFactor);
                      
                      return (
                        <div key={index} className="text-center">
                          <div className="font-bold text-lg text-gray-800">
                            {scaledAmount}
                            <span className="text-sm text-gray-600">{nutrient.unit}</span>
                          </div>
                          <div className="text-sm text-gray-600">{nutrient.name}</div>
                          {currentServings !== recipe.servings && (
                            <div className="text-xs text-gray-500 mt-1">
                              (was {Math.round(nutrient.amount)}{nutrient.unit})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* AI Modifications Modal - Moved outside main modal */}
      <AnimatePresence>
        {showAIModifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔙 AI Modal backdrop clicked');
              setShowAIModifications(false);
            }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('❌ AI Modal close button clicked');
                      setShowAIModifications(false);
                    }}
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
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 max-h-80 overflow-y-auto border border-purple-100">
                        <div className="space-y-4">
                          {aiModification.modifiedRecipe.split('\n\n').filter(section => section.trim()).map((section, index) => {
                            const lines = section.split('\n').filter(line => line.trim());
                            const title = lines[0];
                            const content = lines.slice(1);
                            
                            // Check if this is a title line (ends with colon or is all caps)
                            const isTitle = title.endsWith(':') || title === title.toUpperCase();
                            
                            if (isTitle) {
                              return (
                                <div key={index} className="space-y-2">
                                  <h5 className="font-bold text-purple-800 text-lg flex items-center gap-2">
                                    {title.includes('Ingredients') && '🥘'}
                                    {title.includes('Instructions') && '👨‍🍳'}
                                    {title.includes('Servings') && '🍽️'}
                                    {title.includes('Time') && '⏱️'}
                                    {title}
                                  </h5>
                                  <div className="ml-4 space-y-1">
                                    {content.map((line, lineIndex) => (
                                      <div key={lineIndex} className="flex items-start gap-2 text-gray-700">
                                        {line.match(/^\d+\./) ? (
                                          // Numbered instruction
                                          <>
                                            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                              {line.match(/^\d+/)?.[0]}
                                            </div>
                                            <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                          </>
                                        ) : line.startsWith('-') || line.startsWith('•') ? (
                                          // Bullet point (ingredient)
                                          <>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                                            <span>{line.replace(/^[-•]\s*/, '')}</span>
                                          </>
                                        ) : (
                                          // Regular text
                                          <span className="ml-2">{line}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            } else {
                              // Regular paragraph
                              return (
                                <div key={index} className="text-gray-700 leading-relaxed bg-white/50 rounded-lg p-3">
                                  {lines.map((line, lineIndex) => (
                                    <p key={lineIndex} className="mb-1">{line}</p>
                                  ))}
                                </div>
                              );
                            }
                          })}
                        </div>
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
    </>
  );
}; 