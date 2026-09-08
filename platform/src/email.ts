import type { Env } from "./env";

export type Mail = { to: string; subject: string; text: string };
export type MailResult = { delivered: boolean; detail: string };

/**
 * Sends through Resend's HTTP API. Without RESEND_API_KEY the message is logged
 * instead, which is what you want in `wrangler dev`: the magic link shows up in
 * the terminal and nothing leaves the machine.
 */
export async function sendEmail(env: Env, mail: Mail): Promise<MailResult> {
  if (!env.RESEND_API_KEY) {
    console.log(`[email:not-sent] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}`);
    return { delivered: false, detail: "RESEND_API_KEY not set; logged instead" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[email:failed] ${res.status} ${body}`);
    return { delivered: false, detail: `Resend ${res.status}` };
  }
  return { delivered: true, detail: "sent" };
}
