/* Contact form – FRONTEND ONLY.
   Validates the same required fields as the live Gravity Form (#2) and shows
   loading / error / success states. It does NOT send anything: in WordPress the
   markup is replaced by Gravity Forms, and these classes style its output.
   See docs/wordpress-handoff.md. */
(function () {
  var form = document.querySelector('[data-form]');
  if (!form) return;
  var status = form.querySelector('.form__status');
  var submit = form.querySelector('.form__submit');

  var en = document.documentElement.lang === 'en';     // the English site shares this file
  var messages = en ? {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    consent: 'Please accept the privacy policy'
  } : {
    required: 'שדה חובה',
    email: 'כתובת הדוא"ל אינה תקינה',
    phone: 'מספר הטלפון אינו תקין',
    consent: 'יש לאשר את מדיניות הפרטיות'
  };

  function fieldOf(input) { return input.closest('.field'); }
  function errorOf(input) { return document.getElementById(input.getAttribute('aria-describedby')); }

  function validate(input) {
    var v = (input.value || '').trim();
    var msg = '';
    if (input.type === 'checkbox') { if (!input.checked) msg = messages.consent; }
    else if (input.required && !v) msg = messages.required;
    else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = messages.email;
    else if (input.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 9) msg = messages.phone;

    var field = fieldOf(input), err = errorOf(input);
    field.classList.toggle('is-invalid', !!msg);
    field.classList.toggle('is-valid', !msg && (input.type === 'checkbox' ? input.checked : !!v));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg; err.hidden = !msg; }
    return !msg;
  }

  var inputs = form.querySelectorAll('[required]');
  inputs.forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value || input.type === 'checkbox') validate(input); });
    input.addEventListener('input', function () { if (fieldOf(input).classList.contains('is-invalid')) validate(input); });
    input.addEventListener('change', function () { if (input.type === 'checkbox') validate(input); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    inputs.forEach(function (input) { if (!validate(input) && !firstBad) firstBad = input; });
    if (firstBad) { firstBad.focus(); return; }

    submit.classList.add('is-loading');
    submit.setAttribute('aria-disabled', 'true');
    status.className = 'form__status';
    status.textContent = '';
    setTimeout(function () {
      submit.classList.remove('is-loading');
      submit.removeAttribute('aria-disabled');
      status.classList.add('is-success');
      // Concept-only notice (not site copy): the form is not connected yet.
      status.textContent = en ? 'Concept version: the form is not connected yet.' : 'גרסת קונספט: הטופס עדיין לא מחובר לשליחה.';
    }, 900);
  });
})();
