import { useState, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import useCartStore from '../../store/useCartStore';
import { getProductUrl } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';
import {
  esPeso,
  formatearPeso,
  formatearPesoCorto,
  getPesoInicial,
  getPesosSugeridos,
  precioPorLibra,
  precioPorPeso,
} from '../../utils/peso';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Price from '../common/Price';

// Tarjeta fruver: por PESO (chips de gramos) o FIJA (precio por presentación).
// Sin stock: siempre hay.
const ProductCard = memo(function ProductCard({ perfume, product, onProductNavigate, isRestoring }) {
  const item = product || perfume;
  const addToCart = useCartStore((state) => state.addToCart);
  const location = useLocation();
  const [imageStatus, setImageStatus] = useState('loading');
  const [gramos, setGramos] = useState(() => getPesoInicial(item));
  const hasPhoto = !!item.imagen;
  const porPeso = esPeso(item);
  const pesos = porPeso ? getPesosSugeridos(item) : [];
  const precioPeso = porPeso ? precioPorPeso(item.precioPorKg, gramos) : 0;

  const handleSelectPeso = (event, peso) => {
    event.preventDefault();
    event.stopPropagation();
    setGramos(peso);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (porPeso) {
      addToCart(item, gramos);
      toast.success(`${item.nombre} (${formatearPeso(gramos)}) agregado al mercado`);
    } else {
      addToCart(item, 1);
      toast.success(`${item.nombre} agregado al mercado`);
    }
  };

  return (
    <motion.article
      data-product-id={item.id}
      initial={isRestoring ? false : 'hidden'}
      whileInView={isRestoring ? undefined : 'show'}
      viewport={{ once: true, margin: '50px' }}
      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="absolute left-6 top-6 z-10">
        {item.categoria && (
          <Badge variant="primary" className="bg-white/90 shadow-xs backdrop-blur-md">
            {item.categoria}
          </Badge>
        )}
      </div>

      <Link
        to={getProductUrl(item)}
        state={{ fromCatalog: location.pathname === '/catalogo' }}
        onClick={() => onProductNavigate?.(item.id)}
        className="block flex-1"
        aria-label={`Ver ${item.nombre}`}
      >
        <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-green-50/60">
          {hasPhoto ? (
            <>
              {imageStatus === 'loading' && (
                <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-gradient-to-br from-white via-stone-50 to-stone-100" />
              )}
              <img
                src={item.imagen}
                alt={`${item.nombre} - ${item.categoria}`}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-contain p-4 transition-all duration-500 group-hover:scale-105 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                  }`}
                onLoad={() => setImageStatus('loaded')}
                onError={() => setImageStatus('error')}
              />
            </>
          ) : (
            <span className="text-7xl transition-transform duration-500 group-hover:scale-110" role="img" aria-label={item.nombre}>
              {item.emoji || '🥬'}
            </span>
          )}
        </div>
        <div className="mb-3 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-700">{item.categoria}</p>
          <h3 className="line-clamp-1 font-serif text-lg font-bold text-[#111111] transition-colors group-hover:text-green-800">{item.nombre}</h3>
          {porPeso ? (
            <p className="text-xs font-light text-slate-500">
              {formatPrice(item.precioPorKg)}/kg · {formatPrice(precioPorLibra(item.precioPorKg))} la libra
            </p>
          ) : (
            <p className="text-xs font-light text-slate-500">Por {item.presentacion}</p>
          )}
        </div>
      </Link>

      {/* Selector de peso (solo productos por peso) */}
      {porPeso && (
        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label={`Peso de ${item.nombre}`}>
          {pesos.map((peso) => (
            <button
              key={peso}
              type="button"
              onClick={(e) => handleSelectPeso(e, peso)}
              aria-pressed={gramos === peso}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                gramos === peso
                  ? 'border-green-700 bg-green-700 text-white'
                  : 'border-stone-300 bg-white text-slate-600 hover:border-green-600'
              }`}
            >
              {formatearPesoCorto(peso)}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-stone-100 pt-3">
        <div>
          {porPeso ? (
            <>
              <span className="block text-[10px] font-medium uppercase text-slate-400">{formatearPeso(gramos)}</span>
              <Price value={precioPeso} size="md" />
            </>
          ) : (
            <>
              <span className="block text-[10px] font-medium uppercase text-slate-400">Por {item.presentacion}</span>
              <Price value={item.precioFijo} size="md" />
            </>
          )}
        </div>
        <Button variant="primary" size="sm" onClick={handleAddToCart} className="flex items-center gap-2 !bg-green-700 hover:!bg-green-800" title="Agregar al mercado">
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </div>
    </motion.article>
  );
});

export default ProductCard;
