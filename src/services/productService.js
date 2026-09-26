/**
 * productService.js — Service Layer del Fruver
 *
 * MISMO ESQUEMA que la tienda de perfumes, adaptado a fruver:
 * - Los componentes nunca importan data/productos.js directamente
 * - Siempre pasan por este servicio (fácil migrar a API/Firebase luego)
 * - Funciones retornan Promises para simular API real
 *
 * Hoy:    productService.js → import desde productos.js (local)
 * Mañana: productService.js → fetch('https://api.fruver.com/products')
 */

import { productos } from "../data/productos";
import slugify from "../utils/slug";

/** Todos los productos del fruver. */
export function getAllProducts() {
  return Promise.resolve(productos);
}

/** Busca por slug de URL o ID numérico. Ej: "tomate-chonto" o 1 */
export function getProductById(idOrSlug) {
  const raw = String(idOrSlug).toLowerCase().trim();
  const byId = productos.find((p) => String(p.id) === raw);
  if (byId) return Promise.resolve(byId);
  const product = productos.find((p) => slugify(p.nombre) === raw);
  return Promise.resolve(product);
}

/** URL amigable: /producto/tomate-chonto */
export function getProductUrl(product) {
  return `/producto/${slugify(product.nombre)}`;
}

/** Filtra por categoría: Frutas | Verduras | Tubérculos | Hierbas */
export function getProductsByCategory(category) {
  const filtered = productos.filter(
    (p) => p.categoria.toLowerCase() === category.toLowerCase()
  );
  return Promise.resolve(filtered);
}

/**
 * Compatibilidad: en fruver no hay marcas.
 * Se conserva para no romper imports viejos.
 */
export function getProductsByBrand() {
  return Promise.resolve([]);
}

/** Destacados para el Home. */
export function getFeaturedProducts() {
  const featured = productos.filter((p) => p.destacado);
  return Promise.resolve(featured);
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
