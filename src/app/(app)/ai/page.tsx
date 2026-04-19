import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getCategoryTrends,
  getSkillGaps,
  getUrgencyStats,
  getSuggestedRequestsForUser,
  getUserActivitySummary,
} from "@/lib/ai/insights";
import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

const TIPS = [
  "Start with what you've already tried before asking for help.",
  "Share the exact error message — copy-paste beats paraphrasing.",
  "Break big problems into smaller steps before posting.",
  "Acknowledge the helper's time with a quick update when solved.",
  "Tag your request with specific skills to find the right helpers faster.",
  "Include your OS, version, or environment when asking technical questions.",
  "A short code snippet is worth a thousand words.",
];

function todayTip() {
  const d = new Date();
  return TIPS[d.getDate() % TIPS.length];
}

export default async function AICenterPage() {
  const { user, profile } = await requireOnboarded();
  const sb = createAdminClient();

  const [trends, gaps, urgency, suggested, activity] = await Promise.all([
    getCategoryTrends(sb),
    getSkillGaps(sb),
    getUrgencyStats(sb),
    getSuggestedRequestsForUser(sb, user.id),
    getUserActivitySummary(sb, user.id),
  ]);

  const maxTrendCount = Math.max(...trends.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      <HeroBanner
        label="AI Center"
        title="See what the platform intelligence is noticing."
        subtitle="AI-like insights summarize demand trends, helper readiness, urgency signals, and request recommendations."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Trend Pulse</p>
          <h2 className="mt-3 text-[1.6rem] font-black leading-tight tracking-[-0.04em] text-[#111111]">
            {trends[0]?.category ?? "—"}
          </h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">Most common support area based on active community requests.</p>
        </Card>
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Urgency Watch</p>
          <h2 className="mt-3 text-[1.6rem] font-black leading-tight tracking-[-0.04em] text-[#111111]">
            {(urgency.critical ?? 0) + (urgency.high ?? 0)}
          </h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">Requests currently flagged high priority by the urgency detector.</p>
        </Card>
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Mentor Pool</p>
          <h2 className="mt-3 text-[1.6rem] font-black leading-tight tracking-[-0.04em] text-[#111111]">
            {suggested.length}
          </h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">Trusted helpers with strong response history and contribution signals.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Your Activity (30 days)
          </p>
          <h2 className="mt-3 text-xl font-bold text-[#111111]">
            {activity.helpsGiven > 0
              ? `You helped ${activity.helpsGiven} ${activity.helpsGiven === 1 ? "person" : "people"} this month.`
              : "No solved helps logged yet."}
          </h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Trust gained this month:{" "}
            <span className="font-semibold text-[#0C9F88]">+{activity.trustGain}</span>
          </p>
          <div className="mt-4 rounded-[14px] border border-[#F0EBE3] p-4 text-sm text-[#6B6B6B]">
            Current trust score:{" "}
            <span className="font-bold text-[#111111]">{profile.trust_score}%</span>
          </div>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Tip of the Day
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#111111]">
            &ldquo;{todayTip()}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="open">AI tip</Badge>
            <span className="text-xs text-[#6B6B6B]">Rotates daily</span>
          </div>
        </Card>
      </div>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
          Category Trends
        </p>
        <h2 className="mt-2 text-lg font-bold text-[#111111]">Requests by category (last 30 days)</h2>
        {trends.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B6B6B]">No data yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {trends.map(({ category, count }) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-[#6B6B6B]">{category}</span>
                <div className="flex-1 rounded-full bg-[#F0EBE3] overflow-hidden h-3">
                  <div
                    className="h-3 rounded-full bg-[#0C9F88]"
                    style={{ width: `${(count / maxTrendCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-[#111111]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
          Urgency Overview
        </p>
        <h2 className="mt-2 text-lg font-bold text-[#111111]">Open requests by urgency</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["critical", "high", "medium", "low"] as const).map((level) => (
            <div key={level} className="rounded-[14px] border border-[#F0EBE3] p-4 text-center">
              <p className="text-2xl font-black tracking-tight text-[#111111]">
                {urgency[level]}
              </p>
              <div className="mt-2">
                <Badge variant={level}>{level}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
          Skill Gaps
        </p>
        <h2 className="mt-2 text-lg font-bold text-[#111111]">
          Top skills with most open requests and fewest helpers
        </h2>
        {gaps.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B6B6B]">No skill gaps detected.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {gaps.map(({ tag, demand, helpers }) => (
              <div
                key={tag}
                className="flex items-center justify-between rounded-[14px] border border-[#F0EBE3] p-4"
              >
                <div>
                  <p className="font-medium text-[#111111]">{tag}</p>
                  <p className="text-xs text-[#6B6B6B]">{demand} open requests &middot; {helpers} helpers</p>
                </div>
                <Badge variant="critical">gap</Badge>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-[#6B6B6B]">
          Consider adding these to your skills in{" "}
          <Link href="/profile/me" className="underline text-[#0C9F88]">
            your profile
          </Link>
          .
        </p>
      </Card>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
          AI Recommendations
        </p>
        <h2 className="mt-2 text-[1.7rem] font-black leading-tight tracking-[-0.04em] text-[#111111]">
          Requests needing attention
        </h2>
        {suggested.length === 0 ? (
          <p className="mt-4 text-sm text-[#6B6B6B]">
            No matches yet. Add skills in your profile to get personalized suggestions.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-[#F0EBE3]">
            {suggested.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="block py-5 first:pt-0 last:pb-0 no-underline hover:opacity-80 transition-opacity"
              >
                <p className="font-semibold text-[#111111] leading-snug">{req.title}</p>
                <p className="mt-1.5 text-sm text-[#6B6B6B] leading-6 line-clamp-2">
                  AI summary: {req.ai_summary || req.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {req.category ? (
                    <Badge variant="category">{req.category}</Badge>
                  ) : null}
                  <Badge variant={req.urgency as "low" | "medium" | "high" | "critical"}>
                    {req.urgency}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 border-t border-[#F0EBE3] pt-4">
          <Link
            href="/explore"
            className="text-sm font-medium text-[#0C9F88] hover:underline"
          >
            Browse all open requests &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
}
