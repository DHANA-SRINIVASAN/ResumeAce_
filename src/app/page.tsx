// src/app/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus, Sparkles, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function HomePortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-4 rounded-full shadow-lg mb-6">
          <Sparkles className="w-16 h-16" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
          Welcome to Resume<span className="text-accent">Ace</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered assistant for crafting the perfect resume, finding job opportunities, and planning your career path.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="items-center text-center">
            <UserPlus className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl">New User?</CardTitle>
            <CardDescription>
              Create an account to unlock all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="items-center text-center">
            <LogIn className="w-12 h-12 text-primary mb-3" />
            <CardTitle className="text-2xl">Existing User?</CardTitle>
            <CardDescription>
              Log in to access your dashboard and tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12 max-w-4xl w-full shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-center text-primary">Explore ResumeAce Features</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
                Access powerful tools to enhance your career journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild variant="outline">
                    <Link href="/candidate-portal">
                        Candidate Portal <ExternalLink className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/recruiter-portal">
                        Recruiter Portal <ExternalLink className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </div>
             <Image
                src="https://picsum.photos/800/300"
                alt="ResumeAce platform illustration"
                width={800}
                height={300}
                className="mt-6 rounded-lg shadow-md mx-auto object-cover"
                data-ai-hint="career platform"
            />
        </CardContent>
      </Card>

      <footer className="text-center mt-16 py-8 border-t border-border w-full max-w-4xl">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ResumeAce. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          AI-generated suggestions should be reviewed for accuracy.
        </p>
      </footer>
    </div>
  );
}
