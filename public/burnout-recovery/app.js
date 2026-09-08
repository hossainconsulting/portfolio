/* Weekend Reset. Everything runs in the browser; nothing is sent anywhere
   until the user copies a prompt or opens it in a third-party assistant. */
(function () {
  'use strict';

  var STORE = { drafts: 'br.v1.drafts', done: 'br.v1.done', ack: 'br.v1.ack' };

  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode etc. */ }
  }
  function remove(key) { try { localStorage.removeItem(key); } catch (e) {} }

  /* Placeholders in a template are written {{key}}. Each field's `blank` is the
     bracketed text shown until the user fills it in, verbatim from the source
     prompt so the result still reads correctly when a blank is left. */
  var PROMPTS = [
    {
      id: 'sources', n: 1, tag: 'Understand',
      title: 'Find the real sources of your burnout',
      blurb: 'Seven questions, asked one at a time, then a sorted map of what is actually draining you and three things worth doing this weekend. Start here if you are tired and not sure why.',
      fields: [],
      template: 'Act as a compassionate reflection coach—not a therapist. Ask me 7 focused questions, one at a time, to identify what is draining me. Explore my workload, relationships, unfinished decisions, routines, sleep, boundaries, and expectations. After my answers, organize the causes into: urgent stressors, energy drains, controllable factors, and things I need to accept or seek support for. End with the 3 most useful actions for this weekend.'
    },
    {
      id: 'weekend', n: 2, tag: 'Recover',
      title: 'Build a realistic weekend recovery plan',
      blurb: 'A gentle plan built around the hours you actually have and the energy you actually have, with permission to drop things if the energy goes.',
      fields: [
        { key: 'hours', label: 'Free hours this weekend', type: 'number', blank: '[NUMBER]', hint: 'Roughly. Not counting sleep.', placeholder: 'e.g. 12' },
        { key: 'energy', label: 'Your energy right now', type: 'select', blank: '[LOW/MEDIUM]', options: ['low', 'medium'] },
        { key: 'commitments', label: 'Commitments you must still handle', type: 'text', wide: true, blank: '[COMMITMENTS]', placeholder: 'e.g. Saturday morning sport, groceries, a call with Mum' }
      ],
      template: 'Create a gentle burnout-recovery plan for my weekend. I have {{hours}} free hours, my energy is {{energy}}, and I must still handle {{commitments}}. Include rest, nourishing meals, light movement, enjoyable activities, limited screen time, and preparation for Monday. Use flexible time blocks—not a demanding schedule—and explain what I should skip if my energy drops.'
    },
    {
      id: 'braindump', n: 3, tag: 'Understand',
      title: 'Clear an overloaded mind',
      blurb: 'Empty everything out, let it be sorted into five piles, and end up with only three real priorities. The point is to feel lighter, not to solve it all.',
      fields: [
        { key: 'dump', label: 'Everything on your mind', type: 'textarea', wide: true, blank: '[BRAIN DUMP]', hint: 'Unsorted is fine. Half-sentences are fine.', placeholder: 'The unanswered email, the dentist, the thing I said in the meeting, the invoice, Dad’s birthday…' }
      ],
      template: 'I’m going to paste everything currently occupying my mind: {{dump}}. Sort it into five categories: do this weekend, schedule later, delegate, discuss with someone, and release completely. Select only three genuine priorities. Then create a short plan that helps me feel lighter without trying to solve everything at once.'
    },
    {
      id: 'calm', n: 4, tag: 'Recover',
      title: 'Create a personalized calming menu',
      blurb: 'Three two-minute resets, three ten-minute activities and two longer options, matched to how overwhelm shows up in you and what you actually find calming.',
      fields: [
        { key: 'signs', label: 'How overwhelm usually shows up', type: 'multi', wide: true, blank: '[RACING THOUGHTS/TENSION/IRRITABILITY/SHUTDOWN]', options: ['racing thoughts', 'tension', 'irritability', 'shutdown'] },
        { key: 'prefs', label: 'What tends to help', type: 'multi', wide: true, blank: '[QUIET/MOVEMENT/MUSIC/WRITING/SOCIAL SUPPORT]', options: ['quiet', 'movement', 'music', 'writing', 'social support'] }
      ],
      template: 'Design a ‘calm menu’ for moments when I feel overwhelmed. My common signs are {{signs}}, and I prefer {{prefs}}. Give me three 2-minute resets, three 10-minute activities, and two longer recovery options. Keep everything simple, free, and possible at home. Avoid presenting these as medical treatment.'
    },
    {
      id: 'thought', n: 5, tag: 'Understand',
      title: 'Turn harsh thoughts into balanced ones',
      blurb: 'Take one stressful thought and separate what is true from what is assumed. No forced positivity, just three replacement thoughts you could actually believe.',
      fields: [
        { key: 'thought', label: 'The thought, word for word', type: 'textarea', wide: true, blank: '[INSERT THOUGHT]', placeholder: 'e.g. If I take the weekend off, everything will fall apart and they’ll realise I’m not coping.' }
      ],
      template: 'Help me examine this stressful thought: ‘{{thought}}.’ Do not give me empty positivity. Separate facts from assumptions, identify the pressure or fear underneath it, and show me how I might respond to a close friend having the same thought. Then write three balanced replacement thoughts that feel believable—not overly optimistic.'
    },
    {
      id: 'boundaries', n: 6, tag: 'Protect',
      title: 'Write boundaries I can actually use',
      blurb: 'Three short scripts, warm to firm, for the person or situation that keeps costing you. Plus one line for pushback and one compromise that still protects the core need.',
      fields: [
        { key: 'who', label: 'The person or situation', type: 'text', blank: '[PERSON/SITUATION]', placeholder: 'e.g. my manager, the group chat, my sister' },
        { key: 'behaviour', label: 'What they keep doing or asking', type: 'text', blank: '[BEHAVIOR OR REQUEST]', placeholder: 'e.g. messaging at 9pm expecting a reply' },
        { key: 'protect', label: 'What you want to protect', type: 'text', blank: '[TIME/ENERGY/PRIORITY]', hint: 'Time, energy, or a specific priority.', placeholder: 'e.g. my evenings, my Sunday, my focus in the mornings' },
        { key: 'fear', label: 'What you are worried will happen', type: 'text', blank: '[FEAR]', placeholder: 'e.g. they’ll think I’m not committed' }
      ],
      template: 'I feel exhausted because {{who}} keeps {{behaviour}}. I want to protect {{protect}}, but I’m worried about {{fear}}. Write three boundary scripts: warm, direct, and firm. Keep each under 50 words. Then prepare one response for possible pushback and one compromise that protects my core need.'
    },
    {
      id: 'digital', n: 7, tag: 'Protect',
      title: 'Plan a realistic digital reset',
      blurb: 'A phone plan for a set window that is realistic rather than a detox: notification settings, check-in windows, offline replacements, and a message for people who might need you.',
      fields: [
        { key: 'start', label: 'Reset starts', type: 'time', blank: '[START TIME]' },
        { key: 'end', label: 'Reset ends', type: 'time', blank: '[END TIME]' },
        { key: 'drains', label: 'Apps or habits draining you most', type: 'text', wide: true, blank: '[LIST]', placeholder: 'e.g. Instagram, work email, refreshing the news' },
        { key: 'essential', label: 'What you still need the phone for', type: 'text', wide: true, blank: '[ESSENTIAL USES]', placeholder: 'e.g. calls from school, maps, banking' }
      ],
      template: 'Help me create a digital-reset plan from {{start}} to {{end}}. The apps or habits draining me most are {{drains}}, but I still need my phone for {{essential}}. Recommend specific notification settings, check-in windows, offline replacements, and a simple message for people who may contact me. Make the plan realistic rather than an extreme detox.'
    },
    {
      id: 'winddown', n: 8, tag: 'Recover',
      title: 'Create a gentle evening wind-down',
      blurb: 'A sixty-minute routine for tonight, a five-minute version for the nights you have nothing left, and a short ritual for closing out the things you did not finish.',
      fields: [
        { key: 'bedtime', label: 'When you usually sleep', type: 'time', blank: '[TIME]' },
        { key: 'obstacle', label: 'Your biggest obstacle', type: 'select', blank: '[WORK/SCROLLING/WORRY/NOISE]', options: ['work', 'scrolling', 'worry', 'noise'] },
        { key: 'enjoy', label: 'What you enjoy in the evening', type: 'multi', wide: true, blank: '[READING/MUSIC/SHOWERING/STRETCHING/JOURNALING]', options: ['reading', 'music', 'showering', 'stretching', 'journaling'] }
      ],
      template: 'Design a 60-minute wind-down routine for tonight. I usually sleep at {{bedtime}}, my biggest obstacle is {{obstacle}}, and I enjoy {{enjoy}}. Give me a minute-by-minute routine, a five-minute version for low-energy nights, and a short ‘mental closing ritual’ for unfinished tasks.'
    },
    {
      id: 'monday', n: 9, tag: 'Prepare',
      title: 'Make Monday less overwhelming',
      blurb: 'A minimum-effort Sunday plan: three priorities, the first tiny step for each, one thing to postpone, one boundary to hold, and a kind sentence for when you feel behind.',
      fields: [
        { key: 'responsibilities', label: 'Your responsibilities this week', type: 'textarea', wide: true, blank: '[LIST]', placeholder: 'e.g. the quarterly report, two client calls, onboarding the new starter, school pickup Tuesday' },
        { key: 'concerns', label: 'Your three biggest concerns', type: 'textarea', wide: true, blank: '[LIST]', placeholder: 'e.g. the report isn’t started; I haven’t replied to Sam; I don’t know what the 10am is about' },
        { key: 'minutes', label: 'Minutes you can spare to prepare', type: 'number', blank: '[NUMBER]', placeholder: 'e.g. 30' }
      ],
      template: 'Help me prepare for Monday without sacrificing my entire Sunday. My responsibilities are {{responsibilities}}, my three biggest concerns are {{concerns}}, and my available preparation time is {{minutes}} minutes. Create a minimum-effort plan containing: three priorities, the first tiny action for each, one task to postpone, one boundary to protect, and a compassionate sentence to use when I feel behind.'
    },
    {
      id: 'support', n: 10, tag: 'Protect',
      title: 'Build a personal support plan',
      blurb: 'Who you can lean on, two messages you could actually send, the signs that mean you should not handle this alone, and how to reach a qualified professional. The prompt asks the assistant not to diagnose you.',
      fields: [
        { key: 'people', label: 'People you trust', type: 'text', wide: true, blank: '[NAMES/ROLES]', hint: 'Names or roles. Nothing here leaves your device.', placeholder: 'e.g. Priya (friend), my brother, my GP' },
        { key: 'comfortable', label: 'What you are comfortable asking for', type: 'multi', wide: true, blank: '[LISTENING/PRACTICAL HELP/COMPANY/PROFESSIONAL SUPPORT]', options: ['listening', 'practical help', 'company', 'professional support'] }
      ],
      template: 'Help me create a support plan for periods of exhaustion or emotional overwhelm. My trusted people include {{people}}, and I’m comfortable asking for {{comfortable}}. Draft two short messages asking for help, suggest signs that mean I shouldn’t handle this alone, and list practical steps for contacting an appropriate qualified professional. Do not diagnose me.'
    }
  ];

  var LINK_LIMIT = 6000; // characters; beyond this a URL gets unreliable, copy instead

  var drafts = load(STORE.drafts, {});
  var done = load(STORE.done, []);
  var current = null;

  function $(sel) { return document.querySelector(sel); }
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'className') node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ----- value formatting ------------------------------------------------ */

  function joinList(items) {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function to12h(hhmm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
    if (!m) return hhmm || '';
    var h = parseInt(m[1], 10), min = m[2];
    var suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + min + ' ' + suffix;
  }
  function formatValue(field, raw) {
    if (raw === undefined || raw === null) return '';
    if (field.type === 'multi') return Array.isArray(raw) ? joinList(raw) : '';
    if (field.type === 'time') return to12h(String(raw));
    return String(raw).trim();
  }
  function fieldValue(prompt, field) {
    var d = drafts[prompt.id] || {};
    return formatValue(field, d[field.key]);
  }

  /* Returns { text, blanks, parts } where parts is a list of
     { kind: 'text'|'filled'|'blank', value } for rendering. */
  function assemble(prompt) {
    var byKey = {};
    prompt.fields.forEach(function (f) { byKey[f.key] = f; });
    var parts = [], text = '', blanks = 0;
    var re = /\{\{(\w+)\}\}/g, last = 0, m;
    while ((m = re.exec(prompt.template)) !== null) {
      if (m.index > last) {
        var chunk = prompt.template.slice(last, m.index);
        parts.push({ kind: 'text', value: chunk }); text += chunk;
      }
      var field = byKey[m[1]];
      var val = field ? fieldValue(prompt, field) : '';
      if (val) { parts.push({ kind: 'filled', value: val }); text += val; }
      else { var b = field ? field.blank : '[' + m[1] + ']'; parts.push({ kind: 'blank', value: b }); text += b; blanks++; }
      last = re.lastIndex;
    }
    if (last < prompt.template.length) {
      var tail = prompt.template.slice(last);
      parts.push({ kind: 'text', value: tail }); text += tail;
    }
    return { text: text, blanks: blanks, parts: parts };
  }

  /* ----- rendering ------------------------------------------------------- */

  function renderNav() {
    var ol = $('#nav'); ol.textContent = '';
    PROMPTS.forEach(function (p) {
      var li = el('li');
      var btn = el('button', { type: 'button', className: 'item' + (done.indexOf(p.id) >= 0 ? ' done' : '') });
      if (current && current.id === p.id) btn.setAttribute('aria-current', 'true');
      btn.appendChild(el('span', { className: 'num' }, String(p.n).padStart(2, '0')));
      var ttl = el('span', { className: 'ttl' }, p.title);
      ttl.appendChild(el('span', { className: 'tag' }, p.tag));
      btn.appendChild(ttl);
      btn.appendChild(el('span', { className: 'tick', 'aria-hidden': 'true' }, '✓'));
      if (done.indexOf(p.id) >= 0) btn.appendChild(el('span', { className: 'sr' }, '(done)'));
      btn.addEventListener('click', function () { select(p); });
      li.appendChild(btn); ol.appendChild(li);
    });
    $('#progress').textContent = done.length + ' of ' + PROMPTS.length + ' done';
  }

  function setDraft(key, value) {
    if (!drafts[current.id]) drafts[current.id] = {};
    drafts[current.id][key] = value;
    save(STORE.drafts, drafts);
    renderPreview();
  }

  function renderFields() {
    var host = $('#fields'); host.textContent = '';
    if (!current.fields.length) {
      host.appendChild(el('p', { className: 'nofields' }, 'Nothing to fill in for this one. It is ready to go as written.'));
      return;
    }
    var d = drafts[current.id] || {};
    current.fields.forEach(function (f) {
      var wrap = el('div', { className: 'field' + (f.wide ? ' wide' : '') });
      var id = 'f-' + current.id + '-' + f.key;
      var control;

      if (f.type === 'multi') {
        wrap.appendChild(el('span', { className: 'lbl', id: id + '-lbl' }, f.label));
        var chips = el('div', { className: 'chips', role: 'group', 'aria-labelledby': id + '-lbl' });
        var selected = Array.isArray(d[f.key]) ? d[f.key].slice() : [];
        f.options.forEach(function (opt) {
          var chip = el('button', { type: 'button', className: 'chip', 'aria-pressed': selected.indexOf(opt) >= 0 ? 'true' : 'false' }, opt);
          chip.addEventListener('click', function () {
            var i = selected.indexOf(opt);
            if (i >= 0) selected.splice(i, 1); else selected.push(opt);
            // keep the order of the option list, it reads better in the prompt
            selected.sort(function (a, b) { return f.options.indexOf(a) - f.options.indexOf(b); });
            chip.setAttribute('aria-pressed', selected.indexOf(opt) >= 0 ? 'true' : 'false');
            setDraft(f.key, selected.slice());
          });
          chips.appendChild(chip);
        });
        wrap.appendChild(chips);
      } else {
        wrap.appendChild(el('label', { 'for': id }, f.label));
        if (f.type === 'textarea') {
          control = el('textarea', { id: id, rows: '4' });
        } else if (f.type === 'select') {
          control = el('select', { id: id });
          control.appendChild(el('option', { value: '' }, 'Choose…'));
          f.options.forEach(function (opt) { control.appendChild(el('option', { value: opt }, opt)); });
        } else {
          control = el('input', { id: id, type: f.type });
          if (f.type === 'number') { control.setAttribute('min', '0'); control.setAttribute('inputmode', 'numeric'); }
        }
        if (f.placeholder) control.setAttribute('placeholder', f.placeholder);
        control.value = d[f.key] !== undefined ? d[f.key] : '';
        control.addEventListener('input', function () { setDraft(f.key, control.value); });
        wrap.appendChild(control);
      }
      if (f.hint) wrap.appendChild(el('div', { className: 'hint' }, f.hint));
      host.appendChild(wrap);
    });
  }

  function renderPreview() {
    var out = assemble(current);
    var box = $('#preview'); box.textContent = '';
    out.parts.forEach(function (p) {
      if (p.kind === 'text') box.appendChild(document.createTextNode(p.value));
      else box.appendChild(el('span', { className: p.kind, title: p.kind === 'blank' ? 'Still to fill in' : '' }, p.value));
    });
    var blanks = $('#blanks');
    if (!current.fields.length) { blanks.textContent = 'ready'; blanks.className = 'blanks ok'; }
    else if (out.blanks === 0) { blanks.textContent = 'all blanks filled'; blanks.className = 'blanks ok'; }
    else { blanks.textContent = out.blanks + (out.blanks === 1 ? ' blank left' : ' blanks left'); blanks.className = 'blanks'; }

    var tooLong = out.text.length > LINK_LIMIT;
    var q = encodeURIComponent(out.text);
    var claude = $('#open-claude'), chatgpt = $('#open-chatgpt');
    claude.href = 'https://claude.ai/new?q=' + q;
    chatgpt.href = 'https://chatgpt.com/?q=' + q;
    [claude, chatgpt].forEach(function (a) {
      a.setAttribute('aria-disabled', tooLong ? 'true' : 'false');
      a.title = tooLong ? 'Too long to pass in a link. Copy it instead.' : '';
    });

    var isDone = done.indexOf(current.id) >= 0;
    var doneBtn = $('#done');
    doneBtn.textContent = isDone ? 'Done ✓' : 'Mark as done';
    doneBtn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
  }

  function renderBuilder() {
    $('#b-num').textContent = String(current.n);
    $('#b-tag').textContent = current.tag;
    $('#b-title').textContent = current.title;
    $('#b-blurb').textContent = current.blurb;
    var i = PROMPTS.indexOf(current);
    $('#prev').disabled = i === 0;
    $('#next').disabled = i === PROMPTS.length - 1;
    renderFields();
    renderPreview();
  }

  function select(prompt, opts) {
    current = prompt;
    if (location.hash !== '#' + prompt.n) history.replaceState(null, '', '#' + prompt.n);
    renderBuilder();
    renderNav();
    if (opts && opts.focus) $('#b-title').focus({ preventScroll: false });
    if (opts && opts.scroll && window.innerWidth <= 860) {
      $('#builder').scrollIntoView({ block: 'start' });
    }
  }
  function fromHash() {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    var p = PROMPTS.filter(function (x) { return x.n === n; })[0];
    return p || PROMPTS[0];
  }

  /* ----- actions --------------------------------------------------------- */

  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function wire() {
    $('#copy').addEventListener('click', function () {
      var out = assemble(current);
      copyText(out.text).then(function () {
        toast(out.blanks ? 'Copied, with ' + out.blanks + ' blank' + (out.blanks === 1 ? '' : 's') + ' still to fill' : 'Copied');
      }, function () { toast('Could not copy. Select the text and copy it by hand.'); });
    });
    $('#done').addEventListener('click', function () {
      var i = done.indexOf(current.id);
      if (i >= 0) done.splice(i, 1); else done.push(current.id);
      save(STORE.done, done);
      renderPreview(); renderNav();
    });
    $('#clear').addEventListener('click', function () {
      delete drafts[current.id]; save(STORE.drafts, drafts);
      renderFields(); renderPreview(); toast('Cleared');
    });
    $('#prev').addEventListener('click', function () {
      var i = PROMPTS.indexOf(current); if (i > 0) select(PROMPTS[i - 1], { focus: true, scroll: true });
    });
    $('#next').addEventListener('click', function () {
      var i = PROMPTS.indexOf(current); if (i < PROMPTS.length - 1) select(PROMPTS[i + 1], { focus: true, scroll: true });
    });
    $('#reset-all').addEventListener('click', function () {
      if (!confirm('Erase every draft and the progress ticks stored in this browser? This cannot be undone.')) return;
      drafts = {}; done = [];
      remove(STORE.drafts); remove(STORE.done); remove(STORE.ack);
      location.hash = ''; location.reload();
    });
    window.addEventListener('hashchange', function () {
      var p = fromHash(); if (p !== current) select(p);
    });
    // The "Open in" links carry the prompt in the URL; if the user disabled
    // them (too long) make sure a keyboard activation does nothing either.
    ['#open-claude', '#open-chatgpt'].forEach(function (sel) {
      $(sel).addEventListener('click', function (e) {
        if (this.getAttribute('aria-disabled') === 'true') e.preventDefault();
      });
    });
  }

  function gate() {
    var dlg = $('#gate');
    if (load(STORE.ack, null)) return;
    if (typeof dlg.showModal !== 'function') { dlg.setAttribute('open', ''); }
    else { dlg.showModal(); }
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); });
    $('#ack').addEventListener('click', function () {
      save(STORE.ack, new Date().toISOString());
      dlg.close ? dlg.close() : dlg.removeAttribute('open');
      $('#b-title').setAttribute('tabindex', '-1');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('#b-title').setAttribute('tabindex', '-1');
    wire();
    select(fromHash());
    gate();
  });
})();
