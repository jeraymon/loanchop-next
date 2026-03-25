import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

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
          <main className="flex-1 px-2 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-6 bg-background overflow-x-hidden min-h-screen">
            {children}
          </main>
          <footer className="border-t p-6 text-center text-sm text-muted-foreground space-y-2">
            <nav aria-label="Footer" className="flex justify-center gap-4">
              <a href="/" className="hover:text-foreground transition-colors">Calculator</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Use</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</a>
            </nav>
            <p>&copy; {new Date().getFullYear()} LoanChop. All rights reserved.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
