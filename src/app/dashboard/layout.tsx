import { Logo } from "@/components/icons/logo";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Logo />
          </Link>
          {/* Future navigation items can go here */}
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl py-8">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} GeoVisual Insights. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
