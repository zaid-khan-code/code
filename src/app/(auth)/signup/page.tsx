'use client';

import { useActionState } from 'react';
import { signUp } from '@/lib/auth/actions';

const initialState = { error: null };

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <div>
      <h1>Sign Up</h1>
      <form action={formAction}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        {state.error && <p>{state.error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p><a href="/login">Login</a></p>
    </div>
  );
}
