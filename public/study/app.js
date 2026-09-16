// Study Prompt Builder. Plain browser JavaScript, no dependencies, no network.
// Templates come from templates.js (generated from learning-course-templates.md).
(function () {
  'use strict';

  var TEMPLATES = window.STUDY_TEMPLATES || [];
  var STORE_KEY = 'study-prompt-builder:v1';
  var PLACEHOLDER = /\[([^\[\]]+)\]/g;

  var els = {
    picker: document.getElementById('picker'),
    title: document.getElementById('tpl-title'),
    meta: document.getElementById('tpl-meta'),
    form: document.getElementById('form'),
    preview: document.getElementById('preview'),
    copy: document.getElementById('copy'),
    claude: document.getElementById('open-claude'),
    chatgpt: document.getElementById('open-chatgpt'),
    status: document.getElementById('status'),
    clear: document.getElementById('clear'),
    counter: document.getElementById('counter')
  };

  // ---- persistence (best effort; the page must work with no storage) ----
  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') { return parsed; }
    } catch (e) { /* private mode, blocked storage, bad JSON */ }
    return {};
  }
  function saveState(state) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  var state = loadState();          // { current: id, values: { id: { NAME: text } } }
  if (!state.values) { state.values = {}; }

  // ---- helpers ----
  function placeholders(text) {
    var seen = {}, out = [];
    text.replace(PLACEHOLDER, function (m, name) {
      if (!seen[name]) { seen[name] = true; out.push(name); }
      return m;
    });
    return out;
  }
  function isLong(name) { return /PASTE|MATERIAL|NOTES|TRANSCRIPT/i.test(name); }
  function options(name) {
    // "[BEGINNER/INTERMEDIATE/ADVANCED]" -> ["Beginner", "Intermediate", "Advanced"]
    // "[4/8/12]-week" style placeholders are options too; "TOPIC/QUESTION" is
    // also a slash, so only treat it as options when every part is short-ish
    // and there are at least two of them.
    if (name.indexOf('/') === -1) { return []; }
    var parts = name.split('/');
    if (parts.length < 2) { return []; }
    return parts.map(function (p) { return titleCase(p.trim()); });
  }
  function titleCase(s) {
    if (/^\d/.test(s)) { return s; }
    return s.charAt(0) + s.slice(1).toLowerCase();
  }
  function findTemplate(id) {
    for (var i = 0; i < TEMPLATES.length; i++) { if (TEMPLATES[i].id === id) { return TEMPLATES[i]; } }
    return TEMPLATES[0];
  }
  function currentTemplate() {
    var hashId = window.location.hash.replace(/^#/, '');
    if (hashId && findTemplate(hashId).id === hashId) { state.current = hashId; }
    return findTemplate(state.current);
  }
  function valuesFor(tpl) {
    if (!state.values[tpl.id]) { state.values[tpl.id] = {}; }
    return state.values[tpl.id];
  }
  function fillText(tpl) {
    var vals = valuesFor(tpl);
    return tpl.text.replace(PLACEHOLDER, function (m, name) {
      var v = (vals[name] || '').trim();
      return v ? v : m;
    });
  }
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) { Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); }); }
    if (text != null) { node.textContent = text; }
    return node;
  }
  function setStatus(msg, cls) {
    els.status.textContent = msg;
    els.status.className = 'status' + (cls ? ' ' + cls : '');
    if (msg) {
      window.clearTimeout(setStatus.t);
      setStatus.t = window.setTimeout(function () { setStatus(''); }, 2400);
    }
  }

  // ---- step 1: picker ----
  function renderPicker() {
    els.picker.textContent = '';
    var groups = [];
    TEMPLATES.forEach(function (t) { if (groups.indexOf(t.group) === -1) { groups.push(t.group); } });
    var cur = currentTemplate();
    groups.forEach(function (g) {
      els.picker.appendChild(el('div', { 'class': 'group-lbl' }, g));
      var list = el('ul', { 'class': 'picker', role: 'list' });
      TEMPLATES.filter(function (t) { return t.group === g; }).forEach(function (t) {
        var li = el('li');
        var btn = el('button', {
          type: 'button',
          'data-id': t.id,
          'aria-pressed': String(t.id === cur.id)
        }, t.title);
        btn.addEventListener('click', function () { select(t.id); });
        li.appendChild(btn);
        list.appendChild(li);
      });
      els.picker.appendChild(list);
    });
  }
  function select(id) {
    state.current = id;
    saveState(state);
    if (window.location.hash !== '#' + id) {
      try { window.history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
    }
    var buttons = els.picker.querySelectorAll('button[data-id]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-id') === id));
    }
    renderForm();
    renderPreview();
    var first = els.form.querySelector('input, textarea');
    if (first && document.activeElement && document.activeElement.tagName === 'BUTTON') { first.focus(); }
  }

  // ---- step 2: form ----
  function renderForm() {
    var tpl = currentTemplate();
    var names = placeholders(tpl.text);
    var vals = valuesFor(tpl);
    els.title.textContent = tpl.title;
    els.meta.textContent = tpl.group + ' · ' + names.length + (names.length === 1 ? ' blank' : ' blanks');
    els.form.textContent = '';
    if (!names.length) {
      els.form.appendChild(el('p', { 'class': 'none' }, 'This template has no blanks to fill.'));
      return;
    }
    names.forEach(function (name, idx) {
      var id = 'f-' + tpl.id + '-' + idx;
      var wrap = el('div', { 'class': 'field' });
      var label = el('label', { 'for': id }, name);
      var opts = options(name);
      var long = isLong(name);
      var input;
      if (long) {
        input = el('textarea', { id: id, placeholder: 'Paste it here' });
      } else {
        input = el('input', { id: id, type: 'text', placeholder: opts.length ? opts.join(' / ') : name.toLowerCase() });
        if (opts.length) {
          var listId = id + '-opts';
          var dl = el('datalist', { id: listId });
          opts.forEach(function (o) { dl.appendChild(el('option', { value: o })); });
          input.setAttribute('list', listId);
          wrap.appendChild(dl);
          label.appendChild(el('span', { 'class': 'opts' }, ' · pick one or type your own'));
        }
      }
      input.value = vals[name] || '';
      input.addEventListener('input', function () {
        vals[name] = input.value;
        saveState(state);
        renderPreview();
      });
      wrap.appendChild(label);
      wrap.appendChild(input);
      els.form.appendChild(wrap);
    });
  }

  // ---- step 3: preview + actions ----
  function renderPreview() {
    var tpl = currentTemplate();
    var vals = valuesFor(tpl);
    els.preview.textContent = '';
    var last = 0, missing = 0, total = 0, seen = {};
    var m;
    PLACEHOLDER.lastIndex = 0;
    while ((m = PLACEHOLDER.exec(tpl.text)) !== null) {
      if (m.index > last) { els.preview.appendChild(document.createTextNode(tpl.text.slice(last, m.index))); }
      var name = m[1];
      var v = (vals[name] || '').trim();
      if (!seen[name]) { seen[name] = true; total++; if (!v) { missing++; } }
      if (v) {
        els.preview.appendChild(el('span', { 'class': 'filled' }, v));
      } else {
        els.preview.appendChild(el('span', { 'class': 'gap' }, m[0]));
      }
      last = m.index + m[0].length;
    }
    if (last < tpl.text.length) { els.preview.appendChild(document.createTextNode(tpl.text.slice(last))); }

    var text = fillText(tpl);
    var q = encodeURIComponent(text);
    els.claude.href = 'https://claude.ai/new?q=' + q;
    els.chatgpt.href = 'https://chatgpt.com/?q=' + q;
    els.counter.textContent = total
      ? (missing ? missing + ' of ' + total + ' blanks still empty · ' : 'All blanks filled · ') + text.length + ' characters'
      : text.length + ' characters';
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el('textarea', { 'aria-hidden': 'true' });
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  els.copy.addEventListener('click', function () {
    var tpl = currentTemplate();
    copyText(fillText(tpl)).then(function () {
      setStatus('Copied to clipboard', 'ok');
    }, function () {
      setStatus('Could not copy. Select the text above and copy it by hand.', 'bad');
    });
  });

  els.clear.addEventListener('click', function () {
    var tpl = currentTemplate();
    state.values[tpl.id] = {};
    saveState(state);
    renderForm();
    renderPreview();
    setStatus('Cleared', 'ok');
  });

  window.addEventListener('hashchange', function () {
    var id = window.location.hash.replace(/^#/, '');
    if (id && findTemplate(id).id === id && id !== state.current) { select(id); }
  });

  // ---- boot ----
  if (!TEMPLATES.length) {
    els.title.textContent = 'No templates loaded';
    els.meta.textContent = 'templates.js did not load';
    return;
  }
  renderPicker();
  renderForm();
  renderPreview();
})();
