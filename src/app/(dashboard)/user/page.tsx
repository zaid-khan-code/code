import { signOut } from '@/lib/auth/actions';

export default function UserPage() {
  return (
    <div>
      <h1>THIS IS USER PAGE</h1>
      <form action={signOut}>
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
