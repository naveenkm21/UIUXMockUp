// Direct Groq REST client — no SDK dependency.
// Groq endpoint is OpenAI-compatible: https://api.groq.com/openai/v1

const GROQ_BASE = "https://api.groq.com/openai/v1";

export const GROQ_MODELS = {
  TEXT: process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile",
  CODE: process.env.GROQ_CODE_MODEL || "llama-3.3-70b-versatile",
  VISION: process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
  FAST: process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant",
};

type Role = "system" | "user" | "assistant";
export type GroqMessage = { role: Role; content: any };

export interface GroqChatOptions {
  model: string;
  messages: GroqMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  response_format?: { type: "json_object" | "text" };
}

const MAX_RETRIES = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.includes("<") || key === "") {
    throw new Error("GROQ_API_KEY is missing or invalid");
  }
  return key;
}

// Parse Retry-After header (seconds or HTTP-date) → ms
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const secs = Number(header);
  if (!Number.isNaN(secs)) return Math.max(0, secs * 1000);
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

async function fetchWithRetry(body: any, accept429ms = 60_000): Promise<Response> {
  let lastErr: any;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(body),
    });

    // Success or non-retryable error
    if (res.ok) return res;
    if (res.status !== 429 && res.status < 500) return res;

    // Retryable: 429 or 5xx
    const retryAfterMs =
      parseRetryAfter(res.headers.get("retry-after")) ??
      parseRetryAfter(res.headers.get("retry-after-ms"));
    const backoff = Math.min(
      retryAfterMs ?? 1000 * Math.pow(2, attempt) + Math.random() * 500,
      accept429ms
    );

    const errText = await res.text().catch(() => "");
    lastErr = new Error(`Groq ${res.status} (attempt ${attempt + 1}/${MAX_RETRIES}): ${errText.slice(0, 200)}`);
    (lastErr as any).status = res.status;

    if (attempt === MAX_RETRIES - 1) break;
    console.warn(`[groq] ${res.status} — retrying in ${Math.round(backoff)}ms`);
    await sleep(backoff);
  }
  throw lastErr;
}

export async function groqChat(opts: GroqChatOptions): Promise<any> {
  const res = await fetchWithRetry({ ...opts, stream: false });
  if (!res.ok) {
    const txt = await res.text();
    const err: any = new Error(`Groq ${res.status}: ${txt.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Streams text deltas from Groq SSE response (with 429 retry on initial connect)
export async function* groqStream(opts: GroqChatOptions): AsyncGenerator<string> {
  const res = await fetchWithRetry({ ...opts, stream: true });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    const err: any = new Error(`Groq ${res.status}: ${txt.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
