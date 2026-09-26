import useSEO from '../hooks/useSEO';
import KeyTakeaways from '../components/common/KeyTakeaways';
import RelatedLinks from '../components/common/RelatedLinks';

const About = () => {
  useSEO({
    title: 'Sobre Nosotros — Fruver El Granjero',
    description:
      'Fruver El Granjero en Manizales: frutas, verduras, tubérculos y hierbas frescas todos los días. Catálogo en línea y pedido por WhatsApp.',
    canonical: '/about',
  });
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Sobre Fruver El Granjero 🥬</h1>
      <p className="mb-6 text-lg leading-relaxed text-slate-700">
        Somos el fruver de la Cra. 14 #55d-148 en Manizales. Todos los días seleccionamos frutas,
        verduras, tubérculos y hierbas frescas para tu hogar. Esta página es nuestro catálogo en línea:
        eliges el peso en gramos, agregas a la canasta y confirmas por WhatsApp al +57 320 7141222.
        Sin registros, sin pagos en línea, atención humana.
      </p>

      <div className="mb-8">
        <KeyTakeaways
          title="TL;DR: por qué mercar aquí"
          items={[
            'Surtido fresco todos los días: tomate, papa, plátano, manzana, aguacate y más.',
            'Precios claros en COP: proporcionales al peso, o fijos por unidad, bandeja y litro.',
            'Pides por WhatsApp +57 320 7141222 y coordinas entrega o recogida.',
            'Atención Lun. a sáb. 8:00–19:00, dom. 8:00–13:00.',
          ]}
          cta={{ to: '/catalogo', label: 'Armar mi mercado' }}
        />
      </div>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Cómo funciona</h2>
          <p>
            1) Explora el catálogo, 2) elige el peso en gramos de cada producto, 3) presiona “Pedir por WhatsApp”.
            Llega un mensaje armado con tu mercado y el total. Te confirmamos el pedido,
            hora de entrega y valor del domicilio si aplica.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Dónde estamos</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
            <p><strong>Fruver El Granjero</strong></p>
            <p>Cra. 14 #55d-148, Manizales, Caldas, Colombia</p>
            <p>WhatsApp: +57 320 7141222 · Horario: Lun. a sáb. 8:00–19:00</p>
          </div>
        </div>

        <RelatedLinks
          links={[
            { to: '/contact', label: 'Contacto y WhatsApp' },
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

export default About;
