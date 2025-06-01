import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters } from '@/types/recipe';

interface FilterPanelProps {
  isOpen: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, filters, onFiltersChange }) => {
  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 gradient-text">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diet
                </label>
                <select
                  value={filters.diet || ''}
                  onChange={(e) => updateFilter('diet', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">Any Diet</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten free">Gluten Free</option>
                  <option value="ketogenic">Keto</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  value={filters.cuisine || ''}
                  onChange={(e) => updateFilter('cuisine', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">Any Cuisine</option>
                  <option value="american">American</option>
                  <option value="italian">Italian</option>
                  <option value="mexican">Mexican</option>
                  <option value="chinese">Chinese</option>
                  <option value="indian">Indian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="thai">Thai</option>
                  <option value="french">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">Any Type</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="dessert">Dessert</option>
                  <option value="snack">Snack</option>
                  <option value="appetizer">Appetizer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Cooking Time (min)
                </label>
                <input
                  type="number"
                  value={filters.maxReadyTime || ''}
                  onChange={(e) => updateFilter('maxReadyTime', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 30"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intolerances
                </label>
                <select
                  value={filters.intolerances || ''}
                  onChange={(e) => updateFilter('intolerances', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">No Restrictions</option>
                  <option value="dairy">Dairy Free</option>
                  <option value="egg">Egg Free</option>
                  <option value="gluten">Gluten Free</option>
                  <option value="peanut">Peanut Free</option>
                  <option value="sesame">Sesame Free</option>
                  <option value="seafood">Seafood Free</option>
                  <option value="shellfish">Shellfish Free</option>
                  <option value="soy">Soy Free</option>
                  <option value="tree nut">Tree Nut Free</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort || ''}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">Relevance</option>
                  <option value="popularity">Popularity</option>
                  <option value="healthiness">Healthiness</option>
                  <option value="price">Price</option>
                  <option value="time">Cooking Time</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => onFiltersChange({ query: filters.query })}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 