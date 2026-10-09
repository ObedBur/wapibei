import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';

// Détecter l'URL du backend selon l'environnement d'exécution
const getApiUrl = () => {
  // Toujours priorité à la variable d'environnement (Vercel, Render, etc.)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Côté serveur (build SSR/SSG) sans variable d'env → localhost dev
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:4000/api';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:4000/api';
  }

  // Fallback LAN (développement sur réseau local)
  return `http://${hostname}:4000/api`;
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Nécessaire pour envoyer/récevoir les cookies HttpOnly
});

// Access token conservé en mémoire (non persisté) pour éviter les failles XSS
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;

// Injecte l'access token et la langue dans chaque requête sortante
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // La langue courante est envoyée pour localiser les données (produits, catégories…)
    try {
      const lang = storage.getLanguage();
      if (lang) {
        config.params = { ...(config.params || {}), lang };
      }
    } catch (error) {
      // SSR : pas de window → on ignore silencieusement
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// File d'attente pour les requêtes bloquées pendant un refresh en cours
let isRefreshing = false;
let successSubscribers: ((token: string) => void)[] = [];
let failureSubscribers: ((error: unknown) => void)[] = [];

const subscribeTokenRefresh = (
  onSuccess: (token: string) => void,
  onFailure: (error: unknown) => void
) => {
  successSubscribers.push(onSuccess);
  failureSubscribers.push(onFailure);
};

// Débloquer toutes les requêtes en attente avec le nouveau token
const onRefreshed = (token: string) => {
  successSubscribers.forEach((cb) => cb(token));
  successSubscribers = [];
  failureSubscribers = [];
};

// Rejeter toutes les requêtes en attente si le refresh a échoué
const onRefreshFailed = (error: unknown) => {
  failureSubscribers.forEach((cb) => cb(error));
  successSubscribers = [];
  failureSubscribers = [];
};

// Intercepteur de réponse : gère le renouvellement automatique du token (401)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // On n'intercepte que les 401 non déjà réessayés, hors routes d'auth
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/profile');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    // Un refresh est déjà en cours : mettre la requête en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          (err) => reject(err)
        );
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Le refresh token est dans le cookie HttpOnly, pas besoin de l'envoyer dans le header
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        {
          timeout: 12_000,
          withCredentials: true, // Envoie le cookie HttpOnly automatiquement
        }
      );

      const { access_token: newAccessToken } = response.data;

      setAccessToken(newAccessToken);
      // Le nouveau refresh token est dans le cookie HttpOnly (rotation), pas dans la réponse

      isRefreshing = false;
      onRefreshed(newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return api(originalRequest);

    } catch (refreshError) {
      isRefreshing = false;
      onRefreshFailed(refreshError);

      setAccessToken(null);

      // Rediriger vers /login seulement si pas déjà sur une page auth
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }
);