/* ==========================================================================
   PORTFOLIO CONTROLLER & GALLERY ENGINE
   Team: Juan Urbina, Daniel Rodríguez, Maykelis Meléndez
   ========================================================================== */

/**
 * Catálogo detallado para la Galería de Productos del Portafolio
 */
/**
 * Imágenes individuales y datos de marca por producto
 * Los productos con imagen individual usan su foto; el resto usa la foto de categoría.
 */
const PRODUCT_IMAGES = {
  101: { img: "assets/prod_harina_pan.jpg",  fallback: "assets/products_viveres.jpg",  emoji: "🌽", brand: "P.A.N.",          brandColor: "#1d4ed8" },
  102: { img: "assets/prod_arroz.jpg",        fallback: "assets/products_viveres.jpg",  emoji: "🌾", brand: "Harvest Gold",     brandColor: "#b45309" },
  103: { img: "assets/prod_pasta.jpg",        fallback: "assets/products_viveres.jpg",  emoji: "🍝", brand: "Italia Bella",     brandColor: "#dc2626" },
  104: { img: "assets/prod_aceite.jpg",       fallback: "assets/products_viveres.jpg",  emoji: "🌻", brand: "Vatel",           brandColor: "#d97706" },
  105: { img: "assets/prod_cafe.jpg",         fallback: "assets/products_viveres.jpg",  emoji: "☕", brand: "Fama de América",  brandColor: "#78350f" },
  106: { img: "assets/prod_azucar.jpg",       fallback: "assets/products_viveres.jpg",  emoji: "🍚", brand: "Montalbán",       brandColor: "#059669" },
  107: { img: "assets/prod_queso.jpg",        fallback: "assets/products_lacteos.jpg",  emoji: "🧀", brand: "Quesos Llaneros",  brandColor: "#ca8a04" },
  108: { img: "assets/prod_leche.jpg",        fallback: "assets/products_lacteos.jpg",  emoji: "🥛", brand: "Parmalat",        brandColor: "#2563eb" },
  110: { img: "assets/prod_mantequilla.jpg",  fallback: "assets/products_lacteos.jpg",  emoji: "🧈", brand: "Mavesa",          brandColor: "#eab308" },
  111: { img: "assets/prod_jamon.jpg",        fallback: "assets/products_lacteos.jpg",  emoji: "🥓", brand: "Plumrose",        brandColor: "#e11d48" },
  109: { img: "assets/prod_refresco.jpg",     fallback: "assets/products_bebidas.jpg",  emoji: "🥤", brand: "Coca-Cola",       brandColor: "#dc2626" },
  112: { img: "assets/prod_malta.jpg",        fallback: "assets/products_bebidas.jpg",  emoji: "🍺", brand: "Malta Polar",      brandColor: "#92400e" },
  113: { img: "assets/prod_jugo.jpg",         fallback: "assets/products_bebidas.jpg",  emoji: "🍊", brand: "Yukery",          brandColor: "#ea580c" },
  114: { img: "assets/prod_agua.jpg",         fallback: "assets/products_bebidas.jpg",  emoji: "💧", brand: "Minalba",         brandColor: "#0284c7" },
  115: { img: "assets/prod_galletas.jpg",     fallback: "assets/products_snacks.jpg",   emoji: "🍪", brand: "Club Social",     brandColor: "#2563eb" },
  116: { img: "assets/prod_chocolate.jpg",    fallback: "assets/products_snacks.jpg",   emoji: "🍫", brand: "Savoy",           brandColor: "#854d0e" }
};

