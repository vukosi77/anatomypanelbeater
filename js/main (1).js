/* Anatomy; A Panel Beaters — Part 3 functionality
   Sections: helpers · nav · reveal/counters · accordion · tabs · dialogs · lightbox ·
   gallery filter · services search · dynamic news · form validation · contact · enquiry · map */
(function () {
  'use strict';

  var MAIL_TO = 'workshop@anatomy.co.za';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(tag, attrs) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var kid = arguments[i];
      if (kid == null) continue;
      n.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return n;
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
  function fmtDate(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  function fmtLong(d) {
    return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function money(n) { return 'R ' + Math.round(n).toLocaleString('en-ZA'); }

  /* ---------- nav: mark current page ---------- */
  (function () {
    var page = location.pathname.split('/').pop() || 'home.html';
    $$('header nav a').forEach(function (a) {
      if (a.getAttribute('href') === page) { a.setAttribute('aria-current', 'page'); a.classList.add('active'); }
    });
  })();

  /* ---------- scroll reveal animation + animated counters ---------- */
  (function () {
    var targets = $$('main section, main article');
    var counters = $$('[data-count]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      counters.forEach(function (c) { c.textContent = format(+c.dataset.count, c); });
      return;
    }
    function format(n, c) { return n.toLocaleString('en-ZA') + (c.dataset.suffix || ''); }
    function runCounter(c) {
      var end = +c.dataset.count, start = performance.now(), dur = 1200;
      (function tick(now) {
        var t = Math.min((now - start) / dur, 1);
        c.textContent = format(Math.round(end * (1 - Math.pow(1 - t, 3))), c);
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }
    targets.forEach(function (t) { t.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        $$('[data-count]', e.target).forEach(runCounter);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ---------- accordion ---------- */
  $$('.accordion-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- tabs ---------- */
  $$('.tabs').forEach(function (tabs) {
    var btns = $$('[role="tab"]', tabs);
    function select(btn, focus) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) btn.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % btns.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + btns.length) % btns.length;
        if (j !== null) { e.preventDefault(); select(btns[j], true); }
      });
    });
  });

  /* ---------- modal dialog ---------- */
  function openDialog(title, nodes) {
    var lastFocus = document.activeElement;
    var overlay = el('div', { 'class': 'overlay' });
    var dlg = el('div', { 'class': 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dlgTitle' });
    var closeBtn = el('button', { 'class': 'dlg-close', type: 'button', 'aria-label': 'Close dialog' }, '\u00d7');
    dlg.appendChild(closeBtn);
    dlg.appendChild(el('h2', { id: 'dlgTitle' }, title));
    nodes.forEach(function (n) { dlg.appendChild(n); });
    overlay.appendChild(dlg);
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    closeBtn.focus();

    function close() {
      overlay.remove();
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = $$('button, a[href], input, select, textarea', dlg);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
  }

  /* service cards: "More details" opens a modal */
  $$('.service-card').forEach(function (card) {
    if (!card.dataset.details) return;
    var btn = el('button', { type: 'button', 'class': 'btn btn-small' }, 'More details');
    btn.addEventListener('click', function () {
      openDialog(card.dataset.name, [
        el('p', {}, card.dataset.details),
        el('p', {}, el('a', { 'class': 'btn', href: 'enquiry.html' }, 'Get an estimate'))
      ]);
    });
    card.appendChild(btn);
  });

  /* ---------- gallery: category filter + lightbox ---------- */
  (function () {
    var grid = $('.gallery-grid');
    if (!grid) return;
    var cards = $$('article', grid);
    var buttons = $$('.filter-bar button');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.dataset.filter;
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        cards.forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.category === f); });
      });
    });

    var index = 0, list = [], lastFocus = null, box = null;
    function visibleImages() {
      return $$('img', grid).filter(function (i) { return !i.closest('article').hidden; });
    }
    function show(i) {
      index = (i + list.length) % list.length;
      var img = list[index];
      $('img', box).src = img.currentSrc || img.src;
      $('img', box).alt = img.alt;
      $('.lb-caption', box).textContent = img.alt + ' (' + (index + 1) + ' of ' + list.length + ')';
    }
    function close() {
      box.remove(); box = null;
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    }
    function open(img) {
      lastFocus = img; list = visibleImages(); index = list.indexOf(img);
      box = el('div', { 'class': 'overlay lightbox open', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer' },
        el('button', { 'class': 'dlg-close', type: 'button', 'aria-label': 'Close image viewer' }, '\u00d7'),
        el('button', { 'class': 'lb-nav lb-prev', type: 'button', 'aria-label': 'Previous image' }, '\u2039'),
        el('figure', {}, el('img', { alt: '' }), el('figcaption', { 'class': 'lb-caption' })),
        el('button', { 'class': 'lb-nav lb-next', type: 'button', 'aria-label': 'Next image' }, '\u203a'));
      document.body.appendChild(box);
      document.body.classList.add('no-scroll');
      $('.dlg-close', box).addEventListener('click', close);
      $('.lb-prev', box).addEventListener('click', function () { show(index - 1); });
      $('.lb-next', box).addEventListener('click', function () { show(index + 1); });
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
      document.addEventListener('keydown', onKey);
      show(index);
      $('.dlg-close', box).focus();
    }
    $$('img', grid).forEach(function (img) {
      img.tabIndex = 0; img.setAttribute('role', 'button');
      img.addEventListener('click', function () { open(img); });
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
    });
  })();

  /* ---------- services: live search + sort ---------- */
  (function () {
    var input = $('#serviceSearch');
    if (!input) return;
    var cards = $$('.service-card'), list = cards[0].parentElement;
    var sort = $('#serviceSort'), count = $('#serviceCount'), empty = $('#serviceEmpty');
    function apply() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) {
        var ok = c.textContent.toLowerCase().indexOf(q) !== -1;
        c.hidden = !ok; if (ok) shown++;
      });
      cards.slice().sort(function (a, b) {
        if (sort.value === 'az') return a.dataset.name.localeCompare(b.dataset.name);
        if (sort.value === 'za') return b.dataset.name.localeCompare(a.dataset.name);
        return a.dataset.order - b.dataset.order;
      }).forEach(function (c) { list.appendChild(c); });
      count.textContent = shown + ' of ' + cards.length + ' services shown';
      empty.hidden = shown !== 0;
    }
    input.addEventListener('input', debounce(apply, 150));
    sort.addEventListener('change', apply);
    apply();
  })();

  /* ---------- dynamic news: render, search, filter, sort, load more ---------- */
  function newsCard(n) {
    return el('article', { 'class': 'card' },
      el('h3', {}, n.title),
      el('p', { 'class': 'meta' }, el('time', { datetime: n.date }, fmtDate(n.date)), ' \u2014 ' + n.category),
      el('p', {}, n.summary));
  }
  (function () {
    var host = $('#newsList');
    if (!host || !window.ANATOMY_NEWS) return;
    var data = window.ANATOMY_NEWS, shownCount = 4, STEP = 4;
    var q = $('#newsSearch'), cat = $('#newsCategory'), sort = $('#newsSort');
    var count = $('#newsCount'), more = $('#newsMore');
    Array.from(new Set(data.map(function (n) { return n.category; }))).sort().forEach(function (c) {
      cat.appendChild(el('option', { value: c }, c));
    });
    function render() {
      var term = q.value.trim().toLowerCase();
      var rows = data.filter(function (n) {
        return (cat.value === 'all' || n.category === cat.value) &&
          (n.title + ' ' + n.summary + ' ' + n.category).toLowerCase().indexOf(term) !== -1;
      }).sort(function (a, b) { return sort.value === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date); });
      host.textContent = '';
      rows.slice(0, shownCount).forEach(function (n) { host.appendChild(newsCard(n)); });
      count.textContent = rows.length ? 'Showing ' + Math.min(shownCount, rows.length) + ' of ' + rows.length + ' updates' : 'No updates match your search.';
      more.hidden = shownCount >= rows.length;
    }
    function reset() { shownCount = STEP; render(); }
    q.addEventListener('input', debounce(reset, 150));
    cat.addEventListener('change', reset);
    sort.addEventListener('change', reset);
    more.addEventListener('click', function () { shownCount += STEP; render(); });
    render();
  })();

  /* home page: latest 3 news items */
  (function () {
    var host = $('#latestNews');
    if (!host || !window.ANATOMY_NEWS) return;
    window.ANATOMY_NEWS.slice().sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, 3).forEach(function (n) { host.appendChild(newsCard(n)); });
  })();

  /* ---------- form validation ---------- */
  function fieldMessage(f) {
    if (f.disabled || f.closest('[hidden]')) return '';
    if (f.type === 'checkbox') return f.required && !f.checked ? (f.dataset.msg || 'This box must be ticked.') : '';
    var v = f.value.trim();
    if (!v) return f.required ? (f.tagName === 'SELECT' ? 'Please choose an option.' : 'This field is required.') : '';
    if (f.minLength > 0 && v.length < f.minLength) return 'Please enter at least ' + f.minLength + ' characters (currently ' + v.length + ').';
    if (f.maxLength > 0 && v.length > f.maxLength) return 'Please keep this under ' + f.maxLength + ' characters.';
    switch (f.dataset.validate) {
      case 'name':
        if (!/^\p{L}[\p{L}\s'.\-]{1,59}$/u.test(v)) return 'Enter your full name (letters only, 2\u201360 characters).';
        break;
      case 'phone':
        if (!/^(\+27|0)[1-9][0-9]{8}$/.test(v.replace(/[\s()\-]/g, ''))) return 'Enter a valid South African number, e.g. 011 555 1212 or +27 11 555 1212.';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address, e.g. you@example.com.';
        break;
      case 'date':
        var p = v.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var max = new Date(today); max.setDate(max.getDate() + 90);
        if (isNaN(d)) return 'Enter a valid date.';
        if (d < today) return 'Please choose today or a future date.';
        if (d > max) return 'Please choose a date within the next 90 days.';
        if (d.getDay() === 0) return 'We are closed on Sundays \u2014 please choose Monday to Saturday.';
        break;
    }
    if (f.type === 'number') {
      var n = Number(v);
      if (!Number.isInteger(n) || n < +f.min || n > +f.max) return 'Enter a whole number between ' + f.min + ' and ' + f.max + '.';
    }
    return '';
  }
  function showError(f, msg) {
    var wrap = f.closest('.field') || f.parentElement;
    var box = $('.field-error', wrap);
    if (!box) {
      box = el('p', { 'class': 'field-error', id: f.id + '-error', 'aria-live': 'polite' });
      wrap.appendChild(box);
    }
    box.textContent = msg;
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) f.setAttribute('aria-describedby', box.id); else f.removeAttribute('aria-describedby');
  }
  function validateForm(form) {
    var firstBad = null;
    $$('input, select, textarea', form).forEach(function (f) {
      if (f.type === 'hidden' || f.name === 'bot-field') return;
      var m = fieldMessage(f); showError(f, m);
      if (m && !firstBad) firstBad = f;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function wireForm(form, onValid) {
    form.setAttribute('novalidate', '');
    $$('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('blur', function () { showError(f, fieldMessage(f)); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') showError(f, fieldMessage(f)); });
    });
    $$('textarea[data-counter]', form).forEach(function (t) {
      var out = $(t.dataset.counter);
      function upd() { out.textContent = t.value.length + ' / ' + t.maxLength + ' characters'; }
      t.addEventListener('input', upd); upd();
    });
    $$('input[type="date"]', form).forEach(function (d) {
      var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
      d.min = t.toISOString().slice(0, 10);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateForm(form)) onValid(form);
    });
  }
  function actionButton(label, fn) {
    var b = el('button', { type: 'button', 'class': 'btn btn-small' }, label);
    b.addEventListener('click', fn); return b;
  }
  function copyText(text, btn) {
    var done = function () { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy email text'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done);
  }

  /* ---------- contact form: validate -> AJAX -> compile email ---------- */
  (function () {
    var form = $('#contactForm');
    if (!form) return;
    var out = $('#formResult');
    wireForm(form, function () {
      var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v; });
      if (d['bot-field']) return;                                   // honeypot: bots only
      var subject = '[Website] ' + d.type + ' - ' + d.name;
      var body = ['Name: ' + d.name, 'Phone: ' + d.phone, 'Email: ' + d.email, 'Message type: ' + d.type, '', d.message, '',
        'Sent via the Anatomy; A Panel Beaters website contact form'].join('\r\n');
      var mailto = 'mailto:' + MAIL_TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var submit = $('button[type="submit"]', form);
      submit.disabled = true; submit.textContent = 'Sending\u2026';
      out.hidden = false; out.className = 'result'; out.textContent = 'Sending your message\u2026';

      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; })
        .then(function (sent) {
          submit.disabled = false; submit.textContent = 'Send Request';
          out.textContent = '';
          out.appendChild(el('h3', {}, sent ? 'Thank you, ' + d.name.split(' ')[0] + '!' : 'Your email is ready to send'));
          out.appendChild(el('p', {}, sent
            ? 'Your message reached the workshop. We will reply within one working day. You can also send a copy by email below.'
            : 'Your details are valid. Click the button below to open the email in your mail app, addressed to ' + MAIL_TO + '.'));
          out.appendChild(el('a', { 'class': 'btn btn-small', href: mailto }, 'Open email to ' + MAIL_TO));
          out.appendChild(document.createTextNode(' '));
          var cp = actionButton('Copy email text', function () { copyText(body, cp); });
          out.appendChild(cp);
          out.appendChild(el('pre', { 'class': 'email-preview' }, 'To: ' + MAIL_TO + '\nSubject: ' + subject + '\n\n' + body));
          if (sent) form.reset();
          out.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        });
    });
  })();

  /* ---------- enquiry form: validate -> process -> indicative response ---------- */
  (function () {
    var form = $('#enquiryForm');
    if (!form) return;
    var out = $('#enquiryResult');
    var SERVICES = {
      panel:     { label: 'Panel Beating & Dent Repair',      rate: 1800, unit: 'panels', days: 1 },
      paint:     { label: 'Paint & Colour Matching',          rate: 2600, unit: 'panels', days: 2 },
      chassis:   { label: 'Chassis & Frame Straightening',    flat: 9500, days: 4 },
      pdr:       { label: 'Paintless Dent Removal',           rate: 900,  unit: 'panels', days: 0 },
      insurance: { label: 'Insurance Claim Assistance',       free: true },
      fleet:     { label: 'Fleet & Bulk Repairs',             rate: 1400, unit: 'vehicles', days: 0 }
    };
    var VEHICLE = { hatch: 1, sedan: 1.1, suv: 1.25, van: 1.3 };
    var SEVERITY = { minor: 1, moderate: 1.4, severe: 1.9 };

    var svc = $('#service'), panelsRow = $('#panelsRow'), fleetRow = $('#fleetRow'), sevRow = $('#severityRow'), vehRow = $('#vehicleRow');
    function toggle() {
      var s = svc.value;
      panelsRow.hidden = !(s === 'panel' || s === 'paint' || s === 'pdr');
      fleetRow.hidden = s !== 'fleet';
      sevRow.hidden = s === 'insurance' || s === '';
      vehRow.hidden = s === 'insurance' || s === 'fleet' || s === '';
    }
    svc.addEventListener('change', toggle); toggle();

    function addWorkingDays(from, n) {
      var d = new Date(from);
      while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) n--; }
      return d;
    }
    wireForm(form, function () {
      var s = SERVICES[svc.value], sev = SEVERITY[$('#severity').value] || 1;
      var chosen = $('#dropoff').value.split('-');
      var date = new Date(+chosen[0], +chosen[1] - 1, +chosen[2]);
      var earliest = addWorkingDays(new Date(), 2);
      earliest.setHours(0, 0, 0, 0);
      var rows = [['Service', s.label]];
      var low = 0, high = 0, days = 0, headline;

      if (s.free) {
        headline = 'No fee from us for claim assistance';
        rows.push(['Cost', 'R 0 admin fee \u2014 you only pay your policy excess']);
        rows.push(['Next step', 'Bring your claim number; we contact the insurer\u2019s assessor within one working day']);
      } else {
        if (s.flat) { low = s.flat * sev; days = Math.ceil(s.days * sev * 1.5); }
        else if (svc.value === 'fleet') { low = s.rate * (+$('#vehicles').value) * sev * 0.85; days = 0; }
        else { low = s.rate * (+$('#panels').value) * sev; days = Math.ceil((s.days + Math.ceil(+$('#panels').value / 2)) * (sev > 1 ? 1.5 : 1)); }
        low *= VEHICLE[$('#vehicle').value] || 1;
        low = Math.round(low / 50) * 50; high = Math.round(low * 1.25 / 50) * 50;
        if ($('#insured').checked) rows.push(['Insurance', 'Claim assistance included at no extra charge']);
        headline = 'Indicative estimate: ' + money(low) + ' \u2013 ' + money(high);
        rows.push(['Estimated cost', money(low) + ' \u2013 ' + money(high) + ' (incl. VAT, indicative only)']);
        if (svc.value === 'fleet') rows.push(['Scheduling', 'Priority bays and consolidated monthly invoicing; we book a batch schedule at assessment']);
        else if (days === 0) rows.push(['Turnaround', 'Usually same day']);
        else rows.push(['Turnaround', 'About ' + days + ' working day' + (days > 1 ? 's' : '') + ' once work starts']);
      }
      var avail = date >= earliest
        ? 'Your preferred date, ' + fmtLong(date) + ', is available (provisional until assessment).'
        : 'Your preferred date is fully booked. The earliest assessment slot is ' + fmtLong(earliest) + '.';
      rows.push(['Availability', avail]);
      if (days > 0) {
        var start = date >= earliest ? date : earliest;
        rows.push(['Estimated ready', fmtLong(addWorkingDays(start, days))]);
      }

      out.hidden = false; out.className = 'result'; out.textContent = '';
      out.appendChild(el('h3', {}, headline));
      var dl = el('dl', {});
      rows.forEach(function (r) { dl.appendChild(el('dt', {}, r[0])); dl.appendChild(el('dd', {}, r[1])); });
      out.appendChild(dl);
      out.appendChild(el('p', { 'class': 'meta' }, 'Estimates are a guide based on the details you gave. A written quote follows our free assessment.'));
      var body = ['Enquiry from ' + $('#name').value, 'Phone: ' + $('#phone').value, 'Email: ' + $('#email').value, ''].concat(
        rows.map(function (r) { return r[0] + ': ' + r[1]; }), ['', $('#details').value]).join('\r\n');
      out.appendChild(el('a', { 'class': 'btn btn-small', href: 'mailto:' + MAIL_TO + '?subject=' + encodeURIComponent('Enquiry: ' + s.label) + '&body=' + encodeURIComponent(body) }, 'Email this enquiry to the workshop'));
      out.appendChild(document.createTextNode(' '));
      out.appendChild(el('a', { 'class': 'btn btn-small', href: 'contact.html' }, 'Contact us instead'));
      out.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
  })();

  /* ---------- interactive map (Leaflet + OpenStreetMap) ---------- */
  (function () {
    var host = $('#map');
    if (!host || !window.L) return;
    var pos = [-26.1925, 28.0366];   // Braamfontein, Johannesburg — adjust to the exact workshop pin if needed
    var map = L.map(host, { scrollWheelZoom: false }).setView(pos, 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var pop = el('div', {}, el('strong', {}, 'Anatomy; A Panel Beaters'), el('br'), '14 Jorissen Road, Braamfontein', el('br'),
      el('a', { href: 'https://www.openstreetmap.org/directions?to=' + pos.join('%2C'), rel: 'noopener noreferrer', target: '_blank' }, 'Get directions'));
    L.marker(pos).addTo(map).bindPopup(pop).openPopup();
  })();
})();
