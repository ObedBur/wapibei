'use client';

import { useEffect, useRef } from 'react';

/**
 * Ferme un overlay au clavier (Échap) quand il est ouvert.
 * Le handler courant est stocké dans une ref pour éviter de
 * ré-abonner l'écouteur à chaque rendu.
 */
export function useEscape(active: boolean, handler: () => void) {
  const handlerRef = useRef(handler);

  // Synchro du handler courant via un effet (interdiction d'écrire une ref au rendu)
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handlerRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
