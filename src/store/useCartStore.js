/**
 * useCartStore.js — Carrito por PESO y por PRESENTACIÓN FIJA con Zustand
 *
 * - Productos por peso: UNA línea por producto con sus gramos.
 *   Agregar suma los gramos (500 g + 500 g = 1 kg).
 * - Productos fijos (bandeja, unidad, litro...): UNA línea por producto
 *   con su cantidad. Agregar suma unidades.
 * - Sin stock ni disponibilidad: siempre hay. Si un día falta algo,
 *   se avisa por WhatsApp al confirmar el pedido.
 *
 * Estructura:
 * {
 *   items: [
 *     { key, id, nombre, categoria, emoji, imagen, descripcion,
 *       tipo: 'peso', precioPorKg, gramos: 1500 },
 *     { key, id, nombre, categoria, emoji, imagen, descripcion,
 *       tipo: 'fijo', precioFijo, presentacion, cantidad: 2 },
 *   ]
 * }
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productos } from "../data/productos";
import {
  MAX_GRAMOS,
  MAX_CANTIDAD_FIJA,
  MIN_GRAMOS,
  esPeso,
  getPasoGramos,
  normalizarGramos,
  precioPorPeso,
} from "../utils/peso";

function snapshotProducto(product) {
  const base = {
    id: product.id,
    nombre: product.nombre,
    categoria: product.categoria,
    emoji: product.emoji,
    imagen: product.imagen ?? null,
    descripcion: product.descripcion,
    tipo: product.tipo || "peso",
  };
  if (esPeso(product)) {
    return { ...base, precioPorKg: product.precioPorKg };
  }
  return { ...base, precioFijo: product.precioFijo, presentacion: product.presentacion };
}

function sanitizeCantidad(cantidad) {
  const n = Number(cantidad);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_CANTIDAD_FIJA, Math.max(1, Math.floor(n)));
}

const useCartStore = create(
  persist(
    (set, get) => ({
      // ───── State ─────
      items: [],

      // ───── Actions ─────

      /**
       * Agrega al carrito.
       * - Peso: `valor` son gramos (se suman si ya existe).
       * - Fijo: `valor` es cantidad (se suma si ya existe).
       */
      addToCart: (product, valor = null) => {
        if (esPeso(product)) {
          const peso = normalizarGramos(valor ?? 500);
          return set((state) => {
            const existingItem = state.items.find((item) => item.id === product.id);
            if (existingItem) {
              return {
                items: state.items.map((item) =>
                  item.id === product.id
                    ? { ...snapshotProducto(product), gramos: Math.min(MAX_GRAMOS, (item.gramos || 0) + peso), key: product.id }
                    : item
                ),
              };
            }
            return {
              items: [...state.items, { ...snapshotProducto(product), gramos: peso, key: product.id }],
            };
          });
        }

        const cantidad = sanitizeCantidad(valor ?? 1);
        return set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...snapshotProducto(product), cantidad: Math.min(MAX_CANTIDAD_FIJA, (item.cantidad || 0) + cantidad), key: product.id }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...snapshotProducto(product), cantidad, key: product.id }],
          };
        });
      },

      /** Elimina el producto completamente del carrito. */
      removeFromCart: (key) =>
        set((state) => ({
          items: state.items.filter((item) => item.key !== key && item.id !== key),
        })),

      /**
       * Suma: un paso de gramos en peso (250 g, 50 g en hierbas),
       * una unidad en presentación fija.
       */
      increaseQuantity: (key) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.key !== key && item.id !== key) return item;
            if (item.tipo === "fijo") {
              return { ...item, cantidad: Math.min(MAX_CANTIDAD_FIJA, (item.cantidad || 0) + 1) };
            }
            return { ...item, gramos: Math.min(MAX_GRAMOS, normalizarGramos(item.gramos + getPasoGramos(item))) };
          }),
        })),

      /**
       * Resta: un paso de gramos en peso, una unidad en fijo.
       * Si baja del mínimo, elimina la línea.
       */
      decreaseQuantity: (key) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.key !== key && item.id !== key) return item;
              if (item.tipo === "fijo") {
                return { ...item, cantidad: (item.cantidad || 0) - 1 };
              }
              return { ...item, gramos: item.gramos - getPasoGramos(item) };
            })
            .filter((item) =>
              item.tipo === "fijo" ? item.cantidad > 0 : item.gramos >= MIN_GRAMOS
            ),
        })),

      /** Vacía completamente el carrito. */
      clearCart: () => set({ items: [] }),

      // ───── Selectors (Computados) ─────

      /** Total a pagar. */
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          if (item.tipo === "fijo") {
            return total + Number(item.precioFijo || 0) * Number(item.cantidad || 0);
          }
          return total + precioPorPeso(item.precioPorKg, item.gramos);
        }, 0);
      },

      /** Cantidad de productos distintos en el carrito. */
      getItemCount: () => {
        const { items } = get();
        return items.length;
      },

      /** Peso total en gramos (solo productos por peso). */
      getPesoTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + (item.tipo === "fijo" ? 0 : Number(item.gramos || 0)),
          0
        );
      },
    }),
    {
      name: "fruver-cart",
      version: 4,
      migrate: (persistedState) => {
        // Agrupa por producto. Las líneas viejas traían gramos (v3) o bolsas (v2-).
        const porProducto = new Map();
        for (const item of persistedState?.items || []) {
          const currentProduct = productos.find((product) => product.id === item.id);
          if (!currentProduct) continue;

          if (!esPeso(currentProduct)) {
            const cantidad = Number(item.cantidad) > 0 ? sanitizeCantidad(item.cantidad) : sanitizeCantidad(item.quantity ?? 1);
            const acumulado = porProducto.get(currentProduct.id);
            if (acumulado) {
              acumulado.cantidad = Math.min(MAX_CANTIDAD_FIJA, acumulado.cantidad + cantidad);
            } else {
              porProducto.set(currentProduct.id, { ...snapshotProducto(currentProduct), cantidad, key: currentProduct.id });
            }
            continue;
          }

          let gramos = Number(item.gramos);
          if (!Number.isFinite(gramos)) gramos = 500;
          if (Number(item.quantity) > 1) gramos *= Number(item.quantity);

          const acumulado = porProducto.get(currentProduct.id);
          const nuevos = Math.min(MAX_GRAMOS, (acumulado?.gramos || 0) + normalizarGramos(gramos));
          porProducto.set(currentProduct.id, { ...snapshotProducto(currentProduct), gramos: nuevos, key: currentProduct.id });
        }

        return { ...persistedState, items: [...porProducto.values()] };
      },
    }
  )
);

export default useCartStore;
