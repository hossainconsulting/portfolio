// Opt-in form handler for /workflow-snapshot. Posts to /api/optin on this origin.
(function () {
  var form = document.getElementById("optin");
  if (!form) return;
  var msg = document.getElementById("form-msg");
  var btn = form.querySelector("button[type=submit]");
  var p = new URLSearchParams(location.search), utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) { if (p.get(k)) utm[k] = p.get(k).slice(0, 100); });
  try { if (Object.keys(utm).length) sessionStorage.setItem("utm", JSON.stringify(utm)); else utm = JSON.parse(sessionStorage.getItem("utm") || "{}"); } catch (e) {}

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.className = ""; msg.textContent = "";
    var d = new FormData(form);
    if (!d.get("consent")) { msg.className = "err"; msg.textContent = "Please tick the box so I know I can email you."; return; }
    btn.disabled = true; btn.textContent = "Sending...";
    fetch("/api/optin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: d.get("name"), email: d.get("email"), business: d.get("business"), trade: d.get("trade"),
        want: d.get("want"), consent: true, consent_version: form.dataset.consent, website: d.get("website"),
        page: location.pathname, utm: utm
      })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) {
        if (r.ok) { location.href = "/thanks?w=" + encodeURIComponent(form.querySelector("[name=want]").value); return; }
        throw new Error(r.j.error || "failed");
      })
      .catch(function (err) {
        btn.disabled = false; btn.textContent = form.dataset.cta;
        msg.className = "err";
        msg.textContent = "That did not go through (" + err.message + "). Email hossainconsulting@gmail.com and I will send it by hand.";
      });
  });
})();
