/**
 * prerender-fruver.cjs — Genera HTML estático con contenido real para buscadores y bots de IA.
 *
 * Crea en dist/:
 *  - catalogo/index.html            → todos los productos con precio
 *  - producto/<slug>/index.html     → una página por producto (con JSON-LD Product)
 *  - about/ contact/ index.html     → páginas informativas
 *  - __markdown/*.md                → versión en texto para agentes de IA
 *  - fotos/<id>.<ext>               → fotos de productos con URL pública
 *
 * Cada página usa la misma plantilla dist/index.html, así que la app de React
 * sigue funcionando igual: al cargar, reemplaza el contenido estático.
 */

const fs = require('fs');
const path = require('path');
const { SITE_URL, SITE_NAME, NAP } = require('./utils/site.cjs');
const { loadPerfumes } = require('./utils/parsePerfumes.cjs');

const DIST = path.join(__dirname, '..', 'dist');
const CATEGORIAS = ['Frutas', 'Verduras', 'Tubérculos', 'Hierbas', 'Lácteos', 'Despensa', 'Bebidas'];
const WA = `https://wa.me/${NAP.whatsapp}`;

const productos = loadPerfumes();
const plantilla = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const money = (n) => moneda.format(n);

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escribir(rel, contenido) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contenido, 'utf8');
}

function precioTexto(p) {
  return p.tipo === 'fijo'
    ? `${money(p.precioFijo)} por ${p.presentacion}`
    : `${money(p.precioPorKg)} el kilo (se vende por peso)`;
}

function fotoUrl(p) {
  return p.fotoArchivo ? `${SITE_URL}/fotos/${p.id}${path.extname(p.fotoArchivo).toLowerCase()}` : null;
}

function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

/** Inserta título, metas, canonical y contenido en la plantilla de React. */
function pagina({ title, description, ruta, body, jsonLd = [] }) {
  let html = plantilla;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', `${SITE_URL}${ruta}`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${SITE_URL}${ruta}" />`);

  const scripts = jsonLd.map((obj) => `    <script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n');
  if (scripts) html = html.replace('</head>', `${scripts}\n  </head>`);

  const inicio = html.indexOf('<div id="root">');
  const fin = html.indexOf('</div>', inicio);
  html = html.slice(0, inicio) + `<div id="root">${body}` + html.slice(fin);
  return html;
}

// ───── Fotos públicas ─────
let fotos = 0;
for (const p of productos) {
  if (!p.fotoPath || !fs.existsSync(p.fotoPath)) continue;
  const destino = path.join(DIST, 'fotos', `${p.id}${path.extname(p.fotoArchivo).toLowerCase()}`);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(p.fotoPath, destino);
  fotos++;
}

// ───── Productos ─────
for (const p of productos) {
  const ruta = `/producto/${p.slug}`;
  const title = `${p.nombre} — ${precioTexto(p)} | ${SITE_NAME}`;
  const description = `${p.nombre} en Fruver El Granjero, Manizales: ${precioTexto(p)}. ${p.descripcion}`.slice(0, 160);
  const foto = fotoUrl(p);

  const oferta = p.tipo === 'fijo'
    ? { '@type': 'Offer', priceCurrency: 'COP', price: String(p.precioFijo), availability: 'https://schema.org/InStock', url: `${SITE_URL}${ruta}` }
    : {
        '@type': 'Offer',
        priceCurrency: 'COP',
        price: String(p.precioPorKg),
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}${ruta}`,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(p.precioPorKg),
          priceCurrency: 'COP',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'KGM' },
        },
      };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    description: p.descripcion,
    category: p.categoria,
    sku: String(p.id),
    ...(foto ? { image: [foto] } : {}),
    offers: { ...oferta, seller: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL } },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo` },
      { '@type': 'ListItem', position: 3, name: p.categoria, item: `${SITE_URL}/catalogo?categoria=${encodeURIComponent(p.categoria)}` },
      { '@type': 'ListItem', position: 4, name: p.nombre, item: `${SITE_URL}${ruta}` },
    ],
  };

  const relacionados = productos
    .filter((x) => x.categoria === p.categoria && x.id !== p.id)
    .slice(0, 8)
    .map((x) => `<li><a href="/producto/${x.slug}">${esc(x.nombre)}</a> — ${esc(precioTexto(x))}</li>`)
    .join('');

  const body = `
