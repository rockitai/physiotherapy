/* Illustrated hero: depth parallax.
   Pointer (fine pointers only) sets --mx/--my in [-1, 1]; scroll sets --hx-scroll in px.
   Each .hx-piece moves by its own --depth (see hero-illustrated.css). Off under reduced motion. */
(function () {
  var hero = document.querySelector('[data-hx]');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mx = 0, my = 0, queued = false;

  function paint() {
    queued = false;
    hero.style.setProperty('--mx', mx.toFixed(3));
    hero.style.setProperty('--my', my.toFixed(3));
    hero.style.setProperty('--hx-scroll', Math.min(window.scrollY, hero.offsetHeight).toFixed(0));
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(paint); } }

  if (window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      queue();
    });
    hero.addEventListener('pointerleave', function () { mx = 0; my = 0; queue(); });
  }
  window.addEventListener('scroll', queue, { passive: true });
  paint();
})();
