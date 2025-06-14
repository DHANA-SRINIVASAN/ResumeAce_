'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Simple Toast component
interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    return (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
            <div className="flex justify-between items-center">
                <p>{message}</p>
                <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
                    ×
                </button>
            </div>
        </div>
    );
};

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenError, setTokenError] = useState('');

    // Toast state
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showToast, setShowToast] = useState(false);

    // Toast function
    const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        // Auto hide after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    useEffect(() => {
        if (!token) {
            setTokenError('Invalid or missing reset token. Please request a new password reset link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            showToastMessage('Invalid or missing reset token', 'error');
            return;
        }

        if (password.length < 8) {
            showToastMessage('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToastMessage('Passwords do not match', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setIsSuccess(true);
            showToastMessage('Your password has been reset successfully');

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error: any) {
            showToastMessage(error.message || 'An error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-screen py-10">
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 space-y-1">
                    <h2 className="text-2xl font-bold">Reset Password</h2>
                    <p className="text-gray-500">
                        Create a new password for your account
                    </p>
                </div>

                <div className="p-6 pt-0">
                    {tokenError ? (
                        <div className="space-y-4 text-center">
                            <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-red-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium">Invalid Reset Link</h3>
                            <p className="text-gray-500">
                                {tokenError}
                            </p>
                            <Link href="/forgot-password">
                                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Request New Reset Link
                                </button>
                            </Link>
                        </div>
                    ) : isSuccess ? (
                        <div className="space-y-4 text-center">
                            <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-green-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium">Password Reset Successful</h3>
                            <p className="text-gray-500">
                                Your password has been reset successfully. You will be redirected to the login page shortly.
                            </p>
                            <Link href="/login">
                                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Go to Login
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    minLength={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500">
                                    Password must be at least 8 characters long
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="p-6 pt-0 flex justify-center border-t">
                    <div className="text-sm text-gray-500">
                        Remember your password?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}