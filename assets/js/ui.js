/* Small UI behaviours: mobile action bar visibility + cookie notice. */
(function () {
  /* Action bar appears once the hero call-to-action has scrolled away */
  /* ...and the floating WhatsApp button (desktop) follows the same rule */
  var floating = document.querySelectorAll('[data-action-bar], [data-wa-fab]');
  var heroActions = document.querySelector('.hero__actions');
  function show(on) { floating.forEach(function (el) { el.classList.toggle('is-visible', on); }); }
  if (heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      show(!entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
    }).observe(heroActions);
  } else { show(true); }

  /* Cookie notice: remembered per browser (same behaviour as the Elementor popup) */
  var cookie = document.querySelector('[data-cookie]');
  if (!cookie) return;
  var KEY = 'sn-cookie-ok';
  var seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (!seen) setTimeout(function () { cookie.hidden = false; }, 1200);
  cookie.querySelector('[data-cookie-accept]').addEventListener('click', function () {
    cookie.hidden = true;
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  });
})();

/* Gentle parallax for decorative layers: [data-parallax="-0.06"] moves at that fraction of scroll.
   Off under prefers-reduced-motion. */
(function () {
  var els = document.querySelectorAll('[data-parallax]');
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    els.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = parseFloat(el.getAttribute('data-parallax')) || 0;
      el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * k).toFixed(1) + 'px';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* Hero glow fades out gradually while scrolling (no hard edge into the next section). */
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var ticking = false;
  function update() {
    var p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.8)));
    hero.style.setProperty('--hero-fade', (1 - p).toFixed(3));
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* Hero depth parallax (round 6): pointer (fine pointers) sets --mx/--my in [-1, 1], scroll sets --hp-scroll.
   .hero__dandelions moves by their own --depth. Off under reduced motion. */
