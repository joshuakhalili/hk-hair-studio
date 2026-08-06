/* ============================================================================
   HK Signature (Tier 2) — behaviour.
   Vanilla. No dependencies, no build step.

   Every price, duration, name, rating and opening hour below comes from
   Treatwell venue 462045 (data/treatwell-menu-462045.md). Nothing is invented,
   nothing is rounded, nothing comes from the old website or the window boards —
   both of those contradict the live diary. See docs/HKH-RES-002.

   n = name · d = minutes · p = £ · from = "from" price · note = qualifier
   ========================================================================== */
(() => {
  'use strict';

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------------------------------------------------------- data -- */

  const MENU = [
    { id:'ladies-cut', label:"Ladies' — Cuts & Styling", who:'ladies', items:[
      { n:'Hair Cut', d:30, p:30 },
      { n:'Wash & Haircut', d:40, p:35 },
      { n:'Wash, Haircut & Blow Dry', d:45, p:50, note:'short — above shoulders',
        say:'Washed, cut and dried properly. The one most people mean when they say “a haircut”.' },
      { n:'Wash, Haircut & Blow Dry', d:60, p:60, note:'long' },
      { n:'Blow Dry', d:30, p:30, note:'short' },
      { n:'Blow Dry', d:35, p:35, note:'long' },
      { n:'Wash & Blow Dry', d:40, p:35, note:'short' },
      { n:'Wash & Blow Dry', d:45, p:40, note:'long' },
      { n:'Hair Up', d:45, p:50, note:'occasions & weddings' },
      { n:"Children's Cut", d:25, p:24, note:'under 14' },
      { n:'Fringe Trim', d:10, p:10, say:'Ten minutes, a tenner, no appointment drama.' },
    ]},
    { id:'ladies-colour', label:"Ladies' — Colour", who:'ladies', items:[
      { n:'Toner', d:30, p:30 },
      { n:'Roots Colour', d:60, p:60 },
      { n:'Full Colour', d:90, p:80, from:true },
      { n:'T-Section Highlights', d:90, p:80, from:true },
      { n:'Half Head of Highlights', d:100, p:100, from:true },
      { n:'Full Head of Highlights', d:150, p:150, from:true },
      { n:'Balayage', d:210, p:180, from:true,
        say:'Three and a half hours, hand-painted, grown out soft so there is no line to chase in eight weeks.' },
    ]},
    { id:'ladies-treat', label:"Ladies' — Treatments", who:'ladies', items:[
      { n:'Olaplex Treatment', d:45, p:40 },
      { n:'Keratin Treatment', d:60, p:100, from:true },
      { n:'Brazilian Blowdry', d:105, p:200, note:'above shoulder',
        say:'Priced by length rather than guesswork — above shoulder, below shoulder, below mid back.' },
      { n:'Brazilian Blowdry', d:120, p:225, note:'below shoulder to mid back' },
      { n:'Brazilian Blowdry', d:150, p:250, note:'below mid back' },
      { n:'Perm', d:130, p:200 },
    ]},
    { id:'extensions', label:'Hair Extensions', who:'ladies', items:[
      { n:'Consultation', d:15, p:1,
        say:'A pound, so nobody commits to anything before colour and texture are matched properly.' },
      { n:'Hair Extensions Consultation', d:20, p:1 },
      { n:'Hair Extensions — full fitting', d:120, p:450, from:true },
    ]},
    /* Treatwell lists Patch Test as its own category, so it stays one here.
       It's a prerequisite for colour on BOTH sides of the room; filed under
       `ladies` only because the booking flow needs one staffing side and the
       hairdressers administer it. */
    { id:'patch', label:'Before colour', who:'ladies', items:[
      { n:'Patch Test', d:5, p:1,
        say:'Required at least 48 hours before any colour, highlights, keratin or Brazilian blowdry if you have not had one with us.' },
    ]},
    { id:'mens-cut', label:"Men's — Cuts", who:'mens', items:[
      { n:'Haircut & Styling', d:25, p:20, say:'The one we do most. Twenty-five minutes, finished properly.' },
      { n:'Skin Fade / Taper Fade & Styling', d:30, p:23 },
      { n:'Full Scissors Cut & Styling', d:25, p:21 },
      { n:'Clipper Cut All Over', d:20, p:17 },
      { n:'Re-Style', d:35, p:25 },
      { n:'O.A.P', d:25, p:17, note:'Monday to Thursday only' },
      { n:'Kids Haircut', d:20, p:17, note:'under 14' },
      { n:'Kids Skin Fade', d:25, p:20, note:'under 14' },
      { n:'Wash', d:5, p:3, say:'Three pounds. Sometimes five minutes is all you want.' },
    ]},
    { id:'mens-combo', label:"Men's — The Full Works", who:'mens', items:[
      { n:'Hair Cut, Beard, Hot Towel & Styling', d:45, p:34,
        say:'Forty-five minutes end to end. Cut, beard, hot towel, out the door sharp.' },
      { n:'Skin Fade, Styling, Beard Trim & Hot Towel', d:50, p:37 },
    ]},
    { id:'mens-beard', label:"Men's — Beard & Face", who:'mens', items:[
      { n:'Beard Trim / Shape Up / Hot Towel', d:25, p:18 },
      { n:'Beard Trim', d:15, p:10, note:'clippers only' },
      { n:'Wet Shave / Hot Towel', d:30, p:18 },
      { n:'Facial Waxing', d:20, p:10 },
      { n:'Facial Mask', d:25, p:10 },
    ]},
    { id:'mens-colour', label:"Men's — Colour & Perm", who:'mens', items:[
      { n:'Hair Colour', d:40, p:40 },
      { n:'Beard Colour', d:40, p:20 },
      { n:'Hair Colouring With Bleach', d:130, p:100, from:true },
      { n:"Men's Perm", d:60, p:90, note:'over 16' },
    ]},
  ];

  /* The two menus are staffed by different people. The booking flow has to
     respect that or it offers you a barber for a balayage. */
  const TEAM = [
    { n:'Hüseyin', role:'Hairdresser', r:4.9,  c:81, does:'ladies',
      note:'Colour and transformation work. The longest book in the salon.' },
    { n:'Stacey',  role:'Hairdresser', r:5.0,  c:61, does:'ladies',
      note:'Cutting, colour and extensions. Sixty-one reviews, not one below five.' },
    { n:'Yanbolu', role:'Hairdresser', r:4.8,  c:15, does:'ladies',
      note:'Cuts, colour, treatments and extensions.' },
    { n:'Hami',    role:'Barber',      r:5.0,  c:24, does:'mens',
      note:'Fades and beard work.' },
    { n:'Marcus',  role:'Barber',      r:5.0,  c:16, does:'mens',
      note:'Scissor work and classic cuts.' },
    { n:'Yunus',   role:'Barber',      r:4.9,  c:10, does:'mens',
      note:'Fades, shape-ups and hot towel shaves.' },
    { n:'Sihan',   role:'Barber',      r:null, c:0,  does:'mens',
      note:'Newest to the chair. No reviews yet — first appointments going now.' },
  ];

  /* Treatwell hours. NOT the sticker on their door, which says Sunday closed
     and weekdays to 6pm. That contradiction is HKH-RES-002 §4b, and it is a
     question for the client, not something to quietly pick a side on. */
  const HOURS = [
    { d:'Monday',    o:'09:00', c:'19:00' }, { d:'Tuesday',   o:'09:00', c:'19:00' },
    { d:'Wednesday', o:'09:00', c:'19:00' }, { d:'Thursday',  o:'09:00', c:'19:00' },
    { d:'Friday',    o:'09:00', c:'19:00' }, { d:'Saturday',  o:'09:00', c:'19:00' },
    { d:'Sunday',    o:'10:00', c:'17:00' },
  ];

  const mins = m => m >= 60
    ? (m % 60 ? `${Math.floor(m/60)} hr ${m%60} min` : `${Math.floor(m/60)} hr`)
    : `${m} min`;

  /* ------------------------------------------------------- services menu -- */

  (function renderMenu() {
    const acc = $('#acc');
    if (!acc) return;
    acc.innerHTML = MENU.map((g, gi) => `
      <details${gi === 0 ? ' open' : ''}>
        <summary>
          <h3>${g.label}</h3>
          <span class="count mono">${g.items.length}</span>
          <span class="chev" aria-hidden="true"></span>
        </summary>
        <div class="acc__body">
          ${g.items.map(s => `
            <div class="srow">
              <div class="srow__n">${s.n}${s.note ? `<em>${s.note}</em>` : ''}</div>
              <div class="srow__d mono">${mins(s.d)}</div>
              <div class="srow__p mono">${s.from ? '<i>from</i>' : ''}£${s.p}</div>
              ${s.say ? `<p class="srow__say">${s.say}</p>` : ''}
            </div>`).join('')}
        </div>
      </details>`).join('');
  })();

  /* ------------------------------------------------------------ the team -- */

  (function renderTeam() {
    // #teamGrid, not #team — #team is the <section>, and writing into that
    // would blow away the heading and the wrapper with it.
    const el = $('#teamGrid');
    if (!el) return;
    el.innerHTML = TEAM.map(m => `
      <article class="mem">
        <div class="mem__mono" aria-hidden="true">${m.n[0]}</div>
        <h3>${m.n}</h3>
        <div class="mem__role">${m.role}</div>
        <div class="rating">${m.r ? `${m.r.toFixed(1)} ★ <i>· ${m.c} reviews</i>` : '<i>New to the chair</i>'}</div>
        <p>${m.note}</p>
      </article>`).join('');
  })();

  /* --------------------------------------------------------------- hours -- */

  (function renderHours() {
    const el = $('#hours');
    if (!el) return;
    const today = (new Date().getDay() + 6) % 7;          // JS Sunday=0 -> Monday=0
    el.innerHTML = HOURS.map((h, i) => `
      <div${i === today ? ' data-today' : ''}>
        <dt>${h.d}${i === today ? ' — today' : ''}</dt>
        <dd>${h.o} – ${h.c}</dd>
      </div>`).join('');

    const now = new Date();
    const t = now.getHours() * 60 + now.getMinutes();
    const h = HOURS[today];
    const toMin = s => +s.slice(0, 2) * 60 + +s.slice(3);
    const open = t >= toMin(h.o) && t < toMin(h.c);
    const badge = $('#openNow');
    if (badge) badge.textContent = open ? `Open today until ${h.c}` : `Opens ${h.o} · ${h.d}`;
  })();

  /* ------------------------------------------------------------- booking --
     Frontend demonstration. It behaves like the real thing and says plainly
     that it is not one. No network calls, no storage, nothing to submit. */

  (function booking() {
    const shell = $('#steps');
    if (!shell) return;

    const state = { who:'all', svc:null, staff:null, day:null, time:null, step:1 };
    const panes = [null, $('#p1'), $('#p2'), $('#p3'), $('#p4')];
    const fwd = $('#fwd'), back = $('#back');

    const flat = () => MENU.flatMap(g => g.items.map(s => ({ ...s, who:g.who, group:g.label })));

    function paintSteps() {
      $$('#steps li').forEach((li, i) => {
        li.toggleAttribute('data-on', i + 1 === state.step);
        li.toggleAttribute('data-done', i + 1 < state.step);
      });
    }

    function show(n) {
      state.step = n;
      panes.forEach((p, i) => { if (p) p.hidden = i !== n; });
      back.hidden = n === 1;
      paintSteps();
      const labels = { 1:'Choose a service', 2:'Choose a stylist', 3:'Choose a time', 4:'Start again' };
      fwd.textContent = n === 3 ? 'Confirm booking' : labels[n];
      fwd.disabled = (n === 1 && !state.svc) || (n === 2 && !state.staff) || (n === 3 && !(state.day && state.time));
      if (n === 4) { fwd.disabled = false; fwd.textContent = 'Start again'; }
    }

    /* step 1 — service */
    function paintServices() {
      const list = flat().filter(s => state.who === 'all' || s.who === state.who);
      $('#svcOpts').innerHTML = list.map((s, i) => `
        <button class="opt" type="button" role="button" aria-pressed="false" data-i="${i}">
          <span class="opt__n">${s.n}${s.note ? `<em>${s.note}</em>` : ''}</span>
          <span class="opt__d">${mins(s.d)}</span>
          <span class="opt__p">${s.from ? 'from ' : ''}£${s.p}</span>
          <span class="opt__sub">${s.group}</span>
        </button>`).join('');

      $$('#svcOpts .opt').forEach(b => b.addEventListener('click', () => {
        $$('#svcOpts .opt').forEach(o => o.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        state.svc = list[+b.dataset.i];
        state.staff = null;
        fwd.disabled = false;
      }));
    }

    $$('#whoChips .chip').forEach(c => c.addEventListener('click', () => {
      $$('#whoChips .chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
      c.setAttribute('aria-pressed', 'true');
      state.who = c.dataset.who;
      state.svc = null; fwd.disabled = true;
      paintServices();
    }));

    /* step 2 — stylist, filtered by which side of the room the service is on */
    function paintStaff() {
      const able = TEAM.filter(m => m.does === state.svc.who);
      $('#staffOpts').innerHTML = `
        <button class="opt" type="button" aria-pressed="false" data-any="1">
          <span class="opt__n">Anyone available</span>
          <span class="opt__d"></span>
          <span class="opt__p">Soonest</span>
          <span class="opt__sub">We'll give you whoever is free first</span>
        </button>
        ${able.map((m, i) => `
          <button class="opt" type="button" aria-pressed="false" data-i="${i}">
            <span class="opt__n">${m.n}</span>
            <span class="opt__d">${m.r ? m.r.toFixed(1) + ' ★' : 'new'}</span>
            <span class="opt__p">${m.c ? m.c + ' reviews' : '—'}</span>
            <span class="opt__sub">${m.note}</span>
          </button>`).join('')}`;

      $$('#staffOpts .opt').forEach(b => b.addEventListener('click', () => {
        $$('#staffOpts .opt').forEach(o => o.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        state.staff = b.dataset.any ? { n:'Anyone available' } : able[+b.dataset.i];
        fwd.disabled = false;
      }));
    }

    /* step 3 — day and time, bounded by the real opening hours */
    const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    function paintDays() {
      const out = [];
      for (let i = 0; i < 10; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const idx = (d.getDay() + 6) % 7;
        // The O.A.P rate is Monday–Thursday only. The diary should say so.
        const oapBlocked = /O\.A\.P/.test(state.svc.n) && idx > 3;
        out.push(`<button class="day" type="button" aria-pressed="false"
            ${oapBlocked ? 'data-shut' : ''} data-i="${i}" data-idx="${idx}">
          <span>${i === 0 ? 'Today' : DAYS[d.getDay()]}</span><b>${d.getDate()}</b></button>`);
      }
      $('#days').innerHTML = out.join('');

      $$('#days .day').forEach(b => b.addEventListener('click', () => {
        $$('#days .day').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        const d = new Date(); d.setDate(d.getDate() + +b.dataset.i);
        state.day = d; state.time = null;
        paintTimes(+b.dataset.idx);
        fwd.disabled = true;
      }));
      $('#times').innerHTML = '<p class="book__q" style="margin:0">Pick a day first.</p>';
    }

    function paintTimes(idx) {
      const h = HOURS[idx];
      const start = +h.o.slice(0,2) * 60, end = +h.c.slice(0,2) * 60;
      const slots = [];
      for (let t = start; t + state.svc.d <= end; t += 30) slots.push(t);
      // Deterministic "already taken" pattern — no Math.random, so the demo
      // looks identical every time it's shown in a meeting.
      $('#times').innerHTML = slots.map((t, i) => {
        const gone = (i * 7 + state.svc.d + idx) % 5 === 0;
        const hh = String(Math.floor(t/60)).padStart(2,'0'), mm = String(t%60).padStart(2,'0');
        return `<button class="time" type="button" aria-pressed="false" ${gone ? 'data-gone' : ''}
                  data-t="${hh}:${mm}">${hh}:${mm}</button>`;
      }).join('');

      $$('#times .time').forEach(b => b.addEventListener('click', () => {
        $$('#times .time').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        state.time = b.dataset.t;
        fwd.disabled = false;
      }));
    }

    /* step 4 — summary */
    function paintSummary() {
      const d = state.day.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
      $('#sum').innerHTML = `
        <div><dt>Service</dt><dd>${state.svc.n}${state.svc.note ? ` <span style="color:var(--paper-38)">(${state.svc.note})</span>` : ''}</dd></div>
        <div><dt>With</dt><dd>${state.staff.n}</dd></div>
        <div><dt>When</dt><dd>${d}, ${state.time}</dd></div>
        <div><dt>How long</dt><dd>${mins(state.svc.d)}</dd></div>
        <div class="tot"><dt>Price</dt><dd>${state.svc.from ? 'from ' : ''}£${state.svc.p}</dd></div>`;
    }

    fwd.addEventListener('click', () => {
      if (state.step === 1 && state.svc) { paintStaff(); show(2); }
      else if (state.step === 2 && state.staff) { paintDays(); show(3); }
      else if (state.step === 3 && state.day && state.time) { paintSummary(); show(4); }
      else if (state.step === 4) {
        state.svc = state.staff = state.day = state.time = null;
        $$('#svcOpts .opt').forEach(o => o.setAttribute('aria-pressed','false'));
        show(1);
      }
    });
    back.addEventListener('click', () => show(Math.max(1, state.step - 1)));

    paintServices();
    show(1);
  })();

  /* ------------------------------------------------------------- reveals --
     Only needed where scroll-driven animations are unsupported (Firefox).
     Where they are supported, CSS does it with no JS at all. */

  if (!CSS.supports('animation-timeline', 'view()') && !REDUCED.matches) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    $$('.reveal').forEach((el, i) => { el.style.setProperty('--i', i % 6); io.observe(el); });
  }

  /* ------------------------------------------------------------ counters --
     The final value is already in the HTML. We only ever drop to the start
     value inside begin(), in the same task that starts the animation — so if
     anything throws, the correct number stays on screen rather than a 0. */

  (function counters() {
    const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const active = new Set();
    let raf = 0;

    /* Snap to the true value and stop. Called by the rAF loop when it finishes,
       and unconditionally by a timeout safety net. */
    function finish(it) {
      it.node.nodeValue = it.to.toFixed(it.dec);
      active.delete(it);
      clearTimeout(it.guard);
    }

    function tick(now) {
      raf = 0;
      for (const it of active) {
        if (!it.start) it.start = now;
        const t = Math.min(1, (now - it.start) / it.dur);
        if (t === 1) { finish(it); continue; }
        const s = (it.to * easeOutExpo(t)).toFixed(it.dec);
        if (s !== it.last) { it.last = s; it.node.nodeValue = s; }
      }
      if (active.size) raf = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        obs.unobserve(e.target);
        const el = e.target;
        if (REDUCED.matches) continue;                 // leave the real value alone
        const dec = +(el.dataset.countDecimals || 0);
        // Reserve the width of the *final* string before writing a shorter one.
        const w = el.getBoundingClientRect().width;
        if (w) el.style.minInlineSize = `${Math.ceil(w)}px`;
        const node = el.firstChild || el.appendChild(document.createTextNode(''));
        const it = { node, to:+el.dataset.countTo, dec,
                     dur:+(el.dataset.countDuration || 1500), start:0, last:null, guard:0 };
        node.nodeValue = (0).toFixed(dec);
        active.add(it);
        /* Safety net. rAF stops in a background tab, and can be throttled hard
           by anything else hogging the main thread — leaving the number frozen
           one tick short of the truth. On a section arguing that these figures
           are verified, showing 356 instead of 357 is worse than no animation.
           This guarantees the real value lands whatever happens to rAF. */
        it.guard = setTimeout(() => finish(it), it.dur + 400);
        if (!raf) raf = requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });

    $$('[data-count]').forEach(el => io.observe(el));
  })();

  /* ------------------------------------------------------------ carousel --
     The track is a real scroll container, so touch, trackpad, keyboard and
     find-in-page all work natively. JS only adds the arrow buttons. */

  (function carousel() {
    const track = $('#wtrack');
    if (!track) return;
    const slides = [...track.children];
    if (slides.length < 2) return;

    const ctl = $('#wctl'), prev = $('#wprev'), next = $('#wnext'), status = $('#wstatus');
    ctl.hidden = false;
    let announce = false, current = 0;

    const step = () => {
      const a = slides[0].getBoundingClientRect(), b = slides[1].getBoundingClientRect();
      return Math.round(Math.abs(b.left - a.left)) || track.clientWidth;
    };

    const go = dir => {
      announce = true;
      // scrollBy ignores CSS scroll-behavior AND the OS setting — re-gate here.
      track.scrollBy({ left: step() * dir, behavior: REDUCED.matches ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    function sync() {
      const max = track.scrollWidth - track.clientWidth, x = Math.abs(track.scrollLeft);
      // aria-disabled, not disabled — a disabled button loses focus and strands
      // keyboard users the moment they reach either end.
      prev.setAttribute('aria-disabled', String(x <= 2));
      next.setAttribute('aria-disabled', String(x >= max - 2));
    }
    track.addEventListener('scroll', sync, { passive:true });
    new ResizeObserver(sync).observe(track);
    sync();

    const io = new IntersectionObserver(es => {
      let best = null;
      for (const e of es) if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      if (!best || best.intersectionRatio < 0.5) return;
      const i = slides.indexOf(best.target);
      if (i !== -1) current = i;
    }, { root: track, threshold: [0.5, 0.75, 1] });
    slides.forEach(s => io.observe(s));

    const settled = () => {
      sync();
      if (announce && status) { announce = false; status.textContent = `Item ${current + 1} of ${slides.length}`; }
    };
    if ('onscrollend' in window) track.addEventListener('scrollend', settled);
    else { let t; track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(settled, 120); }, { passive:true }); }
  })();

  /* ------------------------------------------------------- sticky header -- */

  (function header() {
    const hdr = $('#hdr');
    if (!hdr) return;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => {
      hdr.toggleAttribute('data-stuck', !e.isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(sentinel);
  })();

})();
