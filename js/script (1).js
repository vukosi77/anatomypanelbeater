/* ==========================================================================
   Anatomy; A Panel Beaters — site script.js
   Adds: responsive nav toggle, active-page highlighting, gallery filtering,
   contact form validation, back-to-top button, and scroll-reveal animation.
   Include this file on every page with:
     <script src="js/script.js"></script>
   right before the closing </body> tag.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  injectBaseStyles();
  injectThemeStyles();
  initThemeToggle();
  initMobileNav();
  highlightActiveNav();
  initGalleryFilter();
  initContactForm();
  initBackToTop();
  initScrollReveal();
});

/* --------------------------------------------------------------------------
   0. Inject the small amount of CSS the script's own UI needs
      (kept here so no separate stylesheet edit is required).
   -------------------------------------------------------------------------- */
function injectBaseStyles() {
  var style = document.createElement('style');
  style.textContent = [
    '.nav-toggle{display:none;background:none;border:2px solid currentColor;',
    'border-radius:4px;padding:6px 10px;font-size:1rem;cursor:pointer;margin:8px 0;}',
    'nav a.active{font-weight:700;text-decoration:underline;}',
    '@media (max-width:700px){',
    '  .nav-toggle{display:inline-block;}',
    '  header nav{display:none;flex-direction:column;}',
    '  header nav.open{display:flex;}',
    '}',
    '.gallery-filters{list-style:none;display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:12px 0;}',
    '.gallery-filters button{padding:6px 14px;border:1px solid currentColor;border-radius:999px;',
    'background:transparent;cursor:pointer;font-size:0.9rem;}',
    '.gallery-filters button.active-filter{background:currentColor;color:#fff;}',
    '[data-gallery-item].is-hidden{display:none;}',
    '.form-error{color:#c0392b;font-size:0.85rem;margin:2px 0 10px;display:none;}',
    '.form-error.show{display:block;}',
    '.field-invalid{outline:2px solid #c0392b;}',
    '.form-success{color:#1a7a34;font-weight:600;margin-top:10px;display:none;}',
    '.form-success.show{display:block;}',
    '#back-to-top{position:fixed;bottom:24px;right:24px;padding:10px 14px;border-radius:50%;',
    'border:none;background:#222;color:#fff;font-size:1.1rem;cursor:pointer;opacity:0;',
    'visibility:hidden;transition:opacity .25s ease;z-index:999;}',
    '#back-to-top.visible{opacity:1;visibility:visible;}',
    '[data-reveal]{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease;}',
    '[data-reveal].revealed{opacity:1;transform:translateY(0);}'
  ].join('');
  document.head.appendChild(style);
}

/* --------------------------------------------------------------------------
   0b. Theme (light/dark) CSS — variables + dark overrides
   -------------------------------------------------------------------------- */
function injectThemeStyles() {
  var style = document.createElement('style');
  style.textContent = [
    ':root{',
    '  --abg:#ffffff; --atext:#1a1a1a; --aheader-bg:#111111; --aheader-text:#ffffff;',
    '  --alink:#b3261e; --acard-bg:#f7f7f7; --aborder:#dddddd;',
    '  transition:background-color .25s ease, color .25s ease;',
    '}',
    'html[data-theme="dark"]{',
    '  --abg:#121212; --atext:#e8e8e8; --aheader-bg:#000000; --aheader-text:#f2f2f2;',
    '  --alink:#ff6b5e; --acard-bg:#1c1c1c; --aborder:#333333;',
    '}',
    'body{background-color:var(--abg);color:var(--atext);}',
    'header{background-color:var(--aheader-bg);color:var(--aheader-text);}',
    'header a{color:var(--aheader-text);}',
    'a{color:var(--alink);}',
    'main article, table{background-color:var(--acard-bg);border-color:var(--aborder);}',
    'footer{border-top:1px solid var(--aborder);}',
    '.theme-toggle{position:fixed;top:14px;right:14px;z-index:1000;',
    '  border:2px solid var(--aheader-text,#fff);background:transparent;color:inherit;',
    '  border-radius:999px;padding:6px 14px;font-size:0.9rem;cursor:pointer;',
    '  background-color:rgba(0,0,0,0.25);color:#fff;}',
    'html[data-theme="dark"] .theme-toggle{background-color:rgba(255,255,255,0.15);}'
  ].join('');
  document.head.appendChild(style);
}

/* --------------------------------------------------------------------------
   0c. Theme toggle button — remembers choice in localStorage,
       respects the visitor's OS preference on first visit.
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  var STORAGE_KEY = 'anatomy-theme';
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    if (button) {
      button.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }

  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var initialTheme = saved || (prefersDark ? 'dark' : 'light');

  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', 'Toggle light and dark theme');
  document.body.appendChild(button);

  applyTheme(initialTheme);

  button.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark';
    var next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage unavailable */ }
  });
}

/* --------------------------------------------------------------------------
   1. Mobile nav toggle — adds a hamburger button before <nav> on small screens
   -------------------------------------------------------------------------- */
function initMobileNav() {
  var nav = document.querySelector('header nav');
  if (!nav) return;

  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Toggle navigation menu');
  toggle.textContent = '☰ Menu';

  nav.parentNode.insertBefore(toggle, nav);

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '✕ Close' : '☰ Menu';
  });
}

