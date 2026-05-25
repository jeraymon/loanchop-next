"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Calculator, FlaskConical, Wrench, Sigma, DollarSign, Droplets, Hash, Heart, Mountain, Thermometer, Search, X } from "lucide-react";
import { categories } from "@/app/calculator-catalog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const categoryIcons: Record<string, React.ElementType> = {
  physics: FlaskConical,
  thermodynamics: Thermometer,
  "fluid-mechanics": Droplets,
  engineering: Wrench,
  math: Sigma,
  finance: DollarSign,
  environmental: Droplets,
  dimensionless: Hash,
  everyday: Heart,
  geotechnical: Mountain,
};

const allCalculators = categories.flatMap((cat) =>
  cat.calculators.filter((c) => c.live).map((c) => ({ ...c, category: cat.label }))
);

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const clearSearch = React.useCallback(() => {
    setQuery("");
    // Re-focus the input after clearing so mobile keyboards stay open and
    // keyboard-only users don't lose their place when the X unmounts.
    searchRef.current?.focus();
  }, []);
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allCalculators.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 15);
  }, [query]);
  // Highlight the category that contains the calculator the user is currently
  // viewing. Strips trailing slashes from both sides so the comparison works
  // regardless of whether catalog hrefs include them.
  const activeCategoryId = React.useMemo(() => {
    const normalize = (s: string) => s.replace(/\/+$/, "") || "/";
    const target = normalize(pathname);
    for (const cat of categories) {
      if (cat.calculators.some((c) => c.live && normalize(c.href) === target)) {
        return cat.id;
      }
    }
    return null;
  }, [pathname]);

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="font-black tracking-tighter text-xl text-primary">
          LoanChop
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <div className="relative px-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search calculators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") clearSearch();
                }}
                className="w-full rounded-md border bg-background pl-8 pr-10 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {query.trim() ? (
                results.length === 0 ? (
                  <li className="px-4 py-2 text-sm text-muted-foreground">No matches</li>
                ) : (
                  results.map((c) => (
                    <SidebarMenuItem key={c.href}>
                      <SidebarMenuButton asChild tooltip={c.category} isActive={pathname === c.href + "/"}>
                        <Link href={c.href}>
                          <span className="text-sm">{c.name.replace(" Calculator", "")}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )
              ) : (
                categories.map((cat) => {
                  const Icon = categoryIcons[cat.id] || Calculator;
                  return (
                    <SidebarMenuItem key={cat.id}>
                      <SidebarMenuButton asChild tooltip={cat.label} isActive={cat.id === activeCategoryId}>
                        <Link
                          href={`/#${cat.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (pathname === "/") {
                              document.getElementById(cat.id)?.scrollIntoView({ behavior: "smooth" });
                              window.history.replaceState(null, "", `/#${cat.id}`);
                            } else {
                              router.push(`/#${cat.id}`);
                            }
                          }}
                          className="flex items-center gap-3"
                        >
                          <Icon className="size-4" />
                          <span>{cat.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
