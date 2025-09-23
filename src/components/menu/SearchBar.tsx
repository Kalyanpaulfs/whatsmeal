import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useMenuStore } from '../../store/menuStore';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  showFilters?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search dishes, ingredients, or categories...',
  showFilters = false,
  onFilterClick,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { dishes } = useMenuStore();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Get real search results from menu data
  const getSearchResults = () => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchQuery = query.toLowerCase();
    return dishes
      .filter(dish =>
        dish.name.toLowerCase().includes(searchQuery) ||
        dish.description.toLowerCase().includes(searchQuery) ||
        dish.ingredients?.some(ingredient =>
          ingredient.toLowerCase().includes(searchQuery)
        )
      )
      .slice(0, 6); // Limit to 6 results
  };

  const searchResults = getSearchResults();

  return (
    <div className={`relative w-full ${className}`}>
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`relative group transition-all duration-300 ${
          isFocused ? 'scale-105' : ''
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-warm-500 rounded-2xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="relative">
            <Input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              leftIcon={<Search className="w-5 h-5 text-primary-500" />}
              rightIcon={
                query ? (
                  <button
                    onClick={handleClear}
                    className="text-secondary-400 hover:text-primary-600 transition-colors p-1 rounded-full hover:bg-primary-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null
              }
              className={`h-16 text-lg pl-14 pr-12 bg-white/90 backdrop-blur-sm border-2 border-secondary-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                isFocused 
                  ? 'border-primary-500 shadow-2xl ring-4 ring-primary-500/20' 
                  : 'hover:border-primary-300'
              }`}
            />
          </div>
        </div>

        {/* Filter Button */}
        {showFilters && onFilterClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters
          </Button>
        )}
      </motion.div>

      {/* Search Suggestions - Fixed positioning with proper height */}
      {isFocused && query.length > 0 && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-secondary-200 z-50 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3 sticky top-0 bg-white/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-secondary-100">
              <Search className="w-4 h-4 text-primary-500" />
              <p className="text-sm font-medium text-secondary-600">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for "${query}"`
                  : `No results found for "${query}"`
                }
              </p>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((dish, index) => (
                  <motion.div
                    key={dish.id || `search-dish-${index}`}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-primary-50 cursor-pointer transition-colors duration-200"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => {
                      setQuery(dish.name);
                      onSearch(dish.name);
                    }}
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {dish.image ? (
                        <img 
                          src={dish.image} 
                          alt={dish.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-200 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-sm">
                            {dish.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-secondary-900 truncate">{dish.name}</div>
                      <div className="text-xs text-secondary-500 truncate">{dish.description}</div>
                      <div className="text-xs text-primary-600 font-semibold">
                        ₹{dish.price}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-secondary-400" />
                </div>
                <p className="text-secondary-600 text-sm">
                  Try searching for "pizza", "burger", "pasta", or "salad"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;
