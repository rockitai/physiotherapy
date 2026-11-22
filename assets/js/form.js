/* Contact form: validates the same required fields as the live Gravity Form (#2), then sends the enquiry to
   /api/contact (Vercel function api/contact.js), which e-mails it to sivan@physiotherapy.co.il ("פנייה מהאתר | <name>").
   Loading / error / success states. In WordPress Gravity Forms takes over (see docs/wordpress-handoff.md). */
(function () {
  var endpoint = '/api/contact';   // Vercel function api/contact.js (assets/php/contact.php is the same for PHP hosts)
  var form = document.querySelector('[data-form]');
  if (!form) return;
  form.action = endpoint;
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
    submit.disabled = true;
    status.className = 'form__status';
    status.textContent = '';

    var data = new FormData(form);
    data.append('page', location.href);
    data.append('lang', en ? 'en' : 'he');
    function done(ok) {
      submit.classList.remove('is-loading');
      submit.removeAttribute('aria-disabled');
      submit.disabled = false;
      if (ok) {
        status.classList.add('is-success');
        status.textContent = en ? 'Thank you, your message has been sent. Sivan will get back to you soon.'
                                : 'תודה, ההודעה נשלחה. סיון תחזור אליך בהקדם.';
        form.reset();
        form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-valid', 'is-invalid'); });
      } else {
        status.classList.add('is-error');
        status.innerHTML = en ? 'The message was not sent. Please try again, or call <a href="tel:052-6623666" dir="ltr">052-6623666</a>.'
                              : 'ההודעה לא נשלחה. אפשר לנסות שוב, או להתקשר ל־<a href="tel:052-6623666" dir="ltr">052-6623666</a>.';
      }
    }
    fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (j) { done(!!(j && j.ok)); })
      .catch(function () { done(false); });
  });
})();
