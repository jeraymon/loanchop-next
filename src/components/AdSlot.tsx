"use client";

import { useEffect, useRef } from "react";

export default function AdSlot() {
  // Guards against React Strict Mode double-push (dev only) and any
  // accidental remount path, which would trigger AdSense's
  // "already has ads" console error. Safe no-op in production.
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current) return;
    try {
      (
        (window as unknown as { adsbygoogle?: object[] }).adsbygoogle ||= []
      ).push({});
      adLoaded.current = true;
    } catch {
      console.warn("AdSense logic skipped or blocked.");
    }
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className="flex flex-col items-center justify-center w-full my-[50px] min-h-[280px]"
    >
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "250px", minHeight: "280px", textAlign: "center" }}
        data-ad-client="ca-pub-6158058519275033"
        data-ad-slot="5439322335"
        data-ad-format="rectangle, horizontal"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
