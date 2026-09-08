(function () {
  'use strict';

  var canvas = document.getElementById('energy-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var particles = [];
  var PARTICLE_COUNT = 55;
  var running = false;
  var animId = null;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Colores de partículas y línea a partir de las variables CSS de la paleta.
  var COLORS = [];
  var ENERGY_RGB = '126,169,106';

  function readVar(name, fallback) {
    var value = getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
    return value || fallback;
  }

  function refreshColors() {
    COLORS = [
      'rgba(' + readVar('--energy-rgb', '126,169,106') + ',',
      'rgba(' + readVar('--energy-2-rgb', '156,196,127') + ',',
      'rgba(' + readVar('--tech-rgb', '185,161,236') + ',',
      'rgba(' + readVar('--tech-2-rgb', '210,192,247') + ',',
      'rgba(' + readVar('--accent-rgb', '195,166,242') + ',',
    ];
    ENERGY_RGB = readVar('--energy-rgb', '126,169,106');
  }

  // Re-sincroniza la paleta cuando el usuario cambia el tema (data-theme).
  function watchTheme() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type !== 'attributes' && m.type !== 'characterData' && m.type !== 'childList') return;
        var root = document.documentElement;
        if (root && root.getAttribute('data-theme') !== null) {
          refreshColors();
          particles.forEach(function (p) { p.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)]; });
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  }

  function resize() {
    var hero = document.querySelector('.banner');
    if (!hero) return;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.r = Math.random() * 2.2 + 0.6;
    this.dx = (Math.random() - 0.5) * 0.32;
    this.dy = (Math.random() - 0.5) * 0.22;
    this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.45 + 0.15;
    this.alphaDir = (Math.random() - 0.5) * 0.004;
  }

  Particle.prototype.update = function () {
    this.x += this.dx;
    this.y += this.dy;
    this.alpha += this.alphaDir;
    if (this.alpha <= 0.08 || this.alpha >= 0.6) this.alphaDir *= -1;

    if (this.x < -20) this.x = canvas.width + 20;
    if (this.x > canvas.width + 20) this.x = -20;
    if (this.y < -20) this.y = canvas.height + 20;
    if (this.y > canvas.height + 20) this.y = -20;
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.colorBase + this.alpha + ')';
    ctx.fill();
  };

  function drawLines() {
    var maxDist = 100;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          var a = ((1 - dist / maxDist) * 0.12).toFixed(3);
          ctx.strokeStyle = 'rgba(' + ENERGY_RGB + ',' + a + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      p.update();
      p.draw();
    });
    drawLines();
    if (running) animId = requestAnimationFrame(loop);
  }

  function init() {
    if (prefersReduced) return;
    refreshColors();
    resize();
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
    watchTheme();
    if (!running) {
      running = true;
      loop();
    }
  }

  window.addEventListener('resize', function () {
    if (!running) return;
    resize();
  });

  window.EnergyParticles = { init: init };
})();