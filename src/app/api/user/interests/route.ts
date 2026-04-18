import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await sb
    .from("user_interests")
    .select("interest_id")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const interestIds = (data ?? []).map((row) => row.interest_id);
  const { data: interests } = interestIds.length
    ? await sb.from("interests").select("id, name").in("id", interestIds)
    : { data: [] };

  const interests = (data ?? []).map((row) => ({
    id: interests?.find((interest) => interest.id === row.interest_id)?.id ?? row.interest_id,
    name:
      interests?.find((interest) => interest.id === row.interest_id)?.name ??
      "Unknown",
  }));

  return NextResponse.json({ interests });
}

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { interest_ids?: string[] };
  const interestIds = Array.from(new Set(body.interest_ids ?? []));

  const admin = createAdminClient();
  await admin.from("user_interests").delete().eq("user_id", user.id);

  if (interestIds.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin
    .from("user_interests")
    .insert(interestIds.map((interest_id) => ({ user_id: user.id, interest_id })));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
