/* METHOD LAB — carrito local (sin dependencias).
   Guarda los planes elegidos en este navegador; el pago se hace en el checkout oficial de Shopify. */
(() => {
  'use strict';
  const KEY = 'ml_cart_v1';
  const STORE = 'https://methodlab.cl';
  const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(c) ? c : []; } catch (_) { return []; } };
  const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (_) {} badge(); dispatchEvent(new CustomEvent('ml:cart')); };
  const count = (c = read()) => c.reduce((n, i) => n + i.qty, 0);
  const total = (c = read()) => c.reduce((n, i) => n + i.price * i.qty, 0);

  function add(item) {
    const c = read(), found = c.find((i) => i.id === item.id);
    if (found) found.qty = Math.min(found.qty + 1, 5); else c.push({ ...item, qty: 1 });
    write(c);
  }
  function setQty(id, qty) {
    let c = read();
    c = qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 5) } : i));
    write(c);
  }
  // Permalink oficial de Shopify: crea el carrito con estas variantes y abre el checkout
  const checkoutUrl = (c = read()) => `${STORE}/cart/${c.map((i) => `${i.id}:${i.qty}`).join(',')}`;

  function badge() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach((b) => {
      b.textContent = n; b.hidden = n === 0;
      b.closest('a')?.setAttribute('aria-label', n ? `Ver carrito (${n} ${n === 1 ? 'plan' : 'planes'})` : 'Ver carrito');
    });
  }
  function bump() {
    document.querySelectorAll('[data-cart-count]').forEach((b) => { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); });
  }

  // Sincroniza si el carrito cambia en otra pestaña
  addEventListener('storage', (e) => { if (e.key === KEY) { badge(); dispatchEvent(new CustomEvent('ml:cart')); } });
  document.addEventListener('DOMContentLoaded', badge);
  window.MLCart = { read, add, setQty, count, total, checkoutUrl, badge, bump, clp };
})();
