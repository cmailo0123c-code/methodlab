/* METHOD LAB — demo interactiva (vanilla, sin dependencias, sin conexiones comerciales) */
(() => {
  'use strict';
  const d = document;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------------------------------------------------
     PLANES — datos LOCALES verificados en methodlab.cl (9-oct-2026,
     /products/<handle>.json). Sin conexión a Shopify.
     Orden de precios: días 1→4 × (Mensual, Trimestral, Semestral, Anual) × (Con, Sin)
     null = precio no verificado → se muestra "Precio por confirmar".
  --------------------------------------------------------- */
  const DUR = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
  const MONTHS = { Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12 };
  const NUT = ['Con Nutricionista', 'Sin Nutricionista'];
  const build = (prices) => {
    const map = {}; let i = 0;
    for (let dd = 1; dd <= 4; dd++) for (const du of DUR) for (const n of NUT) map[`${dd}|${du}|${n}`] = prices[i++] ?? null;
    return map;
  };
  const PLANS = {
    individual: {
      name: 'Plan Individual',
      full: 'Plan 100% Personalizado de Entrenamiento Individual',
      price: build([
        95000, 60000, 285000, 180000, 570000, 360000, 1140000, 720000,
        155000, 120000, 465000, 360000, 930000, 720000, 1860000, 1440000,
        215000, 180000, 645000, 540000, 1290000, 1080000, 2580000, 2160000,
        259000, 224000, 777000, 672000, 1554000, 1344000, 3108000, 2688000]),
      inc: ['Evaluación física inicial de fuerza, movilidad y control postural', 'Plan progresivo 100 % personalizado', 'Coach semi-privado (máx. 2–3 personas)', 'Mediciones periódicas de fuerza'],
      desc: 'Coaching personalizado en un laboratorio de fuerza y movimiento. Tu coach construye un plan progresivo según tus días de entrenamiento y la duración elegida.'
    },
    duo: {
      name: 'Plan 2 Personas',
      full: 'Plan 100% Personalizado de Entrenamiento para 2 Personas',
      price: build([
        182000, 112000, 546000, 336000, 1092000, 672000, 2184000, 1344000,
        294000, 224000, 882000, 672000, 1764000, 1344000, 3528000, 2688000,
        406000, 336000, 1218000, 1008000, 2436000, 2016000, 4872000, 4032000,
        518000, 448000, 1554000, 1344000, 3108000, 2688000, 6216000, 5376000]),
      inc: ['Evaluación inicial de fuerza, movilidad y control motor', 'Sesiones ajustadas al nivel y objetivos de ambos', 'Mismo horario y mismo coach', 'Mediciones individuales para cada persona'],
      desc: 'Entrena junto a tu partner con coaching personalizado, control de fuerza y nutrición opcional.'
    }
  };
  const NUT_INC = ['Consultas presenciales con nutricionista', 'Evaluaciones ISAK de composición corporal', 'Control mensual y pautas nutricionales'];
  const DEMO_MSG = 'Esta es una demostración del nuevo sitio web de METHOD LAB. La contratación en línea estará disponible cuando se habilite la versión definitiva.';

  const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const money = (v) => (v == null ? 'Precio por confirmar' : clp.format(v));
  const form = $('#cfgForm');
  const el = {
    name: $('#sumName'), spec: $('#sumSpec'), price: $('#sumPrice'), per: $('#sumPer'), eq: $('#sumEq'),
    inc: $('#sumInc'), cmpSel: $('#cmpSel'), cmpA: $('#cmpA'), cmpB: $('#cmpB')
  };
  const state = () => {
    const f = new FormData(form);
    return { plan: f.get('plan'), dias: f.get('dias'), dur: f.get('dur'), nut: f.get('nut') };
  };
  const specText = (s) => `${s.dias} ${s.dias === '1' ? 'día' : 'días'} por semana · ${s.dur} · ${s.nut === 'Con Nutricionista' ? 'Con' : 'Sin'} nutricionista`;
  const priceOf = (plan, s) => PLANS[plan].price[`${s.dias}|${s.dur}|${s.nut}`];
  // Valor mensual: solo si el total es múltiplo exacto del precio Mensual verificado (no se inventa nada)
  const monthlyOf = (plan, s) => {
    const total = priceOf(plan, s), m = PLANS[plan].price[`${s.dias}|Mensual|${s.nut}`], n = MONTHS[s.dur];
    return total != null && m != null && n > 1 && total === m * n ? m : null;
  };

  function render(animate = true) {
    const s = state(), p = PLANS[s.plan], v = priceOf(s.plan, s), months = MONTHS[s.dur];
    el.name.textContent = p.name;
    el.spec.textContent = specText(s);
    el.price.textContent = money(v);
    el.price.classList.toggle('is-tbc', v == null);
    el.per.textContent = v == null ? '' : months === 1 ? 'pago mensual' : `pago total · ${months} meses`;
    const m = monthlyOf(s.plan, s);
    el.eq.hidden = !m;
    if (m) el.eq.innerHTML = `${months} × <b>${clp.format(m)}</b>, el valor del plan mensual`;
    const items = [...p.inc, ...(s.nut === 'Con Nutricionista' ? NUT_INC : [])];
    el.inc.replaceChildren(...items.map((t) => Object.assign(d.createElement('li'), { textContent: t })));
    el.cmpSel.textContent = specText(s).replace(' por semana', '');
    el.cmpA.textContent = money(priceOf('individual', s));
    el.cmpB.textContent = money(priceOf('duo', s));
    $$('.cmp td').forEach((td, i) => td.classList.toggle('is-sel', (i % 2 === 0) === (s.plan === 'individual')));
    if (animate && !reduce) { el.price.classList.remove('is-tick'); void el.price.offsetWidth; el.price.classList.add('is-tick'); }
  }
  form.addEventListener('change', () => render());
  render(false);

  /* ---------- Modal (dialog nativo: Esc, foco atrapado) ---------- */
  const modal = $('#modal');
  const openModal = (dlg) => {
    dlg.showModal();
    d.body.classList.add('modal-open');
  };
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) closeModal(dlg); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(dlg); });
  });
  function closeModal(dlg) {
    if (!dlg.open) return;
    dlg.classList.add('is-closing');
    setTimeout(() => { dlg.classList.remove('is-closing'); dlg.close(); d.body.classList.remove('modal-open'); }, reduce ? 0 : 200);
  }
  const summaryHTML = (s) => {
    const p = PLANS[s.plan], v = priceOf(s.plan, s), m = monthlyOf(s.plan, s);
    return `<dl class="msum">
      <div><dt>Plan</dt><dd>${esc(p.full)}</dd></div>
      <div><dt>Frecuencia</dt><dd>${s.dias} ${s.dias === '1' ? 'día' : 'días'} por semana</dd></div>
      <div><dt>Duración</dt><dd>${esc(s.dur)}</dd></div>
      <div><dt>Nutricionista</dt><dd>${s.nut === 'Con Nutricionista' ? 'Incluido' : 'No incluido'}</dd></div>
      <div class="msum__total"><dt>${MONTHS[s.dur] === 1 ? 'Pago mensual' : 'Pago total'}</dt><dd>${money(v)}${m ? `<small>${MONTHS[s.dur]} × ${clp.format(m)}</small>` : ''}</dd></div>
    </dl>`;
  };
  $('#buyBtn').addEventListener('click', () => {
    const s = state();
    $('#mEye').textContent = 'Versión demo';
    $('#mTitle').textContent = 'Contratación no disponible en la demo';
    $('#mBody').innerHTML = `<p class="mnote">${DEMO_MSG}</p>${summaryHTML(s)}<p class="muted msmall">No se realizó ninguna compra ni se enviaron datos.</p>`;
    $('#mAct').innerHTML = `<a class="btn btn--red" href="#contacto" data-close>Agendar evaluación gratuita</a><button class="btn btn--ghost" type="button" data-close>Seguir explorando</button>`;
    openModal(modal);
  });
  $('#detailBtn').addEventListener('click', () => {
    const s = state(), p = PLANS[s.plan];
    const items = [...p.inc, ...(s.nut === 'Con Nutricionista' ? NUT_INC : [])];
    $('#mEye').textContent = 'Detalle del plan';
    $('#mTitle').textContent = p.full;
    $('#mBody').innerHTML = `<p>${esc(p.desc)}</p>${summaryHTML(s)}<p class="mlist-t">Incluye</p><ul class="chk chk--sm">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p class="muted msmall">Opciones disponibles: 1 a 4 días por semana · Mensual, Trimestral, Semestral o Anual · Con o sin nutricionista.</p>`;
    $('#mAct').innerHTML = `<button class="btn btn--red" type="button" id="mBuy">Contratar plan</button><button class="btn btn--ghost" type="button" data-close>Cerrar</button>`;
    $('#mBuy').addEventListener('click', () => { modal.close(); $('#buyBtn').click(); });
    openModal(modal);
  });
  modal.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"][data-close]');
    if (a) { e.preventDefault(); closeModal(modal); setTimeout(() => $(a.getAttribute('href'))?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 220); }
  });

  /* ---------- Modo revisión (puntos por confirmar) ---------- */
  const revNodes = $$('[data-review]');
  const reviewBtn = $('#reviewBtn'), review = $('#review');
  const groups = new Map(); // mismo texto = mismo punto (p. ej. promociones repetidas)
  revNodes.forEach((n) => {
    const key = n.dataset.review.replace(/Promociones?/, 'Promoción');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(n);
  });
  $('#reviewCount').textContent = groups.size;
  $('#revList').replaceChildren(...[...groups].map(([text, nodes], i) => {
    nodes.forEach((n) => { n.dataset.revN = i + 1; });
    const li = d.createElement('li'), b = d.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span>${esc(text)}${nodes.length > 1 ? ` <em>(${nodes.length} lugares)</em>` : ''}</span>`;
    b.addEventListener('click', () => {
      closeModal(review);
      setTimeout(() => {
        nodes[0].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        nodes.forEach((n) => { n.classList.add('is-flash'); setTimeout(() => n.classList.remove('is-flash'), 1600); });
      }, 220);
    });
    li.append(b); return li;
  }));
  reviewBtn.addEventListener('click', () => {
    const on = !d.body.classList.contains('review-on');
    d.body.classList.toggle('review-on', on);
    reviewBtn.setAttribute('aria-pressed', on);
    if (on) openModal(review);
  });

  /* ---------- Header y barra móvil ---------- */
  const hdr = $('#hdr'), mbar = $('#mbar'), hero = $('.hero');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 24 || d.body.classList.contains('menu-open'));
    const past = y > hero.offsetHeight * 0.6, nearEnd = innerHeight + y > d.body.scrollHeight - 40;
    mbar.classList.toggle('is-on', past && !nearEnd && !d.body.classList.contains('menu-open'));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  const burger = $('#burger'), mnav = $('#mnav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    d.body.classList.toggle('menu-open', open);
    if (open) {
      mnav.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => mnav.classList.add('is-open')));
      $('a', mnav).focus({ preventScroll: true });
    } else {
      mnav.classList.remove('is-open');
      setTimeout(() => { if (!mnav.classList.contains('is-open')) mnav.hidden = true; }, reduce ? 0 : 280);
    }
    onScroll();
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', (e) => {
    if (!d.body.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { setMenu(false); burger.focus(); }
    if (e.key === 'Tab') {
      const f = [burger, ...$$('a', mnav)], i = f.indexOf(d.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  matchMedia('(min-width:1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  /* ---------- Sección activa ---------- */
  const links = $$('.nav__list a');
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.map((a) => $(a.getAttribute('href'))).filter(Boolean).forEach((s) => spy.observe(s));

  /* ---------- Revelado al hacer scroll ---------- */
  $$('[data-stagger]').forEach((g) => $$(':scope > [data-anim]', g).forEach((c, i) => c.style.setProperty('--d', `${i * 80}ms`)));
  $$('.hero [data-anim]').forEach((c, i) => c.style.setProperty('--d', `${120 + i * 90}ms`));
  const rev = new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-anim], .reveal-img').forEach((n) => rev.observe(n));
  requestAnimationFrame(() => $$('.hero [data-anim]').forEach((n) => n.classList.add('is-in')));

  /* ---------- Línea de progreso de pasos ---------- */
  const steps = $('.steps');
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    steps.style.setProperty('--p', 1);
    $$('.step', steps).forEach((s, i) => setTimeout(() => s.classList.add('is-in'), reduce ? 0 : 250 + i * 260));
    o.disconnect();
  }, { threshold: 0.35 }).observe(steps);

  /* ---------- Pestañas (ARIA tabs + flechas) ---------- */
  const tabs = $$('[role="tab"]'), ink = $('.tabs__ink');
  const moveInk = (t) => { if (!ink) return; ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft}px)`; };
  const selectTab = (t, focus) => {
    tabs.forEach((x) => {
      const on = x === t, panel = $('#' + x.getAttribute('aria-controls'));
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if (on && !reduce) panel.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
    });
    moveInk(t);
    if (focus) { t.focus(); t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); selectTab(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });
  const sel = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  moveInk(sel());
  addEventListener('resize', () => moveInk(sel()), { passive: true });
  d.fonts?.ready.then(() => moveInk(sel()));

  /* ---------- Galería ---------- */
  const gal = $('#gal'), gbtn = $$('[data-gal]');
  const gstep = () => (gal.querySelector('figure')?.getBoundingClientRect().width || 300) + 16;
  gbtn.forEach((b) => b.addEventListener('click', () => gal.scrollBy({ left: gstep() * +b.dataset.gal, behavior: reduce ? 'auto' : 'smooth' })));
  const gupd = () => { gbtn[0].disabled = gal.scrollLeft < 8; gbtn[1].disabled = gal.scrollLeft + gal.clientWidth >= gal.scrollWidth - 8; };
  gal.addEventListener('scroll', () => requestAnimationFrame(gupd), { passive: true });
  gal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); gbtn[1].click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); gbtn[0].click(); }
  });
  gupd();

  /* ---------- FAQ animado (Web Animations API) ---------- */
  $$('.acc details').forEach((det) => {
    const sum = $('summary', det), body = $('.acc__b', det); let anim = null;
    sum.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault(); anim?.cancel();
      if (det.open) {
        anim = body.animate({ height: [body.offsetHeight + 'px', '0px'], opacity: [1, 0] }, { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
        anim.onfinish = () => { det.open = false; anim = null; };
      } else {
        det.open = true;
        anim = body.animate({ height: ['0px', body.offsetHeight + 'px'], opacity: [0, 1] }, { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ---------- Formularios en modo demo (no envían datos) ---------- */
  const setErr = (input, msg, errEl) => {
    const fld = input.closest('.fld') || input.closest('form');
    fld.classList.toggle('has-err', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    (errEl || $('.fld__err', fld)).textContent = msg || '';
  };
  const lead = $('#leadForm'), fName = $('#fName'), fPhone = $('#fPhone'), fGoal = $('#fGoal');
  const phoneOk = (v) => { const n = v.replace(/[\s\-().]/g, ''); return /^(\+?56)?9\d{8}$/.test(n); };
  const checkLead = () => {
    let ok = true;
    if (fName.value.trim().length < 2) { setErr(fName, 'Escribe tu nombre.'); ok = false; } else setErr(fName, '');
    if (!phoneOk(fPhone.value)) { setErr(fPhone, 'Ingresa un celular chileno válido, por ejemplo +56 9 1234 5678.'); ok = false; } else setErr(fPhone, '');
    if (!fGoal.value) { setErr(fGoal, 'Elige tu objetivo principal.'); ok = false; } else setErr(fGoal, '');
    return ok;
  };
  [fName, fPhone, fGoal].forEach((i) => i.addEventListener('input', () => { if (i.closest('.fld').classList.contains('has-err')) checkLead(); }));
  lead.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = $('#formOk');
    if (!checkLead()) { ok.hidden = true; $('[aria-invalid="true"]', lead).focus(); return; }
    ok.hidden = false;
    ok.innerHTML = '<b>Datos válidos.</b> Esto es una demostración: tus datos <b>no se enviaron</b> a ningún servicio. Para agendar ahora, escríbenos por <a href="https://wa.me/56961417901" target="_blank" rel="noopener">WhatsApp</a>.';
  });

  const news = $('#newsForm'), nEmail = $('#nEmail'), nErr = $('#nErr');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nEmail.value.trim())) { setErr(nEmail, 'Ingresa un correo válido.', nErr); nErr.classList.remove('is-ok'); nEmail.focus(); return; }
    setErr(nEmail, '', nErr);
    nErr.classList.add('is-ok');
    nErr.textContent = 'Demo: el correo es válido, pero no se envió ni se guardó.';
  });

  /* ---------- Mapa diferido ---------- */
  const map = $('#map');
  const loadMap = () => {
    if (map.dataset.loaded) return; map.dataset.loaded = '1';
    const f = d.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Av.+Francisco+Bilbao+2970,+Providencia,+Chile&z=16&output=embed';
    f.title = 'Mapa: Method Lab, Av. Francisco Bilbao 2970, Providencia';
    f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    map.replaceChildren(f);
  };
  $('#mapBtn').addEventListener('click', loadMap);
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); setTimeout(loadMap, 400); } }, { rootMargin: '200px' }).observe(map);

  /* ---------- Video (si se activa): pausa los demás y respeta movimiento reducido ---------- */
  $$('video').forEach((v) => v.addEventListener('play', () => $$('video').forEach((o) => { if (o !== v) o.pause(); })));

  $('#yr').textContent = new Date().getFullYear();
})();

