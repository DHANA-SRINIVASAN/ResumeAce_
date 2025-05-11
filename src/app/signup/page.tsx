// src/app/signup/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PasswordSpecifications = () => (
  <Alert variant="default" className="bg-secondary/30 border-secondary mt-4">
    <ShieldCheck className="h-5 w-5 text-primary" />
    <AlertTitle className="font-semibold text-primary">Password Requirements</AlertTitle>
    <AlertDescription>
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "Sign Up Attempted",
      description: "This is a placeholder sign up. No actual account has been created.",
      variant: "default",
    });
    // In a real app, you'd handle account creation here
    console.log('Sign up attempt with:', { name, email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-block p-3 bg-primary/10 rounded-full mx-auto mb-4">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
          <CardDescription>Join ResumeAce and take control of your career.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" /> Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <PasswordSpecifications />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Already have an account? Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
