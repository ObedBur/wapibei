'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { VendorSidebar } from "@/components/layout/VendorSidebar";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const { setAppReady } = useLoading();
  const isAdminPage = pathname?.startsWith('/admin');
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/settings');

  // Splash screen: signal ready globally once the auth bootstrap has finished.
  // This runs on every initial full page load (any URL), so the splash never
  // relies on individual pages opting in.
  useEffect(() => {
    if (!authLoading) {
      setAppReady(true);
    }
  }, [authLoading, setAppReady]);

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isAdminPage) {
    return <>{children}</>;
  }

  if (isDashboardPage) {
    return (
      <div className="flex flex-row min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#1E293B] dark:text-slate-100 font-sans antialiased">
        {/* Left column sidebar — desktop only (hidden on mobile/tablet) */}
        <div className="hidden lg:block shrink-0 z-50">
          <VendorSidebar user={user} />
        </div>

        {/* Right column: Navbar + Main content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
          <DashboardHeader />

          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 min-h-[calc(100vh-96px)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
