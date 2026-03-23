"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Calculator, FlaskConical, Wrench, Sigma, DollarSign, Droplets, Hash, Heart, Mountain, Thermometer, Search } from "lucide-react";
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
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allCalculators.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 15);
  }, [query]);

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <a href="/" className="font-black tracking-tighter text-xl text-primary">
          AJ
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <div className="relative px-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search calculators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border bg-background px-8 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
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
                        <a href={c.href}>
                          <span className="text-sm">{c.name.replace(" Calculator", "")}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )
              ) : (
                categories.map((cat) => {
                  const Icon = categoryIcons[cat.id] || Calculator;
                  return (
                    <SidebarMenuItem key={cat.id}>
                      <SidebarMenuButton asChild tooltip={cat.label}>
                        <a href={`/#${cat.id}`} className="flex items-center gap-3">
                          <Icon className="size-4" />
                          <span>{cat.label}</span>
                        </a>
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
