(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // ---- CHANGE THIS to the client's real email ----
  const CONTACT_EMAIL = 'info@yourcuisinechef.com';

  // Preloader
  const pre = $('#preloader'), plFill = $('#plFill'), plBar = $('#plBar'), plNum = $('#plNum');
  let pageLoaded = document.readyState === 'complete', plStart = performance.now(), plShown = 0;
  window.addEventListener('load', () => pageLoaded = true);
  document.body.style.overflow = 'hidden';
  (function plTick(t) {
    // runs at least 2s; holds at 90% until the page has really loaded
    const target = Math.min((t - plStart) / 2000, 1) * (pageLoaded ? 100 : 90);
    plShown += (target - plShown) * .12 + .15;
    plShown = Math.min(plShown, target, 100);
    plFill.style.clipPath = `inset(0 ${100 - plShown}% 0 0)`;
    plBar.style.width = plShown + '%';
    plNum.textContent = Math.round(plShown);
    if (plShown >= 99.5 && pageLoaded) {
      plNum.textContent = 100; plFill.style.clipPath = 'inset(0)'; plBar.style.width = '100%';
      setTimeout(() => {
        pre.classList.add('done'); document.body.style.overflow = '';
        setTimeout(() => pre.classList.add('gone'), 1500);
      }, 350);
    } else requestAnimationFrame(plTick);
  })(performance.now());
  setTimeout(() => pageLoaded = true, 6000);

  // Header, progress bar, back-to-top, active link
  const header = $('#header'), prog = $('#progress'), toTop = $('#toTop');
  const sections = $$('section[id]'), links = $$('#menu a[href^="#"]:not(.btn)');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    prog.style.width = (y / h) * 100 + '%';
    toTop.classList.toggle('show', y > 600);
    let cur = sections[0].id;
    sections.forEach(s => { if (y >= s.offsetTop - 140) cur = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  const heroBg = $('#heroBg');
  addEventListener('scroll', () => { if (scrollY < innerHeight) heroBg.style.translate = `0 ${scrollY * .25}px`; }, { passive: true });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  // Mobile menu
  const burger = $('#burger'), menu = $('#menu');
  burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };
  $$('#menu a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

  // Scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  // Counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 2000;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(end * ease).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step); cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // Typing effect
  const words = ['School Cafeterias', 'Corporate Dining', 'Branded Coffee Shops', 'Event Catering'];
  const typed = $('#typed'); let wi = 0, ci = 0, del = false;
  (function type() {
    const w = words[wi];
    typed.textContent = w.slice(0, ci += del ? -1 : 1);
    let d = del ? 40 : 90;
    if (!del && ci === w.length) { del = true; d = 1400; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; d = 300; }
    setTimeout(type, d);
  })();

  // 3D tilt
  if (matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
      el.style.transition += ',transform .25s';
    });

    // Magnetic buttons
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });

    // Custom cursor
    const cur = $('#cursor');
    addEventListener('mousemove', e => { cur.style.opacity = 1; cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; });
    $$('a,button,.card,.dish,input,select,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }

  // Button ripple
  $$('.btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement('span');
    sp.className = 'rip'; sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 600);
  }));

  // Missing dish photo -> fall back to the emoji
  $$('.dish-img img').forEach(img => {
    const fail = () => { img.parentNode.classList.add('noimg'); img.remove(); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') fail();
  });

  // Pricing tabs
  $$('#priceTabs .tab').forEach(t => t.addEventListener('click', () => {
    $$('#priceTabs .tab').forEach(x => x.classList.remove('active')); t.classList.add('active');
    $$('.price-panel').forEach(p => p.classList.toggle('active', p.id === t.dataset.panel));
  }));

  // Plan buttons fill the contact form
  $$('.plan-btn').forEach(b => b.addEventListener('click', () => {
    const sel = $('#service');
    [...sel.options].forEach(o => { if (o.textContent === b.dataset.service) sel.value = o.value || o.textContent; });
    const m = $('#message');
    m.value = `I'm interested in the "${b.dataset.plan}" plan for ${b.dataset.service}. Please send me a quote.`;
  }));

  // Menu filter
  $$('.tab[data-filter]').forEach(t => t.addEventListener('click', () => {
    $$('.tab[data-filter]').forEach(x => x.classList.remove('active')); t.classList.add('active');
    const f = t.dataset.filter;
    $$('.dish').forEach(d => {
      d.classList.toggle('hide', f !== 'all' && d.dataset.cat !== f);
      d.style.animation = 'none'; d.offsetHeight; d.style.animation = '';
    });
  }));

  // Testimonial slider
  const slides = $$('.slide'), dots = $('.dots'); let si = 0, timer;
  slides.forEach((_, i) => { const d = document.createElement('i'); d.onclick = () => go(i, true); dots.appendChild(d); });
  const go = (i, user) => {
    si = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === si));
    $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === si));
    if (user) { clearInterval(timer); timer = setInterval(() => go(si + 1), 6000); }
  };
  $('.prev').onclick = () => go(si - 1, true);
  $('.next').onclick = () => go(si + 1, true);
  go(0); timer = setInterval(() => go(si + 1), 6000);

  // FAQ accordion
  $$('.qa').forEach(qa => $('.q', qa).addEventListener('click', () => {
    const open = qa.classList.contains('open');
    $$('.qa').forEach(o => { o.classList.remove('open'); $('.a', o).style.maxHeight = 0; });
    if (!open) { qa.classList.add('open'); const a = $('.a', qa); a.style.maxHeight = a.scrollHeight + 'px'; }
  }));

  // "Learn more" preselects the service
  $$('.more').forEach(a => a.addEventListener('click', () => {
    const sel = $('#service'), v = a.dataset.service.replace(/&/g, '&');
    [...sel.options].forEach(o => { if (o.textContent === v) sel.value = o.value || o.textContent; });
  }));

  // Contact form validation + send via email app
  const form = $('#form');
  const rules = {
    name: v => v.trim().length >= 2 || 'Please enter your name',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email address',
    phone: v => !v || /^[+\d][\d\s()\-]{6,}$/.test(v) || 'Enter a valid phone number',
    service: v => !!v || 'Please choose a service',
    message: v => v.trim().length >= 10 || 'Message should be at least 10 characters'
  };
  const check = id => {
    const el = $('#' + id), res = rules[id](el.value), f = el.closest('.field');
    f.classList.toggle('err', res !== true);
    $('small', f).textContent = res === true ? '' : res;
    return res === true;
  };
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => check(id)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!Object.keys(rules).map(check).every(Boolean)) return;
    const g = id => $('#' + id).value.trim();
    const body = `Name: ${g('name')}\nEmail: ${g('email')}\nPhone: ${g('phone') || '-'}\nService: ${g('service')}\n\n${g('message')}`;
    $('#ok').classList.add('show');
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Quote Request: ' + g('service'))}&body=${encodeURIComponent(body)}`;
    form.reset();
  });

  // Newsletter
  $('#news').addEventListener('submit', e => {
    e.preventDefault();
    $('#newsMsg').textContent = '🎉 Thanks for subscribing!';
    e.target.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
