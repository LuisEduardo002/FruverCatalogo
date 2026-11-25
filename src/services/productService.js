/**
 * productService.js — Service Layer del Fruver
 *
 * Los precios salen de GridPOS por /api/precios (función de Vercel).
 * Si esa llamada falla, se usan los precios del archivo local (respaldo).
 *
 * - Por peso: precioPorKg (precio por 1000 g)
 * - Fijos: precioFijo + presentacion
 */

import { productos } from "../data/productos";
import slugify from "../utils/slug";

/* ------------------------------------------------------------------ */
/* Precios desde GridPOS                                               */
/* ------------------------------------------------------------------ */

const TTL_MS = 60 * 1000; // refresca cada minuto
let priceState = { at: 0, map: null, promise: null };

function norm(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(kg|und|unidad|unidades|g|gr|lt|ml|lb|oz|x|de|del|en|con|a|el|la|los|las|y)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Nombres de la web que no coinciden literalmente con GridPOS.
 * Clave: nombre de la web normalizado. Valor: nombre en GridPOS.
 */
const ALIASES = {
  arveja: "ALVERJA KG",
  zucchini: "ZUKINI KG",
  "lechuga batavia": "BATAVIA UND",
  "bulto papa": "PAPA PARDA X BULTO",
  "medio bulto papa": "PAPA PARDA 1/2 BTO",
  "uva roja granel": "UVA ROJA X KG",
  "pina calada 500": "PIÑA CALADA BOLSA 500 GR",
  "pina calada 1": "PIÑA CALADA BOLSA 1KG",
  "zumo limon 350": "ZUMO DE LIMON 335ML",
  "zumo limon 1": "ZUMO DE LIMON 1000ML",
  "aji tubo": "AJI TUBO 120GR",
  "aji tubo grande": "AJI TUBO 120GR",
  "pasta ajo 250": "PASTA DE AJO 100GR",
  "panela atado 2": "PANELA REDONDA X 2UND",
  "uchuva sin desgranar": "OCHUBA SIN DESGRANAR X KG",
  "pepa borojo": "BOROJO MALLA 220G X UND",
  "arepas naturales 5": "AREPAS AL CARBON",
  "arepas naturales x5": "AREPAS AL CARBON",
  "arepas mi abuela extraqueso 4": "AREPAS DE QUESO",
  "arepas mi abuela extraqueso x4": "AREPAS DE QUESO",
  "arepas congo": "AREPAS CONGOLO",
  "panela atado x2": "PANELA REDONDA X 2UND",
  "aloe vera": "SAVILA KG",
  sabila: "SAVILA KG",
  "leche deslactosada 1": "LECHE DESLACTOSADA",
  "leche entera 1": "LECHE ENTERA",
  "mani grande": "MANI GRAND",
  "manzana roja": "MANZANA UND",
  "pulpa maracuya 400": "PULPA MARACUYA",
};

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json && Array.isArray(json.products) ? json : null;
  } catch {
    return null;
  }
}

function loadPrices() {
  if (priceState.map && Date.now() - priceState.at < TTL_MS) {
    return Promise.resolve(priceState.map);
  }
  if (priceState.promise) return priceState.promise;

  priceState.promise = (async () => {
    // 1) API en vivo (requiere variables de entorno en Vercel)
    let json = await fetchJson("/api/precios");
    // 2) Respaldo estático generado por el sync local
    if (!json) json = await fetchJson("/precios.json");
    if (!json) throw new Error("sin precios");

    const map = new Map();
    for (const p of json.products) map.set(p.key || norm(p.name), p);
    priceState = { at: Date.now(), map, promise: null };
    return map;
  })().catch(() => {
    priceState = { at: 0, map: null, promise: null };
    return null;
  });

  return priceState.promise;
}

function findPrice(name, map) {
  if (!map) return null;
  const key = norm(name);
  if (map.has(key)) return map.get(key);

  const alias = ALIASES[key];
  if (alias) {
    const aliasKey = norm(alias);
    if (map.has(aliasKey)) return map.get(aliasKey);
  }

  // Coincidencia por prefijo (ej. "arandanos" → "arandanos x125 gr")
  let best = null;
  for (const candidate of map.keys()) {
    if (candidate === key) continue;
    if (candidate.startsWith(key + " ") || key.startsWith(candidate + " ")) {
      const diff = Math.abs(candidate.length - key.length);
      if (!best || diff < best.diff) best = { key: candidate, diff };
    }
  }
  return best ? map.get(best.key) : null;
}

function isFixed(product) {
  return product.tipo === "fijo" || product.precioFijo != null;
}

function applyPrice(product, hit) {
  if (!hit || !hit.price) return product;
  return isFixed(product)
    ? { ...product, precioFijo: hit.price }
    : { ...product, precioPorKg: hit.price };
}

async function withPrices(list) {
  const map = await loadPrices();
  if (!map) return list;
  return list.map((p) => applyPrice(p, findPrice(p.nombre, map)));
}

/** Fuerza a recargar precios (por si se quiere usar desde un botón). */
export function refreshPrices() {
  priceState = { at: 0, map: null, promise: null };
  return loadPrices();
}

/** Todos los productos del fruver, con precios vigentes. */
export function getAllProducts() {
  return withPrices(productos);
}

/** Busca por slug de URL o ID numérico. Ej: "tomate-chonto" o 1 */
export async function getProductById(idOrSlug) {
  const raw = String(idOrSlug).toLowerCase().trim();
  const byId = productos.find((p) => String(p.id) === raw);
  if (byId) {
    const [product] = await withPrices([byId]);
    return product;
  }
  const product = productos.find((p) => slugify(p.nombre) === raw);
  if (!product) return product;
  const [withPrice] = await withPrices([product]);
  return withPrice;
}

/** URL amigable: /producto/tomate-chonto */
export function getProductUrl(product) {
  return `/producto/${slugify(product.nombre)}`;
}

/** Filtra por categoría: Frutas | Verduras | Tubérculos | Hierbas */
export async function getProductsByCategory(category) {
  const filtered = productos.filter(
    (p) => p.categoria.toLowerCase() === category.toLowerCase()
  );
  return withPrices(filtered);
}

/**
 * Compatibilidad: en fruver no hay marcas.
 * Se conserva para no romper imports viejos.
 */
export function getProductsByBrand() {
  return Promise.resolve([]);
}

/** Destacados para el Home. */
export async function getFeaturedProducts() {
  const featured = productos.filter((p) => p.destacado);
  return withPrices(featured);
}

/** Compatibilidad: en fruver no hay marcas. */
export function getBrands() {
  return Promise.resolve([]);
}

/** Lista única de categorías del fruver. */
export function getCategories() {
  const categories = [...new Set(productos.map((p) => p.categoria))];
  return Promise.resolve(categories);
}
