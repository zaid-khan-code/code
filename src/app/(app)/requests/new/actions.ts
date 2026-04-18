'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireOnboarded } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { notify } from '@/lib/notifications/emit';
import { createRequestSchema } from '@/lib/zod/schemas';
import { TRUST_EVENTS } from '@/lib/trust/score';
import { categorizeHeuristic } from '@/lib/ai/categorize';
import { detectUrgencyHeuristic } from '@/lib/ai/urgency';
import { suggestTags } from '@/lib/ai/tags';

export async function createRequest(
  _prev: { error: string | null; requestId?: string },
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
  const { category: aiCat, confidence: catConfidence } = categorizeHeuristic(text);
  const { urgency: aiUrgency, score: urgencyScore } = detectUrgencyHeuristic(text);

  // Get all skills for tag suggestion
  const { data: skillsList = [] } = await sb
    .from('skills')
    .select('name');
  const skillNames = skillsList.map((s) => s.name);
  const aiTags = suggestTags(text, skillNames);

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
      urgency: parsed.data.urgency || aiUrgency,
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

  // Notify matching helpers (users with can_help=true on matching tags)
  const { data: matchingUsers = [] } = await sb
    .from('user_skills')
    .select('user_id')
    .eq('can_help', true)
    .in(
      'skill_id',
      mergedTags
        .map((t) => skillNames.find((s) => s.toLowerCase() === t.toLowerCase()))
        .filter(Boolean)
        .map((t) => t!)
    )
    .neq('user_id', profile?.id)
    .limit(50);

  // Get unique user IDs
  const notifiedUsers = new Set<string>();
  for (const u of matchingUsers) {
    if (!notifiedUsers.has(u.user_id)) {
      notifiedUsers.add(u.user_id);
      await notify(u.user_id, 'new_helper', {
        request_id: request.id,
        request_title: parsed.data.title,
      });
    }
  }

  revalidatePath('/explore');
  return { error: null, requestId: request.id };
}
