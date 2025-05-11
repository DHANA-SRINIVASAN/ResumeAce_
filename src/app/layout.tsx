import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import Link from 'next/link';
import { Sparkles, PanelLeft } from 'lucide-react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebarNavigation } from '@/components/app-sidebar-navigation'; // Import the new client component

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            {/* Sidebar content is now handled by AppSidebarNavigation */}
            <AppSidebarNavigation />
          </Sidebar>

          <SidebarInset>
            {/* Mobile-only header */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <Sparkles className="w-7 h-7 text-primary" />
                    <span className="text-xl font-semibold text-primary">Resume<span className="text-accent">Ace</span></span>
                </Link>
                <SidebarTrigger variant="ghost" size="icon">
                    <PanelLeft className="h-5 w-5"/>
                    <span className="sr-only">Toggle menu</span>
                </SidebarTrigger>
            </header>

            {/* Desktop-only header for trigger */}
            <header className="sticky top-0 z-40 h-16 items-center border-b bg-background/80 backdrop-blur-md px-4 hidden md:flex">
                <SidebarTrigger variant="ghost" size="icon">
                    <PanelLeft className="h-5 w-5"/>
                    <span className="sr-only">Toggle Sidebar</span>
                </SidebarTrigger>
            </header>

            <main className="flex-1">{children}</main>
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
