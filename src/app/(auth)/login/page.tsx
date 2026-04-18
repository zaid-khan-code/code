'use client';

import { useActionState } from 'react';
import { signIn } from '@/lib/auth/actions';

const initialState = { error: null };

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <div>
      <h1>Login</h1>
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
        <button type="submit">Login</button>
      </form>
      <p><a href="/signup">Sign up</a></p>
    </div>
  );
}
