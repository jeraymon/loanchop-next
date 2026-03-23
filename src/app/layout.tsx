import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AJ Designer | Engineering Calculators",
  description: "Professional engineering and physics calculators.",
  icons: { icon: "/favicon.svg", apple: "/apple-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6158058519275033"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider variant="inset" collapsible="icon">
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-12 items-center border-b px-4 gap-4 md:hidden">
                <SidebarTrigger />
              </header>
              <main className="flex-1 p-6 lg:p-12 bg-background overflow-x-hidden">
                {children}
              </main>
              <footer className="border-t p-6 text-center text-sm text-muted-foreground space-y-2">
                <nav aria-label="Legal" className="flex justify-center gap-4">
                  <a href="/terms" className="hover:text-foreground transition-colors">Terms of Use</a>
                  <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                  <a href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</a>
                </nav>
                <p>&copy; {new Date().getFullYear()} AJ Designer. All rights reserved.</p>
              </footer>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}