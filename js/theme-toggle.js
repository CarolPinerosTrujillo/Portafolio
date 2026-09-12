(function () {
  'use strict';

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  var toggleBtn = document.querySelector('.theme-toggle');
  var html = document.documentElement;
  var STORAGE_KEY = 'carol-portfolio-theme';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function loadTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    } catch (_) {}
    return 'dark';
  }

  applyTheme(loadTheme());

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ============================================================
     CUSTOM CURSOR — rayo de energía + trueno al hacer click
     ============================================================ */
  if (window.matchMedia('(pointer:fine)').matches) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var bolt = document.createElement('div');
    bolt.className = 'cursor-bolt';
    bolt.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

    bolt.style.color = 'var(--color-energy)';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.appendChild(bolt);
    document.body.classList.add('custom-cursor-body');

    var mx = 0, my = 0;
    var dotX = 0, dotY = 0;
    var ringX = 0, ringY = 0;
    var boltX = 0, boltY = 0;
    var raf = null;
    var isOverLink = false;

    function cursorLoop() {
      if (document.body.classList.contains('reader-open')) {
        raf = null;
        return;
      }
      dotX += (mx - dotX) * 0.55;
      dotY += (my - dotY) * 0.55;
      ringX += (mx - ringX) * 0.38;
      ringY += (my - ringY) * 0.38;
      boltX += (mx - boltX) * 0.38;
      boltY += (my - boltY) * 0.38;
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      bolt.style.left = boltX + 'px';
      bolt.style.top = boltY + 'px';
      raf = requestAnimationFrame(cursorLoop);
    }

    document.addEventListener('mousemove', function (e) {
      if (document.body.classList.contains('reader-open')) return;
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(cursorLoop);
    });

    function checkOverLink(e) {
      if (document.body.classList.contains('reader-open')) return;
      var target = e.target;
      while (target && target !== document.body) {
        if (
          target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('a, button, input, textarea')
        ) {
          if (!isOverLink) {
            isOverLink = true;
            dot.classList.add('cursor-active');
            ring.classList.add('cursor-active', 'cursor-link');
          }
          return;
        }
        target = target.parentNode;
      }
      if (isOverLink) {
        isOverLink = false;
        dot.classList.remove('cursor-active');
        ring.classList.remove('cursor-active', 'cursor-link');
      }
    }

    document.addEventListener('mouseover', checkOverLink);
    document.addEventListener('mouseout', checkOverLink);

    /* ---- Trueno al hacer click ---- */
    document.addEventListener('mousedown', function (e) {
      if (document.body.classList.contains('reader-open')) return;
      var flash = document.createElement('div');
      flash.className = 'cursor-flash';
      flash.style.color = '#F59E0B';
      flash.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
      flash.style.left = e.clientX + 'px';
      flash.style.top = e.clientY + 'px';
      document.body.appendChild(flash);
      flash.addEventListener('animationend', function () {
        if (flash.parentNode) flash.parentNode.removeChild(flash);
      });
    });
  }
})();