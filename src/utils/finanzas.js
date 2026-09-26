import { MOVEMENTS_RAW } from '../data/finanzasMovimientos';

export const CATEGORIAS = {
  mercado: { label: 'Mercado y víveres', color: '#16a34a', bg: '#dcfce7', icon: '🛒' },
  comida: { label: 'Comida y restaurantes', color: '#ea580c', bg: '#ffedd5', icon: '🍔' },
  transporte: { label: 'Moto y gasolina', color: '#2563eb', bg: '#dbeafe', icon: '🏍️' },
  negocio: { label: 'Negocio y publicidad', color: '#7c3aed', bg: '#ede9fe', icon: '📢' },
  salud: { label: 'Salud y farmacia', color: '#0d9488', bg: '#ccfbf1', icon: '💊' },
  suscripciones: { label: 'Apps y suscripciones', color: '#db2777', bg: '#fce7f3', icon: '📱' },
  hogar: { label: 'Casa y hogar', color: '#b45309', bg: '#fef3c7', icon: '🏠' },
  personal: { label: 'Cuidado personal', color: '#e11d48', bg: '#ffe4e6', icon: '💈' },
  familia: { label: 'Familia (hermana etc.)', color: '#475569', bg: '#e2e8f0', icon: '👨‍👩‍👧' },
  entretenimiento: { label: 'Entretenimiento', color: '#4f46e5', bg: '#e0e7ff', icon: '🎬' },
  otros: { label: 'Otros gastos', color: '#6b7280', bg: '#f3f4f6', icon: '📦' },
  por_clasificar: { label: '❓ Por clasificar', color: '#a16207', bg: '#fef9c3', icon: '❓' },
};

const norm = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function categorizarAutomatico(descripcion = '', monto = 0, tipoForzado) {
  if (tipoForzado === 'ahorro') return 'ahorro';
  if (monto > 0) return 'ingreso';
  const d = norm(descripcion);

  // Ahorro / internas
  if (d.includes('cajita') || d.includes('rendimiento')) return monto < 0 ? 'ahorro' : 'ingreso';

  // Mercado
  if (
    d.includes('tienda d1') || d.includes('tiendas ara') || d.includes('olimpica') ||
    d.includes('exito') || d.includes('super inter') || d.includes('valentina market') ||
    d.includes('el rebajon') || d.includes('oxxo') || d.includes('julian eugenio')
  ) return 'mercado';

  // Comida
  if (
    d.includes('rappi') || d.includes('panaderia') || d.includes('broaster') ||
    d.includes('gusto y sazon') || d.includes('lucas sazon') || d.includes('cafet') ||
    d.includes('restaur')
  ) return 'comida';

  // Transporte / moto (usuario confirmó)
  if (
    d.includes('eds') || d.includes('servicentro') || d.includes('imperio de las motos') ||
    d.includes('serviteca') || d.includes('andrea restrepo') || d.includes('lavautos')
  ) return 'transporte';

  // Negocio (usuario confirmó tiger-roar = negocio)
  if (
    d.includes('tiktok') || d.includes('dlo') || d.includes('godaddy') ||
    d.includes('shopify') || d.includes('tiger-roar') || d.includes('tiger roar')
  ) return 'negocio';

  // Salud
  if (d.includes('farmatodo') || d.includes('cruz verde') || d.includes('fundacion ips') || d.includes('ips')) return 'salud';

  // Suscripciones
  if (d.includes('apple.com')) return 'suscripciones';

  // Hogar (usuario confirmó)
  if (d.includes('wilfer') || d.includes('luis felipe arboleda') || d.includes('ferreteria')) return 'hogar';

  // Cuidado personal (usuario confirmó robinson = peluquería)
  if (d.includes('robinson')) return 'personal';

  // Familia (usuario confirmó danna = hermana)
  if (d.includes('danna')) return 'familia';

  // Entretenimiento
  if (d.includes('cine')) return 'entretenimiento';

  // SMS investments, esquina celular, miniso, mariajos, chipi -> por clasificar para preguntar
  return 'por_clasificar';
}

export function getCategoria(id, override) {
  if (id === 'ingreso') return { label: 'Ingresos', color: '#15803d', bg: '#dcfce7', icon: '💰' };
  if (id === 'ahorro') return { label: 'Ahorro (Cajita)', color: '#0e7490', bg: '#cffafe', icon: '🐷' };
  if (override && CATEGORIAS[override]) return CATEGORIAS[override];
  return CATEGORIAS[id] || CATEGORIAS.otros;
}

export function buildMovements(overrides = {}, extras = []) {
  const base = MOVEMENTS_RAW.map((m, i) => {
    const auto = categorizarAutomatico(m.descripcion, m.monto, m.tipo);
    const key = `${m.fecha}|${m.descripcion}|${m.monto}`;
    const categoria = overrides[key] || auto;
    return { id: `base-${i}`, key, ...m, categoriaAuto: auto, categoria };
  });
  const custom = extras.map((m, i) => ({
    id: `custom-${i}`,
    key: `custom-${i}`,
    categoriaAuto: m.categoria,
    ...m,
  }));
  return [...base, ...custom].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function summarize(movements) {
  const gastos = movements.filter((m) => m.monto < 0 && m.categoria !== 'ahorro');
  const ingresos = movements.filter((m) => m.monto > 0 && m.categoria !== 'ahorro');
  const ahorro = movements.filter((m) => m.categoria === 'ahorro');
  const totalGastos = Math.abs(gastos.reduce((s, m) => s + m.monto, 0));
  const totalIngresos = ingresos.reduce((s, m) => s + m.monto, 0);
  const porCategoria = {};
  gastos.forEach((m) => {
    porCategoria[m.categoria] = porCategoria[m.categoria] || { total: 0, count: 0 };
    porCategoria[m.categoria].total += Math.abs(m.monto);
    porCategoria[m.categoria].count += 1;
  });
  const ranking = Object.entries(porCategoria)
    .map(([cat, v]) => ({ cat, ...v, pct: totalGastos ? (v.total / totalGastos) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);
  return { gastos, ingresos, ahorro, totalGastos, totalIngresos, balance: totalIngresos - totalGastos, porCategoria, ranking };
}

export function filterByMonth(movements, month) {
  if (!month || month === 'todos') return movements;
  return movements.filter((m) => m.fecha.startsWith(month));
}

export const MESES = [
  { id: 'todos', label: 'Todo (jul–sep)' },
  { id: '2026-07', label: 'Julio' },
  { id: '2026-08', label: 'Agosto' },
  { id: '2026-09', label: 'Septiembre' },
];

export function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export function exportCSV(movements) {
  const rows = [['fecha', 'descripcion', 'monto', 'categoria'], ...movements.map((m) => [m.fecha, `"${m.descripcion.replace(/"/g, '')}"`, m.monto, m.categoria])];
  return rows.map((r) => r.join(',')).join('\n');
}
