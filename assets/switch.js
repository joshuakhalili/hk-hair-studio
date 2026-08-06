/* Tier switcher — shared by essentials/ and signature/.
   Three jobs:
     1. Carry your scroll position across when you flip A <-> B, so the same
        part of the page is on screen in both. That is the whole point of it.
     2. Keyboard shortcuts, so the pitch doesn't involve hunting for a button:
        1 = Option A   2 = Option B   C = compare   0 or Esc = both options
     3. Tell the page when it is running inside the compare view, so it can
        hide the switcher rather than show two of them.
   No dependencies. Safe to load twice. */
(function () {
  'use strict';

  var KEY = 'hk.scrollFrac';
  var root = document.documentElement;

  /* --- where are we, and what is "up" from here --- */
  // Both tier pages sit one level below the site root.
  var UP = '../';

  /* --- running inside the compare view? --- */
  try {
    if (window.self !== window.top) root.classList.add('hk-embedded');
  } catch (e) {
    // Cross-origin parent. Treat as embedded — safer than showing the switcher.
    root.classList.add('hk-embedded');
  }

  /* --- scroll position, as a fraction of scrollable height --- */
  function currentFraction() {
    var max = root.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  function remember() {
    try { sessionStorage.setItem(KEY, String(currentFraction())); } catch (e) {}
  }

  /* --- restore on arrival --- */
  (function restore() {
    var raw;
    try { raw = sessionStorage.getItem(KEY); } catch (e) { return; }
    if (raw === null) return;
    try { sessionStorage.removeItem(KEY); } catch (e) {}

    var f = parseFloat(raw);
    if (!isFinite(f) || f <= 0.01) return;

    function jump() {
      var max = root.scrollHeight - window.innerHeight;
      if (max > 0) window.scrollTo({ top: max * f, behavior: 'instant' });
    }
    // Once when the DOM is ready, again after load — images settling change
    // the document height, and the second pass lands it properly.
    jump();
    window.addEventListener('load', function () { jump(); setTimeout(jump, 150); });
  })();

  /* --- clicking any switcher link remembers where you were --- */
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.hasAttribute && el.hasAttribute('data-tier-link')) { remember(); return; }
      el = el.parentNode;
    }
  }, true);

  /* --- keyboard --- */
  var DEST = { '1': 'essentials/', '2': 'signature/', 'c': 'compare/', '0': '' };

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    var t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;

    var key = e.key === 'Escape' ? '0' : String(e.key).toLowerCase();
    if (!(key in DEST)) return;

    e.preventDefault();
    remember();
    window.location.href = UP + DEST[key];
  });
})();
