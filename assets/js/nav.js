/* Navigation
   - Desktop: submenu toggles (click/Enter/Space) with aria-expanded, Esc closes,
     click outside closes. Hover is handled in CSS.
   - Mobile: full-screen dialog with focus trap, Esc to close, scroll lock. */
(function () {
  /* ---------- Desktop submenus ---------- */
  var items = document.querySelectorAll('.primary-nav .has-sub');
  function closeAll(except) {
    items.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('is-open');
      var b = li.querySelector('.primary-nav__toggle');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  items.forEach(function (li) {
    var btn = li.querySelector('.primary-nav__toggle');
    btn.addEventListener('click', function () {
      var open = !li.classList.contains('is-open');
      closeAll(li);
      li.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) { var first = li.querySelector('.subnav a'); if (first) first.focus(); }
    });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); btn.focus(); }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.primary-nav .has-sub')) closeAll();
  });

  /* ---------- Mobile menu ---------- */
  var menu = document.querySelector('[data-menu]');
  var openBtn = document.querySelector('[data-menu-open]');
  if (!menu || !openBtn) return;
  var closeBtn = menu.querySelector('[data-menu-close]');
  var lastFocus = null;

  function focusables() {
    return Array.prototype.filter.call(
      menu.querySelectorAll('a[href], button, summary, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null; }
    );
  }
  function open() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    openBtn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { menu.classList.add('is-open'); closeBtn.focus(); });
  }
  function close() {
    menu.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () { menu.hidden = true; }, reduce ? 0 : 280);
    if (lastFocus) lastFocus.focus();
  }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // In-page anchors close the menu
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a) close();
  });
  // Close if resized to desktop
  window.matchMedia('(min-width: 1180px)').addEventListener('change', function (mq) {
    if (mq.matches && !menu.hidden) close();
  });
})();
