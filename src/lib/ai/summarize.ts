import { withClaude } from "./claude";

function summarizeHeuristic(text: string): string {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length === 0) return text.slice(0, 180);
  const first = sentences[0];
  const longest = sentences.reduce((a, b) => (b.length > a.length && b !== first ? b : a), "");
  const combined = longest && longest !== first ? `${first}. ${longest}.` : `${first}.`;
  return combined.slice(0, 180);
}

function rewriteHeuristic(text: string): string {
  const fillers = /\b(um|uh|kinda|sorta|basically|just|like|really|literally|honestly|actually)\b/gi;
  const cleaned = text.replace(fillers, "").replace(/\s{2,}/g, " ").trim();
  const sentences = cleaned.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const half = Math.ceil(sentences.length / 2);
  const p1 = sentences.slice(0, half).join(". ");
  const p2 = sentences.slice(half).join(". ");
  return p2 ? `${p1}.\n\n${p2}.` : `${p1}.`;
}

export async function summarize(text: string, mode: "summary" | "rewrite" = "summary"): Promise<string> {
  const fallback = mode === "summary" ? () => summarizeHeuristic(text) : () => rewriteHeuristic(text);

  const prompt = mode === "summary"
    ? `Summarize this help request in 1-2 sentences (max 180 chars). Be specific about the problem and deadline if mentioned.\n\nRequest: ${text}\n\nSummary:`
    : `Rewrite this help request to be clearer and more structured. Remove filler words. Split into 2 short paragraphs. Preserve all key information.\n\nOriginal: ${text}\n\nRewrite:`;

  const result = await withClaude(prompt, fallback);
  return typeof result === "string" ? result.trim() : fallback();
}
