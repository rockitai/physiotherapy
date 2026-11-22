/* Testimonials slider: native scroll-snap + prev/next buttons + dots.
   Works with touch/trackpad; buttons and arrow keys for keyboard users. RTL-aware. */
(function () {
  var track = document.querySelector('[data-slider]');
  if (!track) return;
  var slides = Array.prototype.slice.call(track.querySelectorAll('[data-slide]'));
  var prev = document.querySelector('[data-slider-prev]');
  var next = document.querySelector('[data-slider-next]');
  var dotsWrap = document.querySelector('[data-slider-dots]');
  var current = 0;

  slides.forEach(function () { dotsWrap.appendChild(document.createElement('span')); });
  var dots = dotsWrap.children;

  function setActive(i) {
    current = i;
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    Array.prototype.forEach.call(dots, function (d, k) { d.classList.toggle('is-active', k === i); });
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  }
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slides[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    setActive(i);
  }
  prev.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  track.addEventListener('keydown', function (e) {
    // follows the reading direction: in Hebrew (RTL) ArrowLeft moves forward, in English ArrowRight
    var rtl = getComputedStyle(track).direction === 'rtl';
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { e.preventDefault(); go(current + 1); }
    if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { e.preventDefault(); go(current - 1); }
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio > 0.6) setActive(slides.indexOf(en.target));
      });
    }, { root: track, threshold: [0.6] });
    slides.forEach(function (s) { io.observe(s); });
  }
  setActive(0);
})();
