import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../components/layout/Container';
import SectionTitle from '../components/common/SectionTitle';
import FeaturedProductsCarousel from '../components/product/FeaturedProductsCarousel';
import Button from '../components/common/Button';
import Faq from '../components/common/Faq';
import { purchaseFaqItems } from '../data/faq';
import { NAP, SOCIAL, SITE_FULL_NAME } from '../config/site';
import { getFeaturedProducts } from '../services/productService';
import useSEO from '../hooks/useSEO';
import { ArrowRight, Leaf, Truck, MessageCircle } from 'lucide-react';

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

  useEffect(() => {
    getFeaturedProducts().then(setFeaturedProducts).finally(() => setLoadingProducts(false));
  }, []);

  return (
    <main className="flex-grow">
      {/* Hero fruver */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-[#FAF9F6] to-amber-50 py-16 md:py-24">
        <Container className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 md:space-y-6 text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-green-700 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <Leaf className="w-3 h-3" /> Fresco todos los días
              </div>

              <h1 className="text-3xl font-serif font-bold leading-tight text-[#111111] md:text-[44px] md:leading-[1.05]">
                Tu Fruver en Manizales — Mercado Fresco por WhatsApp
              </h1>
              <p className="text-base font-semibold tracking-[0.14em] uppercase text-green-700 -mt-1">{SITE_FULL_NAME} · Cra. 14 #55d-148</p>

              <p className="hidden md:block text-lg text-slate-600 font-light leading-relaxed">
                Arma tu mercado en el catálogo: frutas, verduras y todo lo del día, por peso con precio proporcional al kilo o por unidad, bandeja y litro. Confirmas por WhatsApp y lo recibes en casa.
              </p>

              <div className="flex flex-wrap gap-4 pt-1 md:pt-2 justify-center md:justify-start">
                <Link to="/catalogo">
                  <Button variant="primary" size="lg" className="flex items-center gap-2 text-sm md:text-base !bg-green-700 hover:!bg-green-800">
                    Armar mi mercado <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="flex items-center gap-2 text-sm md:text-base">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:flex justify-center"
            >
              <div className="relative flex h-96 w-80 flex-col justify-between rounded-3xl border border-green-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Del día 🥬</span>
                <div className="text-center text-8xl">🥑</div>
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#111111]">Fresco y justo</h2>
                  <p className="text-sm text-slate-500 mt-2">Tomate, papa, plátano, aguacate y más, seleccionados cada mañana.</p>
                </div>
                <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center text-xs text-slate-600">
                  <span>{NAP.address.full}</span>
                  <span className="font-semibold text-green-700">8:00–19:00</span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
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
