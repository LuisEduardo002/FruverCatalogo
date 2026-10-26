const fs = require('fs');
const path = require('path');
const { slugify } = require('./slug.cjs');

const ROOT = path.join(__dirname, '..', '..');

/** Mapa id -> archivo de foto, leído de src/data/imagenes.js */
function parseImageMap(source) {
  const vars = {};
  for (const m of source.matchAll(/import\s+(\w+)\s+from\s+'\.\.\/IMAGENES\/([^']+)'/g)) {
    vars[m[1]] = m[2];
  }
  const map = {};
  for (const m of source.matchAll(/^\s+(\d+):\s+(\w+),/gm)) {
    if (vars[m[2]]) map[m[1]] = vars[m[2]];
  }
  return map;
}

/** Lee src/data/productos.js (sin ejecutarlo) y devuelve la lista normalizada. */
function parseProductos(source, imageMap) {
  const blocks = source.split(/\n  \{\n/).slice(1);
  const out = [];
  for (const b of blocks) {
    const str = (k) => { const m = b.match(new RegExp(`\\b${k}: '([^']*)'`)); return m ? m[1] : null; };
    const num = (k) => { const m = b.match(new RegExp(`\\b${k}: (\\d+)`)); return m ? Number(m[1]) : null; };
    const id = num('id');
    const nombre = str('nombre');
    if (!id || !nombre) continue;
    const fijo = /tipo: 'fijo'/.test(b);
    const precioPorKg = num('precioPorKg');
    const precioFijo = num('precioFijo');
    const foto = imageMap[String(id)] || null;
    out.push({
      id,
      nombre,
      marca: 'Fruver El Granjero',
      categoria: str('categoria') || 'Otros',
      tipo: fijo ? 'fijo' : 'peso',
      precioPorKg,
      precioFijo,
      presentacion: str('presentacion'),
      precio: fijo ? precioFijo : precioPorKg,
      descripcion: str('descripcion') || '',
      emoji: str('emoji') || '',
      origen: str('origen') || '',
      destacado: /destacado: true/.test(b),
      slug: slugify(nombre),
      fotoArchivo: foto,
      fotoPath: foto ? path.join(ROOT, 'src', 'IMAGENES', foto) : null,
    });
  }
  return out;
}

function loadPerfumes() {
  const prodSource = fs.readFileSync(path.join(ROOT, 'src', 'data', 'productos.js'), 'utf8');
  const imgSource = fs.readFileSync(path.join(ROOT, 'src', 'data', 'imagenes.js'), 'utf8');
  return parseProductos(prodSource, parseImageMap(imgSource));
}

module.exports = { parseProductos, parseImageMap, loadPerfumes, slugify };
