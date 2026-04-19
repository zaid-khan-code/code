'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn } from '@/lib/auth/actions';
import AuthShell from '@/components/layout/AuthShell';
import Button from '@/components/ui/Button';

const initialState = { error: null as string | null };

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <AuthShell
      panelLabel="Community Access"
      panelTitle="Enter the support network."
      panelDescription="Authenticate once and move into a polished multi-page flow for asking, offering, and tracking support."
      panelPoints={[
        'Role-aware access for people who need help, can help, or both.',
        'Direct path into dashboard, feed, AI Center, requests, and messages.',
        'Persistent account sessions backed by Supabase Auth.',
      ]}
      formLabel="Login / Signup"
      formTitle="Authenticate your community profile"
      formDescription="Use your account details to continue into the platform."
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-[#006c49] no-underline hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3B342D]">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-[18px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none placeholder:text-[#6c7a71] focus:border-[#006c49]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3B342D]">Password</span>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full rounded-[18px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none placeholder:text-[#6c7a71] focus:border-[#006c49]"
          />
        </label>

        {state.error ? (
          <p className="rounded-[18px] bg-[#FFF1EF] px-4 py-3 text-sm text-[#B42318]">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? 'Signing in...' : 'Continue to dashboard'}
        </Button>
      </form>
    </AuthShell>
  );
}
