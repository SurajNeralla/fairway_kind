"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card variant="solid" className="w-full max-w-lg space-y-6 text-center bg-surface-container-lowest border border-outline-variant/40 shadow-md">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-error-container flex items-center justify-center text-error mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <Badge variant="rose">403 Access Denied</Badge>
          <h1 className="text-2xl font-bold text-on-surface font-headline-md">Administrator Access Required</h1>
          <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
            You do not have permission to view this administrative resource. The admin portal is restricted exclusively to FairwayKind system administrators.
          </p>
        </div>

        <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full rounded-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to User Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-full" leftIcon={<Home className="w-4 h-4" />}>
              Go to Home Page
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
