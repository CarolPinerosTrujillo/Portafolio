(function () {
  'use strict';

  var isEN = document.documentElement.lang === 'en';

  var ENDPOINT = 'https://formsubmit.co/ajax/carolpy25m@gmail.com';
  var SUBJECT = isEN ? 'Message from Carol\'s portfolio' : 'Mensaje desde el portafolio de Carol';

  var MSG = {
    nameEmpty:    isEN ? 'Enter your name.' : 'Escribe tu nombre.',
    nameShort:    isEN ? 'Name must be at least 2 characters.' : 'El nombre debe tener al menos 2 caracteres.',
    emailEmpty:   isEN ? 'Enter your email.' : 'Escribe tu correo electrónico.',
    emailInvalid: isEN ? 'Enter a valid email, e.g.: name@domain.com' : 'Ingresa un correo válido, por ejemplo: nombre@dominio.com',
    msgEmpty:     isEN ? 'Enter your message.' : 'Escribe tu mensaje.',
    msgShort:     isEN ? 'Message must be at least 10 characters.' : 'El mensaje debe tener al menos 10 caracteres.',
    success:      isEN ? 'Thank you! Your message was sent successfully. I\'ll get back to you soon.' : '¡Gracias! Tu mensaje llegó correctamente, te responderé pronto.',
    error:        isEN ? 'An error occurred. Please try again or email me at carolpy25m@gmail.com.' : 'Ocurrió un error al enviar. Inténtalo de nuevo o escríbeme a carolpy25m@gmail.com.'
  };

  var form = document.getElementById('contact-form');
  if (!form) return;

  var fields = {
    name: document.getElementById('c-name'),
    email: document.getElementById('c-email'),
    message: document.getElementById('c-message')
  };

  var submitBtn = document.getElementById('contact-submit');
  var statusBox = form.querySelector('.contact-form-status');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    var text = message || '';
    var err = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    input.closest('.field').classList.toggle('has-error', !!text);
    if (err) {
      err.textContent = text;
      err.hidden = !text;
    }
    return !!text;
  }

  function validate() {
    var valid = true;

    var name = fields.name.value.trim();
    if (name.length < 2) {
      setError(fields.name, name.length === 0 ? MSG.nameEmpty : MSG.nameShort);
      valid = false;
    } else {
      setError(fields.name, '');
    }

    var email = fields.email.value.trim();
    if (!EMAIL_RE.test(email)) {
      setError(fields.email, email.length === 0 ? MSG.emailEmpty : MSG.emailInvalid);
      valid = false;
    } else {
      setError(fields.email, '');
    }

    var message = fields.message.value.trim();
    if (message.length < 10) {
      setError(fields.message, message.length === 0 ? MSG.msgEmpty : MSG.msgShort);
      valid = false;
    } else {
      setError(fields.message, '');
    }

    return valid;
  }

  var statusTimer = null;
  function showStatus(message, type) {
    clearTimeout(statusTimer);
    statusBox.textContent = message;
    statusBox.classList.toggle('is-success', type === 'success');
    statusBox.classList.toggle('is-error', type === 'error');
    statusBox.hidden = false;
    if (type === 'success') {
      statusTimer = setTimeout(function () {
        statusBox.classList.remove('is-success', 'is-error');
        statusBox.hidden = true;
      }, 5000);
    }
  }

  function setSubmitting(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = validate();
    if (!valid) return;

    var payload = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      message: fields.message.value.trim(),
      _subject: SUBJECT,
      _captcha: 'false'
    };

    setSubmitting(true);
    statusBox.hidden = true;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function () { throw new Error('bad status'); });
        }
        return res.json();
      })
      .then(function (data) {
        if (data && data.success === 'true') {
          form.reset();
          [fields.name, fields.email, fields.message].forEach(function (f) {
            f.setAttribute('aria-invalid', 'false');
            f.closest('.field').classList.remove('has-error');
            document.getElementById(f.id + '-error').hidden = true;
          });
          showStatus(MSG.success, 'success');
        } else {
          throw new Error('formspree parsed false');
        }
      })
      .catch(function () {
        showStatus(MSG.error, 'error');
      })
      .finally(function () {
        setSubmitting(false);
      });
  });

  ['input', 'blur'].forEach(function (evt) {
    form.addEventListener(evt, function (e) {
      if (e.target === fields.name || e.target === fields.email || e.target === fields.message) {
        if (e.target.getAttribute('aria-invalid') === 'true') {
          validate();
        }
      }
    });
  });
})();
