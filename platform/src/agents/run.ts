import Anthropic from "@anthropic-ai/sdk";
import type { AgentDef } from "./registry";

export type RunResult =
  | { ok: true; output: unknown; raw: string; model: string; stop_reason: string; usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens: number } }
  | { ok: false; error: "refusal" | "empty" | "bad_json"; detail: string; model: string; stop_reason: string; usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens: number } };

export const MAX_INPUT_CHARS = 12_000;

/**
 * One agent call. Non-streaming: max_tokens is small and the SDK timeout is
 * 10 minutes, so a single request comfortably completes inside a Worker.
 *
 * The system prompt is byte-identical per agent and marked cacheable, so
 * repeat calls pay ~10% for that prefix.
 */
export async function runAgent(apiKey: string, agent: AgentDef, input: string): Promise<RunResult> {
  const client = new Anthropic({ apiKey, maxRetries: 2 });

  const response = await client.beta.messages.create({
    model: agent.model,
    max_tokens: agent.maxTokens,
    // Server-side refusal fallbacks: if the safety classifier declines, the API
    // re-runs on a fallback model inside the same call. Opt-in; see README.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: agent.system, cache_control: { type: "ephemeral" } }],
    output_config: { effort: agent.effort, format: { type: "json_schema", schema: agent.outputSchema } },
    messages: [{ role: "user", content: input }],
  });

  const usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
  };
  const base = { model: response.model, stop_reason: String(response.stop_reason), usage };

  if (response.stop_reason === "refusal") {
    const explanation = response.stop_details?.type === "refusal" ? response.stop_details.explanation ?? "" : "";
    return { ok: false, error: "refusal", detail: explanation || "The model declined this request.", ...base };
  }

  const raw = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  if (!raw.trim()) return { ok: false, error: "empty", detail: "No text in response.", ...base };

  try {
    return { ok: true, output: JSON.parse(raw), raw, ...base };
  } catch {
    return { ok: false, error: "bad_json", detail: "Response was not valid JSON.", ...base };
  }
}
