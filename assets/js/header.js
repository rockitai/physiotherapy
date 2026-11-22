/* Header: adds .is-scrolled after the first 24px of scroll. */
(function () {
  var header = document.querySelector('[data-header]');
  if (!header) return;
  var ticking = false;
  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();
