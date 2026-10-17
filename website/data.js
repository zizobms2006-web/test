/* Site content — edit here to add clients, work or services.
   Shared lists use [arabic, english] pairs; services/faq/demoChat have one block per language. */
window.SITE = {
  clients: [
    { n: "Velora Kiss", f: "velora", s: ["تجميل وعناية", "Beauty & care"] },
    { n: "The Guarobow", f: "guarobow", s: ["منتجات", "Products"] },
    { n: "GANGA", f: "ganga", s: ["أزياء", "Fashion"] },
    { n: "Gena Store", f: "gena", s: ["تجارة إلكترونية", "E-commerce"] },
    { n: "Smart Steps", f: "smartsteps", s: ["تعليم", "Education"] },
    { n: "L'Appetito", f: "lappetito", s: ["مطاعم", "Restaurants"] },
    { n: "Wataneya Group", f: "wataneya", s: ["مصانع", "Manufacturing"] },
    { n: "Edu Power", f: "edupower", s: ["تعليم", "Education"] },
    { n: "El-Nada Real Estate", f: "elnada", s: ["عقارات", "Real estate"] },
    { n: ["شركة الرحمن", "El Rahman"], f: "elrahman", s: ["مقاولات", "Construction"] },
    { n: "Enwan Construction", f: "enwan", s: ["مقاولات", "Construction"] },
    { n: "All In One", f: "allinone", s: ["أثاث", "Furniture"] },
    { n: "Awany", f: "awany", s: ["منتجات منزلية", "Home goods"] },
    { n: "Horus Handmade", f: "horus", s: ["هاند ميد", "Handmade"] },
    { n: "Mubarmij", f: "mubarmij", s: ["تكنولوجيا", "Technology"] },
    { n: "Afiedah Tours", f: "afiedah", s: ["سياحة", "Tourism"] },
    { n: "Yum Yum", f: "yumyum", s: ["مطاعم", "Restaurants"] },
    { n: "Lami Brand", f: "lami", s: ["أزياء", "Fashion"] },
    { n: "D Store", f: "dstore", s: ["أزياء", "Fashion"] },
    { n: "RA' Designs", f: "raa", s: ["تصميم", "Design"] }
  ],

  projects: [
    {
      name: "Velora Kiss", logo: "velora", imgs: ["velora3", "velora4", "velora1", "velora2"],
      sector: ["تجميل وعناية", "Beauty & care"],
      title: ["إطلاق خط زيوت المساج بهوية فاخرة", "Launching a massage-oil line with a luxury identity"],
      desc: ["تصوير منتجات وتصميمات حملات لكل نكهة، مع AI Agent بيرد على عملاء واتساب وداشبورد لمتابعة المحادثات.", "Product photography and campaign designs for every flavour, plus a WhatsApp AI Agent and a dashboard to follow every conversation."],
      tags: [["تصوير منتجات", "تصميمات حملات", "AI Agent واتساب", "داشبورد"], ["Product shoot", "Campaign design", "WhatsApp AI Agent", "Dashboard"]]
    },
    {
      name: "The Guarobow", logo: "guarobow", imgs: ["guarobow2", "guarobow1", "guarobow4", "guarobow5", "guarobow3"],
      sector: ["منتجات", "Products"],
      title: ["\u0022الأمان إحساس\u0022 — قصة براند بصرية", "“Safety is a feeling” — a visual brand story"],
      desc: ["محتوى lifestyle بيحكي استخدام المنتج في الحياة اليومية، ومنظومة رد آلي على فيسبوك وإنستجرام وواتساب مع داشبورد للموديريتور.", "Lifestyle content showing the product in everyday life, plus auto-replies on Facebook, Instagram and WhatsApp with a moderator dashboard."],
      tags: [["محتوى Lifestyle", "تصميمات", "AI Agent", "داشبورد"], ["Lifestyle content", "Design", "AI Agent", "Dashboard"]]
    },
    {
      name: "L'Appetito", logo: "lappetito", imgs: ["lappetito2", "lappetito1", "lappetito3"],
      sector: ["مطاعم وكاترينج", "Food & catering"],
      title: ["أكل بيتشاف قبل ما يتاكل", "Food you can taste through the screen"],
      desc: ["تصوير أطباق الكاترينج وركن الحلويات بإضاءة بتفتح النفس، ومحتوى سوشيال وريلز للمنيو.", "Appetising photography of catering dishes and the dessert corner, plus social content and reels for the menu."],
      tags: [["تصوير أكل", "محتوى سوشيال", "ريلز"], ["Food photography", "Social content", "Reels"]]
    },
    {
      name: "Wear Me", logo: "", imgs: ["wearme1", "wearme2"],
      sector: ["أزياء", "Fashion"],
      title: ["مرونة من كل اتجاه", "Stretch in every direction"],
      desc: ["تصميمات منتجات بألوان هادية وكوبي بيركّز على الراحة، لسلسلة بوستات وإعلانات.", "Product designs in calm colours with comfort-led copy, for a run of posts and ads."],
      tags: [["تصميمات", "كوبي رايتنج", "إعلانات"], ["Design", "Copywriting", "Ads"]]
    },
    {
      name: "Smart Steps", logo: "smartsteps", imgs: ["smartsteps"],
      sector: ["تعليم", "Education"],
      title: ["ثقة أولياء الأمور أقوى إعلان", "Parents’ trust is the strongest ad"],
      desc: ["تصميمات آراء أولياء الأمور، ومساعد AI على واتساب بيرد على الاستفسارات ويسجّل الطلبات.", "Parent-testimonial designs, plus a WhatsApp AI assistant that answers enquiries and records requests."],
      tags: [["تصميمات", "AI Agent واتساب", "داشبورد"], ["Design", "WhatsApp AI Agent", "Dashboard"]]
    }
  ],

  ar: {
    services: [
      { icon: "fa-pen-nib", t: "المحتوى وإدارة السوشيال ميديا", d: "خطة محتوى شهرية، كتابة بيعية لكل بوست، أفكار وكابشنز مدعومة بأدوات AI، جدولة ونشر وتفاعل مع جمهورك.", tags: ["فيسبوك", "إنستجرام", "تيك توك"] },
      { icon: "fa-palette", t: "التصميمات والهوية البصرية", d: "تصميمات سوشيال ميديا بستايل متناسق مع البراند، لوجوهات وهويات بصرية، وتصوير منتجات بجودة إعلانية.", tags: ["سوشيال", "براندنج", "منتجات"] },
      { icon: "fa-clapperboard", t: "الفيديو والريلز", d: "ريلز تريندي، فيديوهات إعلانية، تصوير ومونتاج وموشن جرافيك — حتى لو بعتلنا صور بس بنحولها لفيديو بيبيع.", tags: ["ريلز", "مونتاج", "موشن"] },
      { icon: "fa-bullhorn", t: "الإعلانات الممولة", d: "حملات على فيسبوك وإنستجرام وتيك توك وجوجل هدفها مبيعات ورسايل حقيقية. بنمول بالمبلغ المناسب ليك، والأتعاب 10% بس من المصروف الفعلي.", tags: ["Meta Ads", "TikTok", "Google"] },
      { icon: "fa-globe", t: "المواقع والمتاجر الإلكترونية", d: "مواقع ولاندنج بيدج ومتاجر سريعة، متصممة علشان تحوّل الزائر لعميل ومربوطة بالإعلانات والبيكسل.", tags: ["ويب سايت", "متجر", "لاندنج"] },
      { icon: "fa-database", t: "أنظمة CRM", d: "نظام واحد يجمع كل عملائك ومحادثاتك ومبيعاتك، متظبط على حجم شغلك، علشان مفيش عميل يضيع منك.", tags: ["Leads", "Pipeline", "تقارير"] },
      { icon: "fa-robot", t: "الأتمتة و AI Agents", d: "رد آلي ذكي على واتساب وماسنجر وإنستجرام 24 ساعة بلهجة البراند، بيفهم الفويس والصور ويسجّل العملاء المهتمين.", tags: ["واتساب", "n8n", "AI"] },
      { icon: "fa-chess-knight", t: "الخطة والاستراتيجية التسويقية", d: "تحليل للسوق والمنافسين والجمهور، الرسائل التسويقية، القنوات المناسبة وتوزيع الميزانية — خريطة طريق مكتوبة.", tags: ["تحليل", "خطة", "ميزانية"] }
    ],
    faq: [
      { q: "إزاي بتختلفوا عن باقي شركات التسويق؟", a: "إحنا مش بنبيع بوستات أو لايكات، بنبني منظومة تسويق كاملة متربطة بالمبيعات والأرباح: محتوى + إعلانات + موقع + CRM + أتمتة، وكل قرار مبني على بيانات فعلية." },
      { q: "إمتى هبدأ أشوف نتائج؟", a: "بيختلف حسب القطاع والقناة، بس عادةً أول مؤشرات ملموسة بتظهر خلال 4–8 أسابيع من التنفيذ الفعلي." },
      { q: "هل ميزانية الإعلانات منفصلة عن أتعاب الوكالة؟", a: "أيوه وبشفافية كاملة. الميزانية كلها بتتصرف على الإعلانات، وأتعاب الإدارة 10% بس من المبلغ اللي اتصرف فعليًا، وممكن نبدأ بمبالغ صغيرة نجرب بيها مع بعض." },
      { q: "ينفع أطلب خدمة واحدة بس؟", a: "أكيد. ممكن نعمل لك فيديو واحد أو تصميم أو موقع أو أتمتة لوحدها، ومش لازم تاخد باقة كاملة." },
      { q: "إنتو في مصر، هتديروا شغلي في الخليج أو ليبيا إزاي؟", a: "بنستقبل منك الصور والمواد، وإحنا بنبني المحتوى والفيديوهات والإعلانات كلها أونلاين. شغالين مع عملاء في مصر وليبيا والسعودية والخليج." },
      { q: "الـ AI Agent بيرد إزاي على العملاء؟", a: "بيتدرب على خدماتك وأسعارك وأسلوب البراند، وبيرد على واتساب وماسنجر وإنستجرام 24 ساعة، بيفهم الفويس والصور، وبيسجل العملاء المهتمين ويبعت تنبيه لفريقك. تقدر تجربه دلوقتي من الشات في الموقع." }
    ],
    demoChat: [
      { me: false, m: "أهلاً بيك! عامل إيه؟ 😊" },
      { me: true, m: "عايز أعمل إعلانات لمحل أدوات منزلية" },
      { me: false, m: "متاح يا فندم خدمة الإعلانات الممولة على فيسبوك وإنستجرام. تقريبًا ميزانية حضرتك الشهرية للتسويق في حدود كام؟" },
      { me: true, m: "حوالي 6000 جنيه" },
      { me: false, m: "تمام. ممكن الاسم ورقم التليفون وأنسب معاد يتواصل فيه الفريق مع حضرتك؟" },
      { me: true, m: "أحمد — نفس الرقم — بعد 6 المغرب" },
      { me: false, m: "✅ اتسجلت بيانات حضرتك، والفريق هيتواصل معاك بعد 6 المغرب." }
    ]
  },

  en: {
    services: [
      { icon: "fa-pen-nib", t: "Content & Social Media Management", d: "A monthly content plan, sales-driven copy for every post, AI-assisted ideas and captions, plus scheduling, publishing and community engagement.", tags: ["Facebook", "Instagram", "TikTok"] },
      { icon: "fa-palette", t: "Design & Visual Identity", d: "On-brand social media designs, logos and visual identities, and ad-quality product photography.", tags: ["Social", "Branding", "Products"] },
      { icon: "fa-clapperboard", t: "Video & Reels", d: "Trending reels, ad videos, filming, editing and motion graphics — even if you only send us photos, we turn them into videos that sell.", tags: ["Reels", "Editing", "Motion"] },
      { icon: "fa-bullhorn", t: "Paid Advertising", d: "Campaigns on Facebook, Instagram, TikTok and Google built for real sales and messages. You set the budget; our fee is just 10% of actual spend.", tags: ["Meta Ads", "TikTok", "Google"] },
      { icon: "fa-globe", t: "Websites & E-commerce", d: "Fast websites, landing pages and online stores designed to turn visitors into customers, connected to your ads and pixel.", tags: ["Website", "Store", "Landing"] },
      { icon: "fa-database", t: "CRM Systems", d: "One system for all your customers, conversations and sales, set up for the size of your business so no lead slips away.", tags: ["Leads", "Pipeline", "Reports"] },
      { icon: "fa-robot", t: "Automation & AI Agents", d: "Smart 24/7 auto-replies on WhatsApp, Messenger and Instagram in your brand’s voice — understands voice notes and images and captures qualified leads.", tags: ["WhatsApp", "n8n", "AI"] },
      { icon: "fa-chess-knight", t: "Marketing Strategy & Plan", d: "Market, competitor and audience analysis, key messages, the right channels and budget allocation — a written roadmap.", tags: ["Analysis", "Plan", "Budget"] }
    ],
    faq: [
      { q: "How are you different from other marketing agencies?", a: "We don’t sell posts or likes. We build a complete marketing system tied to sales and profit — content + ads + website + CRM + automation — with every decision backed by real data." },
      { q: "When will I start seeing results?", a: "It depends on the industry and channel, but the first tangible signals usually appear within 4–8 weeks of active execution." },
      { q: "Is the ad budget separate from the agency fee?", a: "Yes, fully transparent. Your whole budget goes to the ads, and our management fee is only 10% of what’s actually spent. We can start small and test together." },
      { q: "Can I order just one service?", a: "Of course. We can produce a single video, a design, a website or an automation on its own — no full package required." },
      { q: "You’re in Egypt — how do you manage clients in the Gulf or Libya?", a: "You send us your photos and materials, and we build all the content, videos and ads online. We work with clients in Egypt, Libya, Saudi Arabia and the Gulf." },
      { q: "How does the AI Agent talk to customers?", a: "It’s trained on your services, prices and brand voice, replies 24/7 on WhatsApp, Messenger and Instagram, understands voice notes and images, and logs qualified leads while alerting your team. Try it now from the chat on this site." }
    ],
    demoChat: [
      { me: false, m: "Hi there! 👋 How can we help?" },
      { me: true, m: "I want to run ads for my home-goods store" },
      { me: false, m: "Paid ads on Facebook and Instagram are available. Roughly what’s your monthly marketing budget?" },
      { me: true, m: "Around $300" },
      { me: false, m: "Great. Could I have your name, phone number and the best time for our team to call you?" },
      { me: true, m: "Ahmed — same number — after 6 pm" },
      { me: false, m: "✅ You’re all set. Our team will call you after 6 pm." }
    ]
  }
};
