import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestTags } from "@/lib/ai/tags";
import { aiSuggestTagsSchema } from "@/lib/zod/schemas";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = aiSuggestTagsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { data: skills } = await sb.from("skills").select("name");
  const skillNames = (skills ?? []).map((s) => s.name);

  const tags = await suggestTags(parsed.data.text, skillNames);
  return NextResponse.json({ tags });
}
