# Method Lab — DEMO del nuevo sitio

Demostración visual y funcional. **Sin conexión a Shopify**: ningún botón compra, redirige a la tienda ni envía datos.

## Subir a GitHub / Vercel
Sube el contenido de esta carpeta (index.html en la raíz). Vercel lo publica sin configuración.

## Imágenes reales (hacer 1 vez)
```
npm install
npm run media
```
Descarga los 12 originales de methodlab.cl y genera AVIF/WebP/JPG (640–1920 px) en `assets/img/`. Después sube `assets/img/` al repo.
Mientras no lo hagas, la página carga las mismas fotos desde methodlab.cl automáticamente (nunca se ve rota).

## Qué es demo
- "Contratar plan" / "Ver detalle": modal con la selección y el aviso de demostración. Sin carrito, checkout ni pedidos.
- Formulario de evaluación y newsletter: validan, pero no envían ni guardan nada (lo dicen en pantalla).
- `<meta name="robots" content="noindex">`: quitar al pasar a producción.
- Botón "Puntos por confirmar" (barra superior): resalta en la página todo lo que hay que validar con el cliente.

## Datos
- Precios: las 64 combinaciones (2 planes × 4 frecuencias × 4 duraciones × con/sin nutri) copiadas de methodlab.cl el 9-oct-2026, en `app.js`. Si no hay precio, se muestra "Precio por confirmar".
- El "valor mensual" solo aparece cuando el total es exactamente N × el precio mensual publicado.

## Pendientes de confirmar con el cliente
1. Horario: inicio dice 5:00–23:00 todos los días; el resto del sitio L–V 6–23 / S-D-feriados 9–19 (se muestra este, marcado).
2. Dirección: 2970 (confirmada) vs. 2930 (página legal), Andrés Bello 2909 (ficha plan individual), "Las Condes" (meta de la ficha).
3. Promos "Matrícula gratis" y "3 cuotas sin interés": vigencia.
4. "Planes de 2 a 3 personas": solo existe el de 2 (colección de 3 personas vacía).
5. "Resultados garantizados" se renombró a "Un enfoque integral".
6. Redes sociales: no existen en el sitio actual.
7. Fichas de producto muestran "Agotado" en todas las variantes.

## Material que no existe en el sitio original
- Videos: ninguno. Componente listo y oculto en #instalaciones (`assets/video/method-lab.mp4`).
- Testimonios: ninguno. Sección #testimonios lista y oculta.
- Logo vectorial (SVG): solo hay raster 300×161.
- No usadas a propósito: PLANPERSONALIZADO8CLASES / PLANSTANDARD192CLASES (texto "8/192 clases" no verificado) y el banner Sin_titulo_2000x1080 (se archivan en `assets/img/originales/`).
- Fotos asignadas por su sección original; revisar encuadres una vez descargadas (la portada es un PNG que podría tener texto).
