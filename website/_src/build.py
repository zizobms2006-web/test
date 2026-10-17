#!/usr/bin/env python3
"""Build the static pages: python3 _src/build.py  (run from the website folder or anywhere).

layout.html + pages/<name>.html -> ../<name>.html
  {{> partial}}        includes partials/partial.html
  {{pagehero <page>}}  the internal-page header defined in HEROES below
English text for every data-i18n key lives in i18n.js.
"""
import pathlib, re

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent

PAGES = {
    'index':    dict(title='المسوق المطحون | وكالة تسويق متكاملة — نبني أنظمة نمو، مش بوستات',
                     title_en='El Mat7oon Agency | Full-Service Marketing — Growth Systems, Not Just Posts',
                     desc='المسوق المطحون — وكالة تسويق رقمي متكاملة بقيادة د. محمد حسين بخبرة 26+ سنة: محتوى، تصميمات، فيديو، إعلانات ممولة، مواقع، CRM وأتمتة بالذكاء الاصطناعي.',
                     desc_en='Full-service digital marketing agency led by Dr. Mohamed Hussein (26+ years): content, design, video, paid ads, websites, CRM and AI automation.'),
    'about':    dict(title='مين إحنا | المسوق المطحون', title_en='About us | El Mat7oon Agency',
                     desc='تعرّف على المسوق المطحون ود. محمد حسين، وطريقة شغلنا اللي بتركز على النتايج.',
                     desc_en='Meet El Mat7oon Agency and Dr. Mohamed Hussein, and how we work for results.'),
    'services': dict(title='خدماتنا | المسوق المطحون', title_en='Services | El Mat7oon Agency',
                     desc='محتوى، تصميمات، فيديو، إعلانات ممولة، مواقع ومتاجر، أنظمة CRM وأتمتة بالذكاء الاصطناعي.',
                     desc_en='Content, design, video, paid ads, websites and stores, CRM systems and AI automation.'),
    'projects': dict(title='مشاريعنا | المسوق المطحون', title_en='Projects | El Mat7oon Agency',
                     desc='مشاريع حقيقية نفذناها لعملائنا في التجميل والمطاعم والأزياء والتعليم والمنتجات.',
                     desc_en='Real projects we delivered for clients in beauty, food, fashion, education and products.'),
    'project':  dict(title='مشروع | المسوق المطحون', title_en='Project | El Mat7oon Agency',
                     desc='تفاصيل مشروع من شغل المسوق المطحون.', desc_en='A project by El Mat7oon Agency.'),
    'clients':  dict(title='عملاؤنا | المسوق المطحون', title_en='Clients | El Mat7oon Agency',
                     desc='براندات اختارت تكبر مع المسوق المطحون، ونتايج حقيقية حققناها معاهم.',
                     desc_en='Brands that chose to grow with El Mat7oon Agency, and the results we achieved together.'),
    'contact':  dict(title='تواصل معنا | المسوق المطحون', title_en='Contact | El Mat7oon Agency',
                     desc='كلّم المسوق المطحون على واتساب أو تليفون أو إيميل، أو احجز مكالمة.',
                     desc_en='Reach El Mat7oon Agency on WhatsApp, phone or email, or book a call.'),
}

