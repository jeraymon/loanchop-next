import { useCallback, useEffect, useRef, useState } from "react";

// Shared copy-to-clipboard feedback hook.
// Encapsulates the setState/setTimeout dance that previously appeared inline
// across calculator routes and ShareButtons components. Three safety fixes
// vs. the inline pattern:
//   1. Repeated clicks no longer early-clear the "Copied!" indicator —
//      the pending reset timer is cleared before scheduling a new one.
//   2. Timers are cleaned up on unmount, so rapid route navigation doesn't
//      leak setTimeout handlers.
//   3. The legacy `document.execCommand("copy")` fallback path is handled
//      internally — callers don't need to duplicate it.
//
// Consumer surface:
//   - `copy(text)` — happy path. Tries `navigator.clipboard.writeText` first;
//     falls back to a hidden `<input>` + `execCommand("copy")` on browsers
//     that lack the async clipboard API or refuse the write (e.g. some
//     in-app browsers without HTTPS). Auto-marks the indicator on success.
//     Returns `true` on success, `false` on failure.
//   - `markCopied()` — escape hatch for consumers that own a custom write
//     path (e.g. wired into a third-party SDK). Marks the indicator without
//     touching the clipboard.
//
// Usage A (calculator copy-result buttons — fire and ignore):
//   const { copied, copy } = useCopyFeedback();
//   await copy(showWorkLines.join("\n"));
//
// Usage B (ShareButtons or anywhere the caller wants the boolean):
//   const { copied, copy } = useCopyFeedback(2000);
//   const ok = await copy(url);
//   if (!ok) { /* surface a fail toast, etc. */ }

export async function writeTextToClipboard(text: string): Promise<boolean> {
  // Only attempt the async Clipboard API when it can actually succeed:
  // it requires a secure context AND a transient user activation that
  // survives the await. In in-app webviews (Instagram, X, Facebook, etc.)
  // and other non-secure contexts, navigator.clipboard.writeText is
  // present but rejects — and the rejected promise consumes the user
  // activation, leaving the synchronous execCommand fallback below with
  // no gesture to ride on. Short-circuiting to the DOM path here keeps
  // the gesture alive for execCommand("copy").
  const asyncClipboardLikelyToWork =
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function" &&
    typeof window !== "undefined" &&
    window.isSecureContext === true;

  if (asyncClipboardLikelyToWork) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy DOM copy path below.
    }
  }

  if (typeof document === "undefined") return false;

  // Use <textarea>, not <input>: <input> coerces its value to a single line
  // and strips embedded "\n" characters before the copy command runs, which
  // would silently flatten multi-line Show-Your-Work payloads. <textarea>
  // preserves newlines verbatim. The element is positioned off-screen to
  // avoid any visual flash while it is focused/selected.
  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea?.remove();
  }
}

export function useCopyFeedback(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether the component is still mounted. The clipboard write is
  // async, so by the time it resolves the host may have unmounted (rapid
  // route navigation, modal close, etc.). Without this guard, the post-await
  // setState produces a React "update on unmounted component" warning and
  // a leaked timer when markCopied schedules its reset.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const markCopied = useCallback(() => {
    if (!mountedRef.current) return;
    setCopied(true);
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, resetMs);
  }, [resetMs]);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    const ok = await writeTextToClipboard(text);
    if (ok && mountedRef.current) markCopied();
    return ok;
  }, [markCopied]);

  return { copied, copy, markCopied };
}

// Tristate variant of useCopyFeedback for callers that need to surface
// the success/failure outcome (e.g. shared ShowYourWork buttons that show
// "Copy failed" on failure). Same three lifecycle fixes as useCopyFeedback:
//   1. Repeated clicks clearTimeout the previous reset → no early-clear.
//   2. Unmount cleanup → no leaked timers / no setState after unmount.
//   3. Internal navigator → execCommand fallback via writeTextToClipboard.
//
// Usage:
//   const { copyState, triggerCopy } = useCopyResultFeedback();
//   const copyResult = async () => {
//     if (isStale) return;
//     await triggerCopy(text);
//   };
//   // copyState: "idle" | "ok" | "fail"
export type CopyResultState = "idle" | "ok" | "fail";

export function useCopyResultFeedback(resetMs = 1500) {
  const [copyState, setCopyState] = useState<CopyResultState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // See useCopyFeedback above — same unmount-guard rationale.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const triggerCopy = useCallback(async (text: string): Promise<boolean> => {
    const ok = await writeTextToClipboard(text);
    if (!mountedRef.current) return ok;
    setCopyState(ok ? "ok" : "fail");
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopyState("idle");
      timerRef.current = null;
    }, resetMs);
    return ok;
  }, [resetMs]);

  return { copyState, triggerCopy };
}
