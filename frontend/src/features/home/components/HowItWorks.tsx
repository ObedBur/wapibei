import React from "react";
import { useT } from "@/i18n/useT";

export const HowItWorks = ({ steps = [] }: { steps: any[] }) => {
  const { t } = useT();

  const displaySteps = [
    { title: t('home.howItWorks.steps.step1Title'), description: t('home.howItWorks.steps.step1Desc') },
    { title: t('home.howItWorks.steps.step2Title'), description: t('home.howItWorks.steps.step2Desc') },
    { title: t('home.howItWorks.steps.step3Title'), description: t('home.howItWorks.steps.step3Desc') },
    { title: t('home.howItWorks.steps.step4Title'), description: t('home.howItWorks.steps.step4Desc') },
  ];

  // Clip-paths complexes pour le layout en Z (4 étapes)
  const clipPaths = [
    // 01: En haut à gauche | Pointe vers la droite
    "md:[clip-path:polygon(0%_0%,calc(100%-24px)_0%,100%_50%,calc(100%-24px)_100%,0%_100%)]",
    // 02: En haut à droite | Reçoit à gauche, Pointe vers le bas
    "md:[clip-path:polygon(0%_0%,100%_0%,100%_calc(100%-24px),50%_100%,0%_calc(100%-24px),24px_50%)]",
    // 03: En bas à droite | Reçoit en haut, Pointe vers la gauche
    "md:[clip-path:polygon(24px_0%,50%_24px,100%_0%,100%_100%,24px_100%,0%_50%)]",
    // 04: En bas à gauche | Reçoit à droite
    "md:[clip-path:polygon(0%_0%,100%_0%,calc(100%-24px)_50%,100%_100%,0%_100%)]"
  ];

  const gridClasses = [
    "md:col-start-1 md:row-start-1 md:pr-12",
    "md:col-start-2 md:row-start-1 md:pl-12 md:pb-12",
    "md:col-start-2 md:row-start-2 md:pl-12 md:pt-12",
    "md:col-start-1 md:row-start-2 md:pr-12"
  ];

  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto max-w-7xl px-4">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            {t('home.howItWorks.title')} <span className="text-[#E67E22]">{t('home.howItWorks.titleHighlight')}</span> ?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {displaySteps.slice(0, 4).map((step, index) => (
            <div 
              key={index}
              className={`
                ${gridClasses[index] || ''}
                ${clipPaths[index] || ''}
                bg-slate-100 dark:bg-slate-800/50 p-8 min-h-[220px] rounded-xl md:rounded-none
                flex flex-col justify-center transition-transform hover:-translate-y-1
              `}
            >
              <h3 className="text-4xl sm:text-5xl font-black text-[#E67E22] mb-2">
                0{index + 1}
              </h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {step.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {step.description}
              </p>
              {index < 3 && <div className="w-12 h-1 border-b-2 border-dashed border-slate-300 dark:border-slate-600 mt-4 md:hidden" />}
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};
