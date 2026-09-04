import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Camera, Mic, MicOff, X, ArrowRight, Sparkles, 
  Store, Tag, ArrowUpRight, Zap 
} from 'lucide-react';
import { getSearchSuggestions } from '../utils/searchHelper';

export default function AdvanceSearchBar({
  initialQuery = '',
  onSearch,
  onOpenPhotoSearch,
  onSelectProduct,
  onBuyNow,
  products = [],
  categories = [],
  placeholder = "Search shirts, sneakers, headphones, local shops...",
  autoFocus = false,
  size = "large" // 'large' | 'medium' | 'compact'
}) {
  const [query, setQuery] = useState(initialQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  // Check speech recognition capability in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API Voice Search
  const handleToggleVoice = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!speechSupported) {
      alert("Voice search is not supported by your current browser. Please type your search query.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        if (onSearch) {
          onSearch(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    setIsFocused(false);
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleSelectSuggestion = (term) => {
    setQuery(term);
    setIsFocused(false);
    if (onSearch) {
      onSearch(term);
    }
  };

  const suggestions = getSearchSuggestions(products, categories, query);
  const showDropdown = isFocused && (query.trim().length > 0 || suggestions.terms.length > 0);

  const POPULAR_TAGS = [
    { label: "Shirts", query: "shirt" },
    { label: "T-Shirts", query: "t-shirt" },
    { label: "Sneakers", query: "sneakers" },
    { label: "Chinos", query: "chinos" },
    { label: "Headphones", query: "headphones" }
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Advance Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className={`group flex items-center transition-all duration-300 relative z-30 ${
          size === 'large'
            ? 'rounded-[1.4rem] border-2 bg-white/95 backdrop-blur-md p-1.5 shadow-[0_12px_36px_rgba(17,17,17,0.07)]'
            : 'rounded-2xl border-2 bg-white p-1 shadow-sm'
        } ${
          isFocused
            ? 'border-[#138A36] ring-4 ring-[#138A36]/10 shadow-[0_14px_44px_rgba(19,138,54,0.14)]'
            : 'border-[#E5E7E5] hover:border-[#138A36]/60'
        }`}
      >
        {/* Search Icon / Visual Badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#777777] group-focus-within:text-[#138A36] transition-colors">
          <Search className="h-5 w-5" />
        </div>

        {/* Input Text Box */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="min-w-0 w-full bg-transparent px-1 py-2.5 text-sm md:text-base font-semibold text-[#111111] outline-none placeholder:text-[#999999] placeholder:font-normal"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors mr-1 cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Action Controls: Voice + Photo + Search CTA */}
        <div className="flex shrink-0 items-center gap-1.5 pr-0.5">
          {/* Voice Search Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-400/50'
                  : 'text-[#666666] hover:text-[#138A36] hover:bg-[#EAF7EE]'
              }`}
              title={isListening ? "Listening... speak now" : "Search by Voice"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Photo Search Button */}
          {onOpenPhotoSearch && (
            <button
              type="button"
              onClick={onOpenPhotoSearch}
              className="flex items-center gap-1.5 rounded-xl p-2 sm:px-3 sm:py-2 text-xs font-bold text-[#138A36] hover:bg-[#EAF7EE] transition-colors cursor-pointer"
              title="Search by Photo"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden md:inline">Photo</span>
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-[#138A36] hover:bg-[#0B6B2B] active:scale-95 text-white font-black text-xs md:text-sm px-3 sm:px-5 py-2.5 sm:py-3 shadow-md transition-all cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Advance Live Dropdown: Instant Product Matches & Smart Suggestions */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-3xl border border-[#E5E7E5] shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-4 space-y-4">
          {/* Category Intent Detected Card */}
          {suggestions.intent?.hasCategoryIntent && (
            <div className="bg-[#EAF7EE] border border-[#CDEED5] p-2.5 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="text-xs font-black text-[#138A36]">
                  Category: {suggestions.intent.categoryName}
                </span>
                {suggestions.intent.attributeQuery && (
                  <span className="text-[11px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded-lg border border-[#CDEED5]">
                    Attribute: "{suggestions.intent.attributeQuery}"
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-[#138A36] uppercase tracking-wider hidden sm:inline">
                Auto-Classified
              </span>
            </div>
          )}

          {/* 1. Direct Instant Product Results */}
          {suggestions.products.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#666666] px-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#138A36]" />
                  <span>Matching Products ({suggestions.products.length})</span>
                </span>
                <span className="text-[#138A36] font-bold">Product-First Match</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setIsFocused(false);
                      if (onSelectProduct) onSelectProduct(prod.id);
                      else if (onSearch) onSearch(prod.name);
                    }}
                    className="group/item flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#F8FAF8] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#138A36] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.images?.[0] || prod.image}
                        alt={prod.name}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111111] group-hover/item:text-[#138A36] truncate transition-colors">
                          {prod.name}
                        </p>
                        <p className="text-[11px] font-semibold text-[#666666] truncate">
                          <span className="text-[#138A36] font-black">₹{prod.price}</span>
                          <span className="mx-1">•</span>
                          <span>{prod.shopName}</span>
                        </p>
                      </div>
                    </div>

                    {onBuyNow ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFocused(false);
                          onBuyNow(prod);
                        }}
                        className="bg-[#138A36] hover:bg-[#0B6B2B] text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>Buy Now</span>
                      </button>
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover/item:text-[#138A36] shrink-0 transition-colors" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Suggested Keywords */}
          {suggestions.terms.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#888888] px-1">
                Suggested Searches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.terms.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(term)}
                    className="flex items-center gap-1.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] border border-[#E5E7E5] hover:border-[#138A36] text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Search className="w-3 h-3 text-[#138A36]" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Popular Trending Searches */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#888888]">Trending:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag.query}
                    type="button"
                    onClick={() => handleSelectSuggestion(tag.query)}
                    className="text-[11px] font-bold text-[#138A36] bg-[#EAF7EE] hover:bg-[#DDF3E3] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFormSubmit}
              className="text-xs font-extrabold text-[#138A36] hover:underline flex items-center gap-1 ml-auto"
            >
              <span>See all results for "{query || 'products'}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
