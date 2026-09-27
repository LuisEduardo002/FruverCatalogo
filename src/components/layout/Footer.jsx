import { Link } from 'react-router-dom';
import Container from './Container';
import logo from '../../IMAGENES/LOGOFRUVER.png';

const footerLink = 'text-sm text-[#CFCFCF] transition-colors hover:text-green-400';

export default function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-green-700 bg-[#111111] py-12 text-[#CFCFCF]">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Link to="/" className="mb-5 inline-block">
              <img src={logo} alt="Fruver El Granjero — Manizales" className="h-24 w-auto rounded-2xl object-contain" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[#CFCFCF]">Frutas, verduras y tubérculos frescos todos los días en Manizales. Pide tu mercado por WhatsApp.</p>
          </div>
          <div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-green-400">Tienda</p><ul className="space-y-3"><li><Link to="/catalogo" className={footerLink}>Ver catálogo</Link></li><li><Link to="/about" className={footerLink}>Sobre nosotros</Link></li><li><Link to="/contact" className={footerLink}>Contacto</Link></li></ul></div>
          <div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-green-400">Tu mercado</p><ul className="space-y-3 text-sm"><li><Link to="/privacy" className={footerLink}>Privacidad</Link></li><li><Link to="/terminos" className={footerLink}>Términos</Link></li><li>Producto fresco del día</li></ul></div>
          <div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-green-400">Contacto</p><ul className="space-y-3 text-sm"><li>Cra. 14 #55d-148, frente al Mallplaza</li><li>Al lado de Concentrados del Centro, Manizales</li><li>fruverelgranjero@gmail.com</li><li><a href="https://wa.me/573207141222" target="_blank" rel="noopener noreferrer" className={footerLink}>+57 320 7141222</a></li><li>Lun. a sáb. 8:00 a.m. – 9:00 p.m.</li><li>Dom. 8:00 a.m. – 8:00 p.m.</li></ul></div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-green-700/25 pt-7 text-center text-xs text-slate-500 md:flex-row md:text-left"><p>© {new Date().getFullYear()} Fruver El Granjero. Todos los derechos reservados.</p><div className="space-x-4"><Link to="/about" className="hover:text-green-400">Sobre nosotros</Link><Link to="/contact" className="hover:text-green-400">Contacto</Link><Link to="/privacy" className="hover:text-green-400">Privacidad</Link><Link to="/terminos" className="hover:text-green-400">Términos</Link></div></div>
      </Container>
    </footer>
  );
}
