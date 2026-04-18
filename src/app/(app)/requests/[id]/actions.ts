'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded } from '@/lib/auth/guards';
import { notify } from '@/lib/notifications/emit';
import { TRUST_EVENTS } from '@/lib/trust/score';
import { offerHelpSchema } from '@/lib/zod/schemas';

export async function offerHelp(formData: FormData): Promise<void> {
  const parsed = offerHelpSchema.safeParse({
    request_id: formData.get('request_id'),
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    return;
  }

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  const { data: request } = await sb
    .from('requests')
    .select('id, author_id, status')
    .eq('id', parsed.data.request_id)
    .single();

  if (!request || request.status !== 'open' || request.author_id === profile?.id) {
    return;
  }

  const { data: existing } = await sb
    .from('request_helpers')
    .select('id')
    .eq('request_id', parsed.data.request_id)
    .eq('helper_id', profile?.id)
    .maybeSingle();

  if (!existing) {
    await sb.from('request_helpers').insert({
      request_id: parsed.data.request_id,
      helper_id: profile?.id,
      note: parsed.data.note || null,
    });

    await sb.rpc('trust_emit', {
      p_user: profile?.id,
      p_type: 'offered_help',
      p_delta: TRUST_EVENTS.offered_help,
      p_ref: parsed.data.request_id,
    });

    await notify(request.author_id, 'new_helper', {
      request_id: parsed.data.request_id,
      helper_name: profile?.full_name ?? profile?.username ?? 'Community helper',
      request_title: formData.get('request_title')?.toString() ?? undefined,
    });
  }

  revalidatePath(`/requests/${parsed.data.request_id}`);
  revalidatePath('/explore');
}

export async function markRequestSolved(formData: FormData): Promise<void> {
  const requestId = formData.get('request_id')?.toString();
  if (!requestId) return;

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  const { data: request } = await sb
    .from('requests')
    .select('id, author_id')
    .eq('id', requestId)
    .single();

  if (!request) return;
  if (request.author_id !== profile?.id && profile?.role !== 'admin') return;

  await sb
    .from('requests')
    .update({ status: 'solved', solved_at: new Date().toISOString() })
    .eq('id', requestId);

  await sb.rpc('trust_emit', {
    p_user: request.author_id,
    p_type: 'request_solved_as_author',
    p_delta: TRUST_EVENTS.request_solved_as_author,
    p_ref: requestId,
  });

  const { data: helpers } = await sb
    .from('request_helpers')
    .select('helper_id')
    .eq('request_id', requestId)
    .eq('status', 'accepted');

  for (const helper of helpers ?? []) {
    await sb.rpc('trust_emit', {
      p_user: helper.helper_id,
      p_type: 'request_solved_as_helper',
      p_delta: TRUST_EVENTS.request_solved_as_helper,
      p_ref: requestId,
    });
  }

  await sb
    .from('request_helpers')
    .update({ status: 'completed' })
    .eq('request_id', requestId)
    .eq('status', 'accepted');

  revalidatePath(`/requests/${requestId}`);
  revalidatePath('/explore');
  revalidatePath('/leaderboard');
}

export async function acceptHelper(formData: FormData): Promise<void> {
  const helperRowId = formData.get('helper_id')?.toString();
  if (!helperRowId) return;

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  const { data: helperRow } = await sb
    .from('request_helpers')
    .select('id, request_id, helper_id, status')
    .eq('id', helperRowId)
    .single();

  if (!helperRow || helperRow.status !== 'offered') return;

  const { data: request } = await sb
    .from('requests')
    .select('id, author_id')
    .eq('id', helperRow.request_id)
    .single();

  if (!request || request.author_id !== profile?.id) return;

  await sb.from('request_helpers').update({ status: 'accepted' }).eq('id', helperRowId);
  await sb.from('requests').update({ status: 'in_progress' }).eq('id', helperRow.request_id);

  await sb.rpc('trust_emit', {
    p_user: helperRow.helper_id,
    p_type: 'help_accepted',
    p_delta: TRUST_EVENTS.help_accepted,
    p_ref: helperRow.request_id,
  });

  await notify(helperRow.helper_id, 'status_change', {
    request_id: helperRow.request_id,
    request_title: formData.get('request_title')?.toString() ?? undefined,
    new_status: 'in progress',
  });

  revalidatePath(`/requests/${helperRow.request_id}`);
}

export async function deleteRequest(requestId: string): Promise<void> {
  const { profile } = await requireOnboarded();
  const sb = await createClient();

  const { data: request } = await sb
    .from('requests')
    .select('id, author_id')
    .eq('id', requestId)
    .single();

  if (!request) {
    redirect('/explore');
  }

  if (request.author_id !== profile?.id && profile?.role !== 'admin') {
    redirect(`/requests/${requestId}`);
  }

  await sb.from('requests').delete().eq('id', requestId);
  redirect('/explore');
}
