import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { MealPlan } from '@/types/recipe';
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

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  isOpen,
  onClose,
  mealPlans
}) => {
  // Mock nutrition data - in a real app this would be calculated from meal plans
  const macroData = [
    { name: 'Protein', value: 25, color: '#8B5CF6' },
    { name: 'Carbs', value: 50, color: '#06B6D4' },
    { name: 'Fat', value: 25, color: '#F59E0B' },
  ];

  const weeklyCalories = [
    { day: 'Mon', calories: 2100, target: 2000 },
    { day: 'Tue', calories: 1950, target: 2000 },
    { day: 'Wed', calories: 2200, target: 2000 },
    { day: 'Thu', calories: 1800, target: 2000 },
    { day: 'Fri', calories: 2300, target: 2000 },
    { day: 'Sat', calories: 2400, target: 2000 },
    { day: 'Sun', calories: 1900, target: 2000 },
  ];

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
          className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Nutrition Dashboard</h2>
                  <p className="text-white/80">Track your nutritional goals and progress</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
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
                    <div className="text-3xl font-bold text-blue-600">2,050</div>
                    <div className="text-sm text-gray-600">calories</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-gray-800">Goal Progress</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">on track</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-purple-600" />
                      <span className="font-semibold text-gray-800">Protein Goal</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">125g</div>
                    <div className="text-sm text-gray-600">daily average</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                      <span className="font-semibold text-gray-800">Weekly Trend</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">↗ 5%</div>
                    <div className="text-sm text-gray-600">improvement</div>
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
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {macroData.map((entry, index) => (
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
                        <BarChart data={weeklyCalories}>
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
                      <LineChart data={weeklyCalories}>
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