/* METHOD LAB — interacciones (vanilla, sin dependencias) */
(() => {
  'use strict';
  const d = document, root = d.documentElement;
  root.classList.add('js');
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     CATÁLOGO SHOPIFY
     Respaldo con los datos reales de methodlab.cl (9-oct-2026).
     Al cargar, se intenta leer el catálogo en vivo desde /products/<handle>.js;
     si responde, los precios/IDs vivos reemplazan a estos.
     Orden: días 1→4 × duración (Mensual, Trimestral, Semestral, Anual) × (Con, Sin)
  --------------------------------------------------------- */
  const STORE = 'https://methodlab.cl';
  const DUR = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
  const MONTHS = { Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12 };
  const NUT = ['Con Nutricionista', 'Sin Nutricionista'];
  const build = (ids, prices) => {
    const map = {}; let i = 0;
    for (let dd = 1; dd <= 4; dd++) for (const du of DUR) for (const n of NUT) {
      map[`${dd}|${du}|${n}`] = { id: ids[i], price: prices[i], available: true }; i++;
    }
    return map;
  };
  const seq = (start, step = 32768) => Array.from({ length: 32 }, (_, k) => start + k * step);
  const PRODUCTS = {
    individual: {
      name: 'Plan Individual',
      handle: 'plan-100-personalizado-de-entrenamiento-individual',
      variants: build(seq(49105543790838), [
        95000, 60000, 285000, 180000, 570000, 360000, 1140000, 720000,
        155000, 120000, 465000, 360000, 930000, 720000, 1860000, 1440000,
        215000, 180000, 645000, 540000, 1290000, 1080000, 2580000, 2160000,
        259000, 224000, 777000, 672000, 1554000, 1344000, 3108000, 2688000])
    },
    duo: {
      name: 'Plan 2 Personas',
      handle: 'plan-100-personalizado-de-entrenamiento-para-2-personas',
      variants: build(seq(49105549328630), [
        182000, 112000, 546000, 336000, 1092000, 672000, 2184000, 1344000,
        294000, 224000, 882000, 672000, 1764000, 1344000, 3528000, 2688000,
        406000, 336000, 1218000, 1008000, 2436000, 2016000, 4872000, 4032000,
        518000, 448000, 1554000, 1344000, 3108000, 2688000, 6216000, 5376000])
    }
  };

  // Lectura en vivo (mismo dominio en Shopify; en otro dominio depende de CORS → cae al respaldo)
  const liveSync = async (key) => {
    const p = PRODUCTS[key];
    try {
      const r = await fetch(`${STORE}/products/${p.handle}.js`, { headers: { Accept: 'application/json' } });
      if (!r.ok) return;
      const j = await r.json();
      const fresh = {};
      for (const v of j.variants) {
        const dd = (String(v.option1).match(/\d/) || [])[0];
        if (!dd) continue;
        // Shopify .js devuelve precio en centavos
        fresh[`${dd}|${v.option2}|${v.option3}`] = { id: v.id, price: Math.round(v.price / 100), available: v.available };
      }
      if (Object.keys(fresh).length) { p.variants = fresh; render(false); }
    } catch (_) { /* respaldo */ }
  };

  /* ---------- Configurador ---------- */
  const form = $('#cfgForm');
  const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const el = {
    name: $('#sumName'), spec: $('#sumSpec'), price: $('#sumPrice'), per: $('#sumPer'),
    eq: $('#sumEq'), inc: $('#sumInc'), buy: $('#buyBtn'), detail: $('#detailLink')
  };
  const BASE_INC = ['Evaluación inicial gratuita', 'Programa 100 % personalizado', 'Mediciones periódicas de fuerza'];
  const NUT_INC = ['Consultas presenciales con nutricionista', 'Mediciones ISAK + control mensual'];
  const DUO_INC = ['Mismo horario y coach para ambos', 'Mediciones individuales'];

  const read = () => {
    const f = new FormData(form);
    return { plan: f.get('plan'), dias: f.get('dias'), dur: f.get('dur'), nut: f.get('nut') };
  };

  function render(animate = true) {
    if (!form) return;
    const s = read();
    const p = PRODUCTS[s.plan];
    const v = p.variants[`${s.dias}|${s.dur}|${s.nut}`];
    const months = MONTHS[s.dur];
    const durLbl = { Mensual: 'Mensual', Trimestral: '3 meses', Semestral: '6 meses', Anual: '12 meses' }[s.dur];
    el.name.textContent = p.name;
    el.spec.textContent = `${s.dias} ${s.dias === '1' ? 'día' : 'días'} por semana · ${durLbl} · ${s.nut === 'Con Nutricionista' ? 'Con' : 'Sin'} nutricionista`;

    const items = [...BASE_INC, ...(s.plan === 'duo' ? DUO_INC : []), ...(s.nut === 'Con Nutricionista' ? NUT_INC : [])];
    el.inc.replaceChildren(...items.map(t => { const li = d.createElement('li'); li.textContent = t; return li; }));

    if (!v || v.available === false) {
      el.price.textContent = 'No disponible';
      el.per.textContent = '';
      el.eq.hidden = true;
      el.buy.setAttribute('aria-disabled', 'true');
      el.buy.removeAttribute('href');
      el.buy.querySelector('.btn__lbl').textContent = 'Combinación no disponible';
      return;
    }
    el.buy.removeAttribute('aria-disabled');
    el.buy.querySelector('.btn__lbl').textContent = 'Agregar al carrito';
    el.price.textContent = clp.format(v.price);
    el.per.textContent = months === 1 ? 'pago mensual' : `pago total · ${months} meses`;
    if (months > 1) {
      el.eq.hidden = false;
      el.eq.innerHTML = `Equivale a <b>${clp.format(Math.round(v.price / months))}</b> al mes`;
    } else el.eq.hidden = true;

    // Permalink oficial de Shopify → checkout seguro con la variante exacta
    el.buy.href = `${STORE}/cart/${v.id}:1`;
    el.detail.href = `${STORE}/products/${p.handle}?variant=${v.id}`;

    if (animate && !reduce) {
      el.price.classList.remove('is-tick'); void el.price.offsetWidth; el.price.classList.add('is-tick');
    }
  }
  if (form) {
    form.addEventListener('change', () => render());
    render(false);
    // Sincroniza cuando el configurador se acerca al viewport (no compite con la carga inicial)
    const io = new IntersectionObserver((e, o) => {
      if (e[0].isIntersecting) { o.disconnect(); liveSync('individual'); liveSync('duo'); }
    }, { rootMargin: '600px' });
    io.observe(form);
    // Agregar al carrito (sin JS o sin carrito, el enlace lleva directo al checkout de Shopify)
    const toast = $('#cartToast');
    let toastTimer;
    const hideToast = () => { toast.classList.remove('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 260); };
    el.buy.addEventListener('click', (e) => {
      if (!el.buy.href || !window.MLCart) return;
      e.preventDefault();
      const s = read(), p = PRODUCTS[s.plan], v = p.variants[`${s.dias}|${s.dur}|${s.nut}`];
      if (!v) return;
      window.MLCart.add({ id: v.id, name: p.name, spec: el.spec.textContent, price: v.price });
      window.MLCart.bump();
      $('#toastItem').textContent = `${p.name} · ${el.spec.textContent} · ${clp.format(v.price)}`;
      clearTimeout(toastTimer);
      toast.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-on')));
      toastTimer = setTimeout(hideToast, 7000);
    });
    toast.addEventListener('click', (e) => { if (e.target.closest('[data-toast-close]')) hideToast(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !toast.hidden) hideToast(); });
  }

  /* ---------- Header ---------- */
  const hdr = $('#hdr'), mbar = $('#mbar'), hero = $('.hero');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 24);
    if (mbar && hero) {
      const past = y > hero.offsetHeight * .6;
      const nearEnd = innerHeight + y > d.body.scrollHeight - 40;
      mbar.classList.toggle('is-on', past && !nearEnd && !d.body.classList.contains('menu-open'));
    }
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
      hdr.classList.add('is-solid');
    } else {
      mnav.classList.remove('is-open');
      setTimeout(() => { if (!mnav.classList.contains('is-open')) mnav.hidden = true; }, reduce ? 0 : 280);
      onScroll();
    }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    if (e.key === 'Tab' && d.body.classList.contains('menu-open')) {
      const f = [burger, ...$$('a', mnav)];
      const i = f.indexOf(d.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  matchMedia('(min-width:1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  /* ---------- Sección activa en la navegación ---------- */
  const links = $$('.nav__list a');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => spy.observe(s));

  /* ---------- Revelado al hacer scroll ---------- */
  $$('[data-stagger]').forEach(g => $$(':scope > [data-anim]', g).forEach((c, i) => c.style.setProperty('--d', `${i * 80}ms`)));
  $$('.hero [data-anim]').forEach((c, i) => c.style.setProperty('--d', `${120 + i * 90}ms`));
  const rev = new IntersectionObserver((es, o) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('[data-anim], .reveal-img').forEach(n => rev.observe(n));
  // Hero visible de inmediato
  requestAnimationFrame(() => $$('.hero [data-anim]').forEach(n => n.classList.add('is-in')));

  /* ---------- Línea de progreso de los pasos ---------- */
  const steps = $('.steps');
  if (steps) {
    const so = new IntersectionObserver((es, o) => {
      if (es[0].isIntersecting) {
        steps.style.setProperty('--p', 1);
        $$('.step', steps).forEach((s, i) => setTimeout(() => s.classList.add('is-in'), reduce ? 0 : 250 + i * 260));
        o.disconnect();
      }
    }, { threshold: .35 });
    so.observe(steps);
  }

  /* ---------- Galería ---------- */
  const gal = $('#gal');
  if (gal) {
    const btns = $$('[data-gal]');
    const step = () => (gal.querySelector('figure')?.getBoundingClientRect().width || 300) + 16;
    btns.forEach(b => b.addEventListener('click', () => gal.scrollBy({ left: step() * +b.dataset.gal, behavior: reduce ? 'auto' : 'smooth' })));
    const upd = () => {
      btns[0].disabled = gal.scrollLeft < 8;
      btns[1].disabled = gal.scrollLeft + gal.clientWidth >= gal.scrollWidth - 8;
    };
    gal.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    gal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); btns[1].click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); btns[0].click(); }
    });
    upd();
  }

  /* ---------- FAQ: acordeón animado (Web Animations API) ---------- */
  $$('.acc details').forEach(det => {
    const sum = $('summary', det), body = $('.acc__b', det);
    let anim = null;
    sum.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault();
      if (anim) anim.cancel();
      if (det.open) {
        const h = body.offsetHeight;
        anim = body.animate({ height: [h + 'px', '0px'], opacity: [1, 0] }, { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
        anim.onfinish = () => { det.open = false; anim = null; };
      } else {
        det.open = true;
        const h = body.offsetHeight;
        anim = body.animate({ height: ['0px', h + 'px'], opacity: [0, 1] }, { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ---------- Formulario de evaluación → WhatsApp ---------- */
  const lead = $('#leadForm');
  if (lead) {
    const setErr = (input, msg) => {
      const fld = input.closest('.fld');
      fld.classList.toggle('has-err', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      $('.fld__err', fld).textContent = msg || '';
    };
    const name = $('#fName'), goal = $('#fGoal');
    const check = () => {
      let ok = true;
      if (name.value.trim().length < 2) { setErr(name, 'Escribe tu nombre.'); ok = false; } else setErr(name, '');
      if (!goal.value) { setErr(goal, 'Elige tu objetivo principal.'); ok = false; } else setErr(goal, '');
      const prof = $('input[name="prof"]:checked', lead), first = $('input[name="prof"]', lead);
      if (!prof) { setErr(first, 'Elige con qué entrenador quieres agendar.'); ok = false; } else setErr(first, '');
      return ok;
    };
    [name, goal].forEach(i => i.addEventListener('input', () => { if (i.closest('.fld').classList.contains('has-err')) check(); }));
    // Profesor elegido → su WhatsApp
    const PROFES = { 'William': '56972779125', 'Álvaro': '56934038892' };
    lead.addEventListener('change', (e) => {
      if (e.target.name !== 'prof') return;
      $('#leadBtnLbl').textContent = `Agendar con ${e.target.value} por WhatsApp`;
      if (e.target.closest('.fld').classList.contains('has-err')) check();
    });
    lead.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!check()) { $('[aria-invalid="true"]', lead).focus(); return; }
      const f = new FormData(lead);
      const msg = [
        `Hola ${f.get('prof')}, me gustaría agendar mi evaluación gratuita en Method Lab.`,
        `Nombre: ${f.get('name').trim()}`,
        `Objetivo: ${f.get('goal')}`,
        `Modalidad: ${f.get('who')}`,
        f.get('when').trim() ? `Horario preferido: ${f.get('when').trim()}` : ''
      ].filter(Boolean).join('\n');
      const btn = $('button[type="submit"]', lead);
      btn.classList.add('is-loading');
      window.open(`https://wa.me/${PROFES[f.get('prof')]}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      setTimeout(() => { btn.classList.remove('is-loading'); $('#formOk').hidden = false; }, 600);
    });
  }

  /* ---------- Mapa diferido ---------- */
  const map = $('#map'), mapBtn = $('#mapBtn');
  const loadMap = () => {
    if (map.dataset.loaded) return;
    map.dataset.loaded = '1';
    const f = d.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Av.+Francisco+Bilbao+2970,+Providencia,+Chile&z=16&output=embed';
    f.title = 'Mapa: Method Lab, Av. Francisco Bilbao 2970, Providencia';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    map.replaceChildren(f);
  };
  if (map) {
    mapBtn.addEventListener('click', loadMap);
    // Carga sola cuando el usuario ya está cerca (no afecta la carga inicial)
    const mo = new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); setTimeout(loadMap, 400); } }, { rootMargin: '200px' });
    mo.observe(map);
  }

  /* ---------- Testimonios: solo se muestran si existen reales ---------- */
  // const TESTIMONIOS = [{ texto: '', nombre: '', detalle: '' }];  // ← completar con testimonios reales y autorizados

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Celular/tablet: los enlaces a #contacto bajan directo al formulario ---------- */
  const leadForm = $('#leadForm'), stacked = matchMedia('(max-width: 959px)');
  if (leadForm) {
    d.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#contacto"]');
      if (!a || !stacked.matches) return;
      e.preventDefault();
      const go = () => {
        // offsetTop ignora el desplazamiento de la animación de entrada → posición final exacta
        let y = 0; for (let n = leadForm; n; n = n.offsetParent) y += n.offsetTop;
        const pad = parseFloat(getComputedStyle(d.documentElement).scrollPaddingTop) || 0;
        scrollTo({ top: y - pad, behavior: reduce ? 'auto' : 'smooth' });
      };
      if (a.closest('#mnav')) setTimeout(go, reduce ? 0 : 300); else requestAnimationFrame(go); // espera a que cierre el menú
      history.replaceState(null, '', '#contacto');
    });
  }

  /* ---------- Contacto flotante: la flecha esconde / muestra los botones ---------- */
  const fab = $('#fab'), fabToggle = $('#fabToggle'), fabItems = $('#fabItems');
  if (fab) {
    let tipTimer;
    const flashTips = () => { // en celular muestra los nombres de los profesores un momento
      clearTimeout(tipTimer);
      fab.classList.add('show-tips');
      tipTimer = setTimeout(() => fab.classList.remove('show-tips'), 2600);
    };
    const setOpen = (open) => {
      fab.classList.toggle('is-collapsed', !open);
      fabToggle.setAttribute('aria-expanded', String(open));
      fabToggle.setAttribute('aria-label', open ? 'Ocultar contactos' : 'Mostrar contactos');
      fabItems.inert = !open; // ocultos = no reciben foco ni toques
      if (open) flashTips(); else { clearTimeout(tipTimer); fab.classList.remove('show-tips'); }
    };
    fabToggle.addEventListener('click', () => {
      fab.classList.add('is-used');
      setOpen(fab.classList.contains('is-collapsed'));
    });
    // Celular/tablet: no tapar la portada; aparece al bajar y se ubica sobre la barra inferior
    const heroEl = $('.hero'), mbarEl = $('#mbar'), small = matchMedia('(max-width: 1023px)');
    let fabTick = false;
    const placeFab = () => {
      fabTick = false;
      const away = small.matches && heroEl && scrollY < heroEl.offsetHeight * 0.6;
      if (away && !fab.classList.contains('is-collapsed')) setOpen(false);
      fab.classList.toggle('is-away', !!away);
      fab.classList.toggle('is-low', small.matches && !(mbarEl && mbarEl.classList.contains('is-on')));
    };
    addEventListener('scroll', () => { if (!fabTick) { fabTick = true; requestAnimationFrame(placeFab); } }, { passive: true });
    small.addEventListener('change', placeFab);
    placeFab();
  }
})();
