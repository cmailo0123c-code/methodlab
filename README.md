# Method Lab — rediseño (estático, vanilla)

HTML/CSS/JS sin dependencias. Fuentes self-hosted (Barlow Condensed 600/700 + Manrope variable, subset latin).
Imágenes: se sirven desde el CDN de Shopify de methodlab.cl (`?width=` → WebP automático).

## Compra (Shopify)
- Configurador con las 64 variantes reales (2 productos × 4 días × 4 duraciones × con/sin nutri), precios al 9-oct-2026.
- "Contratar plan" → `https://methodlab.cl/cart/{variant_id}:1` (checkout oficial de Shopify).
- Al acercarse a #planes intenta leer `/products/<handle>.js` en vivo; si CORS lo bloquea, usa los datos embebidos en `app.js`.
- Si cambian precios en Shopify y el sitio está fuera del dominio de la tienda: actualizar el array de precios en `app.js`.

## PENDIENTE DE APROBACIÓN (no publicar sin confirmar)
1. Horario: el home actual dice "5:00–23:00 todos los días"; footer y fichas de producto dicen L–V 6:00–23:00 / S-D-festivos 9:00–19:00. Se usó el segundo.
2. Dirección: la página de contacto legal dice "Bilbao 2930"; el resto del sitio, "2970". Se usó 2970.
3. La página /pages/nuestros-planes-method-lab muestra ambos planes como "Agotado", pero la API de Shopify los da disponibles. Revisar inventario/tema.
4. Promos "Matrícula gratis" y "hasta 3 cuotas sin interés": tomadas del sitio actual, confirmar vigencia.
5. Fotos: asignadas por nombre de archivo sin poder verlas. Revisar encuadre (object-position) y alts de cada una. Hero = DSC02559.jpg.
6. Se eliminó "Resultados garantizados" (promesa no verificable).
7. Testimonios: sección oculta (#testimonios) hasta tener testimonios reales y autorizados.
8. Redes sociales: no se encontraron en el sitio. Agregar Instagram verificado al footer.
9. Logo: solo existía en raster 300×161 (se hizo PNG/WebP transparente). Pedir el SVG original.
10. Medios de pago: el sitio no los lista; la FAQ remite al checkout.
