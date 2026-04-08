"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Breadcrumb = {
  label: string;
  href: string;
};

export type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb[];
};

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((breadcrumb, index) => {
          const hashIndex = breadcrumb.href.indexOf('#');
          const hasHash = hashIndex !== -1;
          return (
            <li key={breadcrumb.href} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
              )}
              <Link
                href={breadcrumb.href}
                onClick={hasHash ? (e) => {
                  e.preventDefault();
                  const id = breadcrumb.href.slice(hashIndex + 1);
                  if (pathname === "/") {
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    window.history.replaceState(null, "", breadcrumb.href);
                  } else {
                    router.push(breadcrumb.href);
                  }
                } : undefined}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {breadcrumb.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
