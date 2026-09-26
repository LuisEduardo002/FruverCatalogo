/**
 * whatsapp.js — Pedido por PESO y PRESENTACIÓN FIJA para WhatsApp del Fruver
 * El carrito arma el mensaje y abre wa.me
 */

import { formatPrice } from "./formatPrice";
import { esPeso, formatearPeso, formatearPesoTotal, precioPorPeso } from "./peso";

// Número desde .env (VITE_WHATSAPP_NUMBER)
const PHONE_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "573207141222";

function lineaPeso(item) {
  const emoji = item.emoji ? `${item.emoji} ` : "🥬 ";
  return `${emoji}${item.nombre} — ${formatearPeso(item.gramos)} — ${formatPrice(precioPorPeso(item.precioPorKg, item.gramos))}`;
}

function lineaFija(item) {
  const emoji = item.emoji ? `${item.emoji} ` : "🥬 ";
  const cantidad = Number(item.cantidad || 1);
  const detalle = cantidad > 1 ? ` × ${cantidad}` : "";
  const subtotal = Number(item.precioFijo || 0) * cantidad;
  const presentacion = item.presentacion ? ` (${item.presentacion})` : "";
  return `${emoji}${item.nombre}${presentacion}${detalle} — ${formatPrice(subtotal)}`;
}

/**
 * Construye el mensaje de WhatsApp con el mercado.
 * @param {Array} cartItems - Líneas por peso [{ nombre, emoji, precioPorKg, gramos }]
 *   o fijas [{ nombre, emoji, precioFijo, presentacion, cantidad }]
 * @param {number} total - Total del pedido (se recalcula si no se pasa)
 */
export function buildWhatsAppMessage(cartItems, total) {
  const itemLines = cartItems
    .map((item) => (esPeso(item) ? lineaPeso(item) : lineaFija(item)))
    .join("\n");

  const pesoTotalGramos = cartItems.reduce(
    (acc, item) => acc + (esPeso(item) ? Number(item.gramos || 0) : 0),
    0
  );
  const totalFinal =
    typeof total === "number"
      ? total
      : cartItems.reduce((acc, item) => {
          if (esPeso(item)) return acc + precioPorPeso(item.precioPorKg, item.gramos);
          return acc + Number(item.precioFijo || 0) * Number(item.cantidad || 0);
        }, 0);

  const resumenPeso =
    pesoTotalGramos > 0 ? `🧺 Peso total aprox: ${formatearPesoTotal(pesoTotalGramos)}\n` : "";

  const message = `Hola Fruver El Granjero 🥬

Quiero hacer mi mercado:

${itemLines}

${resumenPeso}💰 Total a pagar: ${formatPrice(totalFinal)}

¿Me confirman el pedido y el valor del domicilio? Gracias.
`;

  return message;
}

/** Abre WhatsApp con el pedido. */
export function openWhatsApp(cartItems, total) {
  const message = buildWhatsAppMessage(cartItems, total);
  const url = buildWhatsAppLink(message);

  window.open(url, "_blank");
}

/** Enlace wa.me con cualquier mensaje. */
export function buildWhatsAppLink(message = "Hola Fruver El Granjero, quiero hacer un pedido") {
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
