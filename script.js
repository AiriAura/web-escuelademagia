'use strict';

/* ═══════════════════════════════════════
   1. CURSOR MÍSTICO
═══════════════════════════════════════ */
const curO = document.getElementById('cursor-outer');
const curD = document.getElementById('cursor-dot');

if (curO && curD) {
  let mx = 0, my = 0, ox = 0, oy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    curD.style.left = mx + 'px';
    curD.style.top  = my + 'px';
  });

  // Outer sigue con lag suave
  (function seguirCursor() {
    ox += (mx - ox) * 0.12;
    oy += (my - oy) * 0.12;
    curO.style.left = ox + 'px';
    curO.style.top  = oy + 'px';
    requestAnimationFrame(seguirCursor);
  })();

  document.querySelectorAll('a, button, .sendero-card, .voz-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ═══════════════════════════════════════
   2. CANVAS DE FONDO — estrellas + niebla
═══════════════════════════════════════ */
(function fondoCosmos() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Estrellas
  const estrellas = Array.from({ length: 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.3,
    a: Math.random() * 0.6 + 0.1,
    vel: Math.random() * 0.002 + 0.001,
    fase: Math.random() * Math.PI * 2,
  }));

  // Nebulosas
  const nebulas = [
    { x: 0.2, y: 0.3, r: 0.35, c: 'rgba(74,45,122,' },
    { x: 0.8, y: 0.6, r: 0.3,  c: 'rgba(180,60,120,' },
    { x: 0.5, y: 0.8, r: 0.28, c: 'rgba(74,45,122,' },
  ];

  let t = 0;
  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    // Nebulosas
    nebulas.forEach(n => {
      const grad = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.r * W);
      const pulse = 0.06 + Math.sin(t * 0.5 + n.x * 10) * 0.02;
      grad.addColorStop(0, n.c + pulse + ')');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(n.x * W, n.y * H, n.r * W, n.r * H * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Estrellas
    estrellas.forEach(s => {
      const flicker = s.a * (0.6 + 0.4 * Math.sin(t * s.vel * 60 + s.fase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${flicker})`;
      ctx.fill();
    });

    requestAnimationFrame(dibujar);
  }
  dibujar();
})();

/* ═══════════════════════════════════════
   3. NAV scroll
═══════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('oscuro', window.scrollY > 60);
}, { passive: true });

/* ═══════════════════════════════════════
   4. MENÚ HAMBURGUESA
═══════════════════════════════════════ */
const burger  = document.getElementById('burger');
const menuM   = document.getElementById('menu-m');
const menuX   = document.getElementById('menu-x');

function abrirM()  { burger.classList.add('ab'); menuM.classList.add('ab'); document.body.style.overflow = 'hidden'; burger.setAttribute('aria-expanded','true'); }
function cerrarM() { burger.classList.remove('ab'); menuM.classList.remove('ab'); document.body.style.overflow = ''; burger.setAttribute('aria-expanded','false'); }

if (burger) burger.addEventListener('click', () => burger.classList.contains('ab') ? cerrarM() : abrirM());
if (menuX)  menuX.addEventListener('click', cerrarM);
if (menuM)  menuM.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarM));

/* ═══════════════════════════════════════
   5. MOTOR DE REVELACIÓN POR SCROLL
   Cada elemento tiene su propio ritual de aparición
═══════════════════════════════════════ */
const obsBase = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obsBase.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Elementos estándar
document.querySelectorAll('.llamado-texto, .c-info, .form-portal, .uf-inner').forEach(el => obsBase.observe(el));

// Cards de servicios — cascada con delay
const obsSendero = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      obsSendero.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.sendero-card').forEach(el => obsSendero.observe(el));

// Cards de voces — cascada
const obsVoces = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      obsVoces.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.voz-card').forEach(el => obsVoces.observe(el));

/* ═══════════════════════════════════════
   6. REVELACIÓN DE LA FIGURA (efecto velo)
   La imagen de Carolina emerge de la oscuridad
═══════════════════════════════════════ */
const llamadoImg  = document.getElementById('llamado-img');
const llamadoVelo = document.getElementById('llamado-velo');
const llamadoTxt  = document.getElementById('llamado-texto');

const obsLlamado = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // Primero aparece el texto
      setTimeout(() => llamadoTxt.classList.add('visible'), 100);

      // Luego la imagen se revela
      setTimeout(() => {
        llamadoImg.classList.add('revelado');
        // Los credenciales aparecen en cascada
        document.querySelectorAll('.cred-row').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), 400 + i * 120);
        });
      }, 500);

      obsLlamado.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

if (llamadoImg) obsLlamado.observe(llamadoImg);

/* ═══════════════════════════════════════
   7. REVELACIÓN DE CURSOS (escena por escena)
   Visual + texto + bullets en secuencia
═══════════════════════════════════════ */
function revelarCurso(cvId, ccId, bulletsId) {
  const cv = document.getElementById(cvId);
  const cc = document.getElementById(ccId);
  if (!cv || !cc) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Visual escala hacia arriba
        cv.classList.add('visible');

        // Texto entra desde el lado
        setTimeout(() => {
          cc.classList.add('visible');
          // Bullets aparecen uno a uno
          if (bulletsId) {
            document.querySelectorAll(`#${bulletsId} .c-bullet`).forEach(b => {
              const d = parseInt(b.dataset.delay || 0);
              setTimeout(() => b.classList.add('visible'), 400 + d);
            });
          }
        }, 250);

        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  obs.observe(cv);
}

revelarCurso('cv-guardianes', 'cc-guardianes', 'bullets-guardianes');
revelarCurso('cv-tarot',      'cc-tarot',      'bullets-tarot');

/* ═══════════════════════════════════════
   8. CONTADORES ANIMADOS
═══════════════════════════════════════ */
function animar(el) {
  const target = parseInt(el.dataset.target, 10);
  const suf    = el.dataset.suffix || '';
  const dur    = 1800;
  const t0     = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

let contado = false;
const obsStats = new IntersectionObserver(entries => {
  if (entries.some(e => e.isIntersecting) && !contado) {
    contado = true;
    document.querySelectorAll('[data-target]').forEach(animar);
  }
}, { threshold: 0.5 });

const statsWrap = document.querySelector('.portal-stats');
if (statsWrap) obsStats.observe(statsWrap);

/* ═══════════════════════════════════════
   9. SCROLL SUAVE
═══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const dest = document.querySelector(this.getAttribute('href'));
    if (!dest) return;
    e.preventDefault();
    window.scrollTo({ top: dest.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════
   10. FORMULARIO
═══════════════════════════════════════ */
const form = document.getElementById('form');
const fpOk = document.getElementById('fp-ok');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    fpOk.style.display = 'block';
    setTimeout(() => { fpOk.style.display = 'none'; form.style.display = ''; form.reset(); }, 8000);
  });
}

/* ═══════════════════════════════════════
   11. PARALLAX SUAVE EN EL PORTAL
═══════════════════════════════════════ */
const portalLuz = document.querySelector('.portal-luz');
window.addEventListener('scroll', () => {
  if (!portalLuz) return;
  portalLuz.style.transform = `translate(-50%, calc(-50% + ${window.scrollY * 0.12}px))`;
}, { passive: true });
