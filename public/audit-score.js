// Self-scoring quiz. Runs entirely in the browser; no data is sent anywhere.
(function () {
  var AREAS = [
    { k: "Follow-up", fix: "Fix follow-up first. It is the fastest way to win back jobs you already paid to attract.", qs: ["Someone replies to a new enquiry within 15 minutes in business hours.", "Every open quote gets a follow-up at about day 2 and day 7."] },
    { k: "Search and Google profile", fix: "Fix your Google Business Profile and phone/quote button first. It is where local customers look.", qs: ["My Google Business Profile is claimed, accurate and has photos from the last 6 months.", "My website has a tappable phone number and a quote or contact button without scrolling."] },
    { k: "Social", fix: "Fix your bio and link first so each profile tells people how to enquire.", qs: ["My social bios say what I do, where, and how to enquire, and the link works on a phone.", "I posted real work in the last 30 days."] },
    { k: "Email", fix: "Add a short welcome or quote follow-up email first, with an unsubscribe link.", qs: ["I send a regular email, or a follow-up email, to people who agreed to hear from me.", "I reuse my best emails as posts or website answers."] },
    { k: "Photos", fix: "Pick five of your best recent job photos for Google and your service pages first.", qs: ["I have clear before-and-after photos for my main services.", "I have permission for people, houses and number plates shown in my photos."] },
    { k: "Video", fix: "Film one 30-second answer to your most common customer question first.", qs: ["I have at least one short video of my work or a customer tip, with captions.", "I can cut one video into several clips for different channels."] }
  ];
  var form = document.getElementById("quiz"), out = document.getElementById("result");
  var n = 0;
  AREAS.forEach(function (a, ai) {
    a.qs.forEach(function (q, qi) {
      var d = document.createElement("div"); d.className = "q";
      var ar = document.createElement("div"); ar.className = "area"; ar.textContent = a.k; d.appendChild(ar);
      var p = document.createElement("p"); p.textContent = q; d.appendChild(p);
      var o = document.createElement("div"); o.className = "opts"; o.setAttribute("role", "radiogroup"); o.setAttribute("aria-label", q);
      [["Yes", 2], ["Sometimes", 1], ["No", 0]].forEach(function (c) {
        var l = document.createElement("label"), i = document.createElement("input");
        i.type = "radio"; i.name = "q" + n; i.value = c[1]; i.dataset.area = ai;
        l.appendChild(i); l.appendChild(document.createTextNode(" " + c[0])); o.appendChild(l);
      });
      d.appendChild(o); form.appendChild(d); n++;
    });
  });
  var b = document.createElement("button"); b.type = "submit"; b.className = "btn"; b.textContent = "Show my score"; form.appendChild(b);
  var msg = document.createElement("p"); msg.className = "micro"; msg.setAttribute("role", "status"); form.appendChild(msg);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var sums = AREAS.map(function () { return 0; }), answered = 0;
    form.querySelectorAll("input:checked").forEach(function (i) { sums[+i.dataset.area] += +i.value; answered++; });
    if (answered < n) { msg.textContent = "Please answer all " + n + " questions (" + (n - answered) + " left)."; return; }
    msg.textContent = "";
    var total = sums.reduce(function (x, y) { return x + y; }, 0);
    var tier = total >= 19 ? "Tidy. Look for small wins." : total >= 11 ? "Real gaps. Worth fixing the weakest area first." : "Urgent. You are probably losing jobs weekly.";
    var order = sums.map(function (s, i) { return i; }).sort(function (a, b) { return sums[a] - sums[b]; });
    out.textContent = "";
    var h = document.createElement("h2"); h.textContent = "Your score: " + total + " / 24"; out.appendChild(h);
    var t = document.createElement("p"); t.textContent = tier; out.appendChild(t);
    AREAS.forEach(function (a, i) {
      var l = document.createElement("div"); l.textContent = a.k + ": " + sums[i] + " / 4"; out.appendChild(l);
      var bar = document.createElement("div"); bar.className = "bar"; var f = document.createElement("i"); f.style.width = (sums[i] / 4 * 100) + "%"; bar.appendChild(f); out.appendChild(bar);
    });
    var w = AREAS[order[0]];
    var note = document.createElement("div"); note.className = "note";
    note.textContent = "Weakest area: " + w.k + ". " + w.fix; out.appendChild(note);
    var row = document.createElement("div"); row.className = "row"; row.style.marginTop = "16px";
    var a1 = document.createElement("a"); a1.className = "btn"; a1.href = "/workflow-snapshot?utm_source=quiz&utm_medium=result&utm_campaign=leak-score&utm_content=" + encodeURIComponent(w.k.toLowerCase().replace(/[^a-z]+/g, "-")); a1.textContent = "Get the free checklist";
    var a2 = document.createElement("a"); a2.className = "btn ghost"; a2.href = "/book?utm_source=quiz&utm_medium=result&utm_campaign=leak-score"; a2.textContent = "Book a free 20-minute call";
    row.appendChild(a1); row.appendChild(a2); out.appendChild(row);
    out.hidden = false; out.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
