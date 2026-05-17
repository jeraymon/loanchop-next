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

async function writeTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy DOM copy path below.
  }

  if (typeof document === "undefined") return false;

  let input: HTMLInputElement | null = null;
  try {
    input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    input?.remove();
  }
}

export function useCopyFeedback(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markCopied = useCallback(() => {
    setCopied(true);
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, resetMs);
  }, [resetMs]);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    const ok = await writeTextToClipboard(text);
    if (ok) markCopied();
    return ok;
  }, [markCopied]);

  return { copied, copy, markCopied };
}
