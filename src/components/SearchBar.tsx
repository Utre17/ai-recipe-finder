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
        <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center w-full">
          <div className="relative w-full">
            <div className="absolute left-4 z-10 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for recipes by ingredients or name..."
              className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-lg transition-all shadow-lg"
            />
            <div className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleFilters}
                className={`p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] ${
                  showFilters 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium min-w-[44px] min-h-[44px]"
              >
                Search
              </button>
            </div>
          </div>
          <div className="flex sm:hidden flex-col gap-2 mt-2 w-full">
            <div className="flex gap-2 w-full">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 p-2 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
                >
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleFilters}
                className={`flex-1 p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] ${
                  showFilters 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <Filter className="w-5 h-5 mx-auto" />
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium min-w-[44px] min-h-[44px]"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}; 