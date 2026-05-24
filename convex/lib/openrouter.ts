/**
 * openrouter.ts — Secure OpenRouter client
 *
 * Security rules enforced:
 *  RULE-S1 : Called only from Convex actions (server-side). NEVER from the client.
 *  RULE-S6 : Raw API error details are logged server-side only; a generic message
 *             is surfaced to callers.
 *
 * Model selection:
 *  Set OPENROUTER_MODEL in the Convex Dashboard → Settings → Environment Variables.
 *  No code changes required to switch models.
 *  Example: OPENROUTER_MODEL = openai/gpt-oss-120b:free
 *
 * Reliability:
 *  - response_format is intentionally omitted — free models return empty content
 *    when they can't satisfy json_object mode. The prompts handle JSON formatting.
 *  - 2 automatic retries (with 1s delay) handle transient empty responses.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Safely extract a JSON object/array from raw model output.
 *
 * Handles:
 *   1. Plain JSON  { "key": "value" }
 *   2. Markdown code fence  ```json...```  or  ```...```
 *   3. Leading noise before the JSON blob  (e.g. "jsonjsonjs{...}")
 */
function extractJson(raw: string): unknown {
  // Strip markdown code fence if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = (fenceMatch?.[1] ?? raw).trim();

  // Find the first { ... } or [ ... ] block, ignoring any leading noise
  const objMatch = candidate.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!objMatch?.[1]) {
    throw new Error("No JSON object found in model response");
  }

  return JSON.parse(objMatch[1]);
}

/** Sleep helper for retry delay */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Call OpenRouter with a system + user prompt.
 *
 * The model is read from OPENROUTER_MODEL env var set in the Convex Dashboard.
 * Retries up to MAX_RETRIES times on transient empty/malformed responses.
 */
export const callOpenRouter = async (
  systemPrompt: string,
  userPrompt: string
): Promise<unknown> => {
  const model = process.env.OPENROUTER_MODEL;
  if (!model) {
    throw new Error(
      "OPENROUTER_MODEL is not set. " +
        "Add it in Convex Dashboard → Settings → Environment Variables."
    );
  }

  let lastError: Error = new Error("Unexpected error");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              process.env.OPENROUTER_HTTP_REFERER ||
              "https://smartcareerhub.com",
            "X-Title": "Smart Career Hub",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 2000,
            temperature: 0.2,
            // response_format intentionally omitted:
            // free models silently return empty content when they can't
            // satisfy json_object mode. Prompts enforce JSON formatting instead.
          }),
        }
      );

      // Non-2xx: log server-side only, never expose raw errors (RULE-S6)
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `[OpenRouter] HTTP ${response.status} (attempt ${attempt}):`,
          errorBody
        );
        throw new Error(`HTTP ${response.status}`);
      }

      const data: unknown = await response.json();

      // Validate response shape
      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as Record<string, unknown>)["choices"])
      ) {
        throw new Error("Malformed response structure from OpenRouter");
      }

      const choices = (
        data as { choices: Array<{ message?: { content?: string | null } }> }
      ).choices;

      const content = choices[0]?.message?.content;

      // Empty content — retry if attempts remain
      if (!content || content.trim().length === 0) {
        throw new Error(`Empty content on attempt ${attempt}`);
      }

      // Robust JSON extraction: handles fences, noise, and partial wrapping
      const parsed = extractJson(content);

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Model returned a non-object JSON value");
      }

      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[OpenRouter] Attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`);
      lastError = err instanceof Error ? err : new Error(msg);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  // All retries exhausted — return generic error to caller (RULE-S6)
  console.error("[OpenRouter] All retries exhausted.", lastError);
  throw new Error("AI analysis is temporarily unavailable. Please try again.");
};
