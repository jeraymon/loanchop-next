import Image from "next/image";
import Link from "next/link";

interface AuthorBylineProps {
  /** ISO-8601 date (YYYY-MM-DD). Optional but recommended for E-E-A-T freshness. */
  lastReviewed?: string;
}

/** Bottom-of-page author attribution rendered between the EducationalSection
 *  and the Related Calculators card. Links to the local /about/ page (every
 *  site has one). The schema-level author reference for HowTo JSON-LD lives
 *  in seo-constants.ts buildHowToAuthor() and anchors to the canonical
 *  Person @id on ajdesigner — this byline is the visible counterpart. */
export default function AuthorByline({ lastReviewed }: AuthorBylineProps) {
  return (
    <aside
      aria-label="Author and review info"
      className="max-w-3xl mx-auto mt-8 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4"
    >
      <Image
        src="/images/jimmy-raymond.jpg"
        alt=""
        width={40}
        height={40}
        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0 object-cover"
      />
      <div>
        <div>
          Reviewed by{" "}
          <Link
            href="/about/"
            className="font-medium text-slate-800 dark:text-slate-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            Jimmy Raymond
          </Link>
          , Engineer
        </div>
        <div className="text-xs">
          B.S. Environmental Engineering · B.S. Computer Science
          {lastReviewed ? ` · Last reviewed ${lastReviewed}` : null}
        </div>
      </div>
    </aside>
  );
}
