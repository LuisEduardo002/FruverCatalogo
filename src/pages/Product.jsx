import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Container from '../components/layout/Container';
import Button from '../components/common/Button';
import Price from '../components/common/Price';
import ProductGrid from '../components/product/ProductGrid';
import { getAllProducts, getProductById } from '../services/productService';
import useCartStore from '../store/useCartStore';
import useSEO from '../hooks/useSEO';
import slugify from '../utils/slug';
import Faq from '../components/common/Faq';
import ShareButton from '../components/common/ShareButton';
import { faqItems } from '../data/faq';
import { SITE_URL, SITE_NAME } from '../config/site';
import { formatPrice } from '../utils/formatPrice';
import {
  MAX_CANTIDAD_FIJA,
  MAX_GRAMOS,
  MIN_GRAMOS,
  esPeso,
  formatearPeso,
  formatearPesoCorto,
  getPesoInicial,
  getPesosSugeridos,
  normalizarGramos,
  precioBase,
  precioPorLibra,
  precioPorPeso,
} from '../utils/peso';

function injectProductSchema(product) {
  if (!product) return;
  const porPeso = esPeso(product);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": porPeso ? `${product.nombre} por peso - ${SITE_NAME}` : `${product.nombre} (${product.presentacion}) - ${SITE_NAME}`,
    "description": product.descripcion,
    "sku": String(product.id),
    "category": product.categoria,
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/producto/${slugify(product.nombre)}`,
      "priceCurrency": "COP",
      "price": String(precioBase(product)),
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": SITE_NAME }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Venta", "value": porPeso ? "Por peso (gramos)" : `Presentación fija (${product.presentacion})` },
      { "@type": "PropertyValue", "name": "Categoría", "value": product.categoria },
    ]
  };

  const existing = document.getElementById('product-schema');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = 'product-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function injectBreadcrumbSchema(product) {
  if (!product) return;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Catálogo", "item": `${SITE_URL}/catalogo` },
      { "@type": "ListItem", "position": 3, "name": product.categoria, "item": `${SITE_URL}/catalogo?categoria=${encodeURIComponent(product.categoria)}` },
      { "@type": "ListItem", "position": 4, "name": product.nombre, "item": `${SITE_URL}/producto/${slugify(product.nombre)}` },
    ]
  };
  const existing = document.getElementById('breadcrumb-schema');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = 'breadcrumb-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

export default function Product() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gramos, setGramos] = useState(500);
  const [cantidad, setCantidad] = useState(1);
  const [pesoLibre, setPesoLibre] = useState('');

  useLayoutEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      setLoading(true);
      const currentProduct = await getProductById(id);
      const allProducts = currentProduct ? await getAllProducts() : [];
      if (!active) return;
      setProduct(currentProduct);
      setRelatedProducts(
        allProducts.filter((item) => item.id !== currentProduct?.id && item.categoria === currentProduct?.categoria).slice(0, 4)
      );
      setGramos(currentProduct ? getPesoInicial(currentProduct) : 500);
      setCantidad(1);
      setPesoLibre('');
      setLoading(false);
    }
    loadProduct();
    return () => { active = false; };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.imagen ? [product.imagen] : [];
  }, [product]);

  const porPeso = product ? esPeso(product) : true;
  const pesos = useMemo(() => (product && porPeso ? getPesosSugeridos(product) : []), [product, porPeso]);
  const precioPeso = product && porPeso ? precioPorPeso(product.precioPorKg, gramos) : 0;
  const totalFijo = product && !porPeso ? Number(product.precioFijo || 0) * cantidad : 0;
  const itemsCanasta = useCartStore((state) => state.items);
  const lineaCanasta = product ? itemsCanasta.find((item) => item.id === product.id) : null;
  const enCanastaPeso = porPeso ? lineaCanasta?.gramos ?? 0 : 0;
  const enCanastaCantidad = !porPeso ? lineaCanasta?.cantidad ?? 0 : 0;

  useSEO({
    title: product ? (porPeso ? `${product.nombre} por peso — ${SITE_NAME}` : `${product.nombre} por ${product.presentacion} — ${SITE_NAME}`) : 'Fruver El Granjero',
    description: product ? (porPeso ? `${product.nombre} fresco por gramos a ${formatPrice(product.precioPorKg)} el kilo. ${product.descripcion}` : `${product.nombre} por ${product.presentacion} a ${formatPrice(product.precioFijo)}. ${product.descripcion}`).slice(0, 160) : 'Frutas y verduras frescas en Manizales.',
    canonical: product ? `/producto/${slugify(product.nombre)}` : undefined,
  });

  useEffect(() => {
    if (product) {
      injectProductSchema(product);
      injectBreadcrumbSchema(product);
    } else {
      document.getElementById('product-schema')?.remove();
      document.getElementById('breadcrumb-schema')?.remove();
    }
  }, [product]);

  if (loading) {
    return <main className="flex-grow py-20 text-center text-slate-500">Cargando producto fresco...</main>;
  }

  if (!product) {
    return (
      <main className="flex-grow py-20">
        <Container className="text-center">
          <h1 className="font-serif text-3xl text-slate-900">Producto no encontrado</h1>
          <Link to="/catalogo" className="mt-4 inline-block text-sm text-green-700 hover:underline">Ver catálogo del fruver</Link>
        </Container>
      </main>
    );
  }

  const changeCantidad = (change) => {
    setCantidad((current) => Math.min(MAX_CANTIDAD_FIJA, Math.max(1, current + change)));
  };

  const aplicarPesoLibre = () => {
    const n = Number(pesoLibre);
    if (!Number.isFinite(n) || n < MIN_GRAMOS) return;
    setGramos(normalizarGramos(n));
    setPesoLibre('');
  };

  const handleBackToCatalog = () => {
    if (location.state?.fromCatalog) { navigate(-1); return; }
    navigate('/catalogo');
  };

  return (
    <main className="flex-grow bg-[#FAF9F6] py-8 md:py-14">
      <Container>
        <button type="button" onClick={handleBackToCatalog} className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-950">
          <ChevronLeft className="h-4 w-4" /> Volver al catálogo
        </button>

        <section className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-stone-200 bg-green-50">
              {images.length > 0 ? (
                <img src={images[0]} alt={product.nombre} className="h-full w-full object-contain p-8" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="text-[10rem]" role="img" aria-label={product.nombre}>{product.emoji || '🥬'}</span>
              )}
            </motion.div>
          </div>

          <div className="lg:py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700">{product.categoria} · {porPeso ? 'se vende por peso' : `se vende por ${product.presentacion}`}</p>
            <h1 className="mt-3 font-serif text-4xl text-[#111111] md:text-5xl">{product.nombre}</h1>
            {porPeso ? (
              <>
                <p className="mt-4 text-sm uppercase tracking-wider text-slate-500">
                  {formatPrice(product.precioPorKg)} el kilo · {formatPrice(precioPorLibra(product.precioPorKg))} la libra{product.origen ? ` · ${product.origen}` : ''}
                </p>
                <div className="mt-6 flex items-end gap-3">
                  <Price value={precioPeso} size="lg" />
                  <p className="pb-1 text-sm text-slate-500">{formatearPeso(gramos)}</p>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm uppercase tracking-wider text-slate-500">
                  Precio por {product.presentacion}{product.origen ? ` · ${product.origen}` : ''}
                </p>
                <div className="mt-6 flex items-end gap-3">
                  <Price value={totalFijo} size="lg" />
                  <p className="pb-1 text-sm text-slate-500">{cantidad > 1 ? `${cantidad} × ${product.presentacion}` : product.presentacion}</p>
                </div>
              </>
            )}
            <p className="mt-7 leading-7 text-slate-600">{product.descripcion}</p>

            {porPeso ? (
              <>
                {/* Elige el peso */}
                <div className="mt-8 border-t border-stone-200 pt-6">
                  <h2 className="font-serif text-xl text-[#111111]">Elige el peso <span className="text-sm font-sans font-normal text-slate-500">(precio proporcional al kilo)</span></h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pesos.map((peso) => (
                      <button
                        key={peso}
                        type="button"
                        onClick={() => setGramos(peso)}
                        aria-pressed={gramos === peso}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                          gramos === peso
                            ? 'border-green-700 bg-green-700 text-white'
                            : 'border-stone-300 bg-white text-slate-700 hover:border-green-600'
                        }`}
                      >
                        {formatearPesoCorto(peso)} · {formatPrice(precioPorPeso(product.precioPorKg, peso))}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={MIN_GRAMOS}
                      max={MAX_GRAMOS}
                      step={50}
                      value={pesoLibre}
                      onChange={(e) => setPesoLibre(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') aplicarPesoLibre(); }}
                      placeholder={`Otro peso en gramos (mín. ${MIN_GRAMOS} g)`}
                      aria-label="Otro peso en gramos"
                      className="w-full max-w-xs rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-green-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={aplicarPesoLibre}
                      disabled={!Number(pesoLibre) || Number(pesoLibre) < MIN_GRAMOS}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-green-600 disabled:opacity-40"
                    >
                      Usar
                    </button>
                  </div>
                </div>

                {/* Agregar */}
                <div className="mt-6 border-t border-stone-200 pt-6">
                  <Button onClick={() => { addToCart(product, gramos); toast.success(`${product.nombre} (${formatearPeso(gramos)}) agregado al mercado`); }} className="gap-2 w-full sm:w-auto sm:flex-1 !bg-green-700 hover:!bg-green-800">
                    <ShoppingBag className="h-4 w-4" /> Agregar {formatearPeso(gramos)} · {formatPrice(precioPeso)}
                  </Button>
                  {enCanastaPeso > 0 && (
                    <p className="mt-2 text-sm text-slate-500">Ya llevas {formatearPeso(enCanastaPeso)} en tu canasta — se sumará.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Cantidad */}
                <div className="mt-8 border-t border-stone-200 pt-6">
                  <h2 className="font-serif text-xl text-[#111111]">¿Cuántos quieres?</h2>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                    <div className="flex w-fit items-center rounded-full border border-stone-300 bg-white">
                      <button type="button" onClick={() => changeCantidad(-1)} disabled={cantidad === 1} aria-label="Quitar uno" className="p-3 disabled:text-slate-300"><Minus className="h-4 w-4" /></button>
                      <span className="w-10 text-center text-sm font-medium">{cantidad}</span>
                      <button type="button" onClick={() => changeCantidad(1)} disabled={cantidad >= MAX_CANTIDAD_FIJA} aria-label="Agregar uno" className="p-3 disabled:text-slate-300"><Plus className="h-4 w-4" /></button>
                    </div>
                    <Button onClick={() => { addToCart(product, cantidad); toast.success(`${product.nombre} agregado al mercado`); }} className="gap-2 sm:flex-1 !bg-green-700 hover:!bg-green-800">
                      <ShoppingBag className="h-4 w-4" /> Agregar · {formatPrice(totalFijo)}
                    </Button>
                  </div>
                  {enCanastaCantidad > 0 && (
                    <p className="mt-2 text-sm text-slate-500">Ya llevas {enCanastaCantidad} en tu canasta — se sumará.</p>
                  )}
                </div>
              </>
            )}

            <p className="mt-6 flex items-center gap-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> {porPeso ? 'Disponible hoy — lo pesamos al momento' : 'Disponible hoy'}
            </p>
            <ShareButton title={product.nombre} text={porPeso ? `Mira esto en ${SITE_NAME}: ${product.nombre} a ${formatPrice(product.precioPorKg)} el kilo` : `Mira esto en ${SITE_NAME}: ${product.nombre} a ${formatPrice(product.precioFijo)} por ${product.presentacion}`} className="mt-3 w-full sm:w-auto" />
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-stone-200 pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">También te puede interesar</p>
            <h2 className="mt-2 font-serif text-3xl text-[#111111]">Más {product.categoria.toLowerCase()} frescos</h2>
            <div className="mt-8"><ProductGrid products={relatedProducts} /></div>
          </section>
        )}

        <Faq title="Preguntas sobre tu mercado" items={faqItems} />
      </Container>
    </main>
  );
}
