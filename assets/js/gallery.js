/* מכתבי תודה gallery viewer
   - Click (or Enter/Space) on a letter opens it large in a <dialog> over a ~25% dimmed page.
   - Arrows / buttons move between letters (follow the reading direction: ← is next in Hebrew, → in English), Esc or a click on the dim area closes.
   - Focus returns to the letter that opened the viewer. */
(function () {
  const wall = document.querySelector('[data-gallery]');
  const dlg = document.querySelector('.g-viewer');
  if (!wall || !dlg || typeof dlg.showModal !== 'function') return;
  const tiles = Array.from(wall.querySelectorAll('.g-tile'));
  const img = dlg.querySelector('.g-viewer__img');
  const date = dlg.querySelector('.g-viewer__date');
  const count = dlg.querySelector('.g-viewer__count');
  let cur = 0, opener = null;
  const rtl = getComputedStyle(document.documentElement).direction === 'rtl';

  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    const t = tiles[cur];
    const w = +t.dataset.w, h = +t.dataset.h;
    dlg.classList.toggle('is-tall', h / w > 1.9);           // long letters scroll inside the viewer
    img.classList.remove('is-in');
    img.width = w; img.height = h;
    // reading size: phone screenshots ~620px wide, scanned letters wider; never upscaled past the file
    img.style.maxWidth = 'min(100%, ' + Math.min(w, w > 1440 ? 1000 : 620) + 'px)';
    img.src = t.dataset.full;
    img.alt = t.querySelector('img').alt;
    date.textContent = t.dataset.date;
    count.textContent = (cur + 1) + ' / ' + tiles.length;
    dlg.querySelector('.g-viewer__stage').scrollTop = 0;
    const pre = new Image(); pre.src = tiles[(cur + 1) % tiles.length].dataset.full;
  }
  img.addEventListener('load', () => requestAnimationFrame(() => img.classList.add('is-in')));

  function open(i) {
    opener = tiles[i];
    show(i);
    dlg.showModal();
    document.documentElement.classList.add('g-lock');
    requestAnimationFrame(() => dlg.classList.add('is-open'));
  }
  function close() {
    dlg.classList.remove('is-open');
    document.documentElement.classList.remove('g-lock');
    setTimeout(() => { dlg.close(); if (opener) opener.focus({ preventScroll: true }); }, 260);
  }

  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
  dlg.querySelector('.g-viewer__close').addEventListener('click', close);
  dlg.querySelector('.g-viewer__next').addEventListener('click', () => show(cur + 1));
  dlg.querySelector('.g-viewer__prev').addEventListener('click', () => show(cur - 1));
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('keydown', (e) => {
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight', back = rtl ? 'ArrowRight' : 'ArrowLeft';   // reading direction
    if (e.key === fwd) { e.preventDefault(); show(cur + 1); }
    if (e.key === back) { e.preventDefault(); show(cur - 1); }
  });
  // a click on the dimmed area (not on the letter or the buttons) closes
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.classList.contains('g-viewer__stage')) close();
  });
  // swipe on phones
  let x0 = null;
  dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show((dx > 0) === rtl ? cur + 1 : cur - 1);
  });
})();
