import { OPENROUTER_URL, DEFAULT_MODEL, RATE_LIMIT } from "../shared/constants";

const requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length < RATE_LIMIT.maxRequests;
}

export async function chatCompletion(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured. Please set it in Settings.");
  }

  if (!checkRateLimit()) {
    throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
  }

  requestTimestamps.push(Date.now());

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://freelanceflow.app",
      "X-Title": "FreelanceFlow Extension",
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://freelanceflow.app",
        "X-Title": "FreelanceFlow Extension",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "Say ok" }],
        max_tokens: 5,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
