"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Target, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedCharity, setSelectedCharity] = useState('c1000000-0000-0000-0000-000000000001');

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user',
            charity_id: selectedCharity,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        showToast('Registration Failed', error.message, 'error');
      } else if (data.user) {
        // Explicitly sync profile table
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'user',
        });

        // Initialize subscription record with chosen charity if not exists
        await supabase.from('subscriptions').upsert({
          user_id: data.user.id,
          stripe_customer_id: `cus_new_${data.user.id.substring(0, 8)}`,
          status: 'incomplete',
          plan_type: 'monthly',
          charity_id: selectedCharity,
          voluntary_charity_percent: 10.00,
        }, { onConflict: 'user_id' });

        showToast('Account Created!', 'Welcome to FairwayKind.', 'success');
        router.push(`/subscribe?charity=${selectedCharity}`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card variant="solid" className="w-full max-w-md space-y-6 bg-surface-container-lowest border border-outline-variant/40 shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary-fixed/30 text-primary mb-2">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface font-headline-md">Join FairwayKind</h1>
          <p className="text-sm text-on-surface-variant">Play golf, enter monthly draws, and support verified charities.</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-error-container text-xs text-on-error-container flex items-start gap-2.5 border border-error/30">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="David Miller"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-on-surface-variant" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="golfer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-on-surface-variant" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="•••••••• (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-on-surface-variant" />}
            required
          />

          {/* Charity Selection during Signup (PRD §08.1) */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-on-surface">
              Select Your Charity Cause (Min 10% Contribution)
            </label>
            <select
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="c1000000-0000-0000-0000-000000000001">Akshaya Patra Foundation — Nutritious mid-day school meals across India</option>
              <option value="c2000000-0000-0000-0000-000000000002">CRY – Child Rights and You — Child education, healthcare, and protection</option>
              <option value="c3000000-0000-0000-0000-000000000003">Goonj — Community development, disaster relief, and rural empowerment</option>
              <option value="c4000000-0000-0000-0000-000000000004">Teach For India — Educational opportunities and leadership in underserved communities</option>
              <option value="c5000000-0000-0000-0000-000000000005">Smile Foundation — Education, healthcare, and livelihood development</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-12 rounded-full font-semibold"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account &amp; Continue
          </Button>
        </form>

        <div className="text-center text-xs text-on-surface-variant pt-3 border-t border-outline-variant/30">
          <span>Already have an account? </span>
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
