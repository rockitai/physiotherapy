/* Scroll reveal: [data-reveal] gets .is-revealed once it enters the viewport.
   Consecutive siblings get an index (--i) for a gentle stagger. */
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!els.length) return;

  // stagger index among siblings that are revealed together
  els.forEach(function (el) {
    var parent = el.parentElement, i = 0;
    var group = parent ? parent.querySelectorAll(':scope > [data-reveal]') : [];
    group.forEach(function (sib, idx) { if (sib === el) i = idx; });
    el.style.setProperty('--i', Math.min(i, 6));
  });

  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();
