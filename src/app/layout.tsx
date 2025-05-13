import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import Link from 'next/link';
import { Sparkles, PanelLeft, Briefcase, UserCircle } from 'lucide-react'; // Added Briefcase, UserCircle
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebarNavigation } from '@/components/app-sidebar-navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ResumeAce',
  description: 'AI-Powered Resume Analyzer & Job Recommender',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning for theme toggle */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <AppSidebarNavigation />
          </Sidebar>

          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger variant="ghost" size="icon" className="md:hidden"> {/* Mobile Toggle */}
                        <PanelLeft className="h-5 w-5"/>
                        <span className="sr-only">Toggle menu</span>
                    </SidebarTrigger>
                     <SidebarTrigger variant="ghost" size="icon" className="hidden md:flex"> {/* Desktop Toggle */}
                        <PanelLeft className="h-5 w-5"/>
                        <span className="sr-only">Toggle Sidebar</span>
                    </SidebarTrigger>
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-primary" />
                        <span className="text-xl font-semibold text-primary">Resume<span className="text-accent">Ace</span></span>
                    </Link>
                </div>
                <ThemeToggle />
            </header>
            
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}