# internal page headers: (icon, kicker, title, lead) in Arabic; English via i18n keys ph.<page>.k/t/l
HEROES = {
    'about':    ('fa-users', 'مين إحنا', 'فريق كامل بيشتغل على نمو مشروعك', 'وكالة تسويق متكاملة بقيادة د. محمد حسين وخبرة أكتر من 26 سنة في مصر والخليج.'),
    'services': ('fa-layer-group', 'خدماتنا', 'كل اللي مشروعك محتاجه — تحت سقف واحد', 'مش هتحتاج تتعامل مع 5 جهات. فريق واحد، خطة واحدة، وكل الأدوات بتشتغل مع بعض.'),
    'projects': ('fa-briefcase', 'مشاريعنا', 'شغل بيتشاف… وبيبيع', 'مشاريع حقيقية نفذناها لعملائنا — من التصوير والتصميم لحد الـ AI Agent والداشبورد.'),
    'clients':  ('fa-handshake', 'عملاؤنا', 'براندات اختارت تكبر معانا', 'من الأزياء والتجميل للمطاعم والعقارات والتعليم والمصانع — في مصر والخليج.'),
    'contact':  ('fa-paper-plane', 'تواصل معنا', 'خلّينا نبدأ', 'ابعتلنا على واتساب أو كلّمنا، والفريق هيرجعلك بخطة واضحة مش كلام عام.'),
}
NAV_KEY = {'about': 'nav.about', 'services': 'nav.services', 'projects': 'nav.work', 'clients': 'nav.clients', 'contact': 'nav.contact'}

LOADER = '''<!-- Preloader (home only) -->
<div class="loader" id="loader" aria-hidden="true">
  <div class="loader-inner">
    <img src="assets/img/logo.webp" alt="" class="loader-logo">
    <div class="loader-bar"><span id="loaderBar"></span></div>
    <div class="loader-count"><span id="loaderCount">0</span>%</div>
  </div>
</div>
<script>
/* never leave the loader on screen if a script fails or a CDN is slow */
setTimeout(function () {
  if (window.__siteReady) return;
  var l = document.getElementById('loader');
  if (l) l.classList.add('done');
  document.body.classList.remove('loading');
  document.documentElement.classList.add('failsafe');
}, 6000);
</script>'''

THREE = '''<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" } }
</script>
<script type="module" src="three-scene.js?v=dev"></script>'''


def page_hero(page):
    icon, k, t, l = HEROES[page]
    return f'''<section class="page-hero">
  <div class="ph-bg" aria-hidden="true"><span class="ph-orb a"></span><span class="ph-orb b"></span><span class="ph-ring"></span><i class="ph-icon fa-solid {icon}"></i></div>
  <div class="container">
    <nav class="crumbs" aria-label="breadcrumb"><a href="index.html" data-i18n="nav.home">الرئيسية</a><i class="fa-solid fa-chevron-left flip"></i><span data-i18n="{NAV_KEY[page]}">{k}</span></nav>
    <h1 data-i18n="ph.{page}.t">{t}</h1>
    <p class="lead" data-i18n="ph.{page}.l">{l}</p>
  </div>
</section>'''


def build():
    layout = (SRC / 'layout.html').read_text(encoding='utf-8')
    for name, meta in PAGES.items():
        body = (SRC / 'pages' / f'{name}.html').read_text(encoding='utf-8')
        body = re.sub(r'\{\{> (\w+)\}\}', lambda m: (SRC / 'partials' / f'{m.group(1)}.html').read_text(encoding='utf-8').strip(), body)
        body = re.sub(r'\{\{pagehero (\w+)\}\}', lambda m: page_hero(m.group(1)), body)
        html = layout
        for key, val in {
            '{{TITLE}}': meta['title'], '{{TITLE_EN}}': meta['title_en'],
            '{{DESC}}': meta['desc'], '{{DESC_EN}}': meta['desc_en'],
            '{{PAGE}}': name,
            '{{LOADER}}': LOADER if name == 'index' else '',
            '{{EXTRA_SCRIPTS}}': THREE if name == 'index' else '',
            '{{BODY}}': body.strip(),
        }.items():
            html = html.replace(key, val)
        # mark the current page in the nav
        active = 'projects' if name == 'project' else name
        html = html.replace(f'data-nav="{active}"', f'data-nav="{active}" class="active" aria-current="page"')
        assert '{{' not in html, f'unfilled placeholder in {name}'
        (OUT / f'{name}.html').write_text(html, encoding='utf-8')
        print('built', f'{name}.html')


if __name__ == '__main__':
    build()
