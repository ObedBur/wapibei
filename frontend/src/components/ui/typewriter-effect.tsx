"use client";

import React, { useState, useEffect, useRef, startTransition, useMemo } from "react";

export interface TypewriterWord {
  word: string;
}

export interface TypewriterEffectProps {
  words?: (TypewriterWord | string)[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  cursorColor?: string;
  cursorWidth?: number;
  cursorHeight?: number; // percentage of font size
  className?: string;
  cursorClassName?: string;
  style?: React.CSSProperties;
  gradient?: boolean;
  loop?: boolean;
}

/**
 * TypewriterEffect
 * Porté fidèlement du composant Framer (TypewriterEffect-BJ1p) avec support React / Next.js
 */
export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  words = [{ word: "au juste prix." }],
  typingSpeed = 90,
  deletingSpeed = 50,
  pauseDuration = 2200,
  cursorColor = "#E67E22",
  cursorWidth = 3,
  cursorHeight = 85,
  className = "",
  cursorClassName = "",
  style = {},
  gradient = true,
  loop = true,
}) => {
  const normalizedWords = useMemo(() => {
    return (words.length > 0 ? words : [{ word: "au juste prix." }]).map((item) =>
      typeof item === "string" ? item : item.word
    );
  }, [words]);

  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const timeoutRef = useRef<number | null>(null);
  const blinkRef = useRef<number | null>(null);

  const currentWord = normalizedWords[wordIndex % normalizedWords.length] || "";

  // Typing / Deleting Loop
  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    let delay = typingSpeed;

    // Frappe du mot en cours
    if (!isDeleting && charIndex < currentWord.length) {
      delay = typingSpeed;
      timeoutRef.current = window.setTimeout(() => {
        startTransition(() => {
          setDisplayed(currentWord.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        });
      }, delay);
    }
    // Fin de frappe : pause de lecture (ou maintien si loop est désactivé)
    else if (!isDeleting && charIndex === currentWord.length) {
      if (!loop) {
        return;
      }
      timeoutRef.current = window.setTimeout(() => {
        startTransition(() => setIsDeleting(true));
      }, pauseDuration);
    }
    // Effacement caractère par caractère
    else if (isDeleting && charIndex > 0) {
      delay = deletingSpeed;
      timeoutRef.current = window.setTimeout(() => {
        startTransition(() => {
          setDisplayed(currentWord.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        });
      }, delay);
    }
    // Fin d'effacement : passage au mot suivant
    else if (isDeleting && charIndex === 0) {
      timeoutRef.current = window.setTimeout(() => {
        startTransition(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % normalizedWords.length);
        });
      }, 400);
    }

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [charIndex, isDeleting, wordIndex, currentWord, typingSpeed, deletingSpeed, pauseDuration, normalizedWords.length, loop]);

  // Reset charIndex quand on change de mot
  useEffect(() => {
    if (!isDeleting) {
      startTransition(() => setCharIndex(0));
    }
  }, [wordIndex, isDeleting]);

  // Clignotement du curseur (500ms)
  useEffect(() => {
    if (blinkRef.current) window.clearInterval(blinkRef.current);
    blinkRef.current = window.setInterval(() => {
      startTransition(() => setShowCursor((v) => !v));
    }, 530);

    return () => {
      if (blinkRef.current) window.clearInterval(blinkRef.current);
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center min-w-1 min-h-1 w-max max-w-full whitespace-pre ${className}`}
      style={style}
      aria-live="polite"
    >
      <span
        style={
          gradient
            ? {
                backgroundImage:
                  "linear-gradient(90deg, #E67E22 0%, #F39C12 35%, #2D5A27 75%, #E67E22 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
            : undefined
        }
      >
        {displayed || "\u00A0"}
      </span>

      {/* Curseur clignotant fidèle à Framer */}
      <span
        aria-hidden="true"
        className={`inline-block align-middle rounded-xs ${cursorClassName}`}
        style={{
          backgroundColor: cursorColor,
          width: `${cursorWidth}px`,
          height: `${cursorHeight}%`,
          marginLeft: "4px",
          marginRight: "2px",
          opacity: showCursor ? 1 : 0,
          transition: "opacity 0.12s ease-in-out",
        }}
      />
    </span>
  );
};

export default TypewriterEffect;
