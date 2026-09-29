// Charge content.json et construit tout le site (textes, offres, avis, FAQ, photos, meta SEO, alt).
(async () => {
  let c;
  try { c = await (await fetch('content.json')).json(); }
  catch (e) { console.error('content.json introuvable (utilisez un serveur ou l\'hébergeur, pas file://)', e); return; }
  const get = (o, p) => p.split('.').reduce((a, k) => (a ? a[k] : undefined), o);
  const el = (t, cls, txt) => { const n = document.createElement(t); if (cls) n.className = cls; if (txt != null) rich(n, txt); return n; };
  // *mot* => italique terracotta
  function rich(n, s) { n.textContent = ''; String(s).split('*').forEach((p, i) => { if (!p) return; if (i % 2) { const e = document.createElement('em'); e.textContent = p; n.append(e); } else n.append(p); }); }
  const mail = s => `mailto:${c.contact.email}?subject=${encodeURIComponent(s)}`;
  const ph = t => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800"><rect width="100%" height="100%" fill="#b96849"/><text x="50%" y="50%" fill="#f6efe6" font-size="26" text-anchor="middle" font-family="sans-serif">${t}</text></svg>`);
  const photo = (id, src, alt, label) => { const i = document.getElementById(id); i.alt = alt; i.onerror = () => { i.onerror = null; i.src = ph(label); }; i.src = src; };

  document.querySelectorAll('[data-k]').forEach(n => { const v = get(c, n.dataset.k); if (typeof v === 'string') rich(n, v); });
  document.querySelectorAll('[data-mail]').forEach(a => a.href = '#contact');

  // SEO
  document.title = c.seo.title;
  const setMeta = (sel, v) => { const m = document.querySelector(sel); if (m) m.setAttribute('content', v); };
  setMeta('meta[name=description]', c.seo.description); setMeta('meta[property="og:title"]', c.seo.title);
  setMeta('meta[property="og:description"]', c.seo.description); setMeta('meta[property="og:image"]', c.seo.ogImage);
  const can = document.querySelector('link[rel=canonical]'); if (can) can.href = c.seo.url;

  // Logo (affiché seulement si le fichier existe) et photos
  const lg = document.getElementById('logo'); lg.onload = () => { lg.hidden = false; }; lg.src = c.brand.logo;
  photo('heroimg', c.hero.image, c.hero.imageAlt, 'Votre photo ici');
  photo('aboutimg', c.about.image, c.about.imageAlt, 'Votre photo ici');

  // Navigation
  const nav = document.getElementById('nav');
  c.nav.forEach(i => { const li = el('li'); const a = el('a', '', i.label); a.href = i.href; li.append(a); nav.append(li); });
  const burger = document.querySelector('.burger');
  burger.onclick = () => burger.setAttribute('aria-expanded', nav.classList.toggle('open'));
  nav.onclick = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };

  // Bandeau défilant + tags
  const mq = document.getElementById('marquee');
  for (let k = 0; k < 2; k++) c.marquee.forEach(t => mq.append(el('span', '', t)));
  c.who.tags.forEach(t => document.getElementById('tags').append(el('li', '', t)));

  // Offres
  const box = document.getElementById('offers');
  const g = el('div', 'packs');
  c.offers.items.forEach(o => {
    const d = el('div', 'pack' + (o.recommended ? ' reco' : ''));
    if (o.recommended) d.append(el('span', 'badge', c.offers.recommendedLabel));
    d.append(el('h4', '', o.name), el('p', '', o.description));
    const ul = el('ul', 'features'); o.features.forEach(f => ul.append(el('li', '', f))); d.append(ul);
    const a = el('a', 'btn', o.cta); a.href = mail(`Demande d'information - ${o.name}`); d.append(a);
    g.append(d);
  });
  box.append(g);

  // Méthode
  const st = document.getElementById('steps');
  c.method.steps.forEach(x => { const li = el('li'); li.append(el('h3', '', x.t), el('p', '', x.d)); st.append(li); });

  // Portfolio moderne
  const cases = document.getElementById('cases');
  c.portfolio.items.forEach(i => {
    const art = el('article', 'case-modern');
    const phone = el('div', 'phone'); phone.append(el('div', 'phone-notch'));
    const screen = el('div', 'phone-screen');
    const head = el('div', 'ig-header');
    head.append(el('span', 'ig-avatar', i.brand.charAt(0)), el('span', 'ig-name', i.brand));
    const img = el('img', 'ig-photo'); img.alt = i.alt; img.loading = 'lazy';
    img.onerror = () => { img.onerror = null; img.src = ph('Ajoutez une photo ou capture ici'); };
    img.src = i.image;
    const actions = el('div', 'ig-actions', '♡  💬  ↗');
    const caption = el('div', 'ig-caption'); const b = document.createElement('b'); b.textContent = i.brand + ' '; caption.append(b, i.tag);
    screen.append(head, img, actions, caption); phone.append(screen); art.append(phone);
    
    const body = el('div', 'case-body');
    body.append(el('span', 'tag-badge', i.tag), el('h3', 'case-title', i.brand), el('p', 'case-desc', i.objective));
    const stats = el('ul', 'case-stats');
    i.stats.forEach(s => { const li = el('li'); li.append(el('strong', '', s.value), el('span', '', s.label)); stats.append(li); });
    body.append(stats); art.append(body); cases.append(art);
  });

  // Avis
  const rv = document.getElementById('reviews');
  c.reviews.items.forEach(r => {
    const f = el('figure', 'review'); if (r.example) f.append(el('span', 'tag', c.reviews.exampleLabel));
    const q = el('blockquote'); q.append(el('p', '', '« ' + r.quote + ' »'));
    f.append(q, el('figcaption', '', r.name + ' · ' + r.role)); rv.append(f);
  });

  // Logos Partenaires
  const partnersGrid = document.getElementById('partners');
  if (c.reviews.partners) {
    c.reviews.partners.forEach(p => {
      const item = el('div', 'partner-item');
      const img = document.createElement('img');
      img.alt = p.name;
      img.loading = 'lazy';
      img.onerror = () => {
        item.textContent = p.name;
      };
      img.src = p.logo;
      item.append(img);
      partnersGrid.append(item);
    });
  }

  // À propos
  const ab = document.getElementById('about');
  c.about.paragraphs.forEach(p => ab.append(el('p', '', p)));
  ab.append(el('p', '', c.about.location));

  // FAQ
  const fl = document.getElementById('faqlist');
  c.faq.items.forEach(x => { const d = el('details'); d.append(el('summary', '', x.q), el('p', '', x.a)); fl.append(d); });

  // Réseaux sociaux cliquables avec icônes SVG
  const svgIcons = {
    instagram: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    linkedin: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
  };

  const so = document.getElementById('socials');
  c.contact.socials.forEach(s => { 
    const li = el('li'); 
    const a = el('a', 'social-link'); 
    a.href = s.url; 
    a.target = '_blank'; 
    a.rel = 'noopener';
    a.ariaLabel = s.label;
    if (svgIcons[s.icon]) {
      a.innerHTML = svgIcons[s.icon] + `<span>${s.label}</span>`;
    } else {
      a.textContent = s.label;
    }
    li.append(a); 
    so.append(li); 
  });
})();
