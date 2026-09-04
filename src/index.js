// portfolio.hossainconsulting.com
//
// Static assets, plus one endpoint: POST /api/chat, which backs the CONCIERGE widget.
//
// The Anthropic API key is a Worker secret and is never sent to the browser. The browser
// holds the conversation and posts it back each turn; this Worker is stateless. That
// means the history arriving here is client-controlled, so everything below treats it as
// untrusted: shape, size and turn count are all capped before a request is billed.

import Anthropic, {
  APIConnectionError,
  APIError,
  AuthenticationError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { systemPrompt } from "./system-prompt.js";

const MODEL = "claude-opus-5";

// Reply length. Adaptive thinking is on by default for this model and its tokens come
// out of the same budget, so this is well above what a three-sentence answer needs.
const MAX_TOKENS = 4000;

// Request caps. A conversation that needs more than this has stopped being a two-minute
// hand-raise, and the visitor is better served by the email address.
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_CHARS = 24_000;

// One tool round-trip is all the flow needs: capture_lead, then the closing line.
const MAX_ITERATIONS = 4;

const DEFAULT_EMAIL = "hossainconsulting@gmail.com";

/** @type {Anthropic.Tool} */
const CAPTURE_LEAD = {
  name: "capture_lead",
  description:
    "Record an inbound lead so Hemayet can reply. Call this once you have the " +
    "visitor's name and at least one way to reach them. Call it only once per " +
    "conversation, unless they later correct a detail — then call it again with the " +
    "corrected version.",
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        enum: ["employment", "consulting", "other"],
        description: "Which fork the conversation took.",
      },
      name: { type: "string", description: "The visitor's name, as they gave it." },
      email: { type: "string", description: "Their email, if they gave one." },
      phone: { type: "string", description: "Their phone, if they gave one." },
      company: { type: "string", description: "Their company, if they named one." },
      role_or_need: {
        type: "string",
        description:
          "Employment: the role title. Consulting: the need, in their own words — " +
          "quote them rather than paraphrasing.",
      },
      timeframe: { type: "string", description: "When they need this, if they said." },
      team_size: { type: "string", description: "Rough team size, if they said." },
      summary: {
        type: "string",
        description:
          "Two to four sentences for Hemayet: what they want and what would make a " +
          "useful reply. Mark anything you inferred as an inference.",
      },
    },
    required: ["path", "name", "role_or_need", "summary"],
  },
};

/**
 * Deliver a captured lead. Returns the string handed back to the model as the tool
 * result, so a delivery failure changes what the assistant tells the visitor rather
 * than being swallowed.
 */
async function deliverLead(input, transcript, env, ctx) {
  const lead = {
    received_at: new Date().toISOString(),
    source: "widget",
    ...input,
    transcript,
  };

  if (!env.LEAD_WEBHOOK_URL) {
    // No delivery path configured. Say so plainly rather than promising a reply that
    // depends on someone reading `wrangler tail`.
    console.log("LEAD (undelivered — LEAD_WEBHOOK_URL unset):", JSON.stringify(lead));
    return (
      "Not delivered: no lead delivery is configured for this site. Do not promise a " +
      "reply within one business day. Give the visitor the email address and ask them " +
      "to send a short note so nothing is lost."
    );
  }

  try {
    const res = await fetch(env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!res.ok) throw new Error(`webhook returned ${res.status}`);
    console.log("LEAD delivered:", lead.name, lead.path);
    return "Delivered. Hemayet has the details and will reply personally within one business day.";
  } catch (err) {
    console.error("LEAD delivery failed:", err.message, JSON.stringify(lead));
    return (
      "Not delivered: the handoff failed. Do not promise a reply within one business " +
      "day. Apologise briefly, give the visitor the email address, and ask them to " +
      "send a short note directly."
    );
  }
}

/** Validate the client-supplied history. Returns an error string, or null if it is fine. */
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return "messages must be a non-empty array";
  if (messages.length > MAX_MESSAGES) return "conversation too long";

  let total = 0;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return "invalid role";
    if (typeof m.content !== "string") return "content must be a string";
    if (m.content.length > MAX_MESSAGE_CHARS) return "message too long";
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) return "conversation too long";
  if (messages[messages.length - 1].role !== "user") return "last message must be from the visitor";
  return null;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// What the visitor sees when the model cannot answer — a refusal, an outage, a bug.
// It never leaves them without a route to Hemayet.
function fallbackReply(env) {
  const email = env.CONTACT_EMAIL || DEFAULT_EMAIL;
  return `Sorry — I can't help with that here. You can reach Hemayet directly at ${email} and he'll reply personally.`;
}

async function handleChat(request, env, ctx) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    return json({ reply: fallbackReply(env) });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }

  const invalid = validateMessages(body?.messages);
  if (invalid) return json({ error: invalid }, 400);

  const transcript = body.messages.map((m) => ({ role: m.role, content: m.content }));
  const messages = transcript.map((m) => ({ role: m.role, content: m.content }));

  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    // Set ANTHROPIC_BASE_URL in .dev.vars to point at a mock while developing.
    // Unset in production, where the SDK's default is what you want.
    ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}),
  });
  const system = systemPrompt({
    email: env.CONTACT_EMAIL || DEFAULT_EMAIL,
    phone: env.CONTACT_PHONE,
  });

  let captured = false;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // Chat, not analysis. Low effort keeps latency and spend down without
        // turning thinking off — see README for why thinking stays on.
        output_config: { effort: "low" },
        system,
        tools: [CAPTURE_LEAD],
        messages,
      });

      // Populated only on a refusal; guard before reading content.
      if (response.stop_reason === "refusal") {
        console.warn("refusal:", response.stop_details?.category);
        return json({ reply: fallbackReply(env), captured });
      }

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();

      const toolUses = response.content.filter((b) => b.type === "tool_use");
      if (toolUses.length === 0) {
        return json({ reply: text || fallbackReply(env), captured });
      }

      messages.push({ role: "assistant", content: response.content });

      // All tool results for one assistant turn go back in a single user message.
      const results = [];
      for (const use of toolUses) {
        if (use.name !== "capture_lead") {
          results.push({ type: "tool_result", tool_use_id: use.id, content: "Unknown tool.", is_error: true });
          continue;
        }
        const result = await deliverLead(use.input, transcript, env, ctx);
        captured = true;
        results.push({ type: "tool_result", tool_use_id: use.id, content: result });
      }
      messages.push({ role: "user", content: results });
    }

    // Ran out of iterations without a closing text turn.
    console.warn("chat hit MAX_ITERATIONS");
    return json({ reply: fallbackReply(env), captured });
  } catch (err) {
    // Most specific first. APIConnectionError extends APIError, so it is checked
    // before it. Every branch ends the same way for the visitor — a polite line and
    // the email address — but the logs need to tell these apart.
    if (err instanceof AuthenticationError) {
      console.error("ANTHROPIC_API_KEY rejected — the widget is down until it is fixed");
    } else if (err instanceof RateLimitError) {
      console.warn("rate limited or out of credit at the Anthropic API");
    } else if (err instanceof APIConnectionError) {
      console.error("could not reach the Anthropic API:", err.message);
    } else if (err instanceof APIError) {
      console.error("Anthropic API error", err.status, err.message);
    } else {
      console.error("unexpected error:", err);
    }
    return json({ reply: fallbackReply(env), captured });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") return handleChat(request, env, ctx);
    // Everything else is a static asset. ASSETS applies not_found_handling, so unknown
    // paths still get public/404.html.
    return env.ASSETS.fetch(request);
  },
};
