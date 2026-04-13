"use client";

import { useState, useCallback, useEffect } from "react";
import { Link as LinkIcon, Mail } from "lucide-react";

// Inline SVGs for brand icons (no dependency needed)
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IOSShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Arrow pointing up out of the box */}
      <line x1="12" y1="2" x2="12" y2="15" />
      <polyline points="7 7 12 2 17 7" />
      {/* Open-top box */}
      <path d="M7 10H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

interface ShareButtonsProps {
  title: string;
  solutionLabel?: string;
  solutionValue?: string;
}

export default function ShareButtons({ title, solutionLabel, solutionValue }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const solutionText = [solutionLabel, solutionValue].filter(Boolean).join(" ");
  const shareText = `${title}: ${solutionText}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      // User cancelled or share failed — no-op
    }
  }, [title, shareText, url]);

  const shareOnWhatsApp = useCallback(() => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }, [shareText, url]);

  const shareOnX = useCallback(() => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [shareText, url]);

  const emailSubject = encodeURIComponent(title);
  const emailBody = encodeURIComponent(`${shareText}\n\n${url}`);
  const mailtoHref = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="flex items-center justify-center gap-3 mt-3">
      <span className="text-sm text-muted-foreground">Share:</span>

      {/* Platforms */}
      <button
        onClick={shareOnWhatsApp}
        className="text-[#25D366]/60 hover:text-[#25D366] transition-colors"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </button>
      <button
        onClick={shareOnX}
        className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
        aria-label="Share on X"
        title="Share on X"
      >
        <XIcon className="w-5 h-5" />
      </button>

      {/* Utilities */}
      <button
        onClick={copyLink}
        className="text-slate-500 hover:text-foreground transition-colors relative"
        aria-label={copied ? "Link copied" : "Copy link to this result"}
        title={copied ? "Copied!" : "Copy link"}
      >
        <LinkIcon className="w-5 h-5" />
        {copied && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-0.5 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
      <a
        href={mailtoHref}
        className="text-slate-500 hover:text-foreground transition-colors"
        aria-label="Share via email"
        title="Share via email"
      >
        <Mail className="w-5 h-5" />
      </a>

      {/* Native share — mobile only (overflow for all other apps) */}
      {canNativeShare && (
        <button
          onClick={nativeShare}
          className="text-foreground/60 hover:text-foreground transition-colors"
          aria-label="More sharing options"
          title="More sharing options"
        >
          <IOSShareIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
