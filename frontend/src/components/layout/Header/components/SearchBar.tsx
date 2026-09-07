'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useT } from '@/i18n/useT';

interface SearchBarProps {
  isSearchExpanded: boolean;
  setIsSearchExpanded: (expanded: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isSearchExpanded, setIsSearchExpanded }) => {
  const { t } = useT();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        // Optionally close search entirely on mobile if clicking outside
        // setIsSearchExpanded(false); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await api.get('/products/suggestions', { params: { q: query } });
        if (res.data.success) {
          setSuggestions(res.data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Suggestions error:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e?: React.FormEvent, selectedQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = selectedQuery || query;
    if (finalQuery.trim()) {
      router.push(`/compare?q=${encodeURIComponent(finalQuery.trim())}`);
      setIsSearchExpanded(false);
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchBarRef} className={`
      ${isSearchExpanded 
        ? 'flex flex-1 items-center animate-in slide-in-from-right-4 duration-300' 
        : 'hidden md:flex flex-1 max-w-[500px] mx-4'} 
      relative group
    `}>
      {isSearchExpanded && (
        <button 
          type="button"
          onClick={() => setIsSearchExpanded(false)}
          className="md:hidden mr-2 p-2 text-gray-500 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}
      <form onSubmit={handleSearch} className="relative w-full">
        <input 
          ref={searchInputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={t('search.placeholder')}  
          className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-full py-2 md:py-2.5 pl-9 md:pl-11 pr-4 text-[13px] md:text-sm focus:ring-2 focus:ring-primary/40 text-deep-blue dark:text-white placeholder-gray-500 transition-all"
        />
        <button type="submit" className="absolute left-2.5 md:left-3.5 top-1.5 md:top-2.5 text-gray-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px] md:text-[20px] group-focus-within:text-primary">search</span>
        </button>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(undefined, s.text)}
                className="w-full flex items-center justify-between gap-2 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b last:border-0 border-gray-50 dark:border-white/5 text-left overflow-hidden"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="material-symbols-outlined text-gray-400 text-[18px] shrink-0">history</span>
                  <span className="text-[13px] md:text-sm font-medium text-gray-700 dark:text-gray-200 truncate block">{s.text}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded shrink-0">
                  {s.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
