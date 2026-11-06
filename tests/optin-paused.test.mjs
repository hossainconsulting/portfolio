import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { Messages } from '@anthropic-ai/sdk/resources/messages/messages';
import worker from '../src/index.js';

for (const env of [{}, { LEAD_WEBHOOK_URL: 'https://webhook.invalid/lead' }, { LEAD_WEBHOOK_URL: 'https://webhook.invalid/lead', ANTHROPIC_API_KEY: 'test-only' }]) {
  test(`paused signup never reads or forwards a body (${Object.keys(env).join(',') || 'no config'})`, async (t) => {
    const network = t.mock.method(globalThis, 'fetch', () => { throw new Error('network forbidden'); });
    for (const body of ['{"name":"Test","email":"test@example.invalid","consent":true}', 'invalid json', 'x'.repeat(5000), '{"website":"honeypot"}']) {
      const request = new Request('https://local.invalid/api/optin', { method: 'POST', body });
      t.mock.method(request, 'json', () => { throw new Error('body must not be parsed'); });
      const response = await worker.fetch(request, env, {});
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.match((await response.json()).error, /signup is paused/);
      assert.equal(request.bodyUsed, false);
    }
    assert.equal(network.mock.callCount(), 0);
  });
}

test('non-POST signup requests reject without reading the body', async () => {
  for (const method of ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']) {
    const response = await worker.fetch(new Request('https://local.invalid/api/optin', { method }), {}, {});
    assert.equal(response.status, 405);
  }
});

test('chat still delivers a captured lead to its configured webhook (mock only)', async (t) => {
  let turns = 0;
  t.mock.method(Messages.prototype, 'create', async () => ++turns === 1 ? {
    content: [{ type: 'tool_use', id: 'mock-tool', name: 'capture_lead', input: { name: 'Synthetic', path: 'other', role_or_need: 'test', summary: 'Synthetic regression test' } }]
  } : { content: [{ type: 'text', text: 'Mock completed' }] });
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push([url, JSON.parse(options.body)]); return new Response('{}'); });
  t.mock.method(console, 'log', () => {});
  const response = await worker.fetch(new Request('https://local.invalid/api/chat', { method: 'POST', body: JSON.stringify({ messages: [{ role: 'user', content: 'Synthetic test only' }] }) }), { ANTHROPIC_API_KEY: 'test-only', LEAD_WEBHOOK_URL: 'https://webhook.invalid/chat' }, {});
  assert.deepEqual(await response.json(), { reply: 'Mock completed', captured: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'https://webhook.invalid/chat');
  assert.equal(calls[0][1].source, 'widget');
  assert.equal(turns, 2);
});

test('static assets still use the existing binding', async () => {
  const response = await worker.fetch(new Request('https://local.invalid/checklist'), { ASSETS: { fetch: async () => new Response('asset') } }, {});
  assert.equal(await response.text(), 'asset');
});

test('checklist and thanks expose a real PDF and do not promise signup/delivery', async () => {
  const checklist = await readFile(new URL('../public/checklist.html', import.meta.url), 'utf8');
  const thanks = await readFile(new URL('../public/thanks.html', import.meta.url), 'utf8');
  assert.doesNotMatch(checklist, /<form|<input|<select|src="\/funnel.js"/);
  for (const html of [checklist, thanks]) {
    assert.match(html, /Email signup is paused/);
    assert.match(html, /href="\/downloads\/enquiry-leak-checklist.pdf"/);
    assert.doesNotMatch(html, /Check your inbox|should arrive|one click|Email me the checklist/);
  }
  const pdf = await readFile(new URL('../public/downloads/enquiry-leak-checklist.pdf', import.meta.url));
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
});

test('legacy form guard replaces form without collecting or transmitting data', async () => {
  let prevented = false, replaced;
  const form = { addEventListener: (type, handler) => { assert.equal(type, 'submit'); handler({ preventDefault: () => { prevented = true; } }); }, replaceWith: element => { replaced = element; } };
  const script = await readFile(new URL('../public/funnel.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, { document: { getElementById: () => form, createElement: () => ({ appendChild(child) { this.child = child; } }) } });
  assert.equal(prevented, true);
  assert.match(replaced.textContent, /signup is paused/);
  assert.equal(replaced.child.href, '/downloads/enquiry-leak-checklist.pdf');
  vm.runInNewContext(script, { document: { getElementById: () => null } });
});
