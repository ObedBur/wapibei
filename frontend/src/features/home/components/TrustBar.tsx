'use client';

import React from 'react';
import { BadgeCheck, Users, MapPin, Headphones } from 'lucide-react';
import { useT } from '@/i18n/useT';

const items = [
  {
    icon: <BadgeCheck className="size-5 md:size-4 text-[#E67E22] shrink-0" strokeWidth={2.5} />,
    labelKey: 'home.trustBar.verified',
    fallback: 'Vendeurs vérifiés',
  },
  {
    icon: <Users className="size-5 md:size-4 text-[#E67E22] shrink-0" strokeWidth={2.5} />,
    labelKey: 'home.trustBar.direct',
    fallback: 'Connexion directe',
  },
  {
    icon: <MapPin className="size-5 md:size-4 text-[#E67E22] shrink-0" strokeWidth={2.5} />,
    labelKey: 'home.trustBar.local',
    fallback: 'Produits locaux',
  },
  {
    icon: <Headphones className="size-5 md:size-4 text-[#E67E22] shrink-0" strokeWidth={2.5} />,
    labelKey: 'home.trustBar.support',
    fallback: 'Support disponible',
  },
];

export const TrustBar: React.FC = () => {
  const { t } = useT();

  return (
    <div className="w-full bg-slate-50 dark:bg-white/[0.03] border-y border-slate-100 dark:border-white/[0.05]">
      <div className="container mx-auto max-w-7xl px-8 md:px-4">
        <div className="flex items-center justify-between md:justify-center md:gap-12 py-4">
          {items.map((item, i) => {
            const raw = t(item.labelKey);
            const label = raw === item.labelKey ? item.fallback : raw;
            return (
              <React.Fragment key={i}>
                <div className="flex items-center justify-center gap-2 px-1 md:px-0">
                  {item.icon}
                  <span className="hidden md:inline text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap">
                    {label}
                  </span>
                </div>
                {i < items.length - 1 && (
                  <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
