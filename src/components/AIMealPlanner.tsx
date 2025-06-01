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
  Info
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';

export const AIMealPlanner: React.FC = () => {
  const { getMealPlan, preferences, isLoading } = useAI();
  const [mealPlan, setMealPlan] = useState<{ mealPlan: string; explanation: string } | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);

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
                  <div className="bg-gray-50 rounded-xl p-6">
                    <pre className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed">
                      {mealPlan.mealPlan}
                    </pre>
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