<main style="max-width:960px;margin:0 auto;padding:24px;font-family:Montserrat,sans-serif;color:#334155;line-height:1.6">
  <nav aria-label="breadcrumb" style="font-size:13px"><a href="/">Inicio</a> › <a href="/catalogo">Catálogo</a> › <a href="/catalogo?categoria=${encodeURIComponent(p.categoria)}">${esc(p.categoria)}</a> › ${esc(p.nombre)}</nav>
  <article style="display:flex;gap:24px;flex-wrap:wrap;margin-top:16px">
    ${foto ? `<img src="${foto}" alt="${esc(p.nombre)} — ${esc(p.categoria)} Fruver El Granjero" width="400" height="400" style="width:100%;max-width:400px;height:auto;object-fit:contain;border-radius:16px;border:1px solid #e7e5e4">` : `<div style="font-size:120px">${esc(p.emoji)}</div>`}
    <div style="flex:1;min-width:260px">
      <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#16a34a;font-weight:600">${esc(p.categoria)}</p>
      <h1 style="font-family:'Playfair Display',serif;font-size:32px;color:#111;margin:8px 0">${esc(p.nombre)}</h1>
      <p style="font-size:22px;font-weight:700;color:#111">${esc(precioTexto(p))}</p>
      <p>${esc(p.descripcion)}</p>
      ${p.origen ? `<p>Origen: ${esc(p.origen)}</p>` : ''}
      <p>Disponible hoy. Arma tu mercado en el catálogo y confirma por WhatsApp <a href="${WA}">${esc(NAP.telephone)}</a>.</p>
      <p><a href="/catalogo" style="color:#16a34a;font-weight:600">Ver todo el catálogo</a></p>
    </div>
  </article>
  ${relacionados ? `<section style="margin-top:32px"><h2 style="font-family:'Playfair Display',serif;color:#111">Más ${esc(p.categoria.toLowerCase())}</h2><ul>${relacionados}</ul></section>` : ''}
</main>`;

  escribir(`producto/${p.slug}/index.html`, pagina({ title, description, ruta, body, jsonLd: [productSchema, breadcrumb] }));
}

// ───── Catálogo ─────
const porCategoria = CATEGORIAS.map((cat) => {
  const items = productos.filter((p) => p.categoria === cat);
  if (!items.length) return '';
  const lis = items.map((p) => `<li><a href="/producto/${p.slug}">${esc(p.nombre)}</a> — ${esc(precioTexto(p))}</li>`).join('');
  return `<section><h2 style="font-family:'Playfair Display',serif;color:#111;margin-top:24px">${cat} (${items.length})</h2><ul>${lis}</ul></section>`;
}).join('');

const catalogoBody = `
<main style="max-width:900px;margin:0 auto;padding:24px;font-family:Montserrat,sans-serif;color:#334155;line-height:1.6">
  <h1 style="font-family:'Playfair Display',serif;font-size:32px;color:#111">Catálogo de Fruver El Granjero en Manizales</h1>
  <p>${productos.length} productos: frutas, verduras, tubérculos, hierbas, lácteos, despensa y bebidas. Los productos por peso se pagan proporcional al kilo; los de presentación fija (bandeja, unidad, litro) tienen precio fijo.</p>
  ${porCategoria}
</main>`;

const catalogoDesc = `Catálogo completo de ${productos.length} productos del Fruver El Granjero en Manizales: frutas, verduras, tubérculos, lácteos y despensa con precio en COP. Pide por WhatsApp.`;
escribir('catalogo/index.html', pagina({
  title: `Catálogo — ${productos.length} productos frescos | ${SITE_NAME}`,
  description: catalogoDesc,
  ruta: '/catalogo',
  body: catalogoBody,
  jsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: productos.slice(0, 50).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/producto/${p.slug}`,
      name: p.nombre,
    })),
  }],
}));

// ───── Páginas informativas ─────
const horario = 'Lunes a sábado 8:00 a.m. a 9:00 p.m.; domingos 8:00 a.m. a 8:00 p.m.';

