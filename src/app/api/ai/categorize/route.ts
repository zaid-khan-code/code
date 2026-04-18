import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categorize } from "@/lib/ai/categorize";
import { detectUrgency } from "@/lib/ai/urgency";
import { aiCategorizeSchema } from "@/lib/zod/schemas";

const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || entry.reset < now) {
    rateLimitMap.set(userId, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(user.id)) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const parsed = aiCategorizeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { title, description } = parsed.data;
  const text = `${title} ${description}`;

  const [categoryResult, urgencyResult] = await Promise.all([
    categorize(title, description),
    detectUrgency(text),
  ]);

  return NextResponse.json({ ...categoryResult, ...urgencyResult });
}
