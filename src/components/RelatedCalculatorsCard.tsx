import Link from "next/link";

/**
 * One link entry in a Related Calculators / Related Sites card. Internal links
 * use the Next.js `<Link>`; entries with `external: true` (or any absolute URL
 * to a different domain) render as `<a target="_blank">`.
 */
export interface RelatedLink {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
}

/**
 * Bordered card listing 4-6 topically-adjacent calculator pages. Replaces the
 * hand-rolled inline `<div className="rounded-xl border-2 border-slate-300
 * shadow-md p-5">` cards in the calc page.
 *
 * Visual style matches the loanchop inline pattern: rounded card, plain
 * `<ul>` (no bullets), each entry rendered as `<a className="text-indigo-700
 * hover:underline">Title</a> — short description.` (indigo is loanchop's
 * brand).
 *
 * Internal Next.js Links and external sister-site URLs are auto-discriminated
 * by `external: true` or an http(s) prefix. External links open in new tab
 * with rel="noopener noreferrer".
 */
export default function RelatedCalculatorsCard({
  title = "Related Calculators",
  links,
}: {
  title?: string;
  links: readonly RelatedLink[];
}) {
  return (
    <section className="max-w-3xl mx-auto mt-8 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground p-5 space-y-3 text-sm text-muted-foreground">
      <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => {
          const isExternal = link.external ?? /^https?:\/\//.test(link.href);
          const linkClassName = "text-indigo-700 hover:underline";
          return (
            <li key={link.href}>
              {isExternal ? (
                <a href={link.href} className={linkClassName} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className={linkClassName}>
                  {link.label}
                </Link>
              )}
              {link.description ? (
                <> <span className="text-muted-foreground">— {link.description}</span></>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
