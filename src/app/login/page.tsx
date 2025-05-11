// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; 
import { LoadingIndicator } from '@/components/loading-indicator';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingForm, setIsLoadingForm] = useState(false); // Renamed to avoid conflict with auth.isLoading
  const { toast } = useToast();
  const auth = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoggedIn) {
      const intendedRedirect = localStorage.getItem('redirectAfterLogin');
      if (intendedRedirect && intendedRedirect !== '/login' && intendedRedirect !== '/signup') {
        router.replace(intendedRedirect);
        localStorage.removeItem('redirectAfterLogin');
      } else {
        router.replace('/'); 
      }
    }
  }, [auth.isLoggedIn, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const simulatedSuccess = email.length > 0 && password.length > 0; 

    setIsLoadingForm(false);

    if (simulatedSuccess) {
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
        variant: "default",
      });
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/'; 
      localStorage.removeItem('redirectAfterLogin'); 
      auth.login(redirectPath); 
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again. (This is a placeholder response)",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/10">
        <LoadingIndicator text="Loading session..." />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-lg border border-primary/20">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-5 ring-4 ring-primary/20">
            <LogIn className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-extrabold text-primary">Welcome Back!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-1">
            Log in to continue your ResumeAce journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-sm font-medium text-foreground/90">
                <Mail className="mr-2.5 h-4.5 w-4.5 text-primary/70" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoadingForm || auth.isLoggedIn}
                className="bg-background/70 border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center text-sm font-medium text-foreground/90">
                <Lock className="mr-2.5 h-4.5 w-4.5 text-primary/70" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoadingForm || auth.isLoggedIn}
                className="bg-background/70 border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full text-base py-3 group" disabled={isLoadingForm || auth.isLoggedIn}>
              {isLoadingForm ? (
                <LoadingIndicator size="sm" text="Logging in..." />
              ) : (
                <>Login to Your Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pb-8 pt-4">
          <Link href="/signup" className="text-sm text-primary hover:text-accent hover:underline transition-colors">
            Don't have an account? Sign Up
          </Link>
          <Link href="#" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
