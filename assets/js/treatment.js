/* Treatment pages
   1. In-page index: highlights the question being read (scroll-spy).
   2. Hero dandelion: its head is set level with the page title (round 4).
   Dependency-free, deferred; the page reads fine without it. */
(function () {
  /* ---------- 1. Scroll-spy ---------- */
  var toc = document.querySelector('[data-toc]');
  if (toc && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = null;
      links.some(function (a) {
        var id = a.getAttribute('href').slice(1);
        if (visible[id]) { current = id; return true; }
        return false;
      });
      if (!current) return;
      links.forEach(function (a) {
        var on = a === map[current];
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- 2. Hero dandelion level with the title ---------- */
  var hero = document.querySelector('.t-hero');
  var flower = hero && hero.querySelector('.t-hero__long');
  var title = hero && hero.querySelector('.t-hero__title');
  if (flower && title) {
    /* in the drawing (viewBox -300 40 440 …) the head's centre is 90 units below the top, on a 440-unit width */
    var place = function () {
      var mid = title.offsetTop + title.offsetHeight / 2;
      for (var el = title.offsetParent; el && el !== hero && hero.contains(el); el = el.offsetParent) mid += el.offsetTop;
      hero.style.setProperty('--t-head', Math.round(mid - flower.offsetWidth * 90 / 440) + 'px');
    };
    place();
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }
})();
