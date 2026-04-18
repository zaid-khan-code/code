'use client';

import { useActionState } from 'react';
import { signIn } from '@/lib/auth/actions';

const initialState = { error: null as string | null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '900px',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Left dark card */}
        <div style={{
          flex: '0 0 380px',
          background: 'var(--color-hero-dark)',
          color: 'var(--color-hero-dark-fg)',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }} className="auth-left-panel">
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--color-brand)',
            textTransform: 'uppercase',
            marginBottom: '16px',
            display: 'block',
          }}>
            Community Access
          </span>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: '0 0 24px',
            color: '#fff',
          }}>
            Enter the support network.
          </h1>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {[
              'Ask for help from real people',
              'Offer your skills and earn trust',
              'AI-powered request routing',
              'Leaderboard & badge system',
            ].map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
                <span style={{ color: 'var(--color-brand)', marginTop: '1px', flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Right white card */}
        <div style={{
          flex: 1,
          background: 'var(--color-surface)',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            marginBottom: '12px',
            display: 'block',
          }}>
            Login / Signup
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 32px', color: 'var(--color-text)' }}>
            Authenticate your community profile
          </h2>

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <p style={{ margin: 0, fontSize: '13px', color: '#EF4444', background: '#FEE2E2', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              style={{
                background: 'var(--color-brand)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {pending ? 'Signing in…' : 'Continue to dashboard'}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <a href="/signup" style={{ color: 'var(--color-brand)', fontWeight: 500, textDecoration: 'none' }}>
              Sign up
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '14px',
  color: 'var(--color-text)',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};
