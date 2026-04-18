import { signOut } from '@/lib/auth/actions';

export default function AdminPage() {
  return (
    <div>
      <h1>THIS IS ADMIN PAGE</h1>
      <form action={signOut}>
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
