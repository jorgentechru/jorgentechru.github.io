'use strict';

(() => {
  // Частицы из оригинального портфолио, с ограничением нагрузки для телефонов.
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas?.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let particles = [];
  let width = 0;
  let height = 0;
  let animationId = 0;
  const pointer = { x: -1000, y: -1000, active: false };

  function setupParticles() {
    if (!ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(75, Math.max(18, Math.floor(width * height / 16000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .34,
      vy: (Math.random() - .5) * .34,
      size: Math.random() * 1.35 + .65
    }));
  }

  function animate() {
    if (!ctx || reducedMotion.matches || document.hidden) return;
    ctx.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 9 && distSq < 12000) {
          particle.x += dx / Math.sqrt(distSq) * .7;
          particle.y += dy / Math.sqrt(distSq) * .7;
        }
      }
      ctx.fillStyle = 'rgba(118, 192, 244, .67)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    const maxDistSq = 135 * 135;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistSq) continue;
        const opacity = (1 - distSq / maxDistSq) * .19;
        ctx.strokeStyle = `rgba(98, 172, 230, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    animationId = window.requestAnimationFrame(animate);
  }

  function restart() {
    window.cancelAnimationFrame(animationId);
    if (!reducedMotion.matches && !document.hidden) animate();
    else if (ctx) ctx.clearRect(0, 0, width, height);
  }

  if (ctx && !reducedMotion.matches) {
    setupParticles();
    animate();
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { setupParticles(); restart(); }, 150);
    });
    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'mouse') {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      }
    }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; });
    document.addEventListener('visibilitychange', restart);
    reducedMotion.addEventListener?.('change', restart);
  }

  // Плавное появление секций; без JS контент остаётся видимым.
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver((entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        self.unobserve(entry.target);
      }
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(element => observer.observe(element));
  } else {
    reveals.forEach(element => element.classList.add('is-visible'));
  }

  // Диалог с сохранёнными видеозаписью и презентацией «Экобегуна».
  const dialog = document.getElementById('eco-modal');
  const openEco = document.getElementById('open-eco');
  const closeEco = document.getElementById('close-eco');
  const video = document.getElementById('eco-video');
  openEco?.addEventListener('click', () => dialog?.showModal());
  closeEco?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('close', () => video?.pause());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  // Кнопка копирования адреса, не открывающая пустую вкладку почтовой программы.
  const email = 'jorgentech@yandex.ru';
  const status = document.getElementById('copy-status');
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Скопировано! Можно вставить адрес в письмо.';
      } catch {
        status.textContent = `Скопируйте вручную: ${email}`;
      }
    });
  });
})();
