/**
 * Central site configuration — Single Source of Truth for NAP, brand and URLs
 * Used by client (import.meta.env) and Edge (hardcoded fallback)
 */
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || 'https://fruverelgranjero.store').replace(/\/+$/, '');
export const SITE_NAME = 'Fruver El Granjero';
export const SITE_ALTERNATE_NAME = 'Fruver El Granjero';
export const SITE_FULL_NAME = 'Fruver El Granjero';
export const BRAND = SITE_NAME;

export const NAP = {
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAME,
  url: SITE_URL,
  email: 'fruverelgranjero@gmail.com',
  telephone: '+57 320 7141222',
  telephoneDigits: '573207141222',
  whatsapp: '573207141222',
  address: {
    streetAddress: 'Cra. 14 #55d-148',
    addressLocality: 'Manizales',
    addressRegion: 'Caldas',
    postalCode: '170001',
    addressCountry: 'CO',
    full: 'Cra. 14 #55d-148, Manizales, Caldas, Colombia',
  },
  geo: { latitude: 5.055, longitude: -75.484 },
  hours: { days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '08:00', closes: '19:00' },
  description: 'Fruver en Manizales, Caldas (Cra. 14 #55d-148) con frutas, verduras, tubérculos y hierbas frescas todos los días. Arma tu mercado en el catálogo y confirma tu pedido por WhatsApp con entregas en Manizales.',
};

export const SOCIAL = {
  whatsapp: 'https://wa.me/573207141222',
};

// IndexNow: espejo de scripts/utils/site.cjs (cliente no lee .env en build Edge).
// Si cambias la key, cámbiala en ambos archivos.
export const INDEXNOW_KEY = '6db2ccb300575995b1ab6ee52d751c3c';
export const FRESH_SERVICE = {
  name: 'Frutas y verduras frescas todos los días en Manizales',
  steps: ['Eliges en el catálogo', 'Confirmas por WhatsApp', 'Alistamos tu mercado', 'Recibes fresco en casa o en tienda'],
  cost: 'Sin costo de alistamiento',
  schedule: 'Lunes a sábado 8:00-19:00, domingos 8:00-13:00',
};
// Alias de compatibilidad (el Home viejo importaba PH_SERVICE)
export const PH_SERVICE = FRESH_SERVICE;

export const CURRENCY = 'COP';
export const PRICE_TTL_DAYS = 30;
