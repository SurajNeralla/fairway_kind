"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const urlError = searchParams.get('error');

  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError || '');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid email or password credentials.');
        showToast('Authentication Error', error.message, 'error');
      } else if (data.user) {
        showToast('Welcome Back!', 'Successfully signed in.', 'success');

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .limit(1)
          .maybeSingle();

        const role = profile?.role || data.user.user_metadata?.role;
        const targetPath = next !== '/dashboard' ? next : (role === 'admin' ? '/admin' : '/dashboard');

        router.push(targetPath);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="solid" className="w-full max-w-md space-y-6 bg-surface-container-lowest border border-outline-variant/40 shadow-md">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-primary-fixed/30 text-primary mb-2">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface font-headline-md">Sign In to FairwayKind</h1>
        <p className="text-sm text-on-surface-variant">Access your golf scores, charity impact, and draw participation.</p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-error-container text-xs text-on-error-container flex items-start gap-2.5 border border-error/30">
          <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="golfer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-on-surface-variant" />}
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-on-surface-variant" />}
            required
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full h-12 rounded-full font-semibold"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-on-surface-variant pt-3 border-t border-outline-variant/30">
        <span>Don&apos;t have an account? </span>
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-slate-400 text-xs">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
