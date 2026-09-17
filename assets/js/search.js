/* Site search — loads /search.json on first open, ranks matches client-side.
   Shortcuts: "/" or Ctrl/⌘ K to open, ↑/↓ to move, Enter to open, Esc to close. */
(function () {
  var modal = document.getElementById('search-modal');
  if (!modal) return;
  var input = document.getElementById('search-input');
  var list = document.getElementById('search-results');
  var openers = document.querySelectorAll('.search-open');
  var index = null, loading = null, active = -1, results = [], lastFocus = null;

  var LABELS = { page: 'page', cv: 'cv', essay: 'essay', poem: 'poem', story: 'story', reflection: 'reflection',
    medium: 'blog · medium', substack: 'blog · dyota', book: 'book', code: 'code', project: 'project', news: 'news', post: 'blog', paper: 'paper' };

  function norm(s) {
    return (s || '').toString().toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(modal.getAttribute('data-index'), { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        index = data.filter(function (d) { return d.k !== 'end' && d.t; }).map(function (d) {
          d._t = norm(d.t); d._x = norm(d.x); return d;
        });
        return index;
      })
      .catch(function () { index = []; return index; });
    return loading;
  }

  // Short terms (1–2 chars) only match at the start of a word, so "as" finds
  // "Assignment" but not "infrastructure".
  function find(hay, t) {
    if (t.length > 2) return hay.indexOf(t);
    var i = hay.indexOf(t);
    while (i !== -1) {
      if (i === 0 || !/[a-z0-9]/.test(hay.charAt(i - 1))) return i;
      i = hay.indexOf(t, i + 1);
    }
    return -1;
  }

  function score(item, terms) {
    var s = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var ti = find(item._t, t), xi = find(item._x, t);
      if (ti === -1 && xi === -1) return 0;           // every term must match somewhere
      if (ti === 0) s += 12;                           // title starts with term
      else if (ti > 0) s += (/[a-z0-9]/.test(item._t.charAt(ti - 1)) ? 5 : 8);
      if (xi !== -1) s += 1;
    }
    if (item.k === 'essay' || item.k === 'poem' || item.k === 'story') s += 0.5;
    return s;
  }

  function esc(s) {
    return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      var safe = esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = t.length > 2 ? new RegExp('(' + safe + ')', 'ig') : new RegExp('(^|[^A-Za-z0-9])(' + safe + ')', 'ig');
      out = t.length > 2 ? out.replace(re, '<mark>$1</mark>') : out.replace(re, '$1<mark>$2</mark>');
    });
    return out;
  }

  function snippet(item, terms) {
    if (!item.x || item.x === 'wordpress') return '';
    var x = item.x, lx = norm(x), pos = -1;
    for (var i = 0; i < terms.length && pos === -1; i++) pos = find(lx, terms[i]);
    if (pos === -1) return x.length > 120 ? x.slice(0, 120) + '…' : x;
    var start = Math.max(0, pos - 50);
    return (start > 0 ? '…' : '') + x.slice(start, start + 130) + (start + 130 < x.length ? '…' : '');
  }

  function render(q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      results = [];
      list.innerHTML = '<li class="search-empty">Try <em>ebpf</em>, <em>love</em>, <em>GPU</em>, <em>Harvard</em> or <em>iggy</em>.</li>';
      active = -1;
      return;
    }
    results = index.map(function (it) { return { it: it, s: score(it, terms) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 12)
      .map(function (r) { return r.it; });
    if (!results.length) {
      list.innerHTML = '<li class="search-empty">No results for “' + esc(q) + '”.</li>';
      active = -1;
      return;
    }
    list.innerHTML = results.map(function (r, i) {
      var external = /^https?:/.test(r.u) && r.u.indexOf(location.host) === -1;
      return '<li role="option" id="sr-' + i + '"><a href="' + esc(r.u) + '"' + (external ? ' rel="noopener"' : '') + '>' +
        '<span class="sr-top"><span class="sr-title">' + highlight(r.t, terms) + '</span>' +
        '<span class="sr-kind mono">' + esc(LABELS[r.k] || r.k) + (r.d ? ' · ' + esc(r.d) : '') + (external ? ' ↗' : '') + '</span></span>' +
        (snippet(r, terms) ? '<span class="sr-snip">' + highlight(snippet(r, terms), terms) + '</span>' : '') +
        '</a></li>';
    }).join('');
    setActive(0);
  }

  function setActive(i) {
    var items = list.querySelectorAll('li[role="option"]');
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach(function (el, j) { el.classList.toggle('is-active', j === active); el.setAttribute('aria-selected', j === active); });
    input.setAttribute('aria-activedescendant', 'sr-' + active);
    items[active].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('search-lock');
    input.value = '';
    list.innerHTML = '<li class="search-empty">Loading…</li>';
    input.focus();
    load().then(function () { render(input.value); });
  }

  function close() {
    modal.hidden = true;
    document.documentElement.classList.remove('search-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openers.forEach(function (b) { b.addEventListener('click', open); });
  modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
  input.addEventListener('input', function () { if (index) render(input.value); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') {
      var a = list.querySelector('li.is-active a');
      if (a) { e.preventDefault(); window.location.href = a.href; }
    }
  });

  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); close(); return; }
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); modal.hidden ? open() : close(); return; }
    if (e.key === '/' && !typing && modal.hidden) { e.preventDefault(); open(); }
  });
})();
