import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { MealPlan } from '@/types/recipe';
import { format, startOfWeek, addDays } from 'date-fns';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface NutritionDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlans: MealPlan[];
}

// Helper function to calculate nutrition from meal plans
const calculateNutritionFromMealPlans = (mealPlans: MealPlan[]) => {
  if (mealPlans.length === 0) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      dailyAverages: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      weeklyCalories: [],
      macroData: [
        { name: 'Protein', value: 33, color: '#8B5CF6' },
        { name: 'Carbs', value: 34, color: '#06B6D4' },
        { name: 'Fat', value: 33, color: '#F59E0B' },
      ]
    };
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Calculate nutrition from actual recipes
  mealPlans.forEach(plan => {
    const recipe = plan.recipe;
    const servings = plan.servings;
    
    // Use Spoonacular nutrition data if available, otherwise estimate
    const baseCalories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 
                        recipe.readyInMinutes * 20; // Rough estimate: 20 cal per minute
    const baseProtein = recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 
                       baseCalories * 0.15 / 4; // 15% of calories from protein
    const baseCarbs = recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 
                     baseCalories * 0.50 / 4; // 50% of calories from carbs
    const baseFat = recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 
                   baseCalories * 0.35 / 9; // 35% of calories from fat

    totalCalories += baseCalories * servings;
    totalProtein += baseProtein * servings;
    totalCarbs += baseCarbs * servings;
    totalFat += baseFat * servings;
  });

  const uniqueDays = new Set(mealPlans.map(plan => plan.date)).size;
  const dailyAverages = {
    calories: uniqueDays > 0 ? Math.round(totalCalories / uniqueDays) : 0,
    protein: uniqueDays > 0 ? Math.round(totalProtein / uniqueDays) : 0,
    carbs: uniqueDays > 0 ? Math.round(totalCarbs / uniqueDays) : 0,
    fat: uniqueDays > 0 ? Math.round(totalFat / uniqueDays) : 0
  };

  // Calculate macro percentages
  const totalMacroCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);
  const macroData = totalMacroCalories > 0 ? [
    { 
      name: 'Protein', 
      value: Math.round((totalProtein * 4 / totalMacroCalories) * 100), 
      color: '#8B5CF6' 
    },
    { 
      name: 'Carbs', 
      value: Math.round((totalCarbs * 4 / totalMacroCalories) * 100), 
      color: '#06B6D4' 
    },
    { 
      name: 'Fat', 
      value: Math.round((totalFat * 9 / totalMacroCalories) * 100), 
      color: '#F59E0B' 
    },
  ] : [
    { name: 'Protein', value: 33, color: '#8B5CF6' },
    { name: 'Carbs', value: 34, color: '#06B6D4' },
    { name: 'Fat', value: 33, color: '#F59E0B' },
  ];

  // Calculate weekly calories
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyCalories = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayMeals = mealPlans.filter(plan => plan.date === dayStr);
    
    const dayCalories = dayMeals.reduce((sum, plan) => {
      const recipeCalories = plan.recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 
                            plan.recipe.readyInMinutes * 20;
      return sum + (recipeCalories * plan.servings);
    }, 0);

    return {
      day: format(day, 'EEE'),
      calories: Math.round(dayCalories),
      target: 2000
    };
  });

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    dailyAverages,
    weeklyCalories,
    macroData
  };
};

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  isOpen,
  onClose,
  mealPlans
}) => {
  // Calculate real nutrition from meal plans
  const nutrition = useMemo(() => calculateNutritionFromMealPlans(mealPlans), [mealPlans]);

  // If you add any local state in the future, reset it here:
  useEffect(() => {
    // Example: reset any local state if mealPlans changes
    // setSomeState(defaultValue);
  }, [mealPlans]);

  const nutrients = [
    { name: 'Vitamin C', current: 85, target: 100, unit: 'mg' },
    { name: 'Iron', current: 12, target: 15, unit: 'mg' },
    { name: 'Calcium', current: 950, target: 1000, unit: 'mg' },
    { name: 'Fiber', current: 28, target: 35, unit: 'g' },
  ];

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
          className="bg-white rounded-none sm:rounded-3xl max-w-full sm:max-w-6xl w-full max-h-[90vh] overflow-hidden p-2 sm:p-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Nutrition Dashboard</h2>
                  <p className="text-white/80 text-sm">Track your nutritional goals and progress</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors min-w-[44px] min-h-[44px]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {mealPlans.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Meal Plans Yet</h3>
                <p className="text-gray-600">Create some meal plans to see your nutrition analytics</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-gray-800">Daily Average</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {nutrition.dailyAverages.calories.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">calories</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-gray-800">Goal Progress</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {nutrition.dailyAverages.calories > 0 ? Math.round((nutrition.dailyAverages.calories / 2000) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">of 2000 cal target</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-purple-600" />
                      <span className="font-semibold text-gray-800">Protein Goal</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {nutrition.dailyAverages.protein}g
                    </div>
                    <div className="text-sm text-gray-600">daily average</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                      <span className="font-semibold text-gray-800">Total Meals</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">{mealPlans.length}</div>
                    <div className="text-sm text-gray-600">planned</div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Macronutrient Breakdown */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Macronutrient Breakdown</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={nutrition.macroData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {nutrition.macroData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Weekly Calories */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Calorie Intake</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={nutrition.weeklyCalories}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="calories" fill="#8B5CF6" />
                          <Bar dataKey="target" fill="#E5E7EB" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Nutrient Goals */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Nutrient Goals Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {nutrients.map((nutrient, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{nutrient.name}</span>
                          <span className="text-sm text-gray-600">
                            {nutrient.current}{nutrient.unit} / {nutrient.target}{nutrient.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(nutrient.current / nutrient.target) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round((nutrient.current / nutrient.target) * 100)}% of daily goal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Trend */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Calorie Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={nutrition.weeklyCalories}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="#8B5CF6" 
                          strokeWidth={3}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#E5E7EB" 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Nutrition Tips</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">
                        Try to include a variety of colorful vegetables in your meals for diverse nutrients.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">
                        Aim for 25-30g of fiber daily to support digestive health.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">
                        Include lean protein sources in each meal to maintain muscle mass.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">
                        Stay hydrated with 8-10 glasses of water daily.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 