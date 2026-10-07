// CONCIERGE widget — the browser half. Talks to /api/chat on this origin; the Anthropic
// key lives in the Worker and never reaches here.
//
// Progressive enhancement: the markup this drives is hidden until the script runs, so a
// visitor with JavaScript off sees the email address in the footer and nothing broken.
(function () {
  "use strict";

  var launcher = document.getElementById("cx-launcher");
  var panel = document.getElementById("cx-panel");
  var log = document.getElementById("cx-log");
  var form = document.getElementById("cx-form");
  var input = document.getElementById("cx-input");
  var send = document.getElementById("cx-send");
  var closeBtn = document.getElementById("cx-close");
  if (!launcher || !panel || !log || !form || !input) return;

  var GREETING =
    "Hello. Are you looking to hire Hemayet into a role, or explore consulting help " +
    "with Salesforce or automation?";

  var messages = []; // [{role, content}] — the API history, greeting excluded.
  var busy = false;
  var started = false;
  var lastFocus = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function addBubble(role, text) {
    var row = el("div", "cx-msg cx-" + role);
    row.appendChild(el("div", "cx-bubble", text));
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function setBusy(state) {
    busy = state;
    input.disabled = state;
    send.disabled = state;
    send.textContent = state ? "…" : "Send";
  }

  function open() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      addBubble("bot", GREETING);
    }
    input.focus();
  }

  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  launcher.addEventListener("click", function () {
    if (panel.hidden) open();
    else close();
  });
  if (closeBtn) closeBtn.addEventListener("click", close);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;

    var text = input.value.trim();
    if (!text) return;
    if (text.length > 4000) {
      addBubble("bot", "That's a long one — could you trim it a little?");
      return;
    }

    input.value = "";
    addBubble("you", text);
    messages.push({ role: "user", content: text });

    setBusy(true);
    var thinking = addBubble("bot", "…");
    thinking.classList.add("cx-pending");

    fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: messages }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (out) {
        var reply =
          (out.data && out.data.reply) ||
          "Sorry — something went wrong at my end. Hemayet is at " +
            "hossainconsulting@gmail.com and will reply personally.";
        thinking.remove();
        addBubble("bot", reply);
        // Only a real assistant turn goes into the history. An error reply is not one,
        // so a failed turn does not poison the next request.
        if (out.ok && out.data && out.data.reply) {
          messages.push({ role: "assistant", content: out.data.reply });
        } else {
          messages.pop();
        }
      })
      .catch(function () {
        thinking.remove();
        addBubble(
          "bot",
          "I couldn't reach the server. Hemayet is at hossainconsulting@gmail.com " +
            "and will reply personally."
        );
        messages.pop();
      })
      .finally(function () {
        setBusy(false);
        input.focus();
      });
  });

  // The markup ships hidden so it never appears without this script behind it.
  launcher.hidden = false;
})();
