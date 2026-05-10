import Image from "next/image";
import Link from "next/link";

interface AuthorBylineProps {
  /** ISO-8601 date (YYYY-MM-DD). Optional but recommended for E-E-A-T freshness. */
  lastReviewed?: string;
}

/** Bottom-of-page author attribution rendered between the EducationalSection
 *  and the Related Calculators card. Pairs with the Person JSON-LD on the
 *  /about/ page (Person @id resolves to {SITE_URL}/about/#jimmy). The link
 *  always points to the local /about/ since every sister site now has one. */
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
            className="font-medium text-slate-800 dark:text-slate-200 hover:underline"
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
