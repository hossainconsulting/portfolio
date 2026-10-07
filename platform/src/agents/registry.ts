/**
 * The agents this platform hosts. Each is the hosted edition of one tool in
 * github.com/hossainconsulting/home-services-ai. Prompts live here, in code,
 * so a change is a reviewed commit rather than a dashboard edit.
 *
 * Design rules carried over from that repo and from the Meridian engagement:
 *  - Missing information is a first-class output, never a guess.
 *  - The model does no arithmetic. Totals are computed in code from its lines.
 *  - Safety escalations are decided by fixed rules, and the model is told them.
 */
export type AgentDef = {
  slug: string;
  name: string;
  description: string;
  model: string;
  effort: "low" | "medium" | "high";
  maxTokens: number;
  /** Frozen system prompt. Byte-identical on every call so prompt caching works. */
  system: string;
  /** JSON schema for structured output. */
  outputSchema: Record<string, unknown>;
  /** A worked example the dashboard shows and the eval harness can reuse. */
  exampleInput: string;
};

const QUOTE_TRIAGE: AgentDef = {
  slug: "quote-triage",
  name: "Quote Triage",
  description: "Structures a raw customer enquiry and lists what must still be asked before quoting.",
  model: "claude-opus-5",
  effort: "medium",
  maxTokens: 4000,
  system: `You triage inbound enquiries for a small Australian trades business (plumbing, electrical, HVAC, solar, appliance repair).

Given one raw enquiry (email, SMS, web form or voicemail transcript), produce a job spec.

Rules:
- Only state what the enquiry actually says. If the trade, suburb, access, timing or contact details are not stated, leave the field null and add a precise question to "questions_to_ask".
- Never invent a suburb, a price, or an appointment time.
- "urgency" is "emergency" only for active danger or active damage (gas smell, sparking, water flowing where it should not). "urgent" is same-week. Everything else is "routine".
- Keep "summary" to two sentences a tradesperson can read on a phone.
- Write in Australian English.`,
  outputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      trade: { type: ["string", "null"], enum: ["plumbing", "electrical", "hvac", "solar", "appliance", "other", null] },
      urgency: { type: "string", enum: ["emergency", "urgent", "routine"] },
      suburb: { type: ["string", "null"] },
      property_type: { type: ["string", "null"] },
      access_notes: { type: ["string", "null"] },
      preferred_times: { type: ["string", "null"] },
      contact: {
        type: "object", additionalProperties: false,
        properties: { name: { type: ["string", "null"] }, phone: { type: ["string", "null"] }, email: { type: ["string", "null"] } },
        required: ["name", "phone", "email"],
      },
      questions_to_ask: { type: "array", items: { type: "string" } },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
    },
    required: ["summary", "trade", "urgency", "suburb", "property_type", "access_notes", "preferred_times", "contact", "questions_to_ask", "confidence"],
  },
  exampleInput: "hi, hot water is only lukewarm since yesterday, its a rheem on the side of the house, can someone come thurs or fri? thanks - Priya 0412 000 000",
};

const NOTES_TO_INVOICE: AgentDef = {
  slug: "notes-to-invoice",
  name: "Notes to Invoice",
  description: "Maps end-of-day job notes to lines in a rates table. Quantities only; totals are computed in code.",
  model: "claude-opus-5",
  effort: "medium",
  maxTokens: 4000,
  system: `You turn a tradesperson's end-of-day job notes into draft invoice lines.

The input has two parts: RATES (the business's rate table, one item per line as "code | description | unit | unit_price") and NOTES (what was done today).

Rules:
- Every line you output must reference a rate code that exists in RATES. If work was done that has no matching rate, put it in "unmatched_work" with a suggested description; do not invent a code or a price.
- Output quantities only. Do not compute line totals or an invoice total. Code does that.
- If the notes are ambiguous about quantity (for example "a few hours"), choose the smallest defensible quantity and add the ambiguity to "check_with_tradie".
- Write descriptions the customer will read: plain, specific, no jargon.
- Australian English.`,
  outputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      customer_reference: { type: ["string", "null"] },
      lines: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          properties: { rate_code: { type: "string" }, description: { type: "string" }, quantity: { type: "number" } },
          required: ["rate_code", "description", "quantity"],
        },
      },
      unmatched_work: { type: "array", items: { type: "string" } },
      check_with_tradie: { type: "array", items: { type: "string" } },
    },
    required: ["customer_reference", "lines", "unmatched_work", "check_with_tradie"],
  },
  exampleInput: "RATES\nLAB-HR | Labour | hour | 120\nCALL | Call-out fee | each | 90\nTAP-MIX | Mixer tap, standard | each | 185\n\nNOTES\nJob at 14 Wattle St. Replaced kitchen mixer, about 1.5 hrs. Also cleared the laundry drain, half an hour.",
};

const AFTER_HOURS: AgentDef = {
  slug: "after-hours-triage",
  name: "After-Hours Triage",
  description: "Classifies an out-of-hours message and either gathers what is missing or escalates to a human now.",
  model: "claude-opus-5",
  effort: "medium",
  maxTokens: 3000,
  system: `You are the after-hours front door for a small Australian trades business. A customer has sent a message outside business hours. Decide what happens next.

Hard rules, applied before anything else:
- Smell of gas, suspected gas leak, sparking, burning smell from electrical, exposed live wiring, water coming through a ceiling or light fitting, sewage overflow inside the home, or anyone saying they feel unsafe: "action" must be "escalate_now". Tell the customer to get to safety, name the emergency service to call if there is immediate danger (000 in Australia), and say a person from the business will call them back. Do not ask booking questions.
- Never book, promise a time, or quote a price. You can only gather information or escalate.
- If the message is routine, "action" is "gather_info": reply warmly, say the office opens in the morning, and ask only the questions that are actually missing (usually suburb, best contact number, and a one-line description).
- If the message is not a job request (spam, wrong number, supplier), "action" is "no_action".

The "reply_to_customer" must be short enough for an SMS, in Australian English, and must never invent details.`,
  outputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: { type: "string", enum: ["escalate_now", "gather_info", "no_action"] },
      severity: { type: "string", enum: ["emergency", "urgent", "routine", "none"] },
      reason: { type: "string" },
      reply_to_customer: { type: "string" },
      missing_information: { type: "array", items: { type: "string" } },
      human_summary: { type: "string" },
    },
    required: ["action", "severity", "reason", "reply_to_customer", "missing_information", "human_summary"],
  },
  exampleInput: "hey its 11pm and theres water dripping through the bathroom light, what do i do",
};

export const AGENTS: Record<string, AgentDef> = {
  [QUOTE_TRIAGE.slug]: QUOTE_TRIAGE,
  [NOTES_TO_INVOICE.slug]: NOTES_TO_INVOICE,
  [AFTER_HOURS.slug]: AFTER_HOURS,
};

export function getAgent(slug: string): AgentDef | undefined {
  return AGENTS[slug];
}
