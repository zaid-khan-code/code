const enabled =
  typeof process !== "undefined" &&
  process.env.ANTHROPIC_API_KEY &&
  process.env.AI_USE_CLAUDE === "true";

let client: import("@anthropic-ai/sdk").Anthropic | null = null;

async function getClient() {
  if (!enabled) return null;
  if (!client) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    client = new Anthropic();
  }
  return client;
}

export async function withClaude<T>(prompt: string, fallback: () => T): Promise<T | string> {
  const c = await getClient();
  if (!c) return fallback();
  try {
    const r = await c.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = r.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
    return text;
  } catch {
    return fallback();
  }
}
