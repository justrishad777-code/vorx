/* VORX shared core: theme, header + menu, numpad, toast, storage */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('vorx.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('vorx.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const fmt = n => (+n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const buzz = n => { try { navigator.vibrate && navigator.vibrate(n || 8); } catch (e) {} };

  /* theme chosen in Settings applies on every page */
  const theme = store.get('theme', {});
  for (const k in theme) document.documentElement.style.setProperty('--' + k, theme[k]);

  let tt;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1900);
  }

  const LOGO = '<svg viewBox="0 0 512 512" aria-hidden="true"><polygon points="112,150 188,150 256,330 256,398 220,398" fill="#f6c935"/><polygon points="400,150 324,150 256,330 256,398 292,398" fill="#b8860b"/><polygon points="256,86 294,128 256,170 218,128" fill="#e63cf3"/></svg>';
  const NAV = [
    ['index', 'VORX', 'V'], ['rate', 'BULLION', 'Au'], ['karat', 'KARAT', 'K'], ['price', 'VALUER', '$'],
    ['converter', 'CONVERTER', '⇆'], ['casio', 'MATRIX', '#'], ['settings', 'SETTINGS', '⚙']
  ];

  /* numpad: replaces the phone keyboard for any [data-pad] field */
  let cur = null;
  const fields = () => $$('[data-pad]').filter(e => !e.readOnly && e.offsetParent);
  function openPad(el) {
    if (cur) cur.classList.remove('on');
    cur = el; el.classList.add('on');
    document.body.classList.add('padding');
    $('#padt').textContent = el.dataset.pad;
    lift(el);
  }
  /* one-screen pages never scroll: the frame slides up so the active field stays above the pad */
  function lift(el) {
    const w = $('.wrap');
    if (!w || !document.body.classList.contains('fit')) return el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const L = -new DOMMatrix(getComputedStyle(w).transform).m42, head = 74;
    const limit = innerHeight - $('#pad').offsetHeight - 10;
    const kids = [...w.children].filter(k => k.offsetParent);
    const free = Math.max(0, kids[0].getBoundingClientRect().top + L - head);          /* empty space above the content */
    const whole = Math.max(0, kids[kids.length - 1].getBoundingClientRect().bottom + L - limit);
    const r = el.getBoundingClientRect(), mine = Math.max(0, r.bottom + L - limit), cap = Math.max(0, r.top + L - head);
    const need = Math.min(Math.max(mine, Math.min(whole, free)), cap);
    w.style.transform = need ? `translateY(${-need}px)` : '';
  }
  function closePad() {
    if (cur) cur.classList.remove('on');
    cur = null; document.body.classList.remove('padding');
    const w = $('.wrap'); if (w) w.style.transform = '';
  }
  function pressKey(k) {
    buzz();
    if (k === 'done') return closePad();
    if (k === 'next') { const f = fields(), n = f[f.indexOf(cur) + 1]; return n ? openPad(n) : closePad(); }
    let v = cur.value;
    if (k === 'del') v = v.slice(0, -1);
    else if (k === '.') { if (v.includes('.')) return; v = (v || '0') + '.'; }
    else { if (v.replace('.', '').length >= 12) return; v = (v === '0' ? '' : v) + k; }
    cur.value = v;
    cur.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function init() {
    const page = document.body.dataset.page, title = document.body.dataset.title || 'VORX';
    document.body.insertAdjacentHTML('afterbegin',
      `<header class="top"><button class="tear" id="mb" aria-label="Menu" aria-expanded="false"><i></i></button><h1>${title}</h1><a class="mark" href="index.html" aria-label="VORX home">${LOGO}</a></header>
       <div id="scrim"></div>
       <nav id="menu" aria-label="Modules">${NAV.map((n, i) => `<a class="nav${n[0] === page ? ' cur' : ''}" href="${n[0]}.html" style="--i:${i}"><span class="ico">${n[2]}</span>${n[1]}</a>`).join('')}</nav>`);
    document.body.insertAdjacentHTML('beforeend',
      `<div id="pad" role="group" aria-label="Number pad"><div class="padh"><b id="padt"></b><span><button class="pill" data-k="next">Next ›</button><button class="pill done" data-k="done">Done</button></span></div><div class="keys">${'123456789.0'.split('').map(k => `<button class="k" data-k="${k}">${k}</button>`).join('')}<button class="k del" data-k="del" aria-label="Delete">⌫</button></div></div><div id="toast" role="status"></div>`);

    const setMenu = o => { document.body.classList.toggle('menu-open', o); $('#mb').setAttribute('aria-expanded', o); if (o) closePad(); };
    $('#mb').onclick = () => { buzz(); setMenu(!document.body.classList.contains('menu-open')); };
    $('#scrim').onclick = () => setMenu(false);

    $('#pad').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b && cur) pressKey(b.dataset.k); });
    document.addEventListener('focusin', e => {
      const t = e.target;
      if (!t.matches || !t.matches('[data-pad]')) return;
      if (t.readOnly) return closePad();
      t.blur(); openPad(t);
    });
    document.addEventListener('click', e => { if (cur && !e.target.closest('#pad,[data-pad],.edit')) closePad(); });

    /* before the final pages are all built, the demo build sets VORX_DEMO */
    if (window.VORX_DEMO) document.addEventListener('click', e => {
      const a = e.target.closest('a[href$=".html"]'); if (!a) return;
      e.preventDefault(); setMenu(false);
      if (a.getAttribute('href') !== (page + '.html')) toast(a.textContent.trim() + ' page is built in a later step');
    });
    if ('serviceWorker' in navigator && !window.VORX_DEMO && location.protocol.startsWith('http'))
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
  window.VORX = { $, $$, store, fmt, toast, buzz, openPad, closePad };
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); VORX.installEvt = e; window.dispatchEvent(new Event('vorx-install')); });
})();
