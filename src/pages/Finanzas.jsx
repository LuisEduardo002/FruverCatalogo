import React, { useEffect, useMemo, useState } from 'react';
import Container from '../components/layout/Container';
import useSEO from '../hooks/useSEO';
import {
  CATEGORIAS, MESES, buildMovements, summarize, filterByMonth,
  formatCOP, getCategoria, exportCSV,
} from '../utils/finanzas';

const LS_OV = 'finanzas-overrides-v1';
const LS_EX = 'finanzas-extras-v1';

function loadJSON(k, fb) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
}

function Donut({ ranking, total }) {
  if (!total) return <p className="text-sm text-slate-500">Sin gastos en este filtro.</p>;
  const R = 70; const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = ranking.map((r) => {
    const frac = r.total / total;
    const el = { ...r, dash: frac * C, offset: acc };
    acc += frac * C;
    return el;
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={R} fill="none" stroke="#f1f5f9" strokeWidth="26" />
        {segs.map((s) => (
          <circle
            key={s.cat}
            cx="90" cy="90" r={R} fill="none"
            stroke={getCategoria(s.cat).color}
            strokeWidth="26"
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
        <text x="90" y="90" textAnchor="middle" dy=".35em" transform="rotate(90 90 90)" className="font-bold" fontSize="16" fill="#111">
          100%
        </text>
      </svg>
      <div className="flex-1 w-full space-y-2">
        {ranking.slice(0, 8).map((r) => {
          const c = getCategoria(r.cat);
          return (
            <div key={r.cat} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="flex-1 truncate">{c.icon} {c.label}</span>
              <span className="font-semibold">{r.pct.toFixed(1)}%</span>
              <span className="text-slate-500 w-24 text-right">{formatCOP(r.total)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Finanzas() {
  useSEO({ title: 'Mis finanzas | Dónde se va mi plata', description: 'Dashboard privado de gastos por categoría con porcentajes.', canonical: '/finanzas' });
  const [overrides, setOverrides] = useState({});
  const [extras, setExtras] = useState([]);
  const [mes, setMes] = useState('todos');
  const [q, setQ] = useState('');
  const [fCat, setFCat] = useState('todas');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fecha: '2026-09-23', descripcion: '', monto: '', categoria: 'comida' });

  useEffect(() => {
    setOverrides(loadJSON(LS_OV, {}));
    setExtras(loadJSON(LS_EX, []));
  }, []);
  useEffect(() => { try { localStorage.setItem(LS_OV, JSON.stringify(overrides)); } catch {} }, [overrides]);
  useEffect(() => { try { localStorage.setItem(LS_EX, JSON.stringify(extras)); } catch {} }, [extras]);

  const all = useMemo(() => buildMovements(overrides, extras), [overrides, extras]);
  const porMes = useMemo(() => filterByMonth(all, mes), [all, mes]);
  const sum = useMemo(() => summarize(porMes), [porMes]);

  const lista = useMemo(() => {
    return porMes.filter((m) => {
      if (m.categoria === 'ahorro') return false;
      if (fCat !== 'todas' && m.categoria !== fCat) return false;
      if (q && !m.descripcion.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [porMes, fCat, q]);

  const pendientes = useMemo(() => porMes.filter((m) => m.categoria === 'por_clasificar' && m.monto < 0), [porMes]);

  const setCat = (m, cat) => {
    if (m.id.startsWith('custom')) {
      setExtras((prev) => prev.map((e, i) => (`custom-${i}` === m.id ? { ...e, categoria: cat } : e)));
    } else {
      setOverrides((prev) => ({ ...prev, [m.key]: cat }));
    }
  };

  const addMov = (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.monto) return;
    setExtras((p) => [...p, { fecha: form.fecha, descripcion: form.descripcion, monto: Number(form.monto), categoria: form.categoria }]);
    setForm({ fecha: '2026-09-23', descripcion: '', monto: '', categoria: 'comida' });
    setShowAdd(false);
  };

  const download = () => {
    const blob = new Blob([exportCSV(porMes)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `gastos-${mes}.csv`; a.click();
  };

  const top = sum.ranking[0];
  const rappi = porMes.filter((m) => m.descripcion.toLowerCase().includes('rappi')).reduce((s, m) => s + Math.abs(m.monto), 0);
  const tiktok = porMes.filter((m) => m.descripcion.toLowerCase().includes('tiktok') || m.descripcion.toLowerCase().includes('dlo')).reduce((s, m) => s + Math.abs(m.monto), 0);

  return (
    <main className="bg-[#FAF9F6] min-h-screen py-8">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8A450]">Finanzas personales · privado</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#111]">¿En qué se me va la plata?</h1>
            <p className="text-sm text-slate-600 mt-1">Julio → septiembre (Nu). Cajitas de ahorro no cuentan como gasto. Corrige categorías y se guarda solo en tu navegador.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(!showAdd)} className="rounded-full bg-[#4B1E28] text-white text-sm px-4 py-2 font-semibold">+ Agregar gasto/ingreso</button>
            <button onClick={download} className="rounded-full border text-sm px-4 py-2">Exportar CSV</button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={addMov} className="bg-white rounded-2xl border p-4 mb-6 grid sm:grid-cols-5 gap-2">
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="border rounded-xl px-3 py-2 text-sm" />
            <input placeholder="Descripción (ej: D1, Rappi, Moto)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="border rounded-xl px-3 py-2 text-sm sm:col-span-2" />
            <input type="number" placeholder="Monto (- gasto, + ingreso)" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} className="border rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="border rounded-xl px-2 py-2 text-sm flex-1">
                {Object.entries(CATEGORIAS).filter(([k]) => k !== 'por_clasificar').map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                <option value="ingreso">Ingreso</option>
              </select>
              <button className="bg-[#4B1E28] text-white rounded-xl px-4 text-sm font-semibold">Guardar</button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {MESES.map((m) => (
            <button key={m.id} onClick={() => setMes(m.id)} className={`px-4 py-2 rounded-full text-sm font-semibold border ${mes === m.id ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-slate-600'}`}>{m.label}</button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border p-5"><p className="text-xs uppercase text-slate-500 font-semibold">Gastado</p><p className="text-2xl font-bold text-red-700">{formatCOP(sum.totalGastos)}</p><p className="text-xs text-slate-500">{sum.gastos.length} movimientos</p></div>
          <div className="bg-white rounded-2xl border p-5"><p className="text-xs uppercase text-slate-500 font-semibold">Ingresado</p><p className="text-2xl font-bold text-green-700">{formatCOP(sum.totalIngresos)}</p><p className="text-xs text-slate-500">{sum.ingresos.length} movimientos</p></div>
          <div className="bg-white rounded-2xl border p-5"><p className="text-xs uppercase text-slate-500 font-semibold">Balance</p><p className={`text-2xl font-bold ${sum.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCOP(sum.balance)}</p><p className="text-xs text-slate-500">Ingresos − gastos</p></div>
          <div className="bg-[#111] rounded-2xl p-5 text-white"><p className="text-xs uppercase text-[#C8A450] font-semibold">Tu mayor fuga</p><p className="text-lg font-bold">{top ? `${getCategoria(top.cat).icon} ${getCategoria(top.cat).label}` : '—'}</p><p className="text-sm text-white/80">{top ? `${formatCOP(top.total)} · ${top.pct.toFixed(1)}% del gasto` : ''}</p></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-lg mb-1">Gastos por categoría (%)</h2>
            <p className="text-xs text-slate-500 mb-4">Base: total gastado {formatCOP(sum.totalGastos)}. Sin contar Cajitas.</p>
            <Donut ranking={sum.ranking} total={sum.totalGastos} />
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-lg mb-4">Barras por categoría</h2>
            <div className="space-y-3">
              {sum.ranking.map((r) => {
                const c = getCategoria(r.cat);
                return (
                  <div key={r.cat}>
                    <div className="flex justify-between text-sm mb-1"><span>{c.icon} {c.label} <span className="text-slate-400">({r.count})</span></span><span className="font-semibold">{r.pct.toFixed(1)}%</span></div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: c.color }} /></div>
                    <p className="text-xs text-slate-500 mt-0.5">{formatCOP(r.total)}</p>
                  </div>
                );
              })}
              {!sum.ranking.length && <p className="text-sm text-slate-500">Sin datos.</p>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5"><p className="font-bold">📢 TikTok / publicidad</p><p className="text-xl font-bold">{formatCOP(tiktok)}</p><p className="text-xs text-slate-600">{sum.totalGastos ? ((tiktok / sum.totalGastos) * 100).toFixed(1) : 0}% de tu gasto. Si es negocio, sepáralo de tu gasto personal.</p></div>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5"><p className="font-bold">🛵 Rappi + antojos</p><p className="text-xl font-bold">{formatCOP(rappi)}</p><p className="text-xs text-slate-600">Gasto hormiga típico. Compara con tu mercado.</p></div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5"><p className="font-bold">❓ Por clasificar: {pendientes.length}</p><p className="text-xl font-bold">{formatCOP(pendientes.reduce((s, m) => s + Math.abs(m.monto), 0))}</p><p className="text-xs text-slate-600">Clasifícalos abajo para que tus % sean reales.</p></div>
        </div>

        {pendientes.length > 0 && (
          <div className="bg-white rounded-2xl border border-yellow-300 p-6 mb-6">
            <h2 className="font-bold text-lg">❓ Ayúdame a clasificar ({pendientes.length})</h2>
            <p className="text-xs text-slate-500 mb-4">Dime qué es cada uno o cámbialo aquí. Ej: ¿SMS Investments? ¿Esquina del celular? ¿Maria Catalina? ¿Cecilia? ¿Jorge Castro? ¿Luz Marina? ¿Martha Pizo?</p>
            <div className="space-y-2 max-h-72 overflow-auto">
              {pendientes.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center gap-2 text-sm border-b py-2">
                  <span className="text-slate-400 w-24">{m.fecha}</span>
                  <span className="flex-1 min-w-[180px]">{m.descripcion} · <b>{formatCOP(m.monto)}</b></span>
                  <select value={m.categoria} onChange={(e) => setCat(m, e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
                    {Object.entries(CATEGORIAS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar (ej: D1, Rappi, Danna…)" className="border rounded-full px-4 py-2 text-sm flex-1 min-w-[200px]" />
            <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="border rounded-full px-4 py-2 text-sm">
              <option value="todas">Todas las categorías</option>
              {Object.entries(CATEGORIAS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
              <option value="ingreso">Ingresos</option>
              <option value="ahorro">Ahorro</option>
            </select>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="text-left text-xs uppercase text-slate-400 border-b"><th className="py-2">Fecha</th><th>Descripción</th><th>Categoría</th><th className="text-right">Monto</th></tr></thead>
              <tbody>
                {lista.map((m) => {
                  const c = getCategoria(m.categoria);
                  return (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 text-slate-400 whitespace-nowrap">{m.fecha}</td>
                      <td className="py-2 pr-2">{m.descripcion}</td>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border" style={{ background: c.bg, borderColor: c.color + '40', color: '#111' }}>
                          {c.icon} {c.label}
                        </span>
                        <select value={m.categoria} onChange={(e) => setCat(m, e.target.value)} className="ml-2 text-xs border rounded-lg px-1 py-1 text-slate-500">
                          {Object.entries(CATEGORIAS).map(([k, cc]) => <option key={k} value={k}>{cc.label}</option>)}
                          <option value="ingreso">Ingreso</option>
                        </select>
                      </td>
                      <td className={`py-2 text-right font-semibold whitespace-nowrap ${m.monto < 0 ? 'text-red-700' : 'text-green-700'}`}>{formatCOP(m.monto)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!lista.length && <p className="text-sm text-slate-500 py-6 text-center">No hay movimientos con ese filtro.</p>}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">Privado: esta página no está enlazada en el menú de la tienda. Guárdala como favorito: <b>/finanzas</b>. Los cambios de categoría se guardan solo en este navegador.</p>
      </Container>
    </main>
  );
}
