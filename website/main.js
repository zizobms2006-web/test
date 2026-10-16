(() => {
  const S = window.SITE;
  const en = window.LANG === 'en';
  const L = v => Array.isArray(v) ? v[en ? 1 : 0] : v;
  const D = Object.assign({}, S, S[en ? 'en' : 'ar']);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!window.gsap;
  document.documentElement.classList.add('js');
  document.body.classList.add('loading');
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Render content ---------- */
  $('#servicesGrid').innerHTML = D.services.map((s, i) => `
    <article class="svc tilt" data-tilt="8">
      <span class="svc-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="svc-icon"><i class="fa-solid ${s.icon}"></i></div>
      <h3>${s.t}</h3>
      <p>${s.d}</p>
      <div class="svc-tags">${s.tags.map(t => `<span>${t}</span>`).join('')}</div>
    </article>`).join('');

  $('#clientsGrid').innerHTML = D.clients.map(c => `
    <figure class="client tilt" data-tilt="12">
      <div class="client-logo"><img src="assets/clients/${c.f}.webp" alt="${L(c.n)}" loading="lazy" width="360" height="360"></div>
      <figcaption><b>${L(c.n)}</b><small>${L(c.s)}</small></figcaption>
    </figure>`).join('');

  const logos = D.clients.map(c => `<div class="m-logo"><img src="assets/clients/${c.f}.webp" alt="${L(c.n)}" loading="lazy"></div>`);
  const half = Math.ceil(logos.length / 2);
  const rowA = logos.slice(0, half).join(''), rowB = logos.slice(half).concat(logos.slice(0, 2)).join('');
  $('#marqueeA').innerHTML = rowA + rowA + rowA;
  $('#marqueeB').innerHTML = rowB + rowB + rowB;

  $('#workGrid').innerHTML = D.work.map((w, i) => `
    <figure class="work-item" data-c="${w.c}" data-i="${i}">
      <img src="assets/work/${w.f}.webp" alt="${L(w.t)}" loading="lazy">
      <figcaption>${L(w.t)}</figcaption>
    </figure>`).join('');

  $('#faqList').innerHTML = D.faq.map((f, i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}">
      <button class="faq-q" aria-expanded="${i === 0}">${f.q}<i class="fa-solid fa-plus"></i></button>
      <div class="faq-a"><div><p>${f.a}</p></div></div>
    </div>`).join('');

  /* ---------- Loader ---------- */
  const imgs = $$('img').filter(i => i.loading !== 'lazy');
  let loaded = 0;
  const bar = $('#loaderBar'), count = $('#loaderCount');
  const tick = () => {
    loaded++;
    const p = Math.min(100, Math.round(loaded / imgs.length * 100));
    bar.style.width = p + '%'; count.textContent = p;
  };
  const ready = Promise.all(imgs.map(i => i.complete ? (tick(), 1) : new Promise(r => { i.onload = i.onerror = () => { tick(); r(); }; })));
  Promise.race([ready, new Promise(r => setTimeout(r, 3500))]).then(() => {
    bar.style.width = '100%'; count.textContent = 100;
    setTimeout(() => {
      $('#loader').classList.add('done');
      document.body.classList.remove('loading');
      intro();
    }, 250);
  });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    lenis ? lenis.scrollTo(el, { offset: id === '#top' ? 0 : -70 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- Nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 500 && !links.classList.contains('open'));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    $('#scrollProgress').style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function closeMenu() { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  const sections = $$('main section[id]');
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObs.observe(s));

  /* ---------- Cursor glow ---------- */
  if (fine && !reduced) {
    const g = $('#cursorGlow');
    addEventListener('pointermove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }, { passive: true });
  }

  /* ---------- 3D tilt + spotlight ---------- */
  if (fine && !reduced) {
    $$('.tilt').forEach(el => {
      const max = +el.dataset.tilt || 8;
      let raf = 0;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%');
        el.style.setProperty('--my', y * 100 + '%');
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transition = 'transform .12s linear';
          el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
        });
      });
      el.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        el.style.transition = 'transform .8s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
      });
    });

    /* magnetic buttons */
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Marquee ---------- */
  $$('.marquee').forEach(m => {
    const track = m.firstElementChild, dir = +m.dataset.dir;
    let x = 0, speed = 0.5, boost = 0, w = 0;
    const measure = () => { w = track.scrollWidth / 3; };
    measure(); addEventListener('resize', measure);
    if (lenis) lenis.on('scroll', e => { boost = Math.min(8, Math.abs(e.velocity) * 0.4); });
    m.addEventListener('pointerenter', () => speed = 0.12);
    m.addEventListener('pointerleave', () => speed = 0.5);
    const loop = () => {
      if (!reduced) {
        x -= (speed + boost) * dir;
        boost *= 0.92;
        if (w) { if (x <= -w) x += w; if (x > 0) x -= w; }
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(loop);
    };
    loop();
  });

  /* ---------- Counters ---------- */
  const countUp = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1800;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); } }), { threshold: .6 });
  $$('[data-count]').forEach(el => cObs.observe(el));

  /* ---------- FAQ ---------- */
  $$('.faq-item').forEach(item => $('.faq-q', item).addEventListener('click', () => {
    const open = !item.classList.contains('open');
    $$('.faq-item').forEach(o => { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
    item.classList.toggle('open', open);
    $('.faq-q', item).setAttribute('aria-expanded', open);
  }));

  /* ---------- Work filters + lightbox ---------- */
  const items = $$('.work-item');
  $$('#filters .chip').forEach(ch => ch.addEventListener('click', () => {
    $$('#filters .chip').forEach(c => c.classList.toggle('active', c === ch));
    const f = ch.dataset.f;
    items.forEach(it => it.classList.toggle('hidden', f !== 'all' && it.dataset.c !== f));
    if (hasGsap && !reduced) gsap.fromTo(items.filter(i => !i.classList.contains('hidden')), { opacity: 0, y: 30, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .6, stagger: .04, ease: 'power3.out' });
    if (hasGsap) ScrollTrigger.refresh();
  }));
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let cur = 0;
  const visible = () => items.filter(i => !i.classList.contains('hidden'));
  const show = i => {
    const v = visible(); cur = (i + v.length) % v.length;
    const w = D.work[+v[cur].dataset.i];
    lbImg.src = `assets/work/${w.f}.webp`; lbImg.alt = L(w.t); lbCap.textContent = L(w.t);
  };
  items.forEach(it => it.addEventListener('click', () => { show(visible().indexOf(it)); lb.classList.add('open'); lenis && lenis.stop(); }));
  const closeLb = () => { lb.classList.remove('open'); lenis && lenis.start(); };
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  $('#lbNext').addEventListener('click', () => show(cur + 1));
  $('#lbPrev').addEventListener('click', () => show(cur - 1));
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === (en ? 'ArrowRight' : 'ArrowLeft')) show(cur + 1);
    if (e.key === (en ? 'ArrowLeft' : 'ArrowRight')) show(cur - 1);
  });

  /* ---------- Demo chat (phone mock) ---------- */
  const chat = $('#demoChat');
  let chatPlaying = false;
  const playChat = async () => {
    if (chatPlaying) return; chatPlaying = true;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    while (true) {
      chat.innerHTML = '';
      for (const m of D.demoChat) {
        if (!m.me) {
          const t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
          chat.appendChild(t); await wait(900); t.remove();
        } else await wait(700);
        const b = document.createElement('div');
        b.className = 'bubble ' + (m.me ? 'me' : 'bot'); b.textContent = m.m;
        chat.appendChild(b); requestAnimationFrame(() => b.classList.add('in'));
        await wait(900);
      }
      await wait(4000);
    }
  };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { playChat(); o.disconnect(); } }, { threshold: .3 }).observe(chat);

  $('#tryChat').addEventListener('click', () => {
    const t = $('.chat-window-toggle');
    if (t) t.click(); else window.open('https://wa.me/201550069683', '_blank', 'noopener');
  });

  /* ---------- GSAP scroll animations ---------- */
  function intro() {
    if (!hasGsap || reduced) { $$('.reveal-up').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-title .word', { yPercent: 120, rotate: 4, duration: 1.1, stagger: .06 })
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: .9, stagger: .1 }, '-=.7')
      .from('.portrait', { opacity: 0, scale: .85, rotateY: -25, duration: 1.4 }, '-=1.2')
      .from('.portrait-card', { opacity: 0, scale: .6, duration: .8, stagger: .15, ease: 'back.out(2)' }, '-=.8');

    // hero parallax out
    gsap.to('.hero-copy', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.portrait', { yPercent: -10, rotateX: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // headings
    $$('.section-head, .showcase-copy, .founder-copy, .cta-inner').forEach(h => {
      gsap.from(h.children, { y: 40, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 82%' } });
    });

    // staggered 3D card entrances
    const cardsIn = (sel, trigger, extra = {}) => gsap.from(sel, {
      y: 80, opacity: 0, rotateX: -25, transformOrigin: '50% 100%', duration: 1.1, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger, start: 'top 80%' }, clearProps: 'transform', ...extra
    });
    cardsIn('.svc', '#servicesGrid');
    cardsIn('.client', '#clientsGrid', { stagger: { each: .04, from: 'random' } });
    cardsIn('.result', '.results-grid');
    cardsIn('.why', '.why-grid');
    cardsIn('.contact-card', '.contact-cards');
    gsap.from('.stat', { y: 40, opacity: 0, duration: .9, stagger: .1, scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

    // work items reveal individually with clip
    $$('.work-item').forEach(it => gsap.from(it, {
      clipPath: 'inset(100% 0 0 0)', y: 60, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: it, start: 'top 92%' }
    }));
    $$('.work-item img').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } }));

    // phone
    gsap.from('.phone', { rotateY: 35, rotateX: 10, y: 80, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.showcase', start: 'top 70%' } });
    gsap.from('.flow-node', { scale: 0, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(2)', scrollTrigger: { trigger: '.showcase', start: 'top 60%' } });

    // founder photo depth
    gsap.fromTo('.founder-photo img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.founder', scrub: true } });
    gsap.from('.founder-badge', { scale: 0, rotate: -20, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.founder-photo', start: 'top 70%' } });

    // process line
    const steps = $$('.step');
    gsap.to('#stepsFill', {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: .6,
        onUpdate: s => steps.forEach((st, i) => st.classList.toggle('on', s.progress >= i / (steps.length - 1) - .02))
      }
    });
    gsap.from('.step', { y: 50, opacity: 0, duration: .9, stagger: .15, scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
    if (matchMedia('(max-width:960px)').matches) steps.forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 75%', onEnter: () => s.classList.add('on') }));

    gsap.from('.faq-item', { y: 30, opacity: 0, duration: .8, stagger: .08, scrollTrigger: { trigger: '.faq-list', start: 'top 80%' } });
    ScrollTrigger.refresh();
  }
})();
