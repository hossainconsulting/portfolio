/**
 * Anthropic list prices, USD per million tokens, used only to *estimate* the
 * cost of each call for the usage table and the owner digest. Billing to the
 * customer is by call quota, not by token, so an out-of-date row here affects
 * reporting, never what anyone is charged.
 */
export type ModelPrice = { input: number; output: number; cacheRead: number };

export const MODEL_PRICES: Record<string, ModelPrice> = {
  "claude-opus-5": { input: 5, output: 25, cacheRead: 0.5 },
  "claude-opus-4-8": { input: 5, output: 25, cacheRead: 0.5 },
  "claude-sonnet-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheRead: 0.1 },
};

export type Usage = { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null };

/** Returns USD micro-dollars (1e-6 USD) as an integer. */
export function estimateCostMicros(model: string, usage: Usage): number {
  const p = MODEL_PRICES[model] ?? MODEL_PRICES["claude-opus-5"]!;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const usd = (usage.input_tokens * p.input + usage.output_tokens * p.output + cacheRead * p.cacheRead) / 1_000_000;
  return Math.round(usd * 1_000_000);
}

export function microsToUsd(micros: number): string {
  return `$${(micros / 1_000_000).toFixed(4)}`;
}
