'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signUp } from '@/lib/auth/actions';
import AuthShell from '@/components/layout/AuthShell';
import Button from '@/components/ui/Button';

const initialState = { error: null as string | null };

type RoleType = 'need_help' | 'can_help' | 'both';

const roleOptions: { value: RoleType; label: string; desc: string }[] = [
  { value: 'need_help', label: 'I need help', desc: 'Get support from community members.' },
  { value: 'can_help', label: 'I can help', desc: 'Offer your skills and build trust.' },
  { value: 'both', label: 'Both', desc: 'Ask and offer help in the community.' },
];

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [selectedRole, setSelectedRole] = useState<RoleType>('both');

  return (
    <AuthShell
      panelLabel="Community Access"
      panelTitle="Build a support profile that moves with you."
      panelDescription="Set your identity, choose how you want to participate, and step into the same premium multi-page flow shown across the product."
      panelPoints={[
        'Choose whether you need help, can help, or want both roles at once.',
        'Get routed into onboarding, requests, feed, messages, and trust-building tools.',
        'Keep your profile, contribution history, and community reputation in one place.',
      ]}
      formLabel="Create Account"
      formTitle="Set up your community profile"
      formDescription="Create your account to start requesting help, offering support, and building trust."
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#006c49] no-underline hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form action={formAction} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3B342D]">Full name</span>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Ayesha Khan"
            className="w-full rounded-[18px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none placeholder:text-[#6c7a71] focus:border-[#006c49]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3B342D]">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="community@helphub.ai"
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
            autoComplete="new-password"
            placeholder="Min 8 characters"
            className="w-full rounded-[18px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none placeholder:text-[#6c7a71] focus:border-[#006c49]"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold text-[#3B342D]">Role selection</span>
          <div className="grid gap-3 sm:grid-cols-3">
            {roleOptions.map((role) => {
              const active = selectedRole === role.value;

              return (
                <label
                  key={role.value}
                  className={[
                    'cursor-pointer rounded-[18px] border px-4 py-4 transition-all',
                    active
                      ? 'border-[#006c49] bg-[#d7e6e0] shadow-[0_12px_24px_rgba(16,159,136,0.08)]'
                      : 'border-[#d7e6e0] bg-white hover:border-[#CFE5DF]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="user_mode"
                    value={role.value}
                    checked={active}
                    onChange={() => setSelectedRole(role.value)}
                    className="sr-only"
                  />
                  <p className={active ? 'text-sm font-semibold text-[#006c49]' : 'text-sm font-semibold text-[#1b1c1a]'}>
                    {role.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#54615d]">{role.desc}</p>
                </label>
              );
            })}
          </div>
        </div>

        {state.error ? (
          <p className="rounded-[18px] bg-[#FFF1EF] px-4 py-3 text-sm text-[#B42318]">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
