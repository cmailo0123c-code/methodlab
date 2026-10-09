#!/usr/bin/env node
/**
 * Descarga las imágenes ORIGINALES publicadas en methodlab.cl y genera
 * versiones optimizadas (AVIF, WebP, JPG) en assets/img/.
 *
 * Uso (una vez, desde la raíz del proyecto):
 *   npm install
 *   npm run media
 *
 * Luego sube assets/img/ a GitHub. Hasta que lo hagas, la página usa
 * automáticamente los originales del CDN de methodlab.cl como respaldo.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'img');
const ORIG = join(OUT, 'originales');
const BASE = process.env.MEDIA_BASE || 'https://methodlab.cl/cdn/shop/files/';
const WIDTHS = [640, 960, 1440, 1920];

// slug → archivo original en methodlab.cl (inventario del 9-oct-2026)
const USADAS = {
  'hero': '969AC74D-E83E-4369-8819-C2848CB5AFB6.png',          // portada del inicio
  'entrenamiento': '253135E8-81C7-4795-A8B3-30DAE5DB9956_1_105_c.jpg',
  'nutricion': 'IMG_0531.jpg',
  'ciencia-datos': 'FC07D2CD-1DAD-43F9-BD7D-C104E3D1C16A_1_105_c.jpg',
  'comunidad': 'fec90185-27e8-4796-83c6-6f019fef1cac.jpg',
  'plan-individual': 'DSC02559.jpg',
  'plan-dos-personas': 'FE983604-97DC-4080-A6BF-4F7F37512CF7.png',
  'fuerza-ciencia': '16E110FD-177C-42DE-9BFD-8E6EF155D771.jpg',
  'entrenamiento-nutricion': '89CE79A5-D50B-42F1-9094-96A183631990.jpg',
  'ambiente-premium': '9934C035-FA24-4DC3-AF19-5C3D1032841E.jpg',
  'horarios-flexibles': '76297A7B-631C-476D-81E1-90026F6CD0DD_4_5005_c.jpg',
  'resultados': 'FC07D2CD-1DAD-43F9-BD7D-C104E3D1C16A.jpg',
};
// Se archivan sin usar: gráficas con texto no verificado ("8 clases", "192 clases") y banner
const ARCHIVO = [
  'Sin_titulo_2000_x_1080_px.png',
  'PLANPERSONALIZADO8CLASESMethodLabGym.png',
  'PLANSTANDARD192CLASESMethodLabGym_1.png',
];

await mkdir(ORIG, { recursive: true });
const manifest = {}, fallas = [];

async function bajar(file) {
  const r = await fetch(BASE + encodeURIComponent(file));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(join(ORIG, file), buf);
  return buf;
}

for (const [slug, file] of Object.entries(USADAS)) {
  try {
    const buf = await bajar(file);
    const img = sharp(buf, { failOn: 'none' }).rotate(); // respeta orientación EXIF
    const meta = await img.metadata();
    for (const w of WIDTHS) {
      const r = img.clone().resize({ width: w, withoutEnlargement: true });
      await Promise.all([
        r.clone().avif({ quality: 52, effort: 6 }).toFile(join(OUT, `${slug}-${w}.avif`)),
        r.clone().webp({ quality: 78, effort: 6 }).toFile(join(OUT, `${slug}-${w}.webp`)),
        r.clone().flatten({ background: '#0a0a0a' }).jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(join(OUT, `${slug}-${w}.jpg`)),
      ]);
    }
    const ow = meta.autoOrient?.width ?? meta.width, oh = meta.autoOrient?.height ?? meta.height;
    manifest[slug] = { original: file, width: ow, height: oh };
    console.log(`✓ ${slug.padEnd(24)} ${ow}×${oh}  ${file}`);
  } catch (e) {
    fallas.push(`${slug} (${file}): ${e.message}`);
    console.error(`✗ ${slug}: ${e.message}`);
  }
}
for (const file of ARCHIVO) {
  try { await bajar(file); console.log(`· archivado ${file}`); }
  catch (e) { fallas.push(`${file}: ${e.message}`); }
}
await writeFile(join(OUT, 'media.json'), JSON.stringify({ generado: new Date().toISOString(), imagenes: manifest, fallas }, null, 2));
console.log(fallas.length ? `\nTerminado con ${fallas.length} falla(s). Ver assets/img/media.json` : '\nListo. Sube la carpeta assets/img a GitHub.');
process.exit(fallas.length ? 1 : 0);
