import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  ChefHat, 
  Utensils, 
  Loader2,
  RefreshCw,
  Settings,
  X
} from 'lucide-react';
import { AIRecipeRecommendation } from '@/utils/ai';
import { useAI } from '@/hooks/useAI';

interface AIRecommendationsProps {
  onRecipeSelect?: (recommendation: AIRecipeRecommendation) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ onRecipeSelect }) => {
  const { aiRecommendations, isLoading, getRecommendations, preferences } = useAI();
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const handleGetRecommendations = async () => {
    await getRecommendations(3);
    setHasInitialLoad(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-none sm:rounded-3xl max-w-full sm:max-w-4xl w-full shadow-lg border border-gray-100 overflow-hidden p-2 sm:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">AI Recipe Recommendations</h2>
              <p className="text-white/80 text-sm">Personalized just for you</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPreferences(true)}
              className="w-full sm:w-auto p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors min-w-[44px] min-h-[44px]"
              title="Customize Preferences"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleGetRecommendations}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {hasInitialLoad ? 'Refresh' : 'Get Recommendations'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!hasInitialLoad && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready for AI Magic?
            </h3>
            <p className="text-gray-600 mb-6">
              Get personalized recipe recommendations based on your preferences and dietary needs.
            </p>
            <button
              onClick={handleGetRecommendations}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Generate AI Recommendations
            </button>
          </motion.div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">AI is analyzing your preferences...</p>
          </div>
        )}

        {hasInitialLoad && !isLoading && aiRecommendations.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No recommendations available. Try adjusting your preferences.</p>
          </div>
        )}

        <AnimatePresence>
          {aiRecommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {aiRecommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-purple-300"
                  onClick={() => onRecipeSelect?.(recommendation)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex-1 pr-2">
                      {recommendation.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(recommendation.difficulty)}`}>
                      {recommendation.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recommendation.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recommendation.cookingTime}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4" />
                      <span>{recommendation.cuisine}</span>
                    </div>
                  </div>

                  {recommendation.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recommendation.dietaryTags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2">Ingredients needed:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {recommendation.ingredients.slice(0, 4).join(', ')}
                      {recommendation.ingredients.length > 4 && '...'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Preferences Summary */}
        {hasInitialLoad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gray-50 rounded-xl"
          >
            <h4 className="font-semibold text-gray-800 mb-2">Your Current Preferences:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {preferences.dietaryRestrictions.length > 0 && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  🥗 {preferences.dietaryRestrictions.join(', ')}
                </span>
              )}
              {preferences.preferredCuisines.length > 0 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  🌍 {preferences.preferredCuisines.slice(0, 2).join(', ')}
                </span>
              )}
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                ⏱️ {preferences.timeAvailable}min max
              </span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                👨‍🍳 {preferences.cookingSkillLevel}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Preferences Modal */}
      <PreferencesModal 
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

// Simple preferences modal component
const PreferencesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { preferences, updatePreferences } = useAI();

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
          className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold gradient-text">AI Preferences</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cooking Skill Level
              </label>
              <select
                value={preferences.cookingSkillLevel}
                onChange={(e) => updatePreferences({ 
                  cookingSkillLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Cooking Time (minutes)
              </label>
              <input
                type="number"
                min="10"
                max="180"
                value={preferences.timeAvailable}
                onChange={(e) => updatePreferences({ timeAvailable: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.dietaryRestrictions.join(', ')}
                onChange={(e) => updatePreferences({ 
                  dietaryRestrictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., vegetarian, gluten-free, keto"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Cuisines (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.preferredCuisines.join(', ')}
                onChange={(e) => updatePreferences({ 
                  preferredCuisines: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., Italian, Mexican, Asian"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Ingredients (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.favoriteIngredients.join(', ')}
                onChange={(e) => updatePreferences({ 
                  favoriteIngredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., chicken, tomatoes, garlic"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Save Preferences
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 