/* ===== sportpersona front logic (UTF-8) ===== */
'use strict';

/* ---------------- Sticky nav + progress bar ---------------- */
(function () {
  const nav = document.getElementById('siteNav');
  const progress = document.getElementById('progress');

  const onScroll = () => {
    if (nav) nav.classList.toggle('stuck', window.scrollY > 10);
    if (progress) {
      const h = document.documentElement;
      const scrolled = h.scrollHeight > h.clientHeight
        ? (h.scrollTop) / (h.scrollHeight - h.clientHeight)
        : 0;
      progress.style.width = (scrolled * 100).toFixed(2) + '%';
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------------- Helpers ---------------- */
function buildDots(wrapperId, slides, switchTo) {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return [];
  wrap.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.type = 'button';
    d.addEventListener('click', () => switchTo(i));
    wrap.appendChild(d);
  });
  return wrap.querySelectorAll('.dot');
}

function makeSlider({ rootSelector, slideSelector, dotContainerId, interval = 3500 }) {
  const root = document.querySelector(rootSelector);
  if (!root) return null;

  const slides = Array.from(root.querySelectorAll(slideSelector));
  if (slides.length === 0) return null;

  let idx = 0;
  let timer = null;
  let dots = buildDots(dotContainerId, slides, show);

  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('active', j === idx));
    if (dots && dots.length) dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  }

  function next() { show(idx + 1); }
  function prev() { show(idx - 1); }

  function start() { timer = window.setInterval(next, interval); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // drag/swipe
  let startX = 0, dragging = false;
  const onStart = e => { dragging = true; startX = (e.touches ? e.touches[0].clientX : e.clientX); stop(); };
  const onMove = e => {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    if (Math.abs(x - startX) > 50) { (x < startX ? next() : prev()); dragging = false; }
  };
  const onEnd = () => { dragging = false; start(); };

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('mousedown', onStart);
  root.addEventListener('mousemove', onMove);
  root.addEventListener('mouseup', onEnd);
  root.addEventListener('mouseleave', () => (dragging = false));
  root.addEventListener('touchstart', onStart, { passive: true });
  root.addEventListener('touchmove', onMove, { passive: true });
  root.addEventListener('touchend', onEnd);

  show(0);
  start();

  return { show, next, prev, stop, start };
}

/* ---------------- Sliders init ---------------- */
const hero = makeSlider({
  rootSelector: '#heroSlider',
  slideSelector: '.slide',
  dotContainerId: 'heroDots',
  interval:6000
});
const merch = makeSlider({
  rootSelector: '#merchSlider',
  slideSelector: '.merch-slide',
  dotContainerId: 'merchDots',
  interval: 3000
});

/* ---------------- Modal (consultation) ---------------- */
(function () {
  const modal = document.getElementById('consultModal');
  if (!modal) return;

  const openers = [
    document.getElementById('openModal'),
    document.getElementById('openModalHero'),
    document.getElementById('openModal2')
  ].filter(Boolean);
  const closers = [
    document.getElementById('closeModal'),
    document.getElementById('closeModal2')
  ].filter(Boolean);

  const openModal = () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    const name = document.getElementById('name');
    if (name) name.focus();
  };
  const closeModal = () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  };

  openers.forEach(b => b.addEventListener('click', openModal));
  closers.forEach(b => b.addEventListener('click', closeModal));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // экспортируем в глобал, чтобы использовать в других местах
  window.__openConsult = openModal;
  window.__closeConsult = closeModal;
})();

/* ---------------- Phone mask ---------------- */
(function () {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    let out = '+' + v[0];
    if (v.length > 1) out += ' ' + v.slice(1, 4);
    if (v.length > 4) out += ' ' + v.slice(4, 7);
    if (v.length > 7) out += '-' + v.slice(7, 9);
    if (v.length > 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  });
})();

/* ---------------- Footer year ---------------- */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------------- Smooth anchor scroll ---------------- */
(function () {
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.length <= 1) return;

    const targetId = href.substring(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
  });
})();

/* ---------------- Reveal on scroll ---------------- */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('visible'));
  }
})();

/* ---------------- Form submit ---------------- */
(function () {
  const form = document.getElementById('consultForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      phone: fd.get('phone'),
      city: fd.get('city'),
      comment: fd.get('comment') || ''
    };

    try {
     	const resp = await fetch('/api/application', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });

      let result = {};
      try {
        result = await resp.json();
      } catch (_) {
        // если вдруг не JSON
        result = { success: false, error: 'Неверный формат ответа сервера' };
      }

      if (resp.ok && result.success) {
        alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
        e.target.reset();
        if (window.__closeConsult) window.__closeConsult();
      } else {
        alert('Ошибка при отправке заявки: ' + (result.error || resp.statusText || 'Неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка при отправке заявки. Пожалуйста, попробуйте ещё раз.');
    }
  });
})();

