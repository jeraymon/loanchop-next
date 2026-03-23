"use client";

import { useEffect } from "react";

export default function AdSlot() {
  useEffect(() => {
    try {
      // @ts-ignore
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense logic skipped or blocked.");
    }
  }, []);

  return (
    <aside 
      aria-label="Advertisement"
      className="flex flex-col items-center justify-center w-full my-[50px] min-h-[250px] overflow-hidden"
    >
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
        Advertisement
      </span>
      
      <div className="w-full max-w-[728px] bg-slate-50/50 dark:bg-slate-900/20 rounded border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-6158058519275033"
          data-ad-slot="5439322335"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}