escribir('about/index.html', pagina({
  title: `Sobre nosotros | ${SITE_NAME}`,
  description: 'Fruver El Granjero en Manizales: frutas, verduras y productos frescos todos los días. Frente al Mallplaza.',
  ruta: '/about',
  body: `<main style="max-width:800px;margin:0 auto;padding:24px;font-family:Montserrat,sans-serif;color:#334155;line-height:1.7">
  <h1 style="font-family:'Playfair Display',serif;color:#111">Sobre Fruver El Granjero</h1>
  <p>Somos un fruver de Manizales con productos frescos todos los días: frutas, verduras, tubérculos, hierbas, lácteos, despensa y bebidas. Puedes armar tu mercado en el catálogo y confirmarlo por WhatsApp.</p>
  <p>Dirección: ${esc(NAP.address.full)}. Horario: ${esc(horario)}.</p>
</main>`,
}));

escribir('contact/index.html', pagina({
  title: `Contacto | ${SITE_NAME}`,
  description: `Contacta a Fruver El Granjero en Manizales: WhatsApp ${NAP.telephone}, ${NAP.address.streetAddress}, frente al Mallplaza.`,
  ruta: '/contact',
  body: `<main style="max-width:800px;margin:0 auto;padding:24px;font-family:Montserrat,sans-serif;color:#334155;line-height:1.7">
  <h1 style="font-family:'Playfair Display',serif;color:#111">Contacto</h1>
  <p>WhatsApp para pedidos: <a href="${WA}">${esc(NAP.telephone)}</a></p>
  <p>Correo: ${esc(NAP.email)}</p>
  <p>Dirección: ${esc(NAP.address.full)}</p>
  <p>Horario: ${esc(horario)}</p>
</main>`,
}));

// ───── Markdown para agentes de IA ─────
const md = [];
md.push(`# ${SITE_NAME} — Frutas y verduras frescas en Manizales\n\n> ${NAP.description}\n`);
md.push(`## Contacto\n\n- Dirección: ${NAP.address.full}\n- WhatsApp: ${NAP.telephone}\n- Correo: ${NAP.email}\n- Horario: ${horario}\n`);
md.push(`## Catálogo (${productos.length} productos)\n\n${SITE_URL}/catalogo\n`);
escribir('__markdown/home.md', md.join('\n'));

const catMd = CATEGORIAS.map((cat) => {
  const items = productos.filter((p) => p.categoria === cat);
  if (!items.length) return '';
  return `## ${cat}\n\n` + items.map((p) => `- [${p.nombre}](${SITE_URL}/producto/${p.slug}) — ${precioTexto(p)}`).join('\n');
}).join('\n\n');
escribir('__markdown/catalogo.md', `# Catálogo — ${SITE_NAME}\n\n${catMd}\n`);

for (const p of productos) {
  escribir(`__markdown/producto/${p.slug}.md`, [
    `# ${p.nombre}`,
    '',
    `- Categoría: ${p.categoria}`,
    `- Precio: ${precioTexto(p)}`,
    p.origen ? `- Origen: ${p.origen}` : null,
    `- URL: ${SITE_URL}/producto/${p.slug}`,
    '',
    p.descripcion,
    '',
    `Pedidos por WhatsApp: ${NAP.telephone}`,
    '',
  ].filter((l) => l !== null).join('\n'));
}

escribir('__markdown/about.md', `# Sobre ${SITE_NAME}\n\n${NAP.description}\n\nDirección: ${NAP.address.full}\n`);
escribir('__markdown/contact.md', `# Contacto — ${SITE_NAME}\n\nWhatsApp: ${NAP.telephone}\nCorreo: ${NAP.email}\nDirección: ${NAP.address.full}\nHorario: ${horario}\n`);
escribir('__markdown/404.md', `# Página no encontrada\n\nBusca en el catálogo: ${SITE_URL}/catalogo\n`);

console.log(`✓ Prerender: ${productos.length} productos en dist/producto/*/index.html`);
console.log(`✓ Prerender: catálogo en dist/catalogo/index.html y páginas about/contact`);
console.log(`✓ Markdown: dist/__markdown/ (${productos.length + 6} archivos)`);
console.log(`✓ Fotos públicas: ${fotos} en dist/fotos/`);
