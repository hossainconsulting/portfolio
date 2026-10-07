import { html } from "hono/html";
import type { Page } from "./layout";

export function loginPage(next: string | null, error?: string): Page {
  return html`<section>
  <h1>Sign in</h1>
  <p class="sub">No password. Enter your email and we send a link that signs you in for 30 days.</p>
  ${error ? html`<div class="notice bad">${error}</div>` : ""}
  <form method="post" action="/login">
    <label for="email">Email</label>
    <input id="email" type="email" name="email" required autocomplete="email" placeholder="you@example.com">
    ${next ? html`<input type="hidden" name="next" value="${next}">` : ""}
    <button class="btn" type="submit">Send sign-in link</button>
  </form>
</section>`;
}

export function loginSentPage(email: string, delivered: boolean): Page {
  return html`<section>
  <h1>Check your email</h1>
  <p class="sub">If <strong>${email}</strong> is a valid address, a sign-in link is on its way. It works once and expires in 15 minutes.</p>
  ${delivered ? "" : html`<div class="notice">Email delivery is not configured on this deployment, so the link was written to the Worker log instead. That is expected in local development.</div>`}
</section>`;
}
