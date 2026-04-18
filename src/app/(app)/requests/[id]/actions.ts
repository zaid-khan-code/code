'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { notify } from '@/lib/notifications/emit';
import { offerHelpSchema, updateRequestStatusSchema } from '@/lib/zod/schemas';
import { TRUST_EVENTS } from '@/lib/trust/score';

export async function offerHelp(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = offerHelpSchema.safeParse({
    request_id: formData.get('request_id'),
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  // Check request exists and is open
  const { data: request } = await sb
    .from('requests')
    .select('id, author_id, status')
    .eq('id', parsed.data.request_id)
    .single();

  if (!request) return { error: 'Request not found' };
  if (request.status !== 'open') return { error: 'Request is not open' };
  if (request.author_id === profile?.id) {
    return { error: 'Cannot help on your own request' };
  }

  // Check not already offered
  const { data: existing } = await sb
    .from('request_helpers')
    .select('id')
    .eq('request_id', parsed.data.request_id)
    .eq('helper_id', profile?.id)
    .single();

  if (existing) return { error: 'Already offered to help' };

  // Insert helper offer
  const { error } = await sb.from('request_helpers').insert({
    request_id: parsed.data.request_id,
    helper_id: profile?.id,
    note: parsed.data.note || null,
  });

  if (error) return { error: error.message };

  // Emit trust event
  await sb.rpc('trust_emit', {
    p_user: profile?.id,
    p_type: 'offered_help',
    p_delta: TRUST_EVENTS.offered_help,
    p_ref: parsed.data.request_id,
  });

  // Notify request author
  await notify(request.author_id, 'new_helper', {
    request_id: parsed.data.request_id,
    helper_name: profile?.full_name,
  });

  revalidatePath(`/requests/${parsed.data.request_id}`);
  return { error: null };
}

export async function markRequestSolved(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const requestId = formData.get('request_id') as string;
  if (!requestId) return { error: 'Request ID required' };

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  // Verify ownership
  const { data: request } = await sb
    .from('requests')
    .select('id, author_id')
    .eq('id', requestId)
    .single();

  if (!request) return { error: 'Request not found' };
  if (request.author_id !== profile?.id && profile?.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  // Update status
  const { error } = await sb
    .from('requests')
    .update({ status: 'solved', solved_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) return { error: error.message };

  // Emit trust event for author
  await sb.rpc('trust_emit', {
    p_user: request.author_id,
    p_type: 'request_solved_as_author',
    p_delta: TRUST_EVENTS.request_solved_as_author,
    p_ref: requestId,
  });

  // Emit trust events for accepted helpers
  const { data: helpers } = await sb
    .from('request_helpers')
    .select('helper_id')
    .eq('request_id', requestId)
    .eq('status', 'accepted');

  for (const h of helpers || []) {
    await sb.rpc('trust_emit', {
      p_user: h.helper_id,
      p_type: 'request_solved_as_helper',
      p_delta: TRUST_EVENTS.request_solved_as_helper,
      p_ref: requestId,
    });
  }

  revalidatePath(`/requests/${requestId}`);
  return { error: null };
}

export async function acceptHelper(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const helperId = formData.get('helper_id') as string;
  if (!helperId) return { error: 'Helper ID required' };

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  // Get helper record
  const { data: helper } = await sb
    .from('request_helpers')
    .select('id, request_id, helper_id, status')
    .eq('id', helperId)
    .single();

  if (!helper) return { error: 'Helper offer not found' };

  // Verify request ownership
  const { data: request } = await sb
    .from('requests')
    .select('id, author_id, status')
    .eq('id', helper.request_id)
    .single();

  if (!request) return { error: 'Request not found' };
  if (request.author_id !== profile?.id) {
    return { error: 'Not authorized' };
  }

  // Update helper status
  const { error } = await sb
    .from('request_helpers')
    .update({ status: 'accepted' })
    .eq('id', helperId);

  if (error) return { error: error.message };

  // Update request status
  await sb
    .from('requests')
    .update({ status: 'in_progress' })
    .eq('id', helper.request_id);

  // Emit trust event for helper
  await sb.rpc('trust_emit', {
    p_user: helper.helper_id,
    p_type: 'help_accepted',
    p_delta: TRUST_EVENTS.help_accepted,
    p_ref: helper.request_id,
  });

  // Notify helper
  await notify(helper.helper_id, 'status_change', {
    request_id: helper.request_id,
    status: 'accepted',
  });

  revalidatePath(`/requests/${helper.request_id}`);
  return { error: null };
}

export async function deleteRequest(requestId: string): Promise<void> {
  const { profile } = await requireOnboarded();
  const admin = await createAdminClient();

  // Verify ownership or admin
  const { data: request } = await admin
    .from('requests')
    .select('id, author_id')
    .eq('id', requestId)
    .single();

  if (!request) return;
  if (request.author_id !== profile?.id && profile?.role !== 'admin') {
    redirect(`/requests/${requestId}`);
  }

  await admin.from('requests').delete().eq('id', requestId);
  redirect('/explore');
}
