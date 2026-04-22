// components/sso-login.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Lock, Loader } from 'lucide-react';

export function SSOLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleCallback(code, state);
    }
  }, []);

  const handleCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);

      // Exchange code for token with backend
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { access_token } = await response.json();
      await login(access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    setIsLoading(true);
    // In production: Redirect to SSO provider's authorization endpoint
    // For demo: Use mock token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmFseXN0IiwiZW1haWwiOiJhbmFseXN0QGJhbmsuY29tIiwicm9sZSI6ImFuYWx5c3QiLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiQW5hbHlzdCIsImRlcGFydG1lbnQiOiJGcmF1ZCBQcmV2ZW50aW9uIiwiYmFua19jb2RlIjoiQkFOSzAwMSIsImlhdCI6MTcwNDI3MDQwMH0.sampleSignature';
    
    login(mockToken).then(() => {
      router.push('/dashboard');
    }).catch(err => {
      setError(err.message);
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-background border border-border rounded-xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">FraudShield</h1>
            <p className="text-muted-foreground mt-2">Enterprise Fraud Detection System</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Bank employees: Sign in using your Single Sign-On credentials
              </p>
            </div>

            <button
              onClick={handleSSOLogin}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader size={20} className="animate-spin" />}
              {isLoading ? 'Signing In...' : 'Sign In with SSO'}
            </button>

            {/* Demo Credentials Info */}
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Demo Credentials</p>
              <p className="text-sm text-foreground">
                <span className="font-semibold">Email:</span> analyst@bank.com
              </p>
              <p className="text-sm text-foreground">
                <span className="font-semibold">Role:</span> Analyst
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground mt-8">
            © 2024 FraudShield. All rights reserved. Confidential.
          </p>
        </div>
      </div>
    </div>
  );
}
