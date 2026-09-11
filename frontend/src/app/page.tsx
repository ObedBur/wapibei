import { Suspense } from "react";
import { getHomeSections } from "@/features/home/services/home.service";
import { HomeClient } from "./home-client";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { Hero } from "@/features/home/components/Hero";
import { TrustBar } from "@/features/home/components/TrustBar";
import { CategoriesGrid } from "@/features/home/components/CategoriesGrid";

function HomeLoadingFallback() {
  return (
    <main aria-busy="true" aria-label="Chargement de l'accueil" className="flex min-h-screen flex-1 flex-col bg-white dark:bg-black">
      <Hero slides={[]} />
      <TrustBar />
      <CategoriesGrid categories={[]} isLoading />

      <section aria-label="Chargement des produits" className="py-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-6 flex gap-2 overflow-hidden">
            {[0, 1, 2].map((item) => (
              <div key={item} aria-hidden="true" className="h-10 w-32 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

async function HomeContent() {
  const sections = await getHomeSections(12);

  return (
    <HomeClient
      initialSections={{
        categories: sections.categories || [],
        sellers: sections.sellers || [],
        heroSlides: sections.content.heroSlides || [],
        howItWorksSteps: sections.content.howItWorksSteps || [],
        deals: sections.deals || [],
        newArrivals: sections.newArrivals || [],
        bestSellers: sections.bestSellers || [],
      }}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
