"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppLanguage } from '@/i18n/translations';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth.service';
import { getAccessToken } from '@/lib/axios';

export type Theme = 'light' | 'dark' | 'system' | 'emerald' | 'ocean';
export type Language = AppLanguage;
export type FontSize = 'small' | 'medium' | 'large';
export type Currency = 'USD' | 'CDF';

interface SettingsContextType {
    theme: Theme;
    language: Language;
    fontSize: FontSize;
    currency: Currency;
    city: string;
    setTheme: (theme: Theme) => void;
    setLanguage: (lang: Language) => void;
    setFontSize: (size: FontSize) => void;
    setCurrency: (c: Currency) => void;
    setCity: (city: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(storage.getTheme);
    const [language, setLanguageState] = useState<Language>(storage.getLanguage);
    const [fontSize, setFontSizeState] = useState<FontSize>(storage.getFontSize);
    const [currency, setCurrencyState] = useState<Currency>(storage.getCurrency);
    const [city, setCityState] = useState<string>(storage.getCity);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        storage.setTheme(newTheme);
    };

    const setLanguage = (newLang: Language) => {
        setLanguageState(newLang);
        storage.setLanguage(newLang);

        // Persister la langue côté backend uniquement si l'utilisateur est connecté
        if (typeof window !== 'undefined' && getAccessToken()) {
            authService.updateProfile({ language: newLang }).catch(() => {
                // Erreur silencieuse : la langue reste en local
            });
        }
    };

    const setFontSize = (newSize: FontSize) => {
        setFontSizeState(newSize);
        storage.setFontSize(newSize);
    };

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        storage.setCurrency(newCurrency);
    };

    const setCity = (newCity: string) => {
        setCityState(newCity);
        storage.setCity(newCity);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.remove('theme-light', 'theme-dark', 'theme-emerald', 'theme-ocean', 'dark');
            const resolvedTheme =
                theme === 'system'
                    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                    : theme;
            root.classList.add(`theme-${resolvedTheme}`);
            if (resolvedTheme === 'dark') {
                root.classList.add('dark');
            }
        }
    }, [theme]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            // Remove old font classes if any (assuming prefix font-)
            root.classList.remove('font-sm', 'font-base', 'font-lg'); 
            root.classList.add(`font-${fontSize === 'small' ? 'sm' : fontSize === 'large' ? 'lg' : 'base'}`);
        }
    }, [fontSize]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-lang', language);
            document.documentElement.lang = language;
        }
    }, [language]);

    return (
        <SettingsContext.Provider value={{ theme, language, fontSize, currency, city, setTheme, setLanguage, setFontSize, setCurrency, setCity }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
