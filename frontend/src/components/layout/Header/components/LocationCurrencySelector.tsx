'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSettings, Language, Currency } from '@/context/SettingsContext';
import { useEscape } from '@/hooks/useEscape';

const CITIES = [
  { id: 'kinshasa', name: 'Kinshasa', country: 'RDC' },
  { id: 'goma', name: 'Goma', country: 'RDC' },
  { id: 'lubumbashi', name: 'Lubumbashi', country: 'RDC' },
  { id: 'matadi', name: 'Matadi', country: 'RDC' },
  { id: 'bukavu', name: 'Bukavu', country: 'RDC' },
  { id: 'kigali', name: 'Kigali', country: 'Rwanda' },
];

const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'sw', label: 'Kiswahili', short: 'SW' },
];

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: 'CDF', symbol: 'FC', label: 'Franc Congolais (CDF)' },
  { code: 'USD', symbol: '$', label: 'Dollar US (USD)' },
];

export const LocationCurrencySelector: React.FC = () => {
  const { language, setLanguage, currency, setCurrency, city, setCity } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Échap : ferme le panneau et rend le focus au bouton
  useEscape(isOpen, () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  });

  // Fermeture au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const currentCityObj = CITIES.find((c) => c.name === city) || CITIES[0];
  const flagFor = (country: string) => (country === 'Rwanda' ? '🇷🇼' : '🇨🇩');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton d'affichage compact style AliExpress : Drapeau + Langue/Devise */}
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Sélectionner la langue, la devise et la ville"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-300 group cursor-pointer"
      >
        <span className="text-base select-none leading-none">{flagFor(currentCityObj.country)}</span>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[11px] font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#E67E22] transition-colors">
            {currentLangObj.short} / {currency}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium truncate max-w-[55px]">
            {city}
          </span>
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#E67E22] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          strokeWidth={2}
        />
      </button>

      {/* Menu déroulant de configuration */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
            <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Langue, devise & ville
            </span>
            <span className="text-[10px] font-bold text-[#E67E22] bg-[#E67E22]/10 px-2 py-0.5 rounded-full">
              WapiBei
            </span>
          </div>

          <div className="space-y-4 py-3">
            {/* Ville (préférence persistée) */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                Ville
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs font-bold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 outline-none focus:border-[#E67E22]"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.name} className="dark:bg-[#1a1a1a]">
                    {flagFor(c.country)} {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Langue */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                Langue
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between ${
                      language === lang.code
                        ? 'bg-[#E67E22] text-white shadow-xs'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Devise */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                Devise
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => setCurrency(cur.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between ${
                      currency === cur.code
                        ? 'bg-[#2D5A27] text-white shadow-xs'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{cur.symbol} ({cur.code})</span>
                    {currency === cur.code && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
