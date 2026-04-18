'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded } from '@/lib/auth/guards';
import { notify } from '@/lib/notifications/emit';
import { createRequestSchema } from '@/lib/zod/schemas';
import { TRUST_EVENTS } from '@/lib/trust/score';
import { categorizeHeuristic } from '@/lib/ai/categorize';
import { detectUrgencyHeuristic } from '@/lib/ai/urgency';
import { suggestTags } from '@/lib/ai/tags';

export async function createRequest(
  formData: FormData
): Promise<{ error: string | null; requestId?: string }> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string | null;
  const urgency = formData.get('urgency') as string;
  const location = formData.get('location') as string | null;
  const tags: string[] = [];

  formData.getAll('tags').forEach((t) => {
    if (t) tags.push(String(t));
  });

  const parsed = createRequestSchema.safeParse({
    title,
    description,
    category: category || undefined,
    urgency: urgency || 'medium',
    tags,
    location: location || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { profile } = await requireOnboarded();
  const sb = await createClient();

  // Re-compute AI suggestions server-side
  const text = `${parsed.data.title} ${parsed.data.description}`;
  const { category: aiCat } = categorizeHeuristic(text);
  const { urgency: aiUrgency, score: urgencyScore } = detectUrgencyHeuristic(text);

  // Get all skills for tag suggestion
  const { data: skillRows } = await sb
    .from('skills')
    .select('name');
  const skillNames = (skillRows ?? []).map((s) => s.name);
  const aiTags = await suggestTags(text, skillNames);

  // Merge client tags with AI suggestions
  const mergedTags = [...new Set([...parsed.data.tags, ...aiTags])].slice(0, 10);

  // Insert request
  const { data: request, error } = await sb
    .from('requests')
    .insert({
      author_id: profile?.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category || aiCat,
      urgency: parsed.data.urgency ?? aiUrgency,
      tags: mergedTags,
      location: parsed.data.location,
      ai_category: aiCat,
      ai_urgency_score: urgencyScore,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  // Emit trust event
  await sb.rpc('trust_emit', {
    p_user: profile?.id,
    p_type: 'posted_request',
    p_delta: TRUST_EVENTS.posted_request,
    p_ref: request.id,
  });

  const matchedSkillIds = (skillRows ?? [])
    .filter((row) => mergedTags.some((tag) => tag.toLowerCase() === row.name.toLowerCase()))
    .map((row) => row.id);

  const helperIds = new Set<string>();
  if (matchedSkillIds.length > 0) {
    const { data: helperRows } = await sb
      .from('user_skills')
      .select('user_id')
      .eq('can_help', true)
      .in('skill_id', matchedSkillIds);

    for (const row of helperRows ?? []) {
      if (row.user_id !== profile?.id) {
        helperIds.add(row.user_id);
      }
    }
  }

  const notifiedUsers = Array.from(helperIds).slice(0, 50);

  for (const userId of notifiedUsers) {
    await notify(userId, 'new_helper', {
      request_id: request.id,
      request_title: parsed.data.title,
    });
  }

  revalidatePath('/explore');
  revalidatePath('/dashboard');
  revalidatePath(`/requests/${request.id}`);
  return { error: null, requestId: request.id };
}
