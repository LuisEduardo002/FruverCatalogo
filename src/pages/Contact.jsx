import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import KeyTakeaways from '../components/common/KeyTakeaways';
import RelatedLinks from '../components/common/RelatedLinks';

const Contact = () => {
  useSEO({
    title: 'Contacto — Fruver El Granjero',
    description:
      'Contacta a Fruver El Granjero en Manizales: WhatsApp +57 320 7141222, Cra. 14 #55d-148. Lun. a sáb. 8:00–19:00.',
    canonical: '/contact',
  });
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Contacto — Fruver El Granjero</h1>
      <p className="mb-6 text-lg leading-relaxed text-slate-700">
        ¿Dudas con tu mercado, disponibilidad o entregas? Escríbenos por WhatsApp y te respondemos
        en horario laboral. Estamos en Cra. 14 #55d-148, Manizales.
      </p>

      <div className="mb-8">
        <KeyTakeaways
          title="TL;DR: cómo pedir rápido"
          items={[
            'WhatsApp: +57 320 7141222 (Lun. a sáb. 8:00–19:00).',
            'Dirección: Cra. 14 #55d-148, Manizales, Caldas.',
            'Para pedir: arma tu mercado en el catálogo y envíalo por WhatsApp.',
          ]}
          cta={{ to: '/catalogo', label: 'Armar mi mercado' }}
        />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <h2 className="font-semibold text-[#111]">WhatsApp</h2>
          <p className="mt-1 text-sm text-gray-600">+57 320 7141222</p>
          <a href="https://wa.me/573207141222" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline">
            Abrir WhatsApp →
          </a>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <h2 className="font-semibold text-[#111]">Tienda</h2>
          <p className="mt-1 text-sm text-gray-600">Cra. 14 #55d-148, Manizales</p>
          <Link to="/catalogo" className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline">
            Ver catálogo →
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <h2 className="font-semibold text-[#111]">Horario</h2>
          <p className="mt-1 text-sm text-gray-600">Lun. a sáb. 8:00–19:00</p>
          <p className="text-xs text-gray-500">Dom. 8:00–13:00</p>
        </div>
      </div>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Datos oficiales</h2>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">
            <p><strong>Nombre:</strong> Fruver El Granjero</p>
            <p><strong>Dirección:</strong> Cra. 14 #55d-148, Manizales, Caldas, Colombia</p>
            <p><strong>WhatsApp:</strong> +57 320 7141222</p>
            <p><strong>Horario:</strong> Lunes a sábado 8:00–19:00</p>
            <p><strong>Web:</strong> https://fruverelgranjero.store</p>
          </div>
        </div>

        <RelatedLinks
          links={[
            { to: '/about', label: 'Sobre nosotros' },
            { to: '/catalogo', label: 'Catálogo del fruver' },
          ]}
        />

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Última actualización: 2026 — Fruver El Granjero, Manizales</p>
        </div>
      </section>
    </main>
  );
};

export default Contact;
