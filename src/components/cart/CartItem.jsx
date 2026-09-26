import { Minus, Plus, Trash2 } from 'lucide-react';
import Price from '../common/Price';
import {
  esPeso,
  formatearPeso,
  formatearPesoCorto,
  getPasoGramos,
  precioPorPeso,
} from '../../utils/peso';

export default function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  const porPeso = esPeso(item);
  const subtotal = porPeso
    ? precioPorPeso(item.precioPorKg, item.gramos)
    : Number(item.precioFijo || 0) * Number(item.cantidad || 0);
  const paso = porPeso ? getPasoGramos(item) : 1;

  return (
    <article className="flex gap-4 py-5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50">
        {item.imagen ? (
          <img src={item.imagen} alt={item.nombre} className="h-full w-full object-contain p-1" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        ) : (
          <span className="text-4xl" role="img" aria-label={item.nombre}>{item.emoji || '🥬'}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-green-700">
              {item.categoria}{porPeso ? ` · ${formatearPeso(item.gramos)}` : ` · por ${item.presentacion}`}
            </p>
            <h3 className="mt-1 truncate font-serif text-lg text-[#111111]">{item.nombre}</h3>
          </div>
          <button type="button" onClick={() => onRemove(item.key)} aria-label={`Eliminar ${item.nombre}`} className="p-1 text-slate-400 transition-colors hover:text-green-700"><Trash2 className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-stone-200">
            <button type="button" onClick={() => onDecrease(item.key)} aria-label={porPeso ? `Quitar ${formatearPesoCorto(paso)}` : 'Quitar uno'} className="p-2"><Minus className="h-3.5 w-3.5" /></button>
            <span className="min-w-16 px-2 text-center text-sm font-medium">
              {porPeso ? formatearPeso(item.gramos) : `× ${item.cantidad}`}
            </span>
            <button type="button" onClick={() => onIncrease(item.key)} aria-label={porPeso ? `Agregar ${formatearPesoCorto(paso)}` : 'Agregar uno'} className="p-2"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          <Price value={subtotal} size="sm" />
        </div>
      </div>
    </article>
  );
}
