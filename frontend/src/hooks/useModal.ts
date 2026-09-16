'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Gère la fermeture Esc + focus trap pour les modales.
 * @param isOpen - état ouvert/fermé
 * @param onClose - callback fermeture
 * @param options - { restoreFocus, trap }
 */
export function useModal(
    isOpen: boolean,
    onClose: () => void,
    options?: { restoreFocus?: boolean; trap?: boolean }
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const { restoreFocus = true, trap = true } = options || {};

    // Sauvegarder le focus précédent à l'ouverture
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            // Focus le premier élément focusable dans la modale
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    const focusable = containerRef.current.querySelector<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    focusable?.focus();
                }
            });
        }
    }, [isOpen]);

    // Restaurer le focus à la fermeture
    useEffect(() => {
        if (!isOpen && restoreFocus && previousFocusRef.current) {
            previousFocusRef.current.focus();
            previousFocusRef.current = null;
        }
    }, [isOpen, restoreFocus]);

    // Esc handler
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (!isOpen || !trap) return;

        const container = containerRef.current;
        if (!container) return;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusableElements = container.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const firstEl = focusableElements[0];
            const lastEl = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTab);
        return () => container.removeEventListener('keydown', handleTab);
    }, [isOpen, trap]);

    return containerRef;
}
