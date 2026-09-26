/**
 * peso.js — Sistema de venta por peso del Fruver
 *
 * Todo se vende por gramos:
 * - Cada producto tiene un precio base por kilo (`precioPorKg`).
 * - El cliente elige cuántos gramos quiere (250 g, 500 g = 1 libra,
 *   1 kg, 2 kg... o un peso libre).
 * - El precio es proporcional al peso, redondeado a múltiplos de $50
 *   para que los totales queden en cifras limpias en COP.
 * - El carrito lleva UNA línea por producto con su peso total.
 */

export const GRAMOS_POR_KILO = 1000;
export const GRAMOS_POR_LIBRA = 500;

/** Pesos rápidos para la mayoría de productos. */
export const PESOS_RAPIDOS = [250, 500, 1000, 2000];

/** Pesos rápidos para hierbas (cilantro, cebolla larga). */
export const PESOS_HIERBAS = [50, 100, 250, 500];

export const MIN_GRAMOS = 50;
export const MAX_GRAMOS = 10000;
export const PASO_GRAMOS = 50;
/** Tope de unidades por línea en presentación fija. */
export const MAX_CANTIDAD_FIJA = 99;

/** Paso del stepper del carrito: 50 g en hierbas, 250 g en el resto. */
export function getPasoGramos(product) {
  return product?.categoria === 'Hierbas' ? 50 : 250;
}

/** ¿Se vende por peso? Si no, es presentación fija (bandeja, unidad, litro...). */
export function esPeso(product) {
  return product?.tipo !== 'fijo';
}

/** Precio base para ordenar/comparar: por kilo si es peso, fijo si no. */
export function precioBase(product) {
  if (!product) return 0;
  return esPeso(product) ? Number(product.precioPorKg || 0) : Number(product.precioFijo || 0);
}

/** Subtotal de una línea: proporcional al peso, o fijo × cantidad. */
export function subtotalLinea(precioPorKg, gramos, cantidad = 1, producto = null) {
  if (producto && !esPeso(producto)) {
    return Number(producto.precioFijo || 0) * Number(cantidad || 0);
  }
  return precioPorPeso(precioPorKg, gramos);
}

/** Pesos sugeridos según la categoría del producto. */
export function getPesosSugeridos(product) {
  if (Array.isArray(product?.pesos) && product.pesos.length > 0) return product.pesos;
  if (product?.categoria === 'Hierbas') return PESOS_HIERBAS;
  return PESOS_RAPIDOS;
}

/** Peso por defecto al abrir la tarjeta o el detalle. */
export function getPesoInicial(product) {
  const sugeridos = getPesosSugeridos(product);
  return sugeridos.includes(500) ? 500 : sugeridos[0];
}

/**
 * Normaliza cualquier peso: lo limita al rango y lo redondea
 * al múltiplo de PASO_GRAMOS más cercano (mínimo MIN_GRAMOS).
 */
export function normalizarGramos(gramos) {
  const n = Number(gramos);
  if (!Number.isFinite(n)) return 500;
  const limitado = Math.min(MAX_GRAMOS, Math.max(MIN_GRAMOS, n));
  return Math.max(MIN_GRAMOS, Math.round(limitado / PASO_GRAMOS) * PASO_GRAMOS);
}

/**
 * Precio proporcional al peso, redondeado a múltiplos de $50.
 * Ej: $4.500/kg × 250 g = $1.125 → $1.100.
 */
export function precioPorPeso(precioPorKg, gramos) {
  const base = (Number(precioPorKg) * Number(gramos)) / GRAMOS_POR_KILO;
  return Math.max(50, Math.round(base / 50) * 50);
}

/** Precio de la libra (500 g), el peso más pedido en Colombia. */
export function precioPorLibra(precioPorKg) {
  return precioPorPeso(precioPorKg, GRAMOS_POR_LIBRA);
}

/**
 * Texto legible del peso: "250 g", "1 libra", "1 kg", "1.5 kg".
 */
export function formatearPeso(gramos) {
  const g = Number(gramos);
  if (g === GRAMOS_POR_LIBRA) return '1 libra';
  if (g < GRAMOS_POR_KILO) return `${g} g`;
  const kg = g / GRAMOS_POR_KILO;
  const texto = Number.isInteger(kg) ? String(kg) : String(Math.round(kg * 10) / 10).replace('.', ',');
  return `${texto} kg`;
}

/** Texto corto para chips y botones: "250g", "1kg", "1 libra". */
export function formatearPesoCorto(gramos) {
  const g = Number(gramos);
  if (g === GRAMOS_POR_LIBRA) return '1 libra';
  if (g < GRAMOS_POR_KILO) return `${g}g`;
  const kg = g / GRAMOS_POR_KILO;
  return `${Number.isInteger(kg) ? kg : Math.round(kg * 10) / 10}kg`;
}

/** Texto del peso total: "750 g", "2 kg". */
export function formatearPesoTotal(gramosTotales) {
  return formatearPeso(gramosTotales);
}
