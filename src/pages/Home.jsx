import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import FeaturedProductsCarousel from '../components/product/FeaturedProductsCarousel';
import Button from '../components/common/Button';
import Faq from '../components/common/Faq';
import { purchaseFaqItems } from '../data/faq';
import { NAP, SOCIAL, SITE_FULL_NAME } from '../config/site';
import { getFeaturedProducts } from '../services/productService';
import useSEO from '../hooks/useSEO';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Leaf, MapPin, MessageCircle, Truck } from 'lucide-react';
import banner1 from '../IMAGENES/banner1.png';
import banner2 from '../IMAGENES/banner2.png';

const HERO_SLIDES = [banner1, banner2];

const CATEGORY_CARDS = [
  { nombre: 'Frutas', emoji: '🍎', texto: 'Dulces y jugosas del día', to: '/catalogo?categoria=Frutas' },
  { nombre: 'Verduras', emoji: '🍅', texto: 'Frescas para guisos y ensaladas', to: '/catalogo?categoria=Verduras' },
  { nombre: 'Tubérculos', emoji: '🥔', texto: 'Papa, yuca y más', to: '/catalogo?categoria=Tubérculos' },
  { nombre: 'Hierbas', emoji: '🌿', texto: 'Cilantro, ajo y aromáticas', to: '/catalogo?categoria=Hierbas' },
  { nombre: 'Lácteos', emoji: '🧀', texto: 'Quesos y leche', to: '/catalogo?categoria=Lácteos' },
  { nombre: 'Despensa', emoji: '🫓', texto: 'Arepas, panela y más', to: '/catalogo?categoria=Despensa' },
  { nombre: 'Bebidas', emoji: '🧃', texto: 'Zumos y agua', to: '/catalogo?categoria=Bebidas' },
];

export default function Home() {
  useSEO({
    title: 'Fruver El Granjero | Frutas y Verduras Frescas en Manizales',
    description:
      'Fruver en Manizales: frutas, verduras, tubérculos y hierbas frescas. Arma tu mercado en el catálogo y pide por WhatsApp.',
    canonical: '/',
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    getFeaturedProducts().then(setFeaturedProducts).finally(() => setLoadingProducts(false));
  }, []);

  // Slider automático del hero (5 segundos por banner)
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex-grow">
      {/* Hero con slider de banners */}
      <section className="relative overflow-hidden bg-[#111111]">
        <div className="relative h-[540px] md:h-[600px]">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={slide}
              src={HERO_SLIDES[slide]}
              alt={`Fruver El Granjero en Manizales — banner ${slide + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          {/* Sombra para que el texto se lea sobre la foto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          {/* Flechas */}
          <button
            type="button"
            onClick={() => setSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSlide((slide + 1) % HERO_SLIDES.length)}
            aria-label="Banner siguiente"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Contenido */}
          <Container className="absolute inset-0 z-10 flex items-end pb-16 md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl space-y-4 text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-green-600 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <Leaf className="w-3 h-3" /> Fresco todos los días
              </div>

              <h1 className="font-serif text-4xl font-bold leading-tight text-white md:text-6xl md:leading-[1.05]">
                Tu Fruver en Manizales — Mercado Fresco por WhatsApp
              </h1>

              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-white/90">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-green-400" /> Cra. 14 #55d-148, frente al Mallplaza
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-green-400" /> Lun. a sáb. 8 a.m.–9 p.m. · Dom. 8 a.m.–8 p.m.
                </span>
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/catalogo">
                  <Button variant="primary" size="lg" className="flex items-center gap-2 text-sm md:text-base !bg-green-600 hover:!bg-green-700">
                    Armar mi mercado <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/50 px-8 py-4 text-sm font-medium text-white transition hover:bg-white/10 md:text-base">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </motion.div>
          </Container>

          {/* Puntos */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSlide(index)}
                aria-label={`Ir al banner ${index + 1}`}
                className={`h-2 rounded-full transition-all ${index === slide ? 'w-6 bg-green-400' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-[#111111] py-14 md:py-20">
        <Container>
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-400">Compra por categoría</p>
            <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">¿Qué necesitas hoy?</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_CARDS.map((cat) => (
              <Link key={cat.nombre} to={cat.to} className="group rounded-3xl border border-green-700/40 bg-white/[0.04] p-7 text-center transition hover:bg-white/[0.08]">
                <div className="text-5xl transition group-hover:scale-110">{cat.emoji}</div>
                <h3 className="mt-4 font-serif text-2xl text-white">{cat.nombre}</h3>
                <p className="mt-1 text-sm text-slate-400">{cat.texto}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-green-400">Ver productos <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Cómo pedir */}
      <section className="bg-white py-14 md:py-20 border-y border-slate-100">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700 text-center">{SITE_FULL_NAME} — Así de fácil</p>
          <h2 className="mt-3 font-serif text-3xl text-[#111111] md:text-4xl text-center">Arma tu mercado en 3 pasos</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3 text-left">
            <div className="rounded-2xl border border-stone-200 p-5"><p className="text-3xl">🧺</p><p className="mt-2 font-semibold text-[#111111]">1. Elige en el catálogo</p><p className="text-sm text-slate-600 mt-1">Pide por gramos: 250 g, 1 libra, 1 kg o lo que necesites.</p></div>
            <div className="rounded-2xl border border-stone-200 p-5"><p className="text-3xl">💬</p><p className="mt-2 font-semibold text-[#111111]">2. Envía por WhatsApp</p><p className="text-sm text-slate-600 mt-1">Tu pedido llega armado al {NAP.telephone}.</p></div>
            <div className="rounded-2xl border border-stone-200 p-5"><p className="text-3xl">🏠</p><p className="mt-2 font-semibold text-[#111111]">3. Recibe fresco</p><p className="text-sm text-slate-600 mt-1">Domicilio en Manizales o recoge en tienda.</p></div>
          </div>
          <Faq title="Preguntas sobre tu mercado" items={purchaseFaqItems} />
        </Container>
      </section>

      {/* Destacados */}
      <section className="bg-[#FAF9F6] py-20">
        <Container>
          <SectionTitle
            title="Lo más pedido de la semana"
            subtitle="Fresco, de todos los días y al mejor precio en Manizales."
            centered
          />
          <FeaturedProductsCarousel products={featuredProducts} loading={loadingProducts} />

          <div className="text-center mt-12">
            <Link to="/catalogo">
              <Button variant="outline" size="md">
                Ver todo el catálogo
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="rounded-2xl bg-green-50 p-3 text-green-700">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111111]">Fresco todos los días</h3>
                <p className="text-xs text-slate-500 mt-1">Surtido diario seleccionado en la mañana.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="rounded-2xl bg-green-50 p-3 text-green-700">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111111]">Domicilio en Manizales</h3>
                <p className="text-xs text-slate-500 mt-1">Coordinas entrega por WhatsApp al confirmar.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="rounded-2xl bg-green-50 p-3 text-green-700">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111111]">Pide por WhatsApp</h3>
                <p className="text-xs text-slate-500 mt-1">Sin registros ni pagos en línea: directo y humano.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
