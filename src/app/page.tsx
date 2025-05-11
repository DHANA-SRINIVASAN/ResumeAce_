// src/app/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Sparkles, UserCircle, Briefcase, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { LoadingIndicator } from '@/components/loading-indicator';

export default function HomePortalPage() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/10">
        <LoadingIndicator text="Loading session..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      <header className="text-center mb-16 mt-8">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-4 rounded-full shadow-lg mb-6 ring-4 ring-primary/20">
          <Sparkles className="w-16 h-16 animate-pulse" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
          Resume<span className="text-accent">Ace</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Unlock your career potential. AI-powered analysis, tailored job recommendations, and personalized roadmaps to guide your professional journey.
        </p>
      </header>

      <div className="max-w-5xl w-full mb-16">
        {isLoggedIn ? (
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-6">Welcome Back!</h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Choose your portal to continue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40">
                <CardHeader className="items-center text-center pt-8">
                  <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform">
                    <UserCircle className="w-14 h-14" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Candidate Portal</CardTitle>
                  <CardDescription className="text-md min-h-[40px]">
                    Analyze your resume, discover jobs, and chart your career path.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <Button asChild size="lg" className="w-full md:w-3/4 group-hover:bg-accent transition-colors">
                    <Link href="/candidate-portal">Go to Candidate Portal <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40">
                <CardHeader className="items-center text-center pt-8">
                   <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-14 h-14" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Recruiter Portal</CardTitle>
                  <CardDescription className="text-md min-h-[40px]">
                    Evaluate candidate resumes against job descriptions with AI precision.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <Button asChild size="lg" className="w-full md:w-3/4 group-hover:bg-accent transition-colors">
                    <Link href="/recruiter-portal">Go to Recruiter Portal <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group bg-card/80 backdrop-blur-sm border-border hover:border-primary/40">
              <CardHeader className="items-center text-center pt-8">
                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-12 h-12" />
                </div>
                <CardTitle className="text-2xl font-bold">New to ResumeAce?</CardTitle>
                <CardDescription className="text-md min-h-[40px]">
                  Create an account to unlock AI-powered career tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <Button asChild size="lg" variant="default" className="w-full md:w-3/4 group-hover:bg-accent transition-colors">
                  <Link href="/signup">Sign Up Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group bg-card/80 backdrop-blur-sm border-border hover:border-primary/40">
              <CardHeader className="items-center text-center pt-8">
                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform">
                  <LogIn className="w-12 h-12" />
                </div>
                <CardTitle className="text-2xl font-bold">Already a Member?</CardTitle>
                <CardDescription className="text-md min-h-[40px]">
                  Log in to access your personalized dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <Button asChild size="lg" variant="outline" className="w-full md:w-3/4 border-primary text-primary hover:bg-primary/5 hover:text-primary group-hover:border-accent group-hover:text-accent transition-colors">
                  <Link href="/login">Login <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <div className="mt-12 max-w-5xl w-full text-center opacity-80 group">
         <Image
            src="https://picsum.photos/1200/400" // Larger image
            alt="Abstract representation of career growth and technology"
            width={1200}
            height={400}
            className="rounded-xl shadow-2xl mx-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            data-ai-hint="futuristic tech"
            priority // Preload this image as it's LCP for guests
        />
      </div>

      <footer className="text-center mt-20 py-10 border-t border-border/50 w-full">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ResumeAce. Empowering Careers with AI.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-2">
          All AI-generated suggestions are for guidance only. Please review critical information independently.
        </p>
      </footer>
    </div>
  );
}
