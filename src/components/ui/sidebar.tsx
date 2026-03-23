
"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { createContext, useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SidebarContext = createContext<{
  isExpanded: boolean;
  setExpanded: (isExpanded: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  variant: "drawer" | "inset";
  collapsible: "icon" | "button";
}>({
  isExpanded: true,
  setExpanded: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  variant: "inset",
  collapsible: "button",
});

export const SidebarProvider = ({
  children,
  variant = "inset",
  collapsible = "button",
}: {
  children: React.ReactNode;
  variant?: "drawer" | "inset";
  collapsible?: "icon" | "button";
}) => {
  const [isExpanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reset sidebar to expanded when viewport crosses back above md (768px)
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setExpanded(true);
        setMobileOpen(false);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <SidebarContext.Provider value={{ isExpanded, setExpanded, mobileOpen, setMobileOpen, variant, collapsible }}>
      <div
        className={cn("grid h-screen grid-rows-[auto_1fr_auto]", {
          "md:grid-cols-[auto_1fr]": variant === "inset",
        })}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isExpanded, mobileOpen, setMobileOpen } = useContext(SidebarContext);
  return (
    <nav
      ref={ref}
      aria-label="Main navigation"
      className={cn(
        "h-full bg-slate-50 dark:bg-slate-900 border-r dark:border-slate-800 flex-col",
        // Desktop: always visible, width based on expanded state
        "hidden md:flex",
        isExpanded ? "w-64" : "w-16",
        // Mobile: push layout, shown/hidden based on mobileOpen
        mobileOpen && "!flex w-64",
        className
      )}
      {...props}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-end p-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      {children}
    </nav>
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-16 flex items-center px-6 border-b", className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />;
});
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isExpanded } = useContext(SidebarContext);
  if (!isExpanded) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "px-4 text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1", className)} {...props} />;
});
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("space-y-1", className)} {...props} />;
});
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn("", className)} {...props} />;
});
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    tooltip?: string;
    isActive?: boolean;
  }
>(({ className, isActive, ...props }, ref) => {
  const { isExpanded } = useContext(SidebarContext);
  return (
    <Button
      ref={ref}
      variant="ghost"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-full justify-start focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        {
          "justify-center": !isExpanded,
          "bg-primary/10 text-primary font-semibold": isActive,
        },
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { mobileOpen, setMobileOpen } = useContext(SidebarContext);
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={() => setMobileOpen(!mobileOpen)}
      aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      {...props}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarInset = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col">{children}</div>;
};
