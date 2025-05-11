import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import Link from 'next/link';
import { Briefcase, Home, Sparkles, PanelLeft, UserCircle } from 'lucide-react'; // Added UserCircle
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';

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
            <SidebarHeader className="p-4 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">
                Resume<span className="text-accent">Ace</span>
              </h1>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <SidebarMenuButton asChild variant="default" size="default" tooltip="Go to Home Portal">
                      <a><Home /> Home Portal</a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/candidate-portal" legacyBehavior passHref>
                    <SidebarMenuButton asChild variant="default" size="default" tooltip="Access Candidate Tools">
                       <a><UserCircle /> Candidate Portal</a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/recruiter-portal" legacyBehavior passHref>
                    <SidebarMenuButton asChild variant="default" size="default" tooltip="Access Recruiter Portal">
                       <a><Briefcase /> Recruiter Portal</a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2">
              <p className="text-xs text-sidebar-foreground/70 text-center">
                &copy; {new Date().getFullYear()} ResumeAce
              </p>
            </SidebarFooter>
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

            <main className="flex-1">{children}</main> {/* Removed p-4 md:p-6 lg:p-8 to allow pages to control their own padding */}
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
