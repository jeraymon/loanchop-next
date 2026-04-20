import "./globals.css";
import Script from "next/script";
import { Inter, Geist } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={inter.className}>
        {/* AdSense library — lazyOnload defers script until after window 'load',
            keeping first-party hydration off the critical path. */}
        <Script
          id="adsbygoogle-init"
          strategy="lazyOnload"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6158058519275033"
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="flex-1 px-2 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-6 bg-background overflow-x-hidden min-h-screen">
            {children}
          </main>
          <footer className="border-t p-6 text-center text-sm text-muted-foreground space-y-2">
            <nav aria-label="Footer" className="flex justify-center gap-4">
              <Link href="/" className="hover:text-foreground transition-colors">Calculator</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
              <a href="mailto:aj@ajdesigner.com" className="hover:text-foreground transition-colors">Contact</a>
            </nav>
            <p suppressHydrationWarning>&copy; {new Date().getFullYear()} LoanChop. All rights reserved.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
