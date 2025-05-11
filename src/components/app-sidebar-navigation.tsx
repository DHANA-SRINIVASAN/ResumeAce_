// src/components/app-sidebar-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Home, UserCircle, LogIn, LogOut, UserPlus, Sparkles } from 'lucide-react'; 
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, SidebarContent } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from './ui/skeleton'; 

export function AppSidebarNavigation() {
  const { isLoggedIn, logout, isLoading } = useAuth();
  const pathname = usePathname(); 

  if (isLoading) {
    return (
      <>
        <SidebarHeader className="p-4 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">
            Resume<span className="text-accent">Ace</span>
          </h1>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton variant="default" size="default" disabled>
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" /> <Skeleton className="h-4 w-20" />
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton variant="default" size="default" disabled>
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" /> <Skeleton className="h-4 w-24" />
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <p className="text-xs text-sidebar-foreground/70 text-center">
            &copy; {new Date().getFullYear()} ResumeAce
            </p>
        </SidebarFooter>
      </>
    );
  }

  // Condition for showing Candidate and Recruiter portal links
  // Changed: Portal links are shown if the user is logged in, regardless of the current page.
  const showPortalLinks = isLoggedIn;

  return (
    <>
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
                    <SidebarMenuButton asChild variant="default" size="default" tooltip="Go to Home">
                        <a><Home /> Home</a>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>

            {isLoggedIn ? (
                <>
                {showPortalLinks && ( 
                    <>
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
                    </>
                )}
                <SidebarMenuItem>
                    <SidebarMenuButton variant="ghost" size="default" onClick={logout} tooltip="Log out">
                        <LogOut /> Logout
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </>
            ) : (
                <>
                {/* Login and Signup links are only shown if not logged in */}
                {pathname !== '/login' && pathname !== '/signup' && (
                    <>
                        <SidebarMenuItem>
                            <Link href="/login" legacyBehavior passHref>
                            <SidebarMenuButton asChild variant="default" size="default" tooltip="Log In">
                                <a><LogIn /> Login</a>
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/signup" legacyBehavior passHref>
                            <SidebarMenuButton asChild variant="default" size="default" tooltip="Sign Up">
                                <a><UserPlus /> Sign Up</a>
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </>
                )}
                </>
            )}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <p className="text-xs text-sidebar-foreground/70 text-center">
            &copy; {new Date().getFullYear()} ResumeAce
            </p>
        </SidebarFooter>
    </>
  );
}
