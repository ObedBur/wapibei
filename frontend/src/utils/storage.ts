import {
  DEFAULT_LANGUAGE,
  resolveLanguage,
  type AppLanguage,
} from '@/i18n/translations';

type Theme = 'light' | 'dark' | 'system' | 'emerald' | 'ocean';
type Language = AppLanguage;
type FontSize = 'small' | 'medium' | 'large';
type Currency = 'USD' | 'CDF';

const LANGUAGE_STORAGE_KEY = 'language';
const LANGUAGE_COOKIE_KEY = 'lang';

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
};

const writeLanguageCookie = (name: string, lang: Language): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(lang)}; path=/; max-age=${
    60 * 60 * 24 * 365
  }; samesite=lax`;
};

export const storage = {
  // Generic methods with type safety and error handling
  getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage`, error);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Always stringify values to ensure consistency
      // So even strings are stored as "value" (valid JSON)
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage`, error);
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage`, error);
    }
  },

  // Typed helpers for specific app settings
  getTheme: (): Theme => storage.getItem<Theme>('theme', 'light'),
  setTheme: (theme: Theme) => storage.setItem('theme', theme),
  
  getLanguage: (): Language => {
    const language = storage.getItem<string>(LANGUAGE_STORAGE_KEY, '');
    const cookieLanguage =
      getCookieValue(LANGUAGE_COOKIE_KEY) ?? getCookieValue(LANGUAGE_STORAGE_KEY);

    return resolveLanguage(language || cookieLanguage || DEFAULT_LANGUAGE);
  },
  setLanguage: (lang: Language) => {
    storage.setItem(LANGUAGE_STORAGE_KEY, lang);

    try {
      writeLanguageCookie(LANGUAGE_COOKIE_KEY, lang);
      // Legacy compatibility for code still reading `language`
      writeLanguageCookie(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to write language cookie', e);
    }
  },
  
  getFontSize: (): FontSize => storage.getItem<FontSize>('fontSize', 'medium'),
  setFontSize: (size: FontSize) => storage.setItem('fontSize', size),

  getCurrency: (): Currency => storage.getItem<Currency>('currency', 'USD'),
  setCurrency: (c: Currency) => storage.setItem('currency', c),

  getCity: (): string => storage.getItem<string>('city', 'Kinshasa'),
  setCity: (city: string) => storage.setItem('city', city),
};
