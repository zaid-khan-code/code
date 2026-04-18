'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signUpSchema, signInSchema, updateProfileSchema } from '@/lib/zod/schemas';
import { TRUST_EVENTS } from '@/lib/trust/score';
import { DEFAULT_ROLE, type Role } from './roles';

export async function signUp(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    user_mode: formData.get('user_mode'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name || null,
        user_mode: parsed.data.user_mode ?? "both",
      },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: 'Signup failed' };

  // Emit trust event for signup
  await supabase.rpc('trust_emit', {
    p_user: data.user.id,
    p_type: 'signup',
    p_delta: TRUST_EVENTS.signup,
  });

  if (parsed.data.user_mode) {
    await supabase
      .from("profiles")
      .update({ user_mode: parsed.data.user_mode })
      .eq("id", data.user.id);
  }

  redirect(parsed.data.user_mode ? `/onboarding?mode=${parsed.data.user_mode}` : '/onboarding');
}

export async function signIn(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication failed' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarded')
    .eq('id', user.id)
    .single();

  const role: Role = (profile?.role as Role) ?? DEFAULT_ROLE;

  if (role === 'admin') redirect('/admin');

  if (!profile?.onboarded) redirect('/onboarding');

  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function updateProfile(
  _prev: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', success: false };

  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get('full_name') || undefined,
    username: formData.get('username') || undefined,
    location: formData.get('location') || undefined,
    bio: formData.get('bio') || undefined,
    avatar_url: formData.get('avatar_url') || undefined,
    user_mode: formData.get('user_mode') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { error: error.message, success: false };

  return { error: null, success: true };
}