/* ---------------- Card sliders for services ---------------- */
(function () {
  // Эти ID должны существовать в разметке (как у тебя было): service1Dots..service6Dots
  const conf = [
    { root: '.card:nth-child(1) .media .slider', dots: 'service1Dots' },
    { root: '.card:nth-child(2) .media .slider', dots: 'service2Dots' },
    { root: '.card:nth-child(3) .media .slider', dots: 'service3Dots' },
    { root: '.card:nth-child(4) .media .slider', dots: 'service4Dots' },
    { root: '.card:nth-child(5) .media .slider', dots: 'service5Dots' },
    { root: '.card:nth-child(6) .media .slider', dots: 'service6Dots' }
  ];
  conf.forEach(c => makeSlider({
    rootSelector: c.root,
    slideSelector: '.slide',
    dotContainerId: c.dots,
    interval: 3500
  }));
})();

/* ---------------- Service Photos Gallery (SPG) ---------------- */
(function () {
  function parseGallery(str) {
    if (!str) return [];
    try {
      if (str.trim().startsWith('[')) return JSON.parse(str); // JSON-массив
    } catch (_) { /* ignore */ }
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  function buildModalDOM(id, title) {
    const wrap = document.createElement('div');
    wrap.className = 'spg-backdrop';
    wrap.id = id;
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="spg-modal" role="dialog" aria-modal="true">
        <button class="spg-close" aria-label="Закрыть">&times;</button>
        <div class="spg-header">
          <div class="spg-title">${title || 'Галерея'}</div>
          <div class="spg-counter">1 / 1</div>
        </div>
        <div class="spg-stage">
          <button class="spg-nav spg-prev" aria-label="Предыдущее">&lsaquo;</button>
          <div class="spg-track"></div>
          <button class="spg-nav spg-next" aria-label="Следующее">&rsaquo;</button>
        </div>
        <div class="spg-thumbs"></div>
      </div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function initGalleryForButton(btn, index) {
    const title = btn.getAttribute('data-title') || btn.textContent.trim();
    const images = parseGallery(btn.getAttribute('data-gallery'));
    if (images.length === 0) return;

    const modalId = `spg-${index + 1}`;
    const modal = buildModalDOM(modalId, title);

    const track = modal.querySelector('.spg-track');
    const thumbs = modal.querySelector('.spg-thumbs');
    const counter = modal.querySelector('.spg-counter');
    const btnPrev = modal.querySelector('.spg-prev');
    const btnNext = modal.querySelector('.spg-next');
    const btnClose = modal.querySelector('.spg-close');

    let idx = 0, slides = [], thumbBtns = [], built = false;

    function setCounter() { counter.textContent = `${idx + 1} / ${images.length}`; }
    function show(i) {
      idx = (i + images.length) % images.length;
      slides.forEach((s, j) => s.classList.toggle('active', j === idx));
      thumbBtns.forEach((t, j) => t.classList.toggle('active', j === idx));
      setCounter();
      // лёгкое предзагружение соседних кадров
      [ (idx + 1) % images.length, (idx - 1 + images.length) % images.length ].forEach(k => {
        const img = slides[k].querySelector('img'); if (img && !img.complete) { img.decode?.().catch(() => { }); }
      });
    }

    function build() {
      if (built) return;
      slides.length = 0; thumbBtns.length = 0;
      track.innerHTML = ''; thumbs.innerHTML = '';

      images.forEach((src, i) => {
        const s = document.createElement('div');
        s.className = 'spg-slide' + (i === 0 ? ' active' : '');
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${title} ${i + 1}`;
        img.decoding = 'async';
        s.appendChild(img);
        track.appendChild(s); slides.push(s);

        const th = document.createElement('button');
        th.className = 'spg-thumb' + (i === 0 ? ' active' : '');
        th.type = 'button';
        th.innerHTML = `<img src="${src}" alt="thumb ${i + 1}">`;
        th.addEventListener('click', () => show(i));
        thumbs.appendChild(th); thumbBtns.push(th);
      });
      built = true;
      setCounter();
    }

    function open() {
      build();
      show(0);
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }

    // Навигация
    btnPrev.addEventListener('click', () => show(idx - 1));
    btnNext.addEventListener('click', () => show(idx + 1));
    btnClose.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Клавиатура
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('show')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });

    // Swipe
    let startX = 0, dragging = false;
    track.addEventListener('touchstart', (e) => { dragging = true; startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const x = e.touches[0].clientX;
      if (Math.abs(x - startX) > 50) { dragging = false; (x < startX ? show(idx + 1) : show(idx - 1)); }
    }, { passive: true });
    track.addEventListener('touchend', () => { dragging = false; });

    // Открытие по кнопке
    btn.addEventListener('click', open);
  }

  document.querySelectorAll('#services .open-service-gallery').forEach((btn, i) => {
    initGalleryForButton(btn, i);
  });
})();
