// src/app/signup/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth'; 
import { LoadingIndicator } from '@/components/loading-indicator';

const PasswordSpecifications = () => (
  <Alert variant="default" className="bg-secondary/30 border-primary/20 mt-4 rounded-lg">
    <ShieldCheck className="h-5 w-5 text-primary" />
    <AlertTitle className="font-semibold text-primary text-base">Password Requirements</AlertTitle>
    <AlertDescription className="pt-1">
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
        <li>Minimum 8 characters</li>
        <li>At least one uppercase letter (A-Z)</li>
        <li>At least one lowercase letter (a-z)</li>
        <li>At least one number (0-9)</li>
        <li>At least one special character (e.g., !@#$%^&*)</li>
      </ul>
    </AlertDescription>
  </Alert>
);

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingForm, setIsLoadingForm] = useState(false); // Renamed to avoid conflict
  const { toast } = useToast();
  const auth = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoggedIn) {
      router.replace('/'); 
    }
  }, [auth.isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your passwords do not match. Please re-enter.",
        variant: "destructive",
      });
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^<>()=+-[\]{}|\\:;'",./?~`])[A-Za-z\d@$!%*?&_#^<>()=+-[\]{}|\\:;'",./?~`]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast({
        title: "Weak Password",
        description: "Password does not meet the security requirements. Please review the criteria.",
        variant: "destructive",
        duration: 7000, // Longer duration for user to read
      });
      return;
    }

    setIsLoadingForm(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate longer API call
    setIsLoadingForm(false);

    toast({
      title: "Sign Up Successful!",
      description: "Your ResumeAce account has been created. Redirecting...",
      variant: "default",
    });
    
    const redirectPath = localStorage.getItem('redirectAfterLogin') || '/'; 
    localStorage.removeItem('redirectAfterLogin'); 
    auth.login(redirectPath);
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
      <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-lg border border-primary/20">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-5 ring-4 ring-primary/20">
            <UserPlus className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-extrabold text-primary">Create Your Account</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-1">
            Join ResumeAce and supercharge your career.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center text-sm font-medium text-foreground/90">
                <UserIcon className="mr-2.5 h-4.5 w-4.5 text-primary/70" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="E.g., Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoadingForm || auth.isLoggedIn}
                className="bg-background/70 border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center text-sm font-medium text-foreground/90">
                <Lock className="mr-2.5 h-4.5 w-4.5 text-primary/70" /> Create Password
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
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-foreground/90">
                <Lock className="mr-2.5 h-4.5 w-4.5 text-primary/70" /> Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoadingForm || auth.isLoggedIn}
                className="bg-background/70 border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <PasswordSpecifications />
            <Button type="submit" className="w-full text-base py-3 mt-6 group" disabled={isLoadingForm || auth.isLoggedIn}>
              {isLoadingForm ? (
                <LoadingIndicator size="sm" text="Creating Account..." />
              ) : (
                <>Create My Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pb-8 pt-4">
          <Link href="/login" className="text-sm text-primary hover:text-accent hover:underline transition-colors">
            Already have an account? Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