(function () {
  var hero = document.querySelector('[data-hero-parallax]');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mx = 0, my = 0, queued = false;
  function paint() {
    queued = false;
    hero.style.setProperty('--mx', mx.toFixed(3));
    hero.style.setProperty('--my', my.toFixed(3));
    hero.style.setProperty('--hp-scroll', Math.min(window.scrollY, hero.offsetHeight).toFixed(0));
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

/* Hero round 10: the floating capsule (with Sivan) is centred between the word "האגן" ([data-head-anchor])
   and the head of the large dandelion on the left. The small dandelion's head goes under "צור קשר". */
(function () {
  var anchor = document.querySelector('[data-head-anchor]');
  var photo = document.querySelector('[data-hero-photo]');
  var big = document.querySelector('.hero__dandelions--big');
  var small = document.querySelector('[data-dandelion-small]');
  var cta = document.querySelector('.hero__cta');
  var hero = document.querySelector('.hero--split');
  if (!anchor || !photo || !hero) return;
  /* English site (LTR): the hero is the mirror image of the Hebrew one. Horizontal measures are taken from the
     right edge instead of the left, and positions are written to 'right' instead of 'left'. */
  var ltr = getComputedStyle(hero).direction === 'ltr';
  function setX(el, v) { el.style[ltr ? 'right' : 'left'] = v; el.style[ltr ? 'left' : 'right'] = 'auto'; }
  function OL(el) { return ltr ? el.offsetParent.clientWidth - el.offsetLeft - el.offsetWidth : el.offsetLeft; }
  function place() {
    var vw = document.documentElement.clientWidth;
    function M(x) { return ltr ? vw - x : x; }
    function RR(r) { return ltr ? { left: vw - r.right, right: vw - r.left, width: r.width, top: r.top, bottom: r.bottom } : r; }
    var h = RR(hero.getBoundingClientRect());
    var a = RR(anchor.getBoundingClientRect());
    var word = a.left + a.width / 2;
    var flower = big ? OL(big) + big.offsetWidth * 0.636 + h.left : word * 0.4;   /* head sits at 63.6% of the SVG's width */
    /* round 13: the capsule's text part is exactly as long as the caption's longest line */
    var cap = photo.querySelector('.hero__caption-text');
    var H = photo.offsetHeight;
    if (cap && getComputedStyle(cap).whiteSpace === 'nowrap') {
      photo.style.setProperty('--text-w', (cap.offsetWidth + H * 0.58 * 0.3 + 34 + H * 0.75 - H * 1.2 + 2).toFixed(0) + 'px');
    } else { photo.style.removeProperty('--text-w'); }
    var w = photo.offsetWidth;
    var part = H * 1.2;                                 /* the Sivan end of the capsule */
    var left = (word + flower) / 2 + part / 2 - w - h.left;   /* keep that part centred; the text extends it to the left */
    /* never touch the left dandelion: stay right of its stem (at ~24% of its SVG's width) */
    var minLeft = big ? OL(big) + big.offsetWidth * 0.24 + 28 : 8;
    left = Math.max(Math.max(8, vw * 0.025, minLeft), Math.min(left, vw - 8 - w));
    setX(photo, left.toFixed(0) + 'px');
    /* round 16, phones: the left dandelion's head floats a little under the buttons (head at ~20% of its width from the top) */
    var acts = document.querySelector('.hero__where') || document.querySelector('.hero__actions');
    var side = document.querySelector('.hero__dandelions--side');
    if (big && acts) {
      if (vw < 760) {
        /* round 21, phones: Sivan's capsule sits on the same line as the left dandelion's head
           (head centred on the capsule), clear of it sideways; the paragraph capsule hangs under it
           and the right dandelion's head is centred on the paragraph. Nothing touches. */
        hero.style.removeProperty('--img-h');
        var bw = big.offsetWidth, headR = bw * 0.19;           /* head radius incl. pappus */
        var headX = OL(big) + bw * 0.636;               /* head centre, from the hero's left */
        var maxH = (vw - (headX + headR + 28)) / 1.25;         /* capsule = 1.25 × Sivan's height */
        if (photo.offsetHeight > maxH) { hero.style.setProperty('--img-h', maxH.toFixed(1) + 'px'); }
        H = photo.offsetHeight;
        var capH = photo.querySelector('.hero__capsule').offsetHeight || H * 0.7;
        var aB = acts.getBoundingClientRect().bottom - h.top;
        /* round 22: the left dandelion's head sits above Sivan's capsule line, just under the location line */
        var headC = aB + 16 + headR;
        var capTop = Math.max(aB + (H - capH) + 14, headC - capH * 0.15);   /* her head clears the location line */
        photo.style.top = (capTop - (H - capH)).toFixed(0) + 'px';
        photo.style.bottom = 'auto';
        var bigTop = headC - bw * 0.2045;
        big.style.top = bigTop.toFixed(0) + 'px';
        big.style.bottom = 'auto';
        var capEl = photo.querySelector('.hero__caption');
        var paraTop = capTop + capH + 14, paraH = capEl ? capEl.offsetHeight : 140;
        big.style.setProperty('--cut', (paraTop - bigTop - 14).toFixed(0) + 'px');
        if (side) {
          var sw2 = side.offsetWidth;
          /* round 24: the head's top edge (1.1% of the SVG's width down) sits just under the paragraph capsule */
          side.style.top = (paraTop + paraH + 14 - sw2 * 0.011).toFixed(0) + 'px';
          side.style.bottom = 'auto';
        }
        /* round 26: the drifting-seed box fills the gap right of the paragraph capsule, under Sivan's capsule */
        var seeds = document.querySelector('[data-side-seeds]');
        if (seeds && side && capEl) {
          var sTop = capTop + capH + 10;
          var sLeft = RR(capEl.getBoundingClientRect()).right - h.left + 10;
          var sHeadX = OL(side) + side.offsetWidth * 0.187, sHeadY = parseFloat(side.style.top) + side.offsetWidth * 0.176;
          seeds.style.top = sTop.toFixed(0) + 'px';
          setX(seeds, sLeft.toFixed(0) + 'px');
          seeds.style.height = Math.max(40, sHeadY - sTop).toFixed(0) + 'px';
          seeds.style.setProperty('--hx', Math.max(0, sHeadX - sLeft - 7).toFixed(0) + 'px');
        }
        var sideEnd = side ? paraTop + paraH + 14 + side.offsetWidth * 0.33 + 24 : 0;   /* head plus a little stem */
        hero.style.minHeight = 'max(100svh, ' + Math.ceil(Math.max(paraTop + paraH + 40, sideEnd)) + 'px)';
      } else {
        big.style.top = ''; big.style.bottom = ''; big.style.removeProperty('--cut');
        photo.style.top = ''; photo.style.bottom = '';
        if (side) { side.style.top = ''; side.style.bottom = ''; }
        hero.style.minHeight = ''; hero.style.removeProperty('--img-h');
      }
    }
    /* round 22, desktop: if Sivan would reach the buttons (narrower screens, longer capsule), lower the capsule */
    var btns = document.querySelector('.hero__actions');
    if (vw >= 760 && btns) {
      var rel = function (el) { var t = 0, x = 0, w0 = el.offsetWidth; while (el && el !== hero) { t += el.offsetTop; x += el.offsetLeft; el = el.offsetParent; } return { top: t, left: ltr ? hero.clientWidth - x - w0 : x }; };
      var bp = rel(btns), pp = rel(photo);
      var bBottom = bp.top + btns.offsetHeight, pRight = pp.left + photo.offsetWidth;
      /* round 23: the top of Sivan's head (2.8% down the cutout) lines up with the middle of the WhatsApp
         button, as long as her hair (its right edge ~33% of --img-h in from the photo's right) stays clear of it */
      var wa = btns.querySelector('.btn--whatsapp'), imgH = photo.offsetHeight;
      if (wa) {
        var wp = rel(wa), waMid = wp.top + wa.offsetHeight / 2;
        var lift = (pp.top + imgH * 0.028) - waMid;
        if (pRight - imgH * 0.33 < wp.left - 24) {
          var b1 = parseFloat(getComputedStyle(photo).bottom) || 0;
          photo.style.bottom = Math.max(24, b1 + lift).toFixed(0) + 'px';
          pp = rel(photo);
        }
      }
      if (pRight > bp.left - 20 && pp.top < bBottom + 16 && !(wa && photo.style.bottom)) {
        var b0 = parseFloat(getComputedStyle(photo).bottom) || 0;
        photo.style.bottom = Math.max(24, b0 - (bBottom + 16 - pp.top)).toFixed(0) + 'px';
      }
    }
    if (small && cta) {
      var c = RR(cta.getBoundingClientRect());
      var sw = small.offsetWidth;
      var sl = c.left + c.width / 2 - h.left - sw * 0.364 + sw * 0.04;   /* head just right of the CTA's centre */
      sl = Math.min(sl, vw - h.left - 10 - sw * 0.74);                  /* keep the small twin whole on screen */
      setX(small, sl.toFixed(0) + 'px');
      var st = c.bottom - h.top + sw * 0.38 - sw * 2.045 * 0.389;      /* the seed-head sits a little higher (round 12) */
      small.style.top = st.toFixed(0) + 'px';
      small.style.setProperty('--fade-top', (c.bottom - h.top - st + 4).toFixed(0) + 'px');
    }
  }
  place();
  window.addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();

/* Round 15: section 2 — the pull quote's first line (top of the letters) and last line (baseline)
   line up with the top and bottom edges of the video frame. Its font size is scaled to the frame's
   height and nudged into place. Desktop layout only (side by side from 1024px). */
(function () {
  var quote = document.querySelector('.intro__quote');
  var p = quote && quote.querySelector('p');
  var frame = document.querySelector('.intro__media .video');
  if (!p || !frame) return;
  var mq = window.matchMedia('(min-width: 1024px)');
  var ctx = document.createElement('canvas').getContext('2d');
  function docTop(el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; }
  function lines() {                       /* text of each rendered line + its rect, in document space */
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), n, out = [], r = document.createRange();
    while ((n = walker.nextNode())) {
      for (var i = 0; i < n.length; i++) {
        if (!n.data[i].trim()) continue;
        r.setStart(n, i); r.setEnd(n, i + 1);
        var b = r.getBoundingClientRect(), last = out[out.length - 1];
        if (!last || b.top > last.top + b.height * 0.5) out.push({ top: b.top, bottom: b.bottom, text: '' });
        out[out.length - 1].text += n.data[i];
      }
    }
    return out;
  }
  function measure() {
    var ls = lines(); if (!ls.length) return null;
    var cs = getComputedStyle(p);
    ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    var first = ctx.measureText(ls[0].text), lastM = ctx.measureText(ls[ls.length - 1].text);
    var shift = quote.getBoundingClientRect().top - docTop(quote);   /* scroll + any reveal transform */
    var fa = first.fontBoundingBoxAscent, la = lastM.fontBoundingBoxAscent;
    var ink = (ls[0].bottom - ls[0].top - fa - first.fontBoundingBoxDescent) / 2;   /* inline box vs. font box */
    return {
      top: ls[0].top - shift + ink + fa - first.actualBoundingBoxAscent,          /* top of the letters */
      base: ls[ls.length - 1].top - shift + ink + la                              /* last baseline */
    };
  }
  function fit() {
    p.style.fontSize = ''; quote.style.top = '';
    if (!mq.matches) return;
    var vt = docTop(frame), vh = frame.offsetHeight;
    var base = parseFloat(getComputedStyle(p).fontSize), f = base;
    /* the text's height grows with its size (lines may re-wrap), so search for the size that matches */
    var lo = base * 0.6, hi = base * 1.6;
    for (var k = 0; k < 12; k++) {
      f = (lo + hi) / 2;
      p.style.fontSize = f.toFixed(2) + 'px';
      var m = measure(); if (!m) return;
      if (m.base - m.top > vh) hi = f; else lo = f;
    }
    p.style.fontSize = lo.toFixed(2) + 'px';
    var m2 = measure(); if (!m2) return;
    vt = docTop(frame);                       /* the row may have grown with the text */
    quote.style.top = (vt - m2.top).toFixed(1) + 'px';
  }
  var t; function later() { clearTimeout(t); t = setTimeout(fit, 120); }
  window.addEventListener('resize', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  fit();
})();
