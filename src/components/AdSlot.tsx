"use client";

import { useEffect } from "react";

export default function AdSlot() {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense logic skipped or blocked.");
    }
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className="flex flex-col items-center justify-center w-full my-[50px] min-h-[250px]"
    >
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minWidth: "250px", minHeight: "250px", textAlign: "center" }}
        data-ad-client="ca-pub-6158058519275033"
        data-ad-slot="5439322335"
        data-ad-format="rectangle, horizontal"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
