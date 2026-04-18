import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SkillPayload = {
  skill_id: string;
  can_help: boolean;
  needs_help: boolean;
};

export async function GET() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await sb
    .from("user_skills")
    .select("skill_id, can_help, needs_help")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const skillIds = (data ?? []).map((row) => row.skill_id);
  const { data: skillCatalog } = skillIds.length
    ? await sb.from("skills").select("id, name, category").in("id", skillIds)
    : { data: [] };

  const skillMap = new Map((skillCatalog ?? []).map((skill) => [skill.id, skill]));
  const skills = (data ?? []).map((row) => ({
    id: skillMap.get(row.skill_id)?.id ?? row.skill_id,
    name: skillMap.get(row.skill_id)?.name ?? "Unknown",
    category: skillMap.get(row.skill_id)?.category ?? "Other",
    can_help: row.can_help,
    needs_help: row.needs_help,
  }));

  return NextResponse.json({ skills });
}

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { skills?: SkillPayload[] };
  const skills = (body.skills ?? []).filter(
    (skill) => skill.skill_id && (skill.can_help || skill.needs_help)
  );

  const admin = createAdminClient();
  await admin.from("user_skills").delete().eq("user_id", user.id);

  if (skills.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("user_skills").insert(
    skills.map((skill) => ({
      user_id: user.id,
      skill_id: skill.skill_id,
      can_help: skill.can_help,
      needs_help: skill.needs_help,
    }))
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
