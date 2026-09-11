"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { HomeView } from "@/features/home/components/HomeView";

interface HomeClientProps {
  initialSections: {
    categories: any[];
    sellers: any[];
    heroSlides: any[];
    howItWorksSteps: any[];
    deals: any[];
    newArrivals: any[];
    bestSellers: any[];
  };
}

export function HomeClient({ initialSections }: HomeClientProps) {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { setAppReady } = useLoading();
  const router = useRouter();

  // Lazy-load state for recommendations (user-specific)
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);

  // Lazy-load refs for IntersectionObserver
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const [loadRecommendations, setLoadRecommendations] = useState(false);
  const [loadBestSellers, setLoadBestSellers] = useState(false);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === recommendationsRef.current) {
              setLoadRecommendations(true);
            }
            if (entry.target === bestSellersRef.current) {
              setLoadBestSellers(true);
            }
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    if (recommendationsRef.current) observer.observe(recommendationsRef.current);
    if (bestSellersRef.current) observer.observe(bestSellersRef.current);

    return () => observer.disconnect();
  }, []);

  // Redirect ADMIN users away from Home to Admin Dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // The splash is the only first-visit loader for the home route. It fades
  // directly into the mounted page once the session check is complete.
  useEffect(() => {
    if (!authLoading && user?.role !== "ADMIN") {
      setAppReady(true);
    }
  }, [authLoading, setAppReady, user?.role]);

  useEffect(() => {
    if (authLoading) return;

    const fetchRecommendations = async () => {
      try {
        const { getRecommendations } = await import("@/features/products/services/product.service");
        const response = await getRecommendations(user?.id, 12);
        if (response.success) {
          setRecommendations(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setRecommendationsLoaded(true);
      }
    };

    fetchRecommendations();
  }, [user?.id]);

  // Don't render Home content for admins to prevent flash
  if (isAuthenticated && user?.role === "ADMIN") {
    return null;
  }

  return (
    <HomeView
      deals={initialSections.deals || []}
      newArrivals={initialSections.newArrivals || []}
      recommendations={recommendations}
      bestSellers={initialSections.bestSellers || []}
      categories={initialSections.categories || []}
      heroSlides={initialSections.heroSlides || []}
      stores={initialSections.sellers || []}
      howItWorksSteps={initialSections.howItWorksSteps || []}
      loading={{
        categories: false,
        content: false,
        stores: false,
        deals: false,
        newArrivals: false,
        recommendations: !recommendationsLoaded,
        bestSellers: false,
      }}
      recommendationsRef={recommendationsRef}
      bestSellersRef={bestSellersRef}
    />
  );
}
