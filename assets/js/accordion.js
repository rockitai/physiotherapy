/* Accordion ("טיפולים נוספים"): one button per row toggles its panel.
   Panels stay open without JS (CSS only collapses them under .js). */
(function () {
  document.querySelectorAll('[data-accordion]').forEach(function (acc) {
    acc.querySelectorAll('.acc__trigger').forEach(function (btn) {
      var item = btn.closest('.acc__item');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        item.classList.toggle('is-open', !open);
      });
    });
  });
})();
