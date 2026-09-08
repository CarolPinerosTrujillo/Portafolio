(function () {
  'use strict';

  var reader = document.getElementById('blog-reader');
  var contentBox = document.getElementById('blog-reader-content');
  var closeBtn = document.getElementById('blog-reader-close');
  var progressBar = document.getElementById('blog-reader-progress');
  var prevTitle = '';

  if (!reader || !contentBox) return;

  var postCards = Array.prototype.slice.call(
    document.querySelectorAll('.blog-card[data-post]')
  );
  if (!postCards.length) return;

  function openReader(templateId, opener) {
    var tmpl = document.getElementById(templateId);
    if (!tmpl) return;

    contentBox.innerHTML = '';
    contentBox.appendChild(tmpl.content.cloneNode(true));

    var article = contentBox.querySelector('.blog-article');
    var h1 = article.querySelector('h1');
    prevTitle = document.title;
    if (h1) document.title = h1.textContent + ' — Carol Piñeros';

    reader.classList.add('open');
    reader.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reader-open');
    contentBox.scrollTop = 0;
    updateProgress();

    if (closeBtn) {
      setTimeout(function () { closeBtn.focus(); }, 60);
    }
    opener.setAttribute('data-opener', 'true');
  }

  function closeReader() {
    var opener = document.querySelector('.blog-card[data-opener="true"]');
    reader.classList.remove('open');
    reader.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reader-open');
    if (prevTitle) document.title = prevTitle;
    if (opener) {
      opener.removeAttribute('data-opener');
      opener.focus();
    }
  }

  function updateProgress() {
    if (!progressBar) return;
    var max = contentBox.scrollHeight - contentBox.clientHeight;
    var pct = max > 0 ? contentBox.scrollTop / max : 0;
    progressBar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
  }

  postCards.forEach(function (card) {
    function activate() {
      openReader(card.getAttribute('data-post'), card);
    }

    card.addEventListener('click', activate);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeReader);
  reader.addEventListener('click', function (e) {
    if (e.target === reader) closeReader();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && reader.classList.contains('open')) closeReader();
  });

  // Barra de progreso según el scroll del artículo
  contentBox.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  // Enfoque contenido mientras el lector está abierto
  reader.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !reader.classList.contains('open')) return;
    var focusables = contentBox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) {
      e.preventDefault();
      if (closeBtn) closeBtn.focus();
      return;
    }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();