/* --------------------------------------------------------------------------
   2. Highlight the nav link matching the current page
   -------------------------------------------------------------------------- */
function highlightActiveNav() {
  var links = document.querySelectorAll('header nav a');
  var current = (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
  if (current === '') current = 'home.html';

  links.forEach(function (link) {
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* --------------------------------------------------------------------------
   3. Gallery category filter (only runs if the gallery markup is present)
   -------------------------------------------------------------------------- */
function initGalleryFilter() {
  var articles = document.querySelectorAll('main section article');
  if (!articles.length) return;

  // Only proceed if these articles actually carry "Category: X" text (gallery page)
  var items = [];
  articles.forEach(function (article) {
    var paragraphs = article.querySelectorAll('p');
    var categoryText = null;
    paragraphs.forEach(function (p) {
      var match = p.textContent.match(/Category:\s*(.+)/i);
      if (match) categoryText = match[1].trim();
    });
    if (categoryText) {
      article.setAttribute('data-gallery-item', '');
      article.setAttribute('data-category', categoryText);
      items.push({ el: article, category: categoryText });
    }
  });
  if (!items.length) return;

  // Find the "Categories: All Work | X | Y | Z" line and turn it into buttons
  var allParagraphs = document.querySelectorAll('main p');
  var categoriesPara = null;
  allParagraphs.forEach(function (p) {
    if (/^Categories:/i.test(p.textContent.trim())) categoriesPara = p;
  });

  var categories = ['All Work'];
  items.forEach(function (item) {
    if (categories.indexOf(item.category) === -1) categories.push(item.category);
  });

  var filterList = document.createElement('ul');
  filterList.className = 'gallery-filters';

  categories.forEach(function (cat, index) {
    var li = document.createElement('li');
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = cat;
    button.dataset.filter = cat;
    if (index === 0) button.classList.add('active-filter');

    button.addEventListener('click', function () {
      filterList.querySelectorAll('button').forEach(function (b) {
        b.classList.remove('active-filter');
      });
      button.classList.add('active-filter');

      items.forEach(function (item) {
        var show = cat === 'All Work' || item.category === cat;
        item.el.classList.toggle('is-hidden', !show);
      });
    });

    li.appendChild(button);
    filterList.appendChild(li);
  });

  if (categoriesPara && categoriesPara.parentNode) {
    categoriesPara.parentNode.replaceChild(filterList, categoriesPara);
  }
}

/* --------------------------------------------------------------------------
   4. Contact form validation (only runs if the callback form is present)
   -------------------------------------------------------------------------- */
function initContactForm() {
  var form = document.querySelector('form');
  if (!form) return;

  var nameField = form.querySelector('#name');
  var phoneField = form.querySelector('#phone');
  var emailField = form.querySelector('#email');
  var messageField = form.querySelector('#message');
  if (!nameField || !messageField) return; // not the callback form

  function addErrorEl(field) {
    var err = document.createElement('div');
    err.className = 'form-error';
    field.insertAdjacentElement('afterend', err);
    return err;
  }

  var nameError = addErrorEl(nameField);
  var contactError = addErrorEl(emailField || phoneField);
  var messageError = addErrorEl(messageField);

  var successMsg = document.createElement('p');
  successMsg.className = 'form-success';
  successMsg.textContent = "Thanks — your request has been noted. We'll confirm an assessment slot shortly.";
  form.appendChild(successMsg);

  function showError(field, errorEl, message) {
    field.classList.add('field-invalid');
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
  function clearError(field, errorEl) {
    field.classList.remove('field-invalid');
    errorEl.classList.remove('show');
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^[0-9+\s()-]{7,}$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successMsg.classList.remove('show');
    var valid = true;

    if (!nameField.value.trim()) {
      showError(nameField, nameError, 'Please enter your full name.');
      valid = false;
    } else {
      clearError(nameField, nameError);
    }

    var hasPhone = phoneField && phonePattern.test(phoneField.value.trim());
    var hasEmail = emailField && emailPattern.test(emailField.value.trim());
    var contactTargetField = emailField || phoneField;

    if (!hasPhone && !hasEmail) {
      showError(contactTargetField, contactError, 'Please enter a valid phone number or email address.');
      valid = false;
    } else {
      clearError(contactTargetField, contactError);
    }

    if (!messageField.value.trim()) {
      showError(messageField, messageError, 'Please describe the damage so we can prepare a quote.');
      valid = false;
    } else {
      clearError(messageField, messageError);
    }

    if (valid) {
      successMsg.classList.add('show');
      form.reset();
    }
  });

  // Clear individual field errors as the user types/fixes them
  [nameField, phoneField, emailField, messageField].forEach(function (field) {
    if (!field) return;
    field.addEventListener('input', function () {
      field.classList.remove('field-invalid');
    });
  });
}

/* --------------------------------------------------------------------------
   5. Back-to-top button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  var button = document.createElement('button');
  button.id = 'back-to-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Back to top');
  button.textContent = '↑';
  document.body.appendChild(button);

  window.addEventListener('scroll', function () {
    button.classList.toggle('visible', window.scrollY > 400);
  });

  button.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   6. Scroll-reveal animation for main sections
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  var sections = document.querySelectorAll('main > section');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  sections.forEach(function (section) {
    section.setAttribute('data-reveal', '');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(function (section) {
    observer.observe(section);
  });
}
