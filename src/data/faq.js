/**
 * FAQ central del Fruver — mismo esquema <Faq/> con topic para filtrar.
 */
export const faqItems = [
  {
    id: 'como-pedir',
    topic: 'compra',
    q: '¿Cómo hago mi pedido?',
    a: 'Elige el peso en gramos de cada producto (250 g, 1 libra, 1 kg o el que necesites) y presiona “Pedir por WhatsApp”: se abre el chat de Fruver El Granjero (+57 320 7141222) con tu mercado listo para confirmar.',
  },
  {
    id: 'frescura',
    topic: 'compra',
    q: '¿El producto es fresco?',
    a: 'Sí. Trabajamos con surtido diario en Cra. 14 #55d-148, Manizales. Si algo no está en su punto, te avisamos antes de confirmar el pedido.',
  },
  {
    id: 'entregas',
    topic: 'compra',
    q: '¿Hacen entregas a domicilio en Manizales?',
    a: 'Sí, entregamos en Manizales. Al confirmar por WhatsApp coordinamos costo y horario de entrega o recogida en tienda.',
  },
  {
    id: 'pago',
    topic: 'compra',
    q: '¿Qué métodos de pago aceptan?',
    a: 'Efectivo, transferencia y Nequi. Se coordinan por WhatsApp al confirmar tu mercado.',
  },
  {
    id: 'precios',
    topic: 'compra',
    q: '¿Cómo funcionan los precios?',
    a: 'Cada producto por peso tiene un precio por kilo y pagas solo los gramos que pides, de forma proporcional. Por ejemplo, si el kilo vale $4.500, la libra (500 g) vale $2.250. Los productos de presentación fija (bandeja, unidad, litro) tienen precio fijo por unidad. Siempre pesamos al momento.',
  },
  {
    id: 'horario',
    topic: 'tienda',
    q: '¿Cuál es el horario?',
    a: 'Lunes a sábado 8:00 a.m. – 9:00 p.m. Domingos 8:00 a.m. – 8:00 p.m. en Cra. 14 #55d-148, frente al Mallplaza, al lado de Concentrados del Centro, Manizales.',
  },
];

// Filtros nombrados
export const phFaqItems = faqItems.filter((i) => i.topic === 'compra');
export const brandFaqItems = faqItems.filter((i) => i.topic === 'tienda');
export const purchaseFaqItems = faqItems.filter((i) => i.topic === 'compra');