/* ---------- Contactar profesores (desplegable / hoja móvil) ---------- */
(() => {
  'use strict';
  const d = document;
  const btn = d.getElementById('pcBtn'), panel = d.getElementById('pcPanel'), scrim = d.getElementById('pcScrim'), live = d.getElementById('pcLive');
  if (!btn || !panel) return;
  const root = d.getElementById('pc');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 639px)');
  const DUR = reduce ? 0 : 240;
  let open = false, timer = null;
  const focusables = () => [...panel.querySelectorAll('a[href], button:not([disabled])')];

  function place() {
    if (mobile.matches) return;
    panel.classList.remove('is-right');
    const r = panel.getBoundingClientRect();
    if (r.right > innerWidth - 12) panel.classList.add('is-right');
  }
  function show() {
    if (open) return;
    open = true; clearTimeout(timer);
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    const sheet = mobile.matches;
    panel.setAttribute('aria-modal', String(sheet));
    if (sheet) { scrim.hidden = false; d.body.classList.add('pc-sheet'); }
    place();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      panel.classList.add('is-open'); if (sheet) scrim.classList.add('is-open');
    }));
    if (!sheet) {
      const r = panel.getBoundingClientRect();
      if (r.bottom > innerHeight - 16) scrollBy({ top: r.bottom - innerHeight + 24, behavior: reduce ? 'auto' : 'smooth' });
    }
    // foco en el primer contacto (WhatsApp de Álvaro) para teclado y lectores
    setTimeout(() => panel.querySelector('.pc__wa')?.focus({ preventScroll: true }), sheet ? 60 : 0);
  }
  function hide(returnFocus = true) {
    if (!open) return;
    open = false;
    btn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open'); scrim.classList.remove('is-open');
    d.body.classList.remove('pc-sheet');
    timer = setTimeout(() => { panel.hidden = true; scrim.hidden = true; }, DUR);
    if (returnFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', () => (open ? hide() : show()));
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-pc-close]')) hide();
    if (e.target.closest('[data-pc-pick]')) setTimeout(() => hide(false), 120); // se eligió un contacto
  });
  scrim.addEventListener('click', () => hide());
  // Clic/toque fuera del desplegable
  d.addEventListener('pointerdown', (e) => { if (open && !root.contains(e.target) && e.target !== scrim) hide(false); });
  d.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); hide(); }
    if (e.key === 'Tab' && mobile.matches) { // hoja móvil: foco atrapado
      const f = focusables(), i = f.indexOf(d.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  // Escritorio: si el foco sale del componente con Tab, se cierra
  root.addEventListener('focusout', (e) => { if (open && !mobile.matches && e.relatedTarget && !root.contains(e.relatedTarget)) hide(false); });
  mobile.addEventListener('change', () => hide(false));
  addEventListener('resize', () => { if (open) place(); }, { passive: true });

  // Copiar número
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
      const t = Object.assign(d.createElement('textarea'), { value: text });
      t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      d.body.append(t); t.select(); t.setSelectionRange(0, text.length);
      let ok = false; try { ok = d.execCommand('copy'); } catch (_) {}
      t.remove(); return ok;
    }
  }
  panel.querySelectorAll('[data-copy]').forEach((b) => {
    const lbl = b.querySelector('.pc__copy-l');
    let t;
    b.addEventListener('click', async () => {
      const num = b.dataset.copy, ok = await copy(num);
      clearTimeout(t);
      b.classList.toggle('is-done', ok);
      lbl.textContent = ok ? 'Copiado' : 'Mantén para copiar';
      live.textContent = ok ? `Número ${num} copiado` : `No se pudo copiar. El número es ${num}`;
      t = setTimeout(() => { b.classList.remove('is-done'); lbl.textContent = 'Copiar'; }, 1800);
    });
  });
})();
