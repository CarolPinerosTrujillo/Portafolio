(function () {
  'use strict';

  /* ============================================================
     SCROLL REVEAL — anima secciones al entrar al viewport
     ============================================================ */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ============================================================
     NAV — SCROLL SPY: indica la sección activa en escritorio y
     en el drawer móvil (mismo indicador en ambos)
     ============================================================ */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-menu a, .nav-drawer a')
  );
  var sectionMap = {};
  var sections = [];

  navLinks.forEach(function (link) {
    var sel = link.getAttribute('href');
    if (sel && !sectionMap[sel]) {
      var el = document.querySelector(sel);
      if (el) {
        sectionMap[sel] = el;
        sections.push(el);
      }
    }
  });

  function setActive(hash) {
    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === hash);
    });
  }

  if (sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive('#' + entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) {
      spyObserver.observe(s);
    });

    // En el fondo de la página siempre marca el último enlace
    var lastHash = navLinks[navLinks.length - 1].getAttribute('href');
    window.addEventListener(
      'scroll',
      function () {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
          setActive(lastHash);
        }
      },
      { passive: true }
    );
  } else if (navLinks.length) {
    setActive(navLinks[0].getAttribute('href'));
  }

  /* ============================================================
     NAV — SFRIM DEGRADADO AL SCROLL (el texto no se cruza)
     ============================================================ */
  var siteNav = document.querySelector('.site-nav');
  function updNavScrim() {
    if (siteNav) siteNav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updNavScrim, { passive: true });
  updNavScrim();

  /* ============================================================
     MENÚ MÓVIL — drawer a pantalla completa
     Se cierra con scroll, clic en un enlace, clic fuera o Esc.
     ============================================================ */
  var navToggle = document.getElementById('nav-toggle');
  var navDrawer = document.getElementById('nav-drawer');

  function closeNav() {
    if (!navDrawer || !navToggle) return;
    navDrawer.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  function openNav() {
    if (!navDrawer || !navToggle) return;
    navDrawer.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      navDrawer.classList.contains('open') ? closeNav() : openNav();
    });

    navDrawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    // Clic fuera de un enlace (fondo del drawer) también cierra
    navDrawer.addEventListener('click', function (e) {
      if (!e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    var scrollTimer;
    window.addEventListener(
      'scroll',
      function () {
        if (navDrawer.classList.contains('open')) {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(closeNav, 60);
        }
      },
      { passive: true }
    );
  }

  /* ============================================================
     TYPEWRITER — efecto en el hero
     ============================================================ */
  var typeTarget = document.getElementById('typewriter-role');
  if (typeTarget) {
    var phrases = typeTarget.getAttribute('data-phrases')
      ? typeTarget.getAttribute('data-phrases').split('|')
      : [];
    var phrase = phrases[0] || typeTarget.textContent;
    var typeIndex = 0;
    var deleting = false;
    var caret = document.createElement('span');
    caret.className = 'typewriter-caret';
    caret.setAttribute('aria-hidden', 'true');
    typeTarget.parentNode.insertBefore(caret, typeTarget.nextSibling);

    function typeStep() {
      var current = phrase.slice(0, typeIndex);
      typeTarget.textContent = current;

      if (!deleting) {
        typeIndex++;
        if (typeIndex > phrase.length) {
          deleting = true;
          setTimeout(typeStep, 2200);
          return;
        }
        setTimeout(typeStep, 65 + Math.random() * 40);
      } else {
        typeIndex--;
        if (typeIndex <= 0) {
          deleting = false;
          var next = phrases.indexOf(phrase) + 1;
          phrase = phrases[next % phrases.length] || phrase;
          setTimeout(typeStep, 500);
          return;
        }
        setTimeout(typeStep, 30);
      }
    }

    if (phrases.length > 0) phrase = phrases[0];
    setTimeout(typeStep, 400);
  }

  /* ============================================================
     TIMELINE — tap-to-toggle en mobile
     ============================================================ */
  var timelineItems = document.querySelectorAll('.timeline-item');

  timelineItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasActive = item.classList.contains('is-active');

      // Close all
      timelineItems.forEach(function (el) {
        el.classList.remove('is-active');
      });

      // Toggle clicked
      if (!wasActive) {
        item.classList.add('is-active');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.timeline-item')) {
      timelineItems.forEach(function (el) {
        el.classList.remove('is-active');
      });
    }
  });

  /* ============================================================
     TIMELINE — barra de progreso con scroll
     ============================================================ */
  var timeline = document.querySelector('.timeline');
  var progressBar = document.querySelector('.timeline-progress');

  if (timeline && progressBar) {
    function updateTimelineProgress() {
      var rect = timeline.getBoundingClientRect();
      var total = timeline.offsetHeight;
      var viewH = window.innerHeight;
      var scrolled = viewH - rect.top;
      var range = total + viewH;
      var pct = Math.min(100, Math.max(0, (scrolled / range) * 100));

      var isMobile = window.innerWidth <= 600;
      if (isMobile) {
        progressBar.style.width = '2px';
        progressBar.style.height = pct + '%';
      } else {
        progressBar.style.height = '2px';
        progressBar.style.width = pct + '%';
      }
    }
    window.addEventListener('scroll', updateTimelineProgress, { passive: true });
    window.addEventListener('resize', updateTimelineProgress, { passive: true });
    updateTimelineProgress();
  }

  /* ============================================================
     CONTACTO — formulario: prevenir envío y dar feedback
     ============================================================ */
  document.querySelectorAll('.contact-form-col').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.contact-submit');
      var original = btn.innerHTML;
      var isEN = document.documentElement.lang === 'en';
      btn.innerHTML = isEN ? 'Thanks! &#10003;' : '&#10003;';
      btn.style.pointerEvents = 'none';
      setTimeout(function () {
        btn.innerHTML = original;
        btn.style.pointerEvents = '';
        form.reset();
      }, 2500);
    });
  });

  /* ============================================================
     PARTÍCULAS — arranca si el módulo está disponible
     ============================================================ */
  if (window.EnergyParticles) {
    window.EnergyParticles.init();
  }
})();