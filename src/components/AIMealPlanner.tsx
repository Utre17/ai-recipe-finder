import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Sparkles, 
  Loader2, 
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  Info,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';

export const AIMealPlanner: React.FC = () => {
  const { getMealPlan, preferences, updatePreferences, isLoading } = useAI();
  const [mealPlan, setMealPlan] = useState<{ mealPlan: string; explanation: string } | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleGenerateMealPlan = async () => {
    const plan = await getMealPlan(selectedDays);
    setMealPlan(plan);
  };

  const exportMealPlan = () => {
    if (!mealPlan) return;
    
    const content = `${selectedDays}-Day AI Meal Plan\n\n${mealPlan.mealPlan}\n\nWhy This Plan Works:\n${mealPlan.explanation}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-meal-plan-${selectedDays}-days.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Diet type options
  const dietTypes = [
    '',
    'vegetarian',
    'vegan',
    'keto',
    'gluten-free',
    'paleo',
    'low-carb',
    'high-protein',
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Meal Planner</h2>
              <p className="text-white/80 text-sm">Smart nutrition planning made easy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreferences(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium shadow transition-colors"
              title="Preferences"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Preferences</span>
            </button>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              className="px-3 py-2 bg-white/20 text-white rounded-xl border border-white/30 focus:outline-none"
            >
              <option value={3} className="text-gray-800">3 Days</option>
              <option value={7} className="text-gray-800">7 Days</option>
              <option value={14} className="text-gray-800">14 Days</option>
            </select>
            
            <button
              onClick={handleGenerateMealPlan}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Generate Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreferences(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold gradient-text">Meal Plan Preferences</h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                  <select
                    value={preferences.dietType || ''}
                    onChange={e => updatePreferences({ dietType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  >
                    {dietTypes.map(type => (
                      <option key={type} value={type}>{type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Any'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                  <select
                    value={preferences.cookingSkillLevel}
                    onChange={e => updatePreferences({ cookingSkillLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Prep Time (minutes)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={preferences.timeAvailable}
                    onChange={e => updatePreferences({ timeAvailable: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    value={preferences.excludeIngredients?.join(', ') || ''}
                    onChange={e => updatePreferences({ excludeIngredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g., peanuts, shellfish, mushrooms"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions (comma-separated)</label>
                  <input
                    type="text"
                    value={preferences.dietaryRestrictions?.join(', ') || ''}
                    onChange={e => updatePreferences({ dietaryRestrictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g., gluten-free, keto, dairy-free"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Cuisines (comma-separated)</label>
                  <input
                    type="text"
                    value={preferences.preferredCuisines?.join(', ') || ''}
                    onChange={e => updatePreferences({ preferredCuisines: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g., Italian, Mexican, Asian"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    value={preferences.favoriteIngredients?.join(', ') || ''}
                    onChange={e => updatePreferences({ favoriteIngredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g., chicken, tomatoes, garlic"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6">
        {!mealPlan && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Plan Your Meals?
            </h3>
            <p className="text-gray-600 mb-6">
              Let AI create a personalized {selectedDays}-day meal plan based on your preferences and nutritional needs.
            </p>
            
            {/* Current Preferences Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-md mx-auto">
              <h4 className="font-semibold text-gray-800 mb-2">Planning with your preferences:</h4>
              <div className="flex flex-wrap gap-2 text-sm justify-center">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  👨‍🍳 {preferences.cookingSkillLevel}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  ⏱️ {preferences.timeAvailable}min max
                </span>
                {preferences.dietaryRestrictions.length > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    🥗 {preferences.dietaryRestrictions[0]}
                    {preferences.dietaryRestrictions.length > 1 && ' +more'}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleGenerateMealPlan}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Generate {selectedDays}-Day AI Meal Plan
            </button>
          </motion.div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">AI is crafting your personalized meal plan...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
        )}

        <AnimatePresence>
          {mealPlan && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-800">
                    Your {selectedDays}-Day Meal Plan is Ready!
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportMealPlan}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={handleGenerateMealPlan}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Meal Plan Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Meal Plan */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Your Meal Plan
                  </h3>
                  <div className="space-y-4">
                    {(() => {
                      // Debug the actual content
                      console.log('🔍 Meal plan content to parse:', mealPlan.mealPlan);
                      
                      // Clean up the meal plan text - remove any JSON artifacts
                      let cleanedMealPlan = mealPlan.mealPlan;
                      
                      // Remove JSON formatting if present
                      cleanedMealPlan = cleanedMealPlan.replace(/^[{}\s]*"?mealplan"?\s*:?\s*"?/i, '');
                      cleanedMealPlan = cleanedMealPlan.replace(/["{}]*$/, '');
                      cleanedMealPlan = cleanedMealPlan.replace(/\\n/g, '\n');
                      cleanedMealPlan = cleanedMealPlan.replace(/\\"/g, '"');
                      
                      console.log('🧹 Cleaned meal plan:', cleanedMealPlan);
                      
                      // Split by double newlines or day patterns
                      const dayPatterns = cleanedMealPlan.split(/\n\s*\n|\n(?=Day\s+\d+)/i).filter(day => day.trim());
                      
                      // If no proper days found, create a fallback display
                      if (dayPatterns.length === 0 || dayPatterns.every(day => day.length < 10)) {
                        return (
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5">
                            <h4 className="text-lg font-bold text-gray-800 mb-3">Your Meal Plan</h4>
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {cleanedMealPlan || 'AI is generating your meal plan...'}
                            </div>
                          </div>
                        );
                      }
                      
                      return dayPatterns.map((dayPlan, index) => {
                        const lines = dayPlan.split('\n').filter(line => line.trim());
                        
                        // Find day title (Day 1, Day 2, etc.)
                        let dayTitle = `Day ${index + 1}`;
                        let mealLines = lines;
                        
                        const dayTitleLine = lines.find(line => /day\s+\d+/i.test(line));
                        if (dayTitleLine) {
                          dayTitle = dayTitleLine.trim();
                          mealLines = lines.filter(line => line !== dayTitleLine);
                        }
                        
                        // Parse meals from remaining lines
                        const meals = mealLines.filter(line => 
                          line.includes(':') && 
                          (line.toLowerCase().includes('breakfast') || 
                           line.toLowerCase().includes('lunch') || 
                           line.toLowerCase().includes('dinner') ||
                           line.toLowerCase().includes('snack'))
                        );
                        
                        // If no proper meals found, show all content
                        if (meals.length === 0) {
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5"
                            >
                              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                {dayTitle}
                              </h4>
                              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="whitespace-pre-wrap text-gray-700 text-sm">
                                  {mealLines.join('\n')}
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5"
                          >
                            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              {dayTitle}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {meals.map((meal, mealIndex) => {
                                const [mealType, mealName] = meal.split(':').map(part => part.trim());
                                const mealIcons = {
                                  'Breakfast': '🌅',
                                  'Lunch': '☀️',
                                  'Dinner': '🌙',
                                  'Snack': '🍎'
                                };
                                
                                return (
                                  <div key={mealIndex} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-lg">
                                        {mealIcons[mealType as keyof typeof mealIcons] || '🍽️'}
                                      </span>
                                      <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                        {mealType}
                                      </span>
                                    </div>
                                    <p className="text-gray-800 font-medium">
                                      {mealName || meal}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Explanation & Tips */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Why This Plan Works
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {mealPlan.explanation}
                    </p>
                    
                    <div className="border-t border-blue-200 pt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Quick Tips:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Prep ingredients on Sunday for the week</li>
                        <li>• Cook grains and proteins in batches</li>
                        <li>• Keep healthy snacks readily available</li>
                        <li>• Stay hydrated throughout the day</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Time Efficient</h4>
                  <p className="text-sm text-gray-600">
                    Meals designed for {preferences.timeAvailable}min cooking time
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Nutritionally Balanced</h4>
                  <p className="text-sm text-gray-600">
                    Optimized for your dietary preferences
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">AI Personalized</h4>
                  <p className="text-sm text-gray-600">
                    Tailored to your cooking skill level
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 