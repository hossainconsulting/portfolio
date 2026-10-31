// Offline checks for the CONCIERGE Worker. A local mock stands in for the Anthropic API
// (via ANTHROPIC_BASE_URL), so these make no live model calls and cost nothing. They
// check what the Worker sends and how it handles replies; they do not measure answer
// quality from the real model.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import worker from "../src/index.js";
import { KNOWLEDGE } from "../src/knowledge.js";

function mockAnthropic(replies) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      requests.push({ url: req.url, headers: req.headers, body: JSON.parse(body) });
      const content = replies[Math.min(requests.length - 1, replies.length - 1)];
      const stop = content.some((b) => b.type === "tool_use") ? "tool_use" : "end_turn";
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        id: `msg_${requests.length}`, type: "message", role: "assistant", model: "claude-opus-5-5",
        content, stop_reason: stop, stop_details: null,
        usage: { input_tokens: 10, output_tokens: 10 },
      }));
    });
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ server, requests, url: `http://127.0.0.1:${server.address().port}` })));
}

async function chat(env, messages) {
  const req = new Request("https://portfolio.example/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const res = await worker.fetch(req, env, {});
  return { status: res.status, body: await res.json() };
}

test("question turn sends the portfolio as a cached system block and returns the answer", async (t) => {
  const mock = await mockAnthropic([[{ type: "text", text: "Python is in his learning plan." }]]);
  t.after(() => mock.server.close());
  const out = await chat(
    { ANTHROPIC_API_KEY: "test-key", ANTHROPIC_BASE_URL: mock.url, CONTACT_EMAIL: "hemayet@hemayethossain.com" },
    [{ role: "user", content: "What has he built with Python?" }],
  );
  assert.equal(out.status, 200);
  assert.equal(out.body.reply, "Python is in his learning plan.");
  assert.equal(out.body.captured, false);

  assert.equal(mock.requests.length, 1);
  const { body, headers } = mock.requests[0];
  assert.equal(body.model, "claude-opus-5-5");
  assert.equal(body.fallbacks, "default");
  assert.match(headers["anthropic-beta"], /server-side-fallback-2026-07-01/);
  assert.deepEqual(body.output_config, { effort: "low" });
  assert.equal(body.system.length, 2);
  assert.match(body.system[0].text, /Answer only from it/);
  assert.match(body.system[0].text, /hemayet@hemayethossain\.com/);
  assert.equal(body.system[0].cache_control, undefined);
  assert.ok(body.system[1].text.startsWith("<portfolio>"));
  assert.ok(body.system[1].text.includes(KNOWLEDGE));
  assert.deepEqual(body.system[1].cache_control, { type: "ephemeral" });
});

test("system blocks are byte-identical across requests, so the cache can hit", async (t) => {
  const mock = await mockAnthropic([[{ type: "text", text: "ok" }]]);
  t.after(() => mock.server.close());
  const env = { ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: mock.url };
  await chat(env, [{ role: "user", content: "one" }]);
  await chat(env, [{ role: "user", content: "two" }]);
  assert.deepEqual(mock.requests[0].body.system, mock.requests[1].body.system);
});

test("hand-off without a webhook tells the model not to promise a reply", async (t) => {
  const mock = await mockAnthropic([
    [{ type: "tool_use", id: "toolu_1", name: "capture_lead",
       input: { path: "employment", name: "Sam", email: "sam@example.com", role_or_need: "Salesforce Admin", summary: "Recruiter." } }],
    [{ type: "text", text: "Please email Hemayet directly." }],
  ]);
  t.after(() => mock.server.close());
  const out = await chat({ ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: mock.url },
    [{ role: "user", content: "I'm Sam, sam@example.com, hiring a Salesforce Admin." }]);
  assert.equal(out.body.captured, true);
  assert.equal(out.body.reply, "Please email Hemayet directly.");
  const second = mock.requests[1].body.messages;
  const result = second[second.length - 1].content[0];
  assert.equal(result.type, "tool_result");
  assert.match(result.content, /^Not delivered/);
});

test("malformed history is rejected before any model call", async () => {
  const out = await chat({ ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: "http://127.0.0.1:9" },
    [{ role: "assistant", content: "hi" }]);
  assert.equal(out.status, 400);
});

test("knowledge carries the facts the assistant must get right, and no widget markup", () => {
  for (const fact of [
    "These are simulations, not client work.",
    "I have not yet completed a paid client engagement",
    "Salesforce Certified Platform Administrator — earned 23 June 2026",
    "Salesforce Certified Agentforce Specialist — earned 18 August 2026",
    "Python, SQL, Git, HTTP and JSON",
    "SunRise Solar Solutions",
    "Home Services AI",
  ]) {
    assert.ok(KNOWLEDGE.includes(fact), `missing: ${fact}`);
  }
  for (const banned of ["<script", "cx-panel", "Hemayet's assistant", "<style"]) {
    assert.ok(!KNOWLEDGE.includes(banned), `should not contain: ${banned}`);
  }
});
