"use client";

import { useState, useCallback, useEffect } from "react";
import { Link as LinkIcon, Mail, SquareArrowUp } from "lucide-react";

// Inline SVGs for brand icons (no dependency needed)
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
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

  const shareOnX = useCallback(() => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [shareText, url]);

  const shareOnLinkedIn = useCallback(() => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(liUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  }, [url]);

  const shareOnFacebook = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  }, [url]);

  const shareOnWhatsApp = useCallback(() => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }, [shareText, url]);

  const shareOnReddit = useCallback(() => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`;
    window.open(redditUrl, "_blank", "noopener,noreferrer,width=800,height=600");
  }, [shareText, url]);

  const emailSubject = encodeURIComponent(title);
  const emailBody = encodeURIComponent(`${shareText}\n\n${url}`);
  const mailtoHref = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="flex items-center justify-center gap-3 mt-3">
      <span className="text-sm text-muted-foreground">Share:</span>

      {/* Native share — mobile devices with Web Share API */}
      {canNativeShare && (
        <button
          onClick={nativeShare}
          className="text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Share this calculator"
          title="Share"
        >
          <SquareArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Copy link — always visible */}
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

      {/* Platform buttons — desktop fallback row (also visible on mobile alongside native share) */}
      <button
        onClick={shareOnX}
        className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
        aria-label="Share on X"
        title="Share on X"
      >
        <XIcon className="w-5 h-5" />
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="text-[#0A66C2]/60 hover:text-[#0A66C2] transition-colors"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <LinkedInIcon className="w-5 h-5" />
      </button>
      <button
        onClick={shareOnFacebook}
        className="text-[#1877F2]/60 hover:text-[#1877F2] transition-colors"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FacebookIcon className="w-5 h-5" />
      </button>
      <button
        onClick={shareOnWhatsApp}
        className="text-[#25D366]/60 hover:text-[#25D366] transition-colors"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </button>
      <button
        onClick={shareOnReddit}
        className="text-[#FF4500]/60 hover:text-[#FF4500] transition-colors"
        aria-label="Share on Reddit"
        title="Share on Reddit"
      >
        <RedditIcon className="w-5 h-5" />
      </button>
      <a
        href={mailtoHref}
        className="text-slate-500 hover:text-foreground transition-colors"
        aria-label="Share via email"
        title="Share via email"
      >
        <Mail className="w-5 h-5" />
      </a>
    </div>
  );
}
