import Button from '../common/Button';
import Price from '../common/Price';
import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { formatearPesoTotal } from '../../utils/peso';
import { COSTO_DOMICILIO } from '../../config/site';

export default function CartSummary({ items, total }) {
  const pesoTotal = items.reduce((acc, item) => acc + Number(item.gramos || 0), 0);
  const totalConDomicilio = total + COSTO_DOMICILIO;

  return (
    <section className="border-t border-stone-200 pt-5">
      <div className="flex items-center justify-between text-sm text-slate-600"><span>Peso total aprox.</span><span className="font-medium text-slate-800">{formatearPesoTotal(pesoTotal)}</span></div>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><Price value={total} size="sm" /></div>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-600"><span>Domicilio</span><Price value={COSTO_DOMICILIO} size="sm" /></div>
      <div className="mt-3 flex items-center justify-between"><span className="font-serif text-xl text-[#111111]">Total</span><Price value={totalConDomicilio} size="lg" /></div>
      <Button fullWidth className="mt-5 gap-2 !bg-green-700 hover:!bg-green-800" onClick={() => openWhatsApp(items, total)}>
        <MessageCircle className="h-4 w-4" /> Pedir por WhatsApp
      </Button>
      <p className="mt-2 text-center text-xs text-slate-500">Se abre WhatsApp con tu mercado listo para enviar.</p>
    </section>
  );
}
