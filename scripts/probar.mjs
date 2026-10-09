#!/usr/bin/env node
/**
 * Auditoría automática de la demo Method Lab (Playwright).
 *
 *   npm install
 *   npx playwright install chromium webkit firefox     (solo la primera vez)
 *   npm run probar                                      (prueba https://methodlab-six.vercel.app)
 *   node scripts/probar.mjs --url http://localhost:3000 --browsers chromium
 *
 * Revisa en 9 tamaños de pantalla: recursos con error (404/500), errores de consola,
 * imágenes visibles rotas y scroll horizontal. Después ejecuta los 14 flujos principales
 * en celular y escritorio. Sale con código 1 si algo falla.
 * --mock-cdn: reemplaza las fotos del CDN por una imagen de prueba (para entornos sin internet).
 */
import { chromium, webkit, firefox } from 'playwright';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const URL_ = arg('--url', 'https://methodlab-six.vercel.app/');
const ENGINES = arg('--browsers', 'chromium,webkit,firefox').split(',');
const MOCK = process.argv.includes('--mock-cdn');
const MOCK_JPG = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCADVAUADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDlqKKKoAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==', 'base64');
const VIEWPORTS = [
  ['Android 360', 360, 780, true], ['iPhone 375', 375, 812, true], ['Android 412', 412, 915, true],
  ['iPhone 430', 430, 932, true], ['Celular horizontal', 844, 390, true], ['Tablet 768', 768, 1024, true],
  ['Tablet horizontal', 1024, 768, true], ['Laptop 1366', 1366, 768, false], ['Escritorio 1920', 1920, 1080, false],
];
const EXPECT = {
  ig: 'https://www.instagram.com/methodlabgym/',
  alvaro: 'https://wa.me/56934038892', william: 'https://wa.me/56972779125', general: 'https://wa.me/56961417901',
};
const results = []; let failed = 0;
const ok = (name, pass, info = '') => { results.push([pass ? 'OK ' : 'FALLA', name, info]); if (!pass) failed++; };
const isOwn = (u) => u.startsWith(new URL(URL_).origin);
const ignorable = (u) => /google\.com\/maps|gstatic|googleapis|maps\.google/.test(u); // mapa: externo, se carga diferido

