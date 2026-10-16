/* English strings for the static page. Arabic is the default text in index.html. */
(() => {
  const EN = {
    'meta.title': 'El Mat7oon Agency | Full-Service Marketing — Growth Systems, Not Just Posts',
    'meta.desc': 'El Mat7oon is a full-service digital marketing agency led by Dr. Mohamed Hussein (26+ years). Content, design, video, paid ads, websites, CRM and AI automation across Egypt, Libya and the Gulf.',
    'brand': 'El Mat7oon',
    'nav.aria': 'Main menu',
    'nav.services': 'Services',
    'nav.clients': 'Clients',
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.process': 'Process',
    'nav.faq': 'FAQ',
    'nav.call': 'Call us',
    'nav.cta': 'WhatsApp us',
    'nav.menu': 'Open menu',

    'hero.kicker': 'Full-service marketing agency · Egypt · Libya · Gulf',
    'hero.title': '<span class="line"><span class="word">We</span> <span class="word">don’t</span> <span class="word">make</span> <span class="word">you</span> <span class="word">posts.</span></span><span class="line"><span class="word">We</span> <span class="word">build</span> <span class="word">you</span> <span class="word">a</span> <span class="word accent">growth system.</span></span>',
    'hero.sub': 'Content, design, video, paid ads, websites, CRM and AI automation — a complete team working on your growth, led by Dr. Mohamed Hussein with 26+ years of experience.',
    'hero.cta1': 'Start your project',
    'hero.cta2': 'Explore our services',
    'hero.trust': '<b>20+</b> brands trust us across 20+ industries',
    'hero.card1': 'Avg. client growth',
    'hero.card2': 'AI Agent answering your customers',
    'hero.scroll': 'Scroll down',

    'founder.alt': 'Dr. Mohamed Hussein — founder of El Mat7oon',
    'founder.name': 'Dr. Mohamed Hussein',
    'founder.role': 'Founder · 26+ years in the field',
    'founder.badge': 'years in the market',
    'founder.kicker': 'The team behind El Mat7oon',
    'founder.title': 'Marketing here isn’t noise. It’s a system that works.',
    'founder.lead': 'Dr. Mohamed Hussein, with 26+ years of hands-on experience in Egypt and the Gulf, built El Mat7oon as a full-service agency — strategists, designers, copywriters, photographers, and CRM and automation specialists — so your business gets a complete team focused on growth, not random posts.',

    'stats.years': 'Years of experience',
    'stats.growth': 'Avg. client growth',
    'stats.projects': 'Projects delivered',
    'stats.sectors': 'Industries served',

    'services.kicker': 'Our services',
    'services.title': 'Everything your business needs to grow — under one roof',
    'services.lead': 'No need to juggle five vendors. One team, one plan, and every tool working together.',

    'auto.title': 'A salesperson who works 24/7… and never takes a day off',
    'auto.lead': 'We build you an AI Agent that answers your customers on Facebook, Instagram and WhatsApp in your brand’s voice, understands voice notes and images, captures qualified leads and sends them to your team’s CRM — with a dashboard to follow every conversation.',
    'auto.c1': 'Instant replies around the clock, in your brand’s voice',
    'auto.c2': 'Understands voice notes and images',
    'auto.c3': 'Qualified leads saved to your CRM automatically',
    'auto.c4': 'Instant sales-team alerts + monitoring dashboard',
    'auto.cta': 'Try the chat yourself',
    'auto.online': 'Online now',
    'auto.wa': 'WhatsApp',
    'auto.ms': 'Messenger',
    'auto.ig': 'Instagram',

    'clients.kicker': 'Our partners',
    'clients.title': 'Brands that chose to grow with us',
    'clients.lead': 'From fashion and beauty to restaurants, real estate, education and manufacturing — across Egypt and the Gulf.',

    'work.kicker': 'Our work',
    'work.title': 'Work that gets seen… and sells',
    'work.lead': 'A sample of the designs, photography and campaigns we’ve produced for our clients.',
    'work.all': 'All',
    'work.beauty': 'Beauty & care',
    'work.food': 'Food & restaurants',
    'work.fashion': 'Fashion',
    'work.product': 'Products',
    'work.edu': 'Education & services',

    'results.kicker': 'Real results',
    'results.title': 'Numbers that actually happened, not promises',
    'results.r1': 'Growth in reach and sales within months of launching the strategy.',
    'results.r2': 'Tripled monthly revenue after restructuring ads and content.',
    'results.r3': 'Sales grew fourfold thanks to a complete marketing system.',

    'why.t1': 'Business-first methodology',
    'why.d1': 'We think like an owner focused on your profit.',
    'why.t2': 'Data-driven decisions',
    'why.d2': 'Every ad and post is backed by customer-behaviour analysis.',
    'why.t3': 'Focused on results',
    'why.d3': 'Sales and conversions before likes and follows.',
    'why.t4': 'Long-term partnership',
    'why.d4': 'Not just a vendor — partners who grow with your success.',

    'process.kicker': 'How we work',
    'process.title': 'Just 4 steps between us and growth',
    'process.t1': 'Discover',
    'process.d1': 'We understand your business, market and competitors before anything else.',
    'process.t2': 'Plan',
    'process.d2': 'We build a clear strategy and execution plan around your goals.',
    'process.t3': 'Execute',
    'process.d3': 'The full team gets to work — content, ads, design and automation.',
    'process.t4': 'Grow',
    'process.d4': 'We measure, optimize and scale what actually works.',

    'faq.kicker': 'FAQ',
    'faq.title': 'Questions we hear a lot',
    'faq.lead': 'Can’t find your question? Send it on WhatsApp or ask the chat.',

    'cta.kicker': 'Let’s work together',
    'cta.title': 'Ready for a real partnership that grows your business?',
    'cta.lead': 'Talk to us today and we’ll come back with a clear plan — not generic advice.',
    'cta.wa': 'WhatsApp',
    'cta.call': 'Call us',
    'cta.email': 'Email',
    'cta.form': 'Or book a call via the form',

    'footer.rights': 'El Mat7oon Agency. All rights reserved.',
    'lb.close': 'Close',
    'lb.prev': 'Previous',
    'lb.next': 'Next'
  };

  const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
  window.LANG = lang;

  const btn = document.getElementById('langBtn');
  const other = lang === 'en' ? 'ar' : 'en';
  btn.textContent = other === 'en' ? 'EN' : 'ع';
  btn.href = '?lang=' + other + location.hash;
  btn.hreflang = other;
  btn.setAttribute('aria-label', other === 'en' ? 'English' : 'العربية');
  btn.addEventListener('click', () => { try { localStorage.setItem('lang', other); } catch (e) {} });

  if (lang !== 'en') return;
  const t = k => EN[k];
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]').content = t('meta.desc');
  document.querySelector('meta[property="og:title"]').content = t('meta.title');
  document.querySelector('meta[property="og:description"]').content = t('meta.desc');
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (v) el.textContent = v; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { const v = t(el.dataset.i18nHtml); if (v) el.innerHTML = v; });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { const v = t(el.dataset.i18nAria); if (v) el.setAttribute('aria-label', v); });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => { const v = t(el.dataset.i18nAlt); if (v) el.alt = v; });
  document.querySelectorAll('.brand img').forEach(el => { el.alt = t('brand'); });
})();
