# Method Lab — DEMO del nuevo sitio

Demostración visual y funcional. **Sin conexión a Shopify**: ningún botón compra, redirige a la tienda ni envía datos.

## Subir a GitHub / Vercel
Sube el contenido de esta carpeta (index.html en la raíz). Vercel lo publica sin configuración.

## Imágenes
Las 12 fotos/gráficas son las ORIGINALES de methodlab.cl, servidas por el CDN de Shopify
(`?width=` redimensiona y entrega WebP/AVIF automáticamente). No hay rutas locales que puedan dar 404.
Opcional, para no depender de la tienda: `npm install && npm run media` genera `assets/img/`;
luego regenerar el HTML con `src/build.py` (detecta `assets/img/media.json` y cambia a archivos locales).

## Pruebas automáticas
```
npm install
npx playwright install chromium webkit firefox
npm run probar
```
Prueba el sitio publicado en 9 tamaños de pantalla (360 a 1920 px, incluye horizontal) y los 14 flujos
principales en Chromium, WebKit (Safari) y Firefox. `npm run verificar` = solo Chromium.

## Qué es demo
- "Contratar plan" / "Ver detalle": modal con la selección y el aviso de demostración. Sin carrito, checkout ni pedidos.
- Formulario de evaluación y newsletter: validan, pero no envían ni guardan nada (lo dicen en pantalla).
- `<meta name="robots" content="noindex">`: quitar al pasar a producción.
- Sin enlaces a políticas de la tienda real (evita confundirlas con la demo).

## Contacto
- Instagram oficial: https://www.instagram.com/methodlabgym/ (sección contacto, footer y datos estructurados).
- "Contactar profesores": desplegable (hoja inferior en móvil) con Prof. Álvaro +56 9 3403 8892 y Prof. William +56 9 7277 9125: WhatsApp directo (wa.me), llamada y copiar número.

## Datos
- Precios: las 64 combinaciones (2 planes × 4 frecuencias × 4 duraciones × con/sin nutri) copiadas de methodlab.cl el 9-oct-2026, en `app.js`. Si no hay precio, se muestra "Precio por confirmar".
- El "valor mensual" solo aparece cuando el total es exactamente N × el precio mensual publicado.

## Pendientes de confirmar con el cliente
1. Horario: inicio dice 5:00–23:00 todos los días; el resto del sitio L–V 6–23 / S-D-feriados 9–19 (se muestra este, marcado).
2. Dirección: 2970 (confirmada) vs. 2930 (página legal), Andrés Bello 2909 (ficha plan individual), "Las Condes" (meta de la ficha).
3. Promos "Matrícula gratis" y "3 cuotas sin interés": vigencia.
4. "Planes de 2 a 3 personas": solo existe el de 2 (colección de 3 personas vacía).
5. "Resultados garantizados" se renombró a "Un enfoque integral".
6. Fichas de producto muestran "Agotado" en todas las variantes.

## Material que no existe en el sitio original
- Videos: ninguno publicado → no hay sección de video.
- Testimonios: ninguno publicado → no hay sección de testimonios.
- Logo vectorial (SVG): solo hay raster 300×161.
- No usadas a propósito: PLANPERSONALIZADO8CLASES / PLANSTANDARD192CLASES (texto "8/192 clases" no verificado) y el banner Sin_titulo_2000x1080 (se archivan en `assets/img/originales/`).
- Portada: foto DSC02559 (entrenamiento con coach). Las gráficas PNG se muestran completas (object-fit: contain) para no cortar texto.