async function newPage(browser, w, h, mobile) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile && browser.browserType().name() !== 'firefox' });
  const page = await ctx.newPage();
  if (MOCK) await page.route('**/cdn/shop/files/**', (r) => r.fulfill({ status: 200, contentType: 'image/jpeg', body: MOCK_JPG }));
  const bad = [], errors = [];
  page.on('response', (r) => { if (r.status() >= 400 && !ignorable(r.url())) bad.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', (r) => { if (!ignorable(r.url()) && !/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(r.failure()?.errorText || '')) bad.push(`FALLÓ ${r.url()} (${r.failure()?.errorText})`); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/maps|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { ctx, page, bad, errors };
}

async function scanViewport(engine, browser, [label, w, h, mobile]) {
  const { ctx, page, bad, errors } = await newPage(browser, w, h, mobile);
  await page.goto(URL_, { waitUntil: 'load' });
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += Math.round(h * 0.8)) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  // fuerza la carga de toda la galería
  await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')));
  await page.waitForLoadState('networkidle').catch(() => {});
  const img = await page.evaluate(() => {
    const all = [...document.images];
    const broken = all.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
    const missing = document.querySelectorAll('.media.is-missing').length;
    const zero = all.filter((i) => i.closest('.media') && !i.closest('[hidden]') && i.naturalWidth && (i.getBoundingClientRect().height < 8 || i.getBoundingClientRect().width < 8)).length;
    const distorted = all.filter((i) => { const cs = getComputedStyle(i); return i.naturalWidth && cs.objectFit === 'fill' && i.closest('.media'); }).length;
    return { total: all.length, broken, missing, distorted, zero };
  });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(`[${engine}] ${label}: sin scroll horizontal`, sw <= w, `scrollWidth=${sw}`);
  ok(`[${engine}] ${label}: imágenes cargan y se ven`, !img.broken.length && !img.missing && !img.zero, `${img.total} img, rotas=${img.broken.length + img.missing}, tamaño0=${img.zero}${img.broken[0] ? ' ej: ' + img.broken[0] : ''}`);
  ok(`[${engine}] ${label}: sin recursos con error`, !bad.length, bad.slice(0, 3).join(' | '));
  ok(`[${engine}] ${label}: sin errores JS`, !errors.length, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

async function flows(engine, browser, mobile) {
  const [w, h] = mobile ? [390, 844] : [1440, 900];
  const tag = `[${engine}] ${mobile ? 'celular' : 'escritorio'}`;
  const { ctx, page, errors } = await newPage(browser, w, h, mobile);
  const step = async (n, name, fn) => { try { const r = await fn(); ok(`${tag} ${n}. ${name}`, r !== false, typeof r === 'string' ? r : ''); } catch (e) { ok(`${tag} ${n}. ${name}`, false, e.message.split('\n')[0]); } };
  const center = (sel) => page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);

  await step(1, 'Abrir portada', async () => { const r = await page.goto(URL_); return r.status() === 200 && (await page.locator('h1').isVisible()); });
  await step(2, 'Imagen de portada carga', async () => { await page.waitForTimeout(600); return page.evaluate(() => { const i = document.querySelector('.hero img'); if (!i) return 'sin imagen'; const r = i.getBoundingClientRect(); return i.complete && i.naturalWidth > 0 && r.height >= innerHeight * 0.6 && r.width >= innerWidth * 0.95 ? true : `natural=${i.naturalWidth} visible=${Math.round(r.width)}x${Math.round(r.height)}`; }); });
  if (mobile) await step(3, 'Menú móvil abre y cierra', async () => {
    await page.click('#burger'); await page.waitForTimeout(400);
    const open = await page.isVisible('#mnav');
    await page.click('#mnav a[href="#planes"]'); await page.waitForTimeout(900);
    const closed = await page.isHidden('#mnav');
    const y = await page.evaluate(() => document.getElementById('planes').getBoundingClientRect().top);
    return open && closed && y < 200 ? true : `abre=${open} cierra=${closed} top=${Math.round(y)}`;
  });
  else await step(3, 'Navbar escritorio lleva a la sección', async () => { await page.click('.nav__list a[href="#planes"]'); await page.waitForTimeout(1000); return page.evaluate(() => Math.abs(document.getElementById('planes').getBoundingClientRect().top) < 200); });
  await step(4, 'Pestañas de servicios', async () => {
    await center('#servicios .tabs'); await page.waitForTimeout(500);
    for (const id of ['nut', 'dat', 'com', 'ent']) {
      await page.click(`#t-${id}`); await page.waitForTimeout(250);
      const vis = await page.isVisible(`#p-${id}`), sel = await page.getAttribute(`#t-${id}`, 'aria-selected');
      const img = await page.evaluate((p) => { const i = document.querySelector(`#p-${p} img`); return !!i && i.naturalWidth > 0; }, id);
      if (!vis || sel !== 'true' || !img) return `falla en ${id}: visible=${vis} img=${img}`;
    }
  });
  await step(5, 'Selector de planes (precio, comparación y beneficios)', async () => {
    await center('#cfg'); await page.waitForTimeout(400);
    const pick = async (n, v) => page.click(`label:has(> input[name="${n}"][value="${v}"])`);
    await pick('plan', 'duo'); await pick('dias', '3'); await pick('dur', 'Semestral'); await pick('nut', 'Con Nutricionista');
    const price = (await page.innerText('#sumPrice')).replace(/\D/g, ''), cmpB = (await page.innerText('#cmpB')).replace(/\D/g, '');
    const inc = await page.locator('#sumInc li').count();
    await pick('plan', 'individual'); await pick('dias', '1'); await pick('dur', 'Mensual'); await pick('nut', 'Sin Nutricionista');
    const p2 = (await page.innerText('#sumPrice')).replace(/\D/g, '');
    return price === '2436000' && cmpB === '2436000' && inc === 7 && p2 === '60000' ? true : `duo3S+N=${price} cmp=${cmpB} inc=${inc} ind1M=${p2}`;
  });
  await step(6, 'Detalle del plan', async () => { await page.click('#detailBtn'); await page.waitForTimeout(400); const t = await page.innerText('#mTitle'); await page.keyboard.press('Escape'); await page.waitForTimeout(350); return /individual/i.test(t) && !(await page.evaluate(() => document.getElementById('modal').open)); });
  await step(7, 'Contratar = solo demo (sin navegar)', async () => { const u = page.url(); await page.click('#buyBtn'); await page.waitForTimeout(400); const txt = await page.innerText('#modal'); await page.keyboard.press('Escape'); await page.waitForTimeout(350); return page.url() === u && /demostración/i.test(txt); });
  await step(8, 'Desplegable de profesores', async () => {
    await center('.social'); await page.waitForTimeout(600);
    await page.click('#pcBtn'); await page.waitForTimeout(400);
    const vis = await page.isVisible('#pcPanel'), names = await page.innerText('#pcPanel');
    const covered = await page.evaluate(() => { const r = document.getElementById('pcPanel').getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + 40); return !(e && e.closest('#pcPanel')); });
    const inView = await page.evaluate(() => { const r = document.getElementById('pcPanel').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; });
    await page.keyboard.press('Escape'); await page.waitForTimeout(350);
    const closed = await page.isHidden('#pcPanel');
    return vis && /Álvaro/.test(names) && /William/.test(names) && /\+56 9 3403 8892/.test(names) && /\+56 9 7277 9125/.test(names) && !covered && inView && closed ? true : `vis=${vis} tapado=${covered} dentro=${inView} cierra=${closed}`;
  });
  await step(9, 'URLs de WhatsApp e Instagram exactas', async () => {
    const wa = await page.$$eval('.pc__wa', (a) => a.map((x) => x.getAttribute('href')));
    const ig = await page.getAttribute('.soc[href*="instagram"]', 'href');
    const gen = await page.getAttribute('.soc[href*="wa.me"]', 'href');
    return wa[0] === EXPECT.alvaro && wa[1] === EXPECT.william && ig === EXPECT.ig && gen === EXPECT.general ? true : JSON.stringify({ wa, ig, gen });
  });
  await step(10, 'Formulario valida y NO envía', async () => {
    await center('#leadForm'); const reqs = []; page.on('request', (r) => { if (r.method() !== 'GET') reqs.push(r.url()); });
    await page.click('#leadForm button[type=submit]'); await page.waitForTimeout(200);
    const errs = await page.locator('#leadForm .fld__err:not(:empty)').count();
    await page.fill('#fName', 'Prueba'); await page.fill('#fPhone', '+56 9 1234 5678'); await page.selectOption('#fGoal', 'Salud general');
    await page.click('#leadForm button[type=submit]'); await page.waitForTimeout(300);
    const msg = await page.innerText('#formOk');
    return errs === 3 && /no se enviaron/i.test(msg) && !reqs.length ? true : `errores=${errs} posts=${reqs.length}`;
  });
  await step(11, 'Preguntas frecuentes se expanden', async () => { await center('.acc'); const s = page.locator('.acc summary').nth(2); await s.click(); await page.waitForTimeout(450); return page.evaluate(() => document.querySelectorAll('.acc details')[2].open); });
  await step(12, 'Ubicación (mapa + cómo llegar)', async () => { await center('#map'); await page.waitForTimeout(900); const href = await page.getAttribute('a[href*="maps.app.goo.gl"]', 'href'); const iframe = await page.locator('#map iframe').count(); return href === 'https://maps.app.goo.gl/c57bSRTB8xeeejiK8' && iframe === 1; });
  await step(13, 'Footer visible y enlaces internos válidos', async () => { await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(400); const bad = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter((a) => a.getAttribute('href').length > 1 && !document.querySelector(a.getAttribute('href'))).length); return (await page.isVisible('.ftr')) && bad === 0; });
  await step(14, 'Recargar y sigue funcionando', async () => { await page.reload(); await page.waitForTimeout(500); await page.click(`label:has(> input[name="dias"][value="2"])`).catch(() => {}); return (await page.locator('h1').isVisible()) && !errors.length ? true : errors.join(' | '); });
  const shop = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => /methodlab\.cl\/(cart|products|checkout|account|policies|collections)/.test(h)));
  ok(`${tag} Sin enlaces a Shopify`, !shop.length, shop.join(' '));
  await ctx.close();
}

for (const engine of ENGINES) {
  const bt = { chromium, webkit, firefox }[engine];
  let browser;
  try { browser = await bt.launch(); } catch (e) { ok(`[${engine}] navegador disponible`, false, 'no instalado: npx playwright install ' + engine); continue; }
  for (const vp of VIEWPORTS) await scanViewport(engine, browser, vp);
  await flows(engine, browser, true);
  await flows(engine, browser, false);
  await browser.close();
}
console.log(`\nAuditoría: ${URL_}${MOCK ? '  (fotos simuladas)' : ''}\n`);
for (const [s, n, i] of results) console.log(`${s}  ${n}${i && s !== 'OK ' ? '  →  ' + i : ''}`);
console.log(`\n${results.length - failed}/${results.length} pruebas OK`);
process.exit(failed ? 1 : 0);
