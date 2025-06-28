import React, { useState, useRef, useEffect } from 'react';
import { searchCities } from '../data/cities';
import { autoCorrectCityName, isLikelyTypo } from '../utils/cityCorrection';
import { ChevronDown, MapPin, Wand2 } from 'lucide-react';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, country?: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "e.g., Paris",
  className = "",
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{name: string, country: string}>>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctedValue, setCorrectedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 1) {
      // Auto-correct the input
      const corrected = autoCorrectCityName(value);
      const isTypo = isLikelyTypo(value);
      
      // Show correction suggestion if it's different from input and likely a typo
      if (corrected !== value && isTypo && corrected.toLowerCase() !== value.toLowerCase()) {
        setCorrectedValue(corrected);
        setShowCorrection(true);
      } else {
        setShowCorrection(false);
        setCorrectedValue('');
      }

      // Search with both original and corrected values
      const originalResults = searchCities(value);
      const correctedResults = corrected !== value ? searchCities(corrected) : [];
      
      // Combine and deduplicate results
      const allResults = [...originalResults];
      correctedResults.forEach(result => {
        if (!allResults.some(r => r.name === result.name && r.country === result.country)) {
          allResults.push(result);
        }
      });
      
      setSuggestions(allResults);
      setIsOpen(allResults.length > 0 || showCorrection);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setShowCorrection(false);
      setCorrectedValue('');
    }
    setHighlightedIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCorrection(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (city: {name: string, country: string}) => {
    onChange(city.name, city.country);
    setIsOpen(false);
    setShowCorrection(false);
    setHighlightedIndex(-1);
  };

  const handleCorrectionClick = () => {
    // Find the country for the corrected city
    const correctedCity = searchCities(correctedValue)[0];
    onChange(correctedValue, correctedCity?.country);
    setIsOpen(false);
    setShowCorrection(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + (showCorrection ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === 0 && showCorrection) {
          handleCorrectionClick();
        } else if (highlightedIndex >= (showCorrection ? 1 : 0) && suggestions[highlightedIndex - (showCorrection ? 1 : 0)]) {
          handleSuggestionClick(suggestions[highlightedIndex - (showCorrection ? 1 : 0)]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setShowCorrection(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 || showCorrection) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full px-3 sm:px-4 py-2 pr-8 sm:pr-10 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-sm sm:text-base ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          } ${className}`}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isOpen && (showCorrection || suggestions.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {/* Auto-correction suggestion */}
          {showCorrection && (
            <button
              type="button"
              onClick={handleCorrectionClick}
              className={`w-full px-3 sm:px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-100 ${
                highlightedIndex === 0 ? 'bg-blue-50 text-blue-700' : 'text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Wand2 size={16} className="text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base">Did you mean "{correctedValue}"?</div>
                  <div className="text-xs sm:text-sm text-blue-500">Auto-correction suggestion</div>
                </div>
              </div>
            </button>
          )}

          {/* Regular city suggestions */}
          {suggestions.map((city, index) => {
            const adjustedIndex = index + (showCorrection ? 1 : 0);
            return (
              <button
                key={`${city.name}-${city.country}`}
                type="button"
                onClick={() => handleSuggestionClick(city)}
                className={`w-full px-3 sm:px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                  adjustedIndex === highlightedIndex ? 'bg-teal-50 text-teal-700' : 'text-gray-900'
                } ${
                  index === suggestions.length - 1 && !showCorrection ? 'rounded-b-lg' : 
                  index < suggestions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">{city.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">{city.country}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;