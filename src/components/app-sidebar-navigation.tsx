// src/components/app-sidebar-navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogIn, LogOut, UserPlus, Sparkles, FileText, MessageSquare } from 'lucide-react';
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
                        <SidebarMenuButton asChild variant="default" size="default" tooltip="Go to Home">
                            <Link href="/">
                                <Home /> Home
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant="default" size="default" tooltip="Resume Templates">
                            <Link href="/templates">
                                <FileText /> Templates
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant="default" size="default" tooltip="Provide Feedback">
                            <Link href="/feedback">
                                <MessageSquare /> Feedback
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {isLoggedIn ? (
                        <>
                            {/* Candidate Portal and Recruiter Portal links removed as per request */}
                            <SidebarMenuItem>
                                <SidebarMenuButton variant="ghost" size="default" onClick={logout} tooltip="Log out">
                                    <LogOut /> Logout
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        <>
                            {/* Show Login and Signup links only if not on login/signup pages */}
                            {pathname !== '/login' && pathname !== '/signup' && (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild variant="default" size="default" tooltip="Log In">
                                            <Link href="/login">
                                                <LogIn /> Login
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild variant="default" size="default" tooltip="Sign Up">
                                            <Link href="/signup">
                                                <UserPlus /> Sign Up
                                            </Link>
                                        </SidebarMenuButton>
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
