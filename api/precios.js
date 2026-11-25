/**
 * /api/precios — Precios y stock del catálogo de Fruver El Granjero
 *
 * La web es estática, así que este endpoint le entrega los precios vigentes
 * de GridPOS. El navegador nunca ve las credenciales.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 *   GRIDPOS_TOKEN          Token de API (recomendado si es de larga duración)
 *   GRIDPOS_CLIENT_SLUG    Slug de la sede (por defecto fruver-el-granjero)
 *   GRIDPOS_EMAIL          Usuario dedicado para la web (alternativa al token)
 *   GRIDPOS_PASSWORD       Clave de ese usuario
 *   GRIDPOS_STORE_SLUG     Solo si algún día publicas la tienda virtual
 *   GRIDPOS_STORE_TOKEN    Token gpk_ de la tienda (opcional)
 *
 * Orden de intentos: token → usuario/clave → tienda pública.
 */

const API_BASE = (process.env.GRIDPOS_API_BASE || "https://api-co.gridpos.co/api/v1").replace(/\/$/, "");
const STORE_BASE = (process.env.GRIDPOS_STORE_BASE || "https://api-co.gridpos.co/api/external/v1").replace(/\/$/, "");
const SLUG = process.env.GRIDPOS_CLIENT_SLUG || "fruver-el-granjero";
const TOKEN = (process.env.GRIDPOS_TOKEN || "").trim();
const EMAIL = (process.env.GRIDPOS_EMAIL || "").trim();
const PASSWORD = (process.env.GRIDPOS_PASSWORD || "").trim();
const STORE_SLUG = (process.env.GRIDPOS_STORE_SLUG || "").trim();
const STORE_TOKEN = (process.env.GRIDPOS_STORE_TOKEN || "").trim();

const TTL_MS = 60 * 1000; // 1 minuto
let cache = { at: 0, data: null };
let loginCache = { token: "", at: 0 };

function norm(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(kg|und|unidad|unidades|g|gr|lt|ml|lb|oz|x|de|del|en|con|a|el|la|los|las|y)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function getLoginToken() {
  if (!EMAIL || !PASSWORD) return "";
  // El token de sesión se reutiliza 20 minutos
  if (loginCache.token && Date.now() - loginCache.at < 20 * 60 * 1000) return loginCache.token;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Slug": SLUG,
    },
    body: JSON.stringify({ email_or_nickname: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login GridPOS ${res.status}`);
  const json = await res.json();
  const token =
    json.token || json.access_token ||
    (json.data && (json.data.token || json.data.access_token)) || "";
  if (!token) throw new Error("Login GridPOS sin token");
  loginCache = { token, at: Date.now() };
  return token;
}

async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      Accept: "application/json",
      "X-Client-Slug": SLUG,
    },
  });
  if (!res.ok) throw new Error(`GridPOS ${path} ${res.status}`);
  return res.json();
}

async function collectPages(path) {
  const rows = [];
  let page = 1;
  for (;;) {
    const sep = path.includes("?") ? "&" : "?";
    const json = await apiGet(`${path}${sep}perPage=200&page=${page}`, await pickToken());
    rows.push(...(json.data || []));
    const last = Number(json.last_page || 1);
    if (page >= last || page > 50) break;
    page += 1;
  }
  return rows;
}

let activeToken = "";

async function pickToken() {
  if (activeToken) return activeToken;
  if (TOKEN) {
    activeToken = TOKEN;
    return activeToken;
  }
  activeToken = await getLoginToken();
  return activeToken;
}

async function fromPrivateApi() {
  const products = await collectPages("/products");
  let stock = {};
  try {
    const pos = await apiGet("/products/pos?type=1&ware_house_id=1&per_page=1000&include_modifiers=true", await pickToken());
    for (const p of pos.data || []) stock[p.id] = Number(p.stock);
  } catch {
    stock = {};
  }
  const categories = await apiGet("/categories?perPage=200", await pickToken()).catch(() => ({ data: [] }));
  return { products, stock, categories: categories.data || [], source: TOKEN ? "token" : "login" };
}

async function fromStoreApi() {
  if (!STORE_SLUG || !STORE_TOKEN) throw new Error("Tienda no configurada");
  const res = await fetch(`${STORE_BASE}/catalog`, {
    headers: {
      Authorization: `Bearer ${STORE_TOKEN}`,
      Accept: "application/json",
      "X-Client-Slug": STORE_SLUG,
    },
  });
  if (!res.ok) throw new Error(`Tienda GridPOS ${res.status}`);
  const json = await res.json();
  const stock = {};
  for (const p of json.products || []) {
    stock[p.id] = p.warehouses && p.warehouses[0] && p.warehouses[0].pivot
      ? Number(p.warehouses[0].pivot.quantity)
      : null;
  }
  return {
    products: (json.products || []).map((p) => ({
      id: p.id,
      name: p.name,
      price_sale: p.total_price ?? p.price_sale,
      is_weight_product: p.is_weight_product,
      category_id: p.category_id,
    })),
    stock,
    categories: json.categories || [],
    source: "store",
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (cache.data && Date.now() - cache.at < TTL_MS) {
    return res.status(200).json(cache.data);
  }

  let raw;
  let lastError = null;
  for (const fn of [fromPrivateApi, fromStoreApi]) {
    try {
      raw = await fn();
      break;
    } catch (err) {
      lastError = err;
      activeToken = ""; // reintenta login en el siguiente intento
    }
  }

  if (!raw) {
    return res.status(502).json({
      ok: false,
      error: lastError ? String(lastError.message || lastError) : "Sin fuente de datos",
    });
  }

  const catById = {};
  for (const c of raw.categories || []) catById[c.id] = c.name;

  const products = (raw.products || [])
    .filter((p) => p && p.name)
    .map((p) => {
      const stock = raw.stock[p.id];
      return {
        id: p.id,
        name: p.name,
        key: norm(p.name),
        price: Number(p.price_sale ?? p.total_price ?? 0),
        isWeight: !!p.is_weight_product,
        category: catById[p.category_id] || null,
        stock: stock === undefined ? null : stock,
      };
    })
    .filter((p) => p.price > 0);

  const data = {
    ok: true,
    source: raw.source,
    updatedAt: new Date().toISOString(),
    count: products.length,
    products,
  };

  cache = { at: Date.now(), data };
  return res.status(200).json(data);
}
