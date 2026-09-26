const fs=require('fs'), path=require('path');
const { slugify } = require('./slug.cjs');

function parsePerfumes(source){
  // Formato fruver (productos.js): por peso (precioPorKg) o fijo (precioFijo + presentacion)
  if (source.includes('precioPorKg') || source.includes('precioFijo')) {
    const out = [];
    const pesoRe = /\{\s*id:\s*(\d+),\s*nombre:\s*'([^']+)',\s*categoria:\s*'([^']+)',\s*precioPorKg:\s*(\d+),\s*descripcion:\s*'([^']+)'[\s\S]*?emoji:\s*'([^']+)'/g;
    const fijoRe = /\{\s*id:\s*(\d+),\s*nombre:\s*'([^']+)',\s*categoria:\s*'([^']+)',\s*tipo:\s*'fijo',\s*precioFijo:\s*(\d+),\s*presentacion:\s*'([^']+)'/g;
    let m;
    while ((m = pesoRe.exec(source)) !== null) {
      const [, id, nombre, categoria, precioPorKg, descripcion, emoji] = m;
      out.push({
        id: Number(id), nombre, marca: 'Fruver El Granjero', precio: Number(precioPorKg),
        categoria, genero: '', ml: 0, stock: 999, descripcion,
        notas: { salida: [], corazon: [], fondo: [] },
        slug: slugify(nombre), imagenVar: null, importPath: null,
        sku: `FRUVER-${id}`, unidad: 'kg', emoji,
      });
    }
    while ((m = fijoRe.exec(source)) !== null) {
      const [, id, nombre, categoria, precioFijo, presentacion] = m;
      out.push({
        id: Number(id), nombre, marca: 'Fruver El Granjero', precio: Number(precioFijo),
        categoria, genero: '', ml: 0, stock: 999, descripcion: presentacion,
        notas: { salida: [], corazon: [], fondo: [] },
        slug: slugify(nombre), imagenVar: null, importPath: null,
        sku: `FRUVER-${id}`, unidad: presentacion, emoji: '',
      });
    }
    if (out.length > 0) return out.sort((a, b) => a.id - b.id);
  }

  // Formato legacy perfumes (marca, genero, ml, notas)
  const perfumes=[];
  const productRegex=/\{\s*id:\s*(\d+),\s*nombre:\s*"([^"]+)",\s*marca:\s*"([^"]+)",\s*precio:\s*(\d+),\s*categoria:\s*"([^"]+)",\s*genero:\s*"([^"]+)",\s*ml:\s*(\d+),\s*stock:\s*(\d+),\s*descripcion:\s*"([^"]+)"[\s\S]*?imagen:\s*(\w+)(?:,[\s\S]*?imagenes:\s*\[([^\]]*)\])?/g;
  const importMap={};
  const importRegex=/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let im;
  while((im=importRegex.exec(source))!==null){
    importMap[im[1]]=im[2];
  }
  let m;
  while((m=productRegex.exec(source))!==null){
    const [, id, nombre, marca, precio, categoria, genero, ml, stock, descripcion, imagenVar] = m;
    const blockStart=m.index;
    const blockEnd=source.indexOf('},', blockStart)+2;
    const block=source.slice(blockStart, blockEnd+800);
    const notasMatch=block.match(/notas:\s*\{\s*salida:\s*\[([^\]]*)\],\s*corazon:\s*\[([^\]]*)\],\s*fondo:\s*\[([^\]]*)\]/);
    let notas={ salida:[], corazon:[], fondo:[] };
    if(notasMatch){
      const parseList=s=>[...s.matchAll(/"([^"]+)"/g)].map(x=>x[1]);
      notas={ salida:parseList(notasMatch[1]), corazon:parseList(notasMatch[2]), fondo:parseList(notasMatch[3]) };
    }
    perfumes.push({
      id:Number(id), nombre, marca, precio:Number(precio), categoria, genero, ml:Number(ml), stock:Number(stock), descripcion,
      notas, slug:slugify(nombre), imagenVar, importPath:importMap[imagenVar]||null,
      sku:`LAMAAR-${id}`,
    });
  }
  return perfumes;
}

function loadPerfumes(){
  // Fruver primero: productos.js. Fallback legacy: perfumes.js
  const prodPath = path.join(__dirname,'..','..','src/data/productos.js');
  const legacyPath = path.join(__dirname,'..','..','src/data/perfumes.js');
  try {
    if (fs.existsSync(prodPath)) {
      const source = fs.readFileSync(prodPath,'utf8');
      const parsed = parsePerfumes(source);
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  const source=fs.readFileSync(legacyPath,'utf8');
  return parsePerfumes(source);
}

module.exports={ parsePerfumes, loadPerfumes, slugify };
