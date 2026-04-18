import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCategoryTrends, getSkillGaps, getUrgencyStats } from "@/lib/ai/insights";

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [trends, gaps, urgency] = await Promise.all([
    getCategoryTrends(sb),
    getSkillGaps(sb),
    getUrgencyStats(sb),
  ]);

  return NextResponse.json({ trends, gaps, urgency });
}
