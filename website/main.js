(() => {
  const S = window.SITE;
  const en = window.LANG === 'en';
  const L = v => Array.isArray(v) ? v[en ? 1 : 0] : v;
  const D = Object.assign({}, S, S[en ? 'en' : 'ar']);
  const P = D.projects;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!window.gsap;
  const arrow = '<i class="fa-solid fa-arrow-left flip"></i>';
  document.documentElement.classList.add('js');
  $('#year').textContent = new Date().getFullYear();

  /* ================= Content renderers (each runs only if its slot is on this page) ================= */
  const logoOf = p => p.logo ? `<img src="assets/clients/${p.logo}.webp" alt="">` : `<span class="proj-mono">${p.name.split(' ').map(w => w[0]).join('')}</span>`;
  const projectCard = p => `
    <a class="pcard tilt" data-tilt="6" data-c="${p.c}" href="project.html?id=${p.id}">
      <span class="pc-media">${p.imgs.slice(0, 3).map((f, k) => `<img class="pi pi-${k}" src="assets/work/${f}.webp" alt="" loading="lazy">`).join('')}</span>
      <span class="pc-body">
        <span class="proj-client">${logoOf(p)}<span><b>${p.name}</b><small>${L(p.sector)}</small></span></span>
        <b class="pc-title">${L(p.title)}</b>
        <span class="svc-tags">${L(p.tags).slice(0, 3).map(t => `<span>${t}</span>`).join('')}</span>
        <span class="pc-go">${en ? 'View project' : 'شوف المشروع'} ${arrow}</span>
      </span>
    </a>`;

  const slot = id => document.getElementById(id);
  // a client's own project page, when we have one
  const projOf = f => P.find(p => p.logo === f || p.id === f);

  if (slot('serviceTiles')) slot('serviceTiles').innerHTML = D.services.map((s, i) => `
    <a class="tile" href="services.html#svc-${i + 1}">
      <span class="tile-icon"><i class="fa-solid ${s.icon}"></i></span>
      <b>${s.t}</b>
      <span class="tile-go">${arrow}</span>
    </a>`).join('');

  if (slot('servicesGrid')) slot('servicesGrid').innerHTML = D.services.map((s, i) => `
    <article class="svc tilt" data-tilt="8" id="svc-${i + 1}">
      <span class="svc-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="svc-icon"><i class="fa-solid ${s.icon}"></i></div>
      <h3>${s.t}</h3>
      <p>${s.d}</p>
      <div class="svc-tags">${s.tags.map(t => `<span>${t}</span>`).join('')}</div>
      <div class="svc-links">
        <a href="contact.html">${en ? 'Request this service' : 'اطلب الخدمة'} ${arrow}</a>
        ${s.icon === 'fa-robot' || s.icon === 'fa-database'
          ? `<a href="#automation">${en ? 'See it in action' : 'شوفها شغالة'}</a>`
          : `<a href="projects.html">${en ? 'See our work' : 'شوف شغلنا'}</a>`}
      </div>
    </article>`).join('');

  if (slot('featuredProjects')) slot('featuredProjects').innerHTML = P.slice(0, 3).map(projectCard).join('');
  if (slot('projectsGrid')) slot('projectsGrid').innerHTML = P.map(projectCard).join('');

  if (slot('clientsGrid')) slot('clientsGrid').innerHTML = D.clients.map(c => { const pr = projOf(c.f); return `
    <figure class="client tilt" data-tilt="10" tabindex="0">
      <div class="client-card">
        <div class="client-face client-front"><img src="assets/clients/${c.f}.webp" alt="${L(c.n)}" loading="lazy" width="360" height="360"><span class="shine"></span></div>
        <div class="client-face client-back">
          <img src="assets/clients/${c.f}.webp" alt="" loading="lazy">
          <b>${L(c.n)}</b><small>${L(c.s)}</small>
          ${pr ? `<a class="client-go" href="project.html?id=${pr.id}">${en ? 'View project' : 'شوف المشروع'} ${arrow}</a>` : ''}
        </div>
      </div>
      <figcaption>${pr ? `<a href="project.html?id=${pr.id}"><b>${L(c.n)}</b></a>` : `<b>${L(c.n)}</b>`}<small>${L(c.s)}</small></figcaption>
    </figure>`; }).join('');

  if (slot('marqueeA')) {
    // each logo opens that client's project, or the clients page
    const onClients = document.body.dataset.page === 'clients';
    const logos = D.clients.map(c => {
      const pr = projOf(c.f), href = pr ? `project.html?id=${pr.id}` : onClients ? '' : 'clients.html';
      const img = `<img src="assets/clients/${c.f}.webp" alt="${L(c.n)}" loading="lazy">`;
      return href ? `<a class="m-logo" href="${href}" tabindex="-1">${img}</a>` : `<div class="m-logo">${img}</div>`;
    });
    const half = Math.ceil(logos.length / 2);
    const rowA = logos.slice(0, half).join(''), rowB = logos.slice(half).concat(logos.slice(0, 2)).join('');
    slot('marqueeA').innerHTML = rowA + rowA + rowA;
    slot('marqueeB').innerHTML = rowB + rowB + rowB;
  }

  if (slot('faqList')) slot('faqList').innerHTML = D.faq.map((f, i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}">
      <button class="faq-q" aria-expanded="${i === 0}">${f.q}<i class="fa-solid fa-plus"></i></button>
      <div class="faq-a"><div><p>${f.a}</p></div></div>
    </div>`).join('');

  // project detail page: project.html?id=<id>
  let detail = null;
  if (slot('pdTitle')) {
    const id = new URLSearchParams(location.search).get('id');
    detail = P.find(p => p.id === id) || P[0];
    const p = detail;
    slot('pdCrumb').textContent = p.name;
    slot('pdClient').innerHTML = `${logoOf(p)}<div><b>${p.name}</b><small>${L(p.sector)}</small></div>`;
    slot('pdTitle').textContent = L(p.title);
    slot('pdDesc').textContent = L(p.desc);
    slot('pdSector').innerHTML = `<a href="projects.html?c=${p.c}">${L(p.sector)}</a>`;
    slot('pdTags').innerHTML = L(p.tags).map(t => `<span>${t}</span>`).join('');
    slot('pdCover').innerHTML = `<span class="proj-stack">${p.imgs.slice(0, 3).map((f, k) => `<img class="pi pi-${k}" src="assets/work/${f}.webp" alt="">`).join('')}</span><span class="proj-zoom"><i class="fa-solid fa-expand"></i></span>`;
    slot('pdCover').dataset.gallery = '0';
    slot('pdGallery').innerHTML = p.imgs.map((f, k) => `
      <button class="g-item" data-gallery="${k}"><img src="assets/work/${f}.webp" alt="${p.name} ${k + 1}" loading="lazy"><span><i class="fa-solid fa-expand"></i></span></button>`).join('');
    slot('pdMore').innerHTML = P.filter(x => x !== p).slice(0, 3).map(projectCard).join('');
    document.title = `${p.name} — ${L(p.title)} | ${en ? 'El Mat7oon Agency' : 'المسوق المطحون'}`;
  }

  /* ================= Page-to-page transition ================= */
  const leave = href => {
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = href; }, reduced ? 0 : 420);
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page (#anchors)
    e.preventDefault();
    closeMenu();
    leave(url.href);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });

  /* ================= Smooth scroll ================= */
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
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));
  // arriving with a hash (e.g. services.html#svc-3): land on it below the fixed nav
  if (location.hash && $(location.hash)) setTimeout(() => {
    const el = $(location.hash);
    lenis ? lenis.scrollTo(el, { offset: -90, immediate: true }) : el.scrollIntoView();
    el.classList.add('target-flash');
  }, 450);

  /* ================= Nav ================= */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 30);  // turns brand-coloured and stays on screen
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

  /* ================= Pointer effects ================= */
  if (fine && !reduced) {
    const g = $('#cursorGlow');
    addEventListener('pointermove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }, { passive: true });

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

    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // logo cards: hover flips on desktop (CSS), tap flips on touch
  $$('.client').forEach(c => {
    c.addEventListener('click', () => { if (!fine) c.classList.toggle('flipped'); });
    c.addEventListener('keydown', e => { if (e.target !== c) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.classList.toggle('flipped'); } });
  });

  /* ================= Marquee ribbons ================= */
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

  /* ================= Dynamic numbers ================= */
  // Growth sparkline: a rising, slightly noisy path ending at the top-right.
  const sparkPath = (seed, w = 120, h = 34) => {
    let s = seed;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      pts.push([t * w, h - 4 - (t * t * .75 + t * .2) * (h - 8) + (i && i < n - 1 ? (rnd() - .5) * 9 : 0)]);
    }
    return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  };
  const sparkSvg = seed => {
    const d = sparkPath(seed);
    return `<svg class="spark" viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true">
      <path class="spark-fill" d="${d} L120,34 L0,34 Z"/><path class="spark-line" pathLength="1" d="${d}"/></svg>`;
  };

  // Odometer: every digit is a rolling column; replays each time it scrolls into view.
  $$('.odo').forEach((el, k) => {
    const digits = String(el.dataset.to).split('');
    el.innerHTML = digits.map(() => `<span class="odo-col"><span class="odo-strip">${'01234567890123456789'.split('').map(n => `<span>${n}</span>`).join('')}</span></span>`).join('')
      + `<span class="odo-suf">${el.dataset.suffix || ''}</span>`;
    el.setAttribute('aria-label', el.dataset.to + (el.dataset.suffix || ''));
    el.closest('.stat').insertAdjacentHTML('beforeend', sparkSvg(17 + k * 31));
  });
  const roll = (el, on) => {
    const digits = String(el.dataset.to).split('');
    $$('.odo-strip', el).forEach((strip, i) => {
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';
      if (!on) return;
      void strip.offsetWidth;
      strip.style.transition = `transform ${reduced ? 0 : 1.6 + i * .25}s cubic-bezier(.16,1,.3,1) ${i * .08}s`;
      strip.style.transform = `translateY(-${(10 + +digits[i]) * 5}%)`;
    });
  };
  const sObs = new IntersectionObserver(es => es.forEach(e => {
    roll($('.odo', e.target), e.isIntersecting);
    e.target.classList.toggle('in', e.isIntersecting);
  }), { threshold: .5 });
  $$('.stat').forEach(s => sObs.observe(s));

  // Results: count up + before/after bars + sparkline, replayed on every visit.
  $$('.result').forEach((r, k) => {
    $('.rchart', r).innerHTML = `
      <div class="rbars">
        <div class="rbar"><i style="--h:${r.dataset.before}%"></i><span>${en ? 'Before' : 'قبل'}</span></div>
        <div class="rbar after"><i style="--h:100%"></i><span>${en ? 'After' : 'بعد'}</span></div>
      </div>${sparkSvg(101 + k * 47)}`;
  });
  const countUp = (el, on) => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    cancelAnimationFrame(el._raf);
    if (!on) { el.textContent = pre + (end < 10 ? 1 : 0) + suf; return; }
    if (reduced) { el.textContent = pre + end + suf; return; }
    const from = end < 10 ? 1 : 0, t0 = performance.now(), dur = 1800;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4), v = from + (end - from) * e;
      el.textContent = pre + (end < 10 && p < 1 ? v.toFixed(1) : Math.round(v)) + suf;
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  };
  const rObs = new IntersectionObserver(es => es.forEach(e => {
    countUp($('.rnum', e.target), e.isIntersecting);
    e.target.classList.toggle('in', e.isIntersecting);
  }), { threshold: .45 });
  $$('.result').forEach(r => rObs.observe(r));

  /* ================= FAQ ================= */
  $$('.faq-item').forEach(item => $('.faq-q', item).addEventListener('click', () => {
    const open = !item.classList.contains('open');
    $$('.faq-item').forEach(o => { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
    item.classList.toggle('open', open);
    $('.faq-q', item).setAttribute('aria-expanded', open);
  }));

  /* ================= Project filters ================= */
  $$('#filters .chip').forEach(ch => ch.addEventListener('click', () => {
    $$('#filters .chip').forEach(c => c.classList.toggle('active', c === ch));
    const f = ch.dataset.f, cards = $$('#projectsGrid .pcard');
    cards.forEach(c => c.classList.toggle('hidden', f !== 'all' && c.dataset.c !== f));
    if (hasGsap && !reduced) gsap.fromTo(cards.filter(c => !c.classList.contains('hidden')), { opacity: 0, y: 30, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .6, stagger: .06, ease: 'power3.out' });
  }));
  // projects.html?c=beauty opens with that filter on (linked from a project's sector)
  const wantC = new URLSearchParams(location.search).get('c');
  if (wantC && $(`#filters .chip[data-f="${CSS.escape(wantC)}"]`)) {
    const ch = $(`#filters .chip[data-f="${CSS.escape(wantC)}"]`);
    $$('#filters .chip').forEach(c => c.classList.toggle('active', c === ch));
    $$('#projectsGrid .pcard').forEach(c => c.classList.toggle('hidden', c.dataset.c !== wantC));
  }

  /* ================= Lightbox (project gallery) ================= */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let gal = [], cur = 0;
  const show = i => {
    cur = (i + gal.length) % gal.length;
    lbImg.src = gal[cur].src; lbImg.alt = gal[cur].cap;
    lbCap.textContent = gal[cur].cap + (gal.length > 1 ? `  ·  ${cur + 1} / ${gal.length}` : '');
    if (hasGsap && !reduced) gsap.fromTo(lbImg, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .45, ease: 'power3.out' });
  };
  if (detail) $$('[data-gallery]').forEach(b => b.addEventListener('click', () => {
    gal = detail.imgs.map(f => ({ src: `assets/work/${f}.webp`, cap: `${detail.name} — ${L(detail.title)}` }));
    lb.querySelectorAll('.lb-nav').forEach(n => n.hidden = gal.length < 2);
    show(+b.dataset.gallery); lb.classList.add('open'); lenis && lenis.stop();
  }));
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

  /* ================= Chat: demo phone + "open chat" buttons ================= */
  const chat = slot('demoChat');
  if (chat) {
    let playing = false;
    const play = async () => {
      if (playing) return; playing = true;
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
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { play(); o.disconnect(); } }, { threshold: .3 }).observe(chat);
  }
  $$('[data-try-chat]').forEach(b => b.addEventListener('click', () => {
    const t = $('.chat-window-toggle');
    if (t) t.click(); else window.open('https://wa.me/201550069683', '_blank', 'noopener');
  }));

  /* ================= Start: loader on the home page, straight in elsewhere ================= */
  const start = () => {
    window.__siteReady = true;
    const l = slot('loader');
    if (l) l.classList.add('done');
    document.body.classList.remove('loading');
    try { intro(); } catch (e) { console.warn('animations disabled:', e); document.documentElement.classList.add('failsafe'); }
  };
  if (slot('loader')) {
    document.body.classList.add('loading');
    const imgs = $$('img').filter(i => i.loading !== 'lazy');
    let loaded = 0;
    const bar = slot('loaderBar'), count = slot('loaderCount');
    const tick = () => {
      loaded++;
      const p = Math.min(100, Math.round(loaded / imgs.length * 100));
      bar.style.width = p + '%'; count.textContent = p;
    };
    const ready = Promise.all(imgs.map(i => i.complete ? (tick(), 1) : new Promise(r => { i.onload = i.onerror = () => { tick(); r(); }; })));
    Promise.race([ready, new Promise(r => setTimeout(r, 3500))]).then(() => {
      bar.style.width = '100%'; count.textContent = 100;
      setTimeout(start, 250);
    });
  } else start();

  /* ================= GSAP scroll animations ================= */
  function intro() {
    if (!hasGsap || reduced) { $$('.reveal-up').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
    gsap.registerPlugin(ScrollTrigger);
    const has = sel => $$(sel).length > 0;

    // home hero
    if (has('.hero')) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero-title .word', { yPercent: 120, rotate: 4, duration: 1.1, stagger: .06 })
        .to('.hero .reveal-up', { opacity: 1, y: 0, duration: .9, stagger: .1 }, '-=.7')
        .from('.portrait', { opacity: 0, scale: .85, rotateY: -25, duration: 1.4 }, '-=1.2')
        .from('.portrait-card', { opacity: 0, scale: .6, duration: .8, stagger: .15, ease: 'back.out(2)' }, '-=.8')
        .from('.orbit', { scale: .4, opacity: 0, duration: 1.4, stagger: .15, ease: 'expo.out' }, '-=1.1')
        .from('.spin-badge', { scale: 0, rotate: -180, duration: 1, ease: 'back.out(1.8)' }, '-=1')
        .call(rotateHeadline);
      gsap.matchMedia().add('(min-width: 961px)', () => {
        gsap.to('.hero-copy', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.portrait', { yPercent: -10, rotateX: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      });
    }

    // internal page header
    if (has('.page-hero')) {
      gsap.from('.page-hero .container > :not(.pd-cover)', { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', delay: .1 });
      gsap.from('.ph-bg > *', { scale: .6, opacity: 0, duration: 1.4, stagger: .1, ease: 'expo.out' });
    }

    // section headings
    $$('.section-head, .showcase-copy, .founder-copy, .cta-inner, .at-copy').forEach(h => {
      gsap.from(h.children, { y: 40, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
    });

    // staggered 3D card entrances
    const cardsIn = (sel, trigger, extra = {}) => has(sel) && gsap.from(sel, {
      y: 80, opacity: 0, rotateX: -25, transformOrigin: '50% 100%', duration: 1.1, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger, start: 'top 85%' }, clearProps: 'transform', ...extra
    });
    cardsIn('.svc', '#servicesGrid');
    cardsIn('.tile', '#serviceTiles', { stagger: .05 });
    cardsIn('#featuredProjects .pcard', '#featuredProjects');
    cardsIn('#projectsGrid .pcard', '#projectsGrid');
    cardsIn('#pdMore .pcard', '#pdMore');
    cardsIn('.g-item', '#pdGallery', { stagger: .06 });
    cardsIn('.result', '.results-grid');
    cardsIn('.why', '.why-grid');
    cardsIn('.contact-card', '.contact-cards');
    cardsIn('.ce-card', '.contact-extra');
    if (has('.stat')) gsap.from('.stat', { y: 40, opacity: 0, rotateX: -40, transformOrigin: '50% 100%', duration: .9, stagger: .1, scrollTrigger: { trigger: '.stats', start: 'top 88%' } });

    // logo cards are dealt face-down, then flip over one by one
    if (has('.client-card')) gsap.fromTo('.client-card', { rotateY: en ? -180 : 180, y: 60, opacity: 0 }, {
      rotateY: 0, y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: { each: .05, from: 'random' },
      scrollTrigger: { trigger: '#clientsGrid', start: 'top 85%' }, clearProps: 'transform,opacity'
    });
    // crossed logo ribbons tilt a little more as you scroll past them
    if (has('.marquee-sec')) {
      gsap.fromTo('.marquee-sec .marquee:first-child', { rotate: -1 }, { rotate: -4, ease: 'none', scrollTrigger: { trigger: '.marquee-sec', scrub: true } });
      gsap.fromTo('.marquee-sec .marquee:last-child', { rotate: 1 }, { rotate: 3.5, ease: 'none', scrollTrigger: { trigger: '.marquee-sec', scrub: true } });
    }

    // project detail cover
    if (has('.pd-cover')) gsap.from('.pd-cover', { rotateY: en ? -25 : 25, x: en ? 80 : -80, opacity: 0, duration: 1.4, ease: 'power3.out', delay: .2 });

    // services: phone mock
    if (has('.phone')) {
      gsap.from('.phone', { rotateY: 35, rotateX: 10, y: 80, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.showcase', start: 'top 70%' } });
      gsap.from('.flow-node', { scale: 0, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(2)', scrollTrigger: { trigger: '.showcase', start: 'top 60%' } });
    }

    // founder photos
    $$('.founder-photo img, .at-photo img').forEach(img => gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } }));
    $$('.founder-badge').forEach(b => gsap.from(b, { scale: 0, rotate: -20, duration: 1, ease: 'back.out(2)', scrollTrigger: { trigger: b.parentElement, start: 'top 75%' } }));

    // about: process line
    const steps = $$('.step');
    if (steps.length) {
      gsap.to('#stepsFill', {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: .6,
          onUpdate: s => steps.forEach((st, i) => st.classList.toggle('on', s.progress >= i / (steps.length - 1) - .02))
        }
      });
      gsap.from('.step', { y: 50, opacity: 0, duration: .9, stagger: .15, scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
      if (matchMedia('(max-width:960px)').matches) steps.forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 75%', onEnter: () => s.classList.add('on') }));
    }

    if (has('.faq-item')) gsap.from('.faq-item', { y: 30, opacity: 0, duration: .8, stagger: .08, scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });
    ScrollTrigger.refresh();
  }

  // home hero: the last word of the headline cycles through what we build
  function rotateHeadline() {
    const el = $('.hero-title .accent');
    if (!el) return;
    const words = en ? ['growth system.', 'sales engine.', 'brand that wins.'] : ['منظومة نمو.', 'ماكينة مبيعات.', 'براند بيكسب.'];
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % words.length;
      gsap.to(el, {
        yPercent: -110, opacity: 0, duration: .45, ease: 'power2.in',
        onComplete: () => { el.textContent = words[i]; gsap.fromTo(el, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, ease: 'power3.out' }); }
      });
    }, 3200);
  }
})();
