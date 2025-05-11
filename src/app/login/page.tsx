// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth(); // Use the auth hook
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.isLoggedIn) {
      router.replace('/candidate-portal'); // Or your default dashboard
    }
  }, [auth.isLoggedIn, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful login
    // In a real app, you'd verify credentials against a backend
    const simulatedSuccess = email.length > 0 && password.length > 0; // Basic check for placeholder

    setIsLoading(false);

    if (simulatedSuccess) {
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
        variant: "default",
      });
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/candidate-portal';
      localStorage.removeItem('redirectAfterLogin'); // Clean up
      auth.login(redirectPath); // Use auth.login to set state and redirect
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. This is a placeholder.",
        variant: "destructive",
      });
    }
  };
  
  // If auth is loading or user is already logged in, show minimal UI or loading
  if (auth.isLoading || auth.isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block p-3 bg-primary/10 rounded-full mx-auto mb-4">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Log in to continue your ResumeAce journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || auth.isLoggedIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || auth.isLoggedIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || auth.isLoggedIn}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Link href="/signup" className="text-sm text-primary hover:underline">
            Don't have an account? Sign Up
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