const GALLERY_PRODUCTS = [
  // Víveres
  { id: 101, name: "Harina P.A.N. Blanca 1kg",      category: "viveres", price: 1.25, stock: 45,  desc: "Harina de maíz blanco precocida marca P.A.N., estándar nacional de Venezuela para arepas." },
  { id: 102, name: "Arroz Blanco Harvest Gold 1kg",  category: "viveres", price: 1.10, stock: 30,  desc: "Grano largo seleccionado calidad gourmet de alta cocción y grano suelto." },
  { id: 103, name: "Pasta Spaghetti Italia Bella 500g", category: "viveres", price: 0.95, stock: 25,  desc: "Spaghetti elaborado con sémola de trigo duro durum, cocción al dente en 10 min." },
  { id: 104, name: "Aceite Vegetal Vatel 1L",        category: "viveres", price: 2.40, stock: 18,  desc: "Aceite comestible puro refinado marca Vatel, ideal para freír y aderezos diarios." },
  { id: 105, name: "Café Fama de América Gourmet 250g", category: "viveres", price: 2.80, stock: 14, desc: "Café molido tostado criollo con aroma intenso y cuerpo balanceado tradicional." },
  { id: 106, name: "Azúcar Blanca Montalbán 1kg",    category: "viveres", price: 1.30, stock: 22,  desc: "Azúcar blanca refinada de caña Central Montalbán, dulzura pura cristalina." },
  // Lácteos & Charcutería
  { id: 107, name: "Queso Blanco Llanero Especial (kg)", category: "lacteos", price: 4.80, stock: 4.5, desc: "Queso blanco semiduro llanero tradicional, textura óptima para rallar o asar." },
  { id: 108, name: "Leche Completa Parmalat 1L",     category: "lacteos", price: 1.95, stock: 15,  desc: "Leche entera líquida pasteurizada UHT marca Parmalat enriquecida con vitaminas." },
  { id: 110, name: "Mantequilla con Sal Mavesa 250g", category: "lacteos", price: 1.75, stock: 16,  desc: "Mantequilla untable con sal marina marca Mavesa, sabor y cremosidad auténtica." },
  { id: 111, name: "Jamón de Pierna Cocido Plumrose (kg)", category: "lacteos", price: 6.50, stock: 8.0, desc: "Jamón de pierna seleccionado Plumrose, bajo en grasa y cortado fino para charcutería." },
  // Bebidas
  { id: 109, name: "Refresco Coca-Cola Sabor Original 2L", category: "bebidas", price: 2.00, stock: 3.0, desc: "Bebida gaseosa refrescante Coca-Cola en presentación familiar 2 litros bien fría." },
  { id: 112, name: "Malta Polar Botella 250ml",      category: "bebidas", price: 0.90, stock: 48,  desc: "Bebida alimenticia de cebada malteada Polar, energizante natural rica en complejo B." },
  { id: 113, name: "Jugo Natural Yukery Naranja 1L", category: "bebidas", price: 1.60, stock: 12,  desc: "Néctar de naranja pasteurizado Yukery con pulpa natural y alta vitamina C." },
  { id: 114, name: "Agua Mineral Natural Minalba 5L", category: "bebidas", price: 1.50, stock: 20,  desc: "Agua mineral pura embotellada de manantial Minalba, filtrado ozonizado multi-etapa." },
  // Snacks & Despensa
  { id: 115, name: "Galletas Club Social Familiar",  category: "snacks",  price: 1.15, stock: 24,  desc: "Galletas saladas horneadas crujientes Club Social, paquete familiar multipack." },
  { id: 116, name: "Chocolate Savoy Criollo de Leche 70g", category: "snacks", price: 1.40, stock: 35, desc: "Barra de chocolate criollo de leche Savoy con cacao venezolano de exportación." }
];

let currentGalleryCategory = "todos";

/**
 * Renderiza la Galería de Productos del Portafolio
 */
function renderProductGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  const filtered = currentGalleryCategory === "todos"
    ? GALLERY_PRODUCTS
    : GALLERY_PRODUCTS.filter(p => p.category === currentGalleryCategory);

  container.innerHTML = filtered.map(p => {
    const isLow = p.stock <= 5;
    const priceVES = (p.price * exchangeRate).toFixed(2);
    const categoryName = {
      viveres: "🌾 Víveres",
      lacteos: "🧀 Lácteos & Charcutería",
      bebidas: "🥤 Bebidas",
      snacks: "🍫 Snacks & Despensa"
    }[p.category] || "General";

    const productMedia = PRODUCT_IMAGES[p.id] || { img: null, fallback: null, emoji: '📦', brand: null, brandColor: '#334155' };
    const brandBadge = productMedia.brand
      ? `<div class="p-gallery-brand" style="--brand-color: ${productMedia.brandColor}">${productMedia.brand}</div>`
      : '';

    return `
      <div class="p-gallery-card">
        <div class="p-gallery-img-box">
          <img
            src="${productMedia.img}"
            alt="${escapeHTML(p.name)}"
            loading="lazy"
            onerror="if(!this.dataset.fallback && '${productMedia.fallback || ''}') { this.dataset.fallback='1'; this.src='${productMedia.fallback}'; } else { this.style.display='none'; this.nextElementSibling.style.display='flex'; }"
          />
          <div class="p-gallery-img-fallback">${productMedia.emoji}</div>
          <span class="p-gallery-stock-badge ${isLow ? 'low' : ''}">
            ${isLow ? `⚠️ ${p.stock}` : `✅ ${p.stock}`}
          </span>
        </div>
        ${brandBadge}
        <div class="p-gallery-category">${categoryName}</div>
        <div class="p-gallery-title" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</div>
        <p style="font-size: 0.78rem; color: var(--p-text-muted); margin-bottom: 10px; line-height: 1.4;">
          ${escapeHTML(p.desc)}
        </p>
        <div class="p-gallery-price-row">
          <span class="p-gallery-price-usd">$${p.price.toFixed(2)}</span>
          <span class="p-gallery-price-ves">Bs. ${priceVES}</span>
        </div>
        <button class="p-gallery-add-btn" onclick="addToSimFromGallery(${p.id})">
          <span>🛒</span>
          <span>Añadir al Simulador</span>
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Filtra los productos de la galería por categoría
 * @param {string} cat - Categoría seleccionada
 * @param {HTMLElement} btn - Botón clickeado
 */
function filterGallery(cat, btn) {
  currentGalleryCategory = cat;
  document.querySelectorAll('.p-gallery-pill').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProductGallery();
}

/**
 * Agrega un producto desde la Galería directamente al Simulador POS
 * @param {number} prodId - ID del producto
 */
function addToSimFromGallery(prodId) {
  // Asegurar que el producto existe en el catálogo del POS
  let prod = products.find(x => x.id === prodId);
  if (!prod) {
    const galleryItem = GALLERY_PRODUCTS.find(x => x.id === prodId);
    if (galleryItem) {
      prod = {
        id: galleryItem.id,
        name: galleryItem.name,
        price: galleryItem.price,
        stock: galleryItem.stock
      };
      products.push(prod);
      saveDB();
    }
  }

  // Invocar la función de agregar al carrito del POS
  addToCart(prodId);
  showToast(`✓ "${prod.name}" añadido al Carrito del Simulador`);

  // Animar suavemente el contador del carrito del simulador
  const cartBadge = document.getElementById('cartItemCount');
  if (cartBadge) {
    cartBadge.style.transform = 'scale(1.3)';
    setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 200);
  }
}

/**
 * Alterna pestañas dentro del Simulador POS Integrado
 * @param {string} viewId - ID de la vista ('posView' | 'historyView' | 'adminView')
 * @param {HTMLElement} btn - Botón de pestaña
 */
function switchSimTab(viewId, btn) {
  if ((viewId === 'historyView' || viewId === 'adminView') && !isAdminUnlocked) {
    openLoginModal(viewId, btn);
    return;
  }

  document.querySelectorAll('.p-sim-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');

  if (viewId === 'posView') {
    renderPOS();
    updateCartUI();
  } else if (viewId === 'historyView') {
    renderHistory();
  } else if (viewId === 'adminView') {
    renderPTable();
    renderCTable();
  }
}

/**
 * Alterna entre el tema Claro y Oscuro del Portafolio
 */
function togglePortfolioTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('portfolio_theme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('portfolioThemeBtn');
  if (btn) {
    btn.innerHTML = isLight ? "🌙" : "☀️";
    btn.title = isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
  }
  showToast(isLight ? "Modo claro activado ☀️" : "Modo oscuro activado 🌙");
}

/**
 * Inicialización completa del Portafolio y su Simulador Integrado
 */
window.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar la base de datos y persistencia del POS
  initDB();

  // 2. Restaurar tema guardado
  const savedTheme = localStorage.getItem('portfolio_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    const btn = document.getElementById('portfolioThemeBtn');
    if (btn) btn.innerHTML = "🌙";
  }

  // 3. Renderizar Galería y Vistas del POS
  renderProductGallery();
  renderPOS();
  renderClients();
  updateCartUI();

  // Actualizar tasa en navbar
  const rateDisplay = document.getElementById('portfolioRateVal');
  if (rateDisplay) rateDisplay.innerText = exchangeRate.toFixed(2);

  console.log("🚀 Portafolio de Ingeniería (Juan Urbina, Daniel Rodríguez, Maykelis Meléndez) activo.");
});
