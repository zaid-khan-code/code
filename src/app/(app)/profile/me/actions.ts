'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireOnboarded } from '@/lib/auth/guards';
import { updateProfileSchema } from '@/lib/zod/schemas';

export async function updateProfile(
  _prev: { error: string | null; success?: boolean },
  formData: FormData
): Promise<{ error: string | null; success?: boolean }> {
  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get('full_name') || undefined,
    username: formData.get('username') || undefined,
    location: formData.get('location') || undefined,
    bio: formData.get('bio') || undefined,
    avatar_url: formData.get('avatar_url') || undefined,
    user_mode: formData.get('user_mode') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  // Check username uniqueness if changing
  if (parsed.data.username && parsed.data.username !== profile?.username) {
    const { data: existing } = await sb
      .from('profiles')
      .select('id')
      .eq('username', parsed.data.username)
      .single();
    if (existing) {
      return { error: 'Username already taken' };
    }
  }

  const { error } = await sb
    .from('profiles')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile?.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile/me');
  revalidatePath(`/profile/${parsed.data.username || profile?.username}`);
  return { error: null, success: true };
}

export async function deleteAccount(): Promise<void> {
  const { user } = await requireOnboarded();
  const admin = await createAdminClient();

  // Delete user data (cascades handle related records)
  await admin.auth.admin.deleteUser(user.id);

  redirect('/');
}
