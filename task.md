# Fruver El Granjero — Tareas (copia del esquema perfume-store)

Esquema copiado de la tienda de perfumes, adaptado a fruver:
`data/productos.js` → `services/productService.js` → `hooks/useProducts.js` →
`pages/Home|Catalog|Product` + `components/ProductCard|ProductGrid|FilterSidebar` +
`store/useCartStore.js` (Zustand + localStorage) → `utils/whatsapp.js` (pedido por wa.me)

## Catálogo real (lista de precios del negocio) ✅
- `[x]` `data/productos.js` con 111 productos y precios reales:
  67 por peso (`precioPorKg`: tomate, papa, frutas, verduras...) y
  44 de presentación fija (`precioFijo` + `presentacion`: bandejas, und, litros, atados, bolsas, bultos)
- `[x]` Categorías: Frutas (49), Verduras (27), Tubérculos (8), Hierbas (7), Lácteos (4), Despensa (12), Bebidas (4)
- `[x]` Sin `stock`: siempre hay; si falta algo se avisa por WhatsApp
- `[ ]` Fotos reales: hoy se muestra el emoji de cada producto (`imagen: null`).
  Para poner foto: guarda en `public/images/` y pon `imagen: '/images/tomate.jpg'`

## Datos fruver ✅
- `[x]` `data/productos.js` con 14 productos (Frutas, Verduras, Tubérculos, Hierbas), precio por kg/unidad/atado en COP
- `[x]` `services/productService.js` simplificado (sin marcas/género, solo categoría)
- `[x]` `store/useCartStore.js` con key `fruver-cart`
- `[x]` `utils/whatsapp.js` con mensaje de mercado + `VITE_WHATSAPP_NUMBER=573207141222`
- `[x]` `.env` + `site.js` + `index.html` con NAP: Cra. 14 #55d-148, Manizales

## Catálogo ✅
- `[x]` `useProducts.js` solo búsqueda + categoría
- `[x]` `FilterSidebar` solo categorías
- `[x]` `Catalog.jsx` con `?categoria=` y `?q=` + schema ItemList fruver
- `[x]` `ProductCard` con emoji + `por kg/unidad/atado`
- `[x]` `Product.jsx` con unidad/categoría (sin notas olfativas)

## UI ✅
- `[x]` `Home.jsx` fruver (hero, categorías, 3 pasos, destacados)
- `[x]` `Navbar` (logo 🥬 + buscar tomate/manzana), `Footer`, `MobileCta`, `CartDrawer|CartItem|CartSummary` en verde
- `[x]` `About`, `Contact`, `NotFound`, `faq.js` fruver

## Venta por peso (gramos) ✅
- `[x]` `utils/peso.js`: precio proporcional al kilo (redondeado a $50), pesos 250 g / 1 libra / 1 kg / 2 kg (hierbas: 50/100/250/500 g), peso libre 50–10000 g
- `[x]` `data/productos.js`: `precioPorKg` por producto, sin `stock`/`unidad` (siempre hay; si falta algo se avisa por WhatsApp)
- `[x]` `store/useCartStore.js`: UNA línea por producto con su peso total (agregar suma gramos), stepper ±250 g (±50 g en hierbas)
- `[x]` `utils/whatsapp.js`: mensaje con peso por producto, peso total y total a pagar (sin bolsas)
- `[x]` `ProductCard`: chips de peso + precio del peso elegido
- `[x]` `Product.jsx`: elige peso (chips + peso libre) y agrega; avisa lo que ya llevas
- `[x]` `CartItem`/`CartDrawer`/`CartSummary`: stepper en gramos, peso total y subtotal por línea (sin bolsas)

## Pendiente
- `[ ]` Tomar fotos reales y ponerlas en `imagen` (hoy se muestran emojis)
- `[ ]` Cambiar `VITE_SITE_URL` al dominio final + favicon/logo propio
- `[ ]` `npm install && npm run dev` para verlo, luego `npm run build`
- `[ ]` Actualizar `Privacy`/`Terminos` con razón social del fruver si aplica
