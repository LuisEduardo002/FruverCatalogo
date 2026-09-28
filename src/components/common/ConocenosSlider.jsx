import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Container from '../layout/Container';
import video1 from '../../IMAGENES/conocenosvideos.mp4';
import video2 from '../../IMAGENES/conocenosvideo2.mp4';
import fotoLocal from '../../IMAGENES/conoceellugar.jpeg';

const VIDEOS = [
  { src: video1, titulo: 'Nuestro fruver' },
  { src: video2, titulo: 'Fresco todos los días' },
];

const FOTOS = [{ src: fotoLocal, titulo: 'Conoce el lugar' }];

/**
 * ConocenosSlider — Sección "Conócenos" con videos del negocio.
 * Va justo antes del footer en el inicio.
 */
export default function ConocenosSlider() {
  const previousButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  return (
    <section className="bg-[#111111] py-14 md:py-20">
      <Container>
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-400">Conócenos</p>
          <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">Así es nuestro fruver</h2>
          <p className="mt-2 text-sm text-slate-400">Te esperamos en Cra. 14 #55d-148, frente al Mallplaza, Manizales.</p>
        </div>

        <div className="group/carousel relative mx-auto max-w-4xl px-2 sm:px-12">
          <button
            ref={previousButtonRef}
            type="button"
            aria-label="Ver video anterior"
            className="absolute -left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-green-700/40 bg-white/10 text-white shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-green-700 active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:left-1 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          <button
            ref={nextButtonRef}
            type="button"
            aria-label="Ver siguiente video"
            className="absolute -right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-green-700/40 bg-white/10 text-white shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-green-700 active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:right-1 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5 stroke-[2.5]" />
          </button>

          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              prevEl: previousButtonRef.current,
              nextEl: nextButtonRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = previousButtonRef.current;
              swiper.params.navigation.nextEl = nextButtonRef.current;
            }}
            onInit={(swiper) => {
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 24 },
            }}
            className="!overflow-hidden py-4"
          >
            {FOTOS.map((foto) => (
              <SwiperSlide key={foto.src} className="!h-auto">
                <div className="overflow-hidden rounded-3xl border border-green-700/40 bg-black">
                  <img
                    src={foto.src}
                    alt={foto.titulo}
                    loading="lazy"
                    className="h-auto max-h-[520px] w-full object-contain"
                  />
                </div>
                <p className="mt-3 text-center text-sm text-slate-300">{foto.titulo}</p>
              </SwiperSlide>
            ))}
            {VIDEOS.map((slide) => (
              <SwiperSlide key={slide.src} className="!h-auto">
                <div className="overflow-hidden rounded-3xl border border-green-700/40 bg-black">
                  <video
                    src={slide.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-[9/16] max-h-[520px] w-full object-contain sm:object-cover"
                    aria-label={slide.titulo}
                  />
                </div>
                <p className="mt-3 text-center text-sm text-slate-300">{slide.titulo}</p>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}
