import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-[1.75rem] overflow-hidden border border-slate-200/70 dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-pulse flex flex-col">
      <div className="w-full aspect-[4/5] bg-slate-200 dark:bg-white/10 relative p-3 md:p-4 flex flex-col justify-between">

        <div className="flex justify-between items-start">
          <div className="size-7 rounded-full bg-slate-300 dark:bg-white/20" />
          <div className="size-7 rounded-full bg-slate-300 dark:bg-white/20" />
        </div>

        <div className="mt-auto space-y-2">
          <div className="w-3/4 h-4 md:h-5 rounded-md bg-slate-300 dark:bg-white/20" />
          <div className="w-1/2 h-4 md:h-5 rounded-md bg-slate-300 dark:bg-white/20" />

          <div className="w-1/3 h-3 md:h-4 rounded-md bg-slate-300 dark:bg-white/20 mt-2" />
        </div>

      </div>

      <div className="shrink-0 px-4 pb-4 pt-3 bg-white dark:bg-zinc-900">
        <div className="w-full h-9 md:h-10 rounded-[0.85rem] md:rounded-[1rem] bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
};
