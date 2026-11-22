/* YouTube facade: shows the poster, swaps in a privacy-enhanced iframe on click.
   Opened from disk (file://) the browser sends no referrer and YouTube refuses the embed (Error 153),
   so there the click opens the video on YouTube in a new tab instead. On the live site (https) it plays in place. */
(function () {
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var id = box.getAttribute('data-video');
    var btn = box.querySelector('.video__play');
    var poster = box.querySelector('.video__poster');
    // upgrade poster to max-res when available (falls back silently)
    var hi = new Image();
    hi.onload = function () { if (hi.naturalWidth > 120) poster.src = hi.src; };
    hi.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';

    var local = location.protocol === 'file:';
    if (local) btn.querySelector('.video__play-label') && btn.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Watch the video on YouTube (opens in a new tab)' : 'צפייה בסרטון ב-YouTube (נפתח בלשונית חדשה)');
    btn.addEventListener('click', function () {
      if (local) { window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener'); return; }
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&hl=he';
      iframe.title = 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      box.appendChild(iframe);
      btn.remove();
      poster.remove();
      iframe.focus();
    });
  });
})();
