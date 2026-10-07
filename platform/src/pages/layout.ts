import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { User } from "../db";

export type Page = HtmlEscapedString | Promise<HtmlEscapedString>;

// Same tokens as ../public/index.html so the platform reads as the same site.
const CSS = `
:root{--paper:#FAF9F7;--surface:#FFFFFF;--sunk:#F1EFEC;--ink:#141210;--ink-2:#4A4540;--ink-3:#78716A;--rule:#DED9D3;--rule-2:#EBE7E2;--key:#1B4D3E;--key-soft:#E6EEEA;--wip:#8A6410;--wip-soft:#F7EFDC;--bad:#8A2A1A;--bad-soft:#F7E3DE;
--struc:"Segoe UI",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;--prose:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--mono:"Cascadia Code","SF Mono",ui-monospace,Consolas,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#100F0D;--surface:#191714;--sunk:#141210;--ink:#EDE9E4;--ink-2:#A9A29A;--ink-3:#7D766E;--rule:#2C2823;--rule-2:#221F1B;--key:#6FBFA3;--key-soft:#13251F;--wip:#D8A94A;--wip-soft:#251E10;--bad:#E38B78;--bad-soft:#2A1512}}
:root[data-theme="dark"]{--paper:#100F0D;--surface:#191714;--sunk:#141210;--ink:#EDE9E4;--ink-2:#A9A29A;--ink-3:#7D766E;--rule:#2C2823;--rule-2:#221F1B;--key:#6FBFA3;--key-soft:#13251F;--wip:#D8A94A;--wip-soft:#251E10;--bad:#E38B78;--bad-soft:#2A1512}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--prose);font-size:17px;line-height:1.62;-webkit-font-smoothing:antialiased}
.wrap{max-width:76ch;margin:0 auto;padding:0 26px}a{color:var(--key);text-underline-offset:2px}
nav.top{border-bottom:1px solid var(--rule);padding:22px 0;font-family:var(--struc);font-size:.9rem;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
nav.top .brand{font-weight:700;letter-spacing:-.02em;color:var(--ink);text-decoration:none;margin-right:auto}nav.top a{text-decoration:none;color:var(--ink-2)}nav.top a:hover{color:var(--key)}
.eyebrow{font-family:var(--struc);font-size:.7rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--key);margin:0 0 14px}
h1{font-family:var(--struc);font-weight:700;letter-spacing:-.03em;font-size:clamp(1.8rem,4.5vw,2.6rem);line-height:1.08;margin:0 0 14px}
h2{font-family:var(--struc);font-weight:700;font-size:1.25rem;letter-spacing:-.02em;margin:0 0 12px}h3{font-family:var(--struc);font-size:1.02rem;margin:0}
p{margin:0 0 14px}.sub{font-size:1.08rem;color:var(--ink-2);max-width:56ch}section{padding:40px 0 10px}section+section{border-top:1px solid var(--rule-2)}
.card{background:var(--surface);border:1px solid var(--rule);border-radius:5px;padding:18px 20px;margin-bottom:12px}.card p{font-size:.95rem;color:var(--ink-2);margin:6px 0 10px}
.row{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.row .price{margin-left:auto;font-family:var(--struc);font-weight:700;white-space:nowrap}
.muted{color:var(--ink-3);font-family:var(--struc);font-size:.82rem}.mono{font-family:var(--mono);font-size:.8rem}
.btn{font-family:var(--struc);font-size:.85rem;font-weight:600;border:1px solid var(--key);background:var(--key);color:#fff;padding:7px 14px;border-radius:100px;cursor:pointer;text-decoration:none;display:inline-block}
.btn.secondary{background:transparent;color:var(--key)}.btn.small{padding:4px 10px;font-size:.76rem}
.tag{font-family:var(--struc);font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:3px;white-space:nowrap}
.tag.ok{background:var(--key-soft);color:var(--key)}.tag.warn{background:var(--wip-soft);color:var(--wip)}.tag.bad{background:var(--bad-soft);color:var(--bad)}.tag.plain{background:var(--sunk);color:var(--ink-3)}
form.inline{display:inline}label{font-family:var(--struc);font-size:.84rem;color:var(--ink-2);display:block;margin-bottom:6px}
input[type=text],input[type=email],input[type=datetime-local],textarea{font:inherit;font-size:.95rem;width:100%;padding:9px 12px;border:1px solid var(--rule);border-radius:5px;background:var(--surface);color:var(--ink);margin-bottom:12px}
.notice{background:var(--key-soft);border:1px solid color-mix(in srgb,var(--key) 26%,transparent);border-radius:5px;padding:14px 18px;margin:0 0 18px;font-size:.95rem}
.notice.bad{background:var(--bad-soft);border-color:var(--bad)}pre{background:var(--sunk);border:1px solid var(--rule-2);border-radius:5px;padding:12px 14px;overflow-x:auto;font-family:var(--mono);font-size:.78rem;line-height:1.5}
table{width:100%;border-collapse:collapse;font-family:var(--struc);font-size:.88rem}td,th{text-align:left;padding:8px 6px;border-bottom:1px solid var(--rule-2);vertical-align:top}th{color:var(--ink-3);font-weight:600;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase}
footer{border-top:1px solid var(--rule);margin-top:40px;padding:24px 0 60px;font-family:var(--struc);font-size:.82rem;color:var(--ink-3)}
`;

export function layout(opts: { title: string; appName: string; user: User | null; body: Page; description?: string }): Page {
  return html`<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.title} · ${opts.appName}</title>
${opts.description ? html`<meta name="description" content="${opts.description}">` : ""}
<style>${raw(CSS)}</style>
</head>
<body>
<div class="wrap">
<nav class="top">
  <a class="brand" href="/">${opts.appName}</a>
  <a href="/#agents">Agents</a>
  <a href="/#projects">Projects</a>
  <a href="/#services">Services</a>
  ${opts.user
    ? html`<a href="/dashboard">Dashboard</a>${opts.user.role === "owner" ? html`<a href="/admin">Admin</a>` : ""}<form class="inline" method="post" action="/logout"><button class="btn secondary small" type="submit">Sign out</button></form>`
    : html`<a href="/login">Sign in</a>`}
</nav>
${opts.body}
<footer>Hemayet Hossain · Sydney, Australia · <a href="https://portfolio.hossainconsulting.com">portfolio</a> · <a href="https://github.com/hossainconsulting">GitHub</a><br>
Every project listed here is real work offered for sale; the portfolio projects it references are simulations and say so.</footer>
</div>
</body>
</html>`;
}

export function notice(kind: "ok" | "bad", text: string): Page {
  return html`<div class="notice ${kind === "bad" ? "bad" : ""}">${text}</div>`;
}
