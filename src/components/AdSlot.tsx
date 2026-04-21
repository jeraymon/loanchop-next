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

  // Self-contained: outer <div> owns width constraint + 280px reservation
  // (AdSense strips min-height: 0 !important on the immediate <aside> parent
  // of <ins>, but does NOT touch this outer wrapper — so the reservation
  // actually holds). The <aside> centers the served ad within the reserved
  // area. <ins> style is Google's documented responsive baseline.
  return (
    <div className="max-w-3xl lg:max-w-[970px] mx-auto my-[50px] min-h-[280px] flex items-center justify-center">
      <aside
        aria-label="Advertisement"
        className="w-full flex items-center justify-center"
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-6158058519275033"
          data-ad-slot="5439322335"
          data-ad-format="rectangle, horizontal"
          data-full-width-responsive="true"
        />
      </aside>
    </div>
  );
}
