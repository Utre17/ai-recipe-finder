import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '@/types/recipe';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onToggleFilters, showFilters }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query });
  };

  const handleClear = () => {
    setQuery('');
    onSearch({ query: '' });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 z-10">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for recipes by ingredients or name..."
            className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-lg transition-all shadow-lg"
          />
          
          <div className="absolute right-2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
            
            <button
              type="button"
              onClick={onToggleFilters}
              className={`p-2 rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}; 