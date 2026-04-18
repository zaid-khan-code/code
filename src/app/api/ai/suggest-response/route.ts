import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestResponse } from "@/lib/ai/suggest";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text || typeof text !== "string") return NextResponse.json({ error: "text required" }, { status: 400 });

  const templates = await suggestResponse(text.slice(0, 4000));
  return NextResponse.json({ templates });
}
