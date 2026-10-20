/* ==========================================================================
   PORTFOLIO CONTROLLER & GALLERY ENGINE
   Team: Juan Urbina, Daniel Rodríguez, Maykelis Meléndez
   ========================================================================== */

/**
 * Catálogo detallado para la Galería de Productos del Portafolio
 */
// Mapa de imágenes reales por producto (generadas con IA para fines demostrativos)
const PRODUCT_IMAGES = {
  101: { img: "assets/products_viveres.jpg",  emoji: "🌽" },
  102: { img: "assets/products_viveres.jpg",  emoji: "🌾" },
  103: { img: "assets/products_viveres.jpg",  emoji: "🍝" },
  104: { img: "assets/products_viveres.jpg",  emoji: "🌻" },
  105: { img: "assets/products_viveres.jpg",  emoji: "☕" },
  106: { img: "assets/products_viveres.jpg",  emoji: "🍚" },
  107: { img: "assets/products_lacteos.jpg",  emoji: "🧀" },
  108: { img: "assets/products_lacteos.jpg",  emoji: "🥛" },
  110: { img: "assets/products_lacteos.jpg",  emoji: "🧈" },
  111: { img: "assets/products_lacteos.jpg",  emoji: "🥓" },
  109: { img: "assets/products_bebidas.jpg",  emoji: "🥤" },
  112: { img: "assets/products_bebidas.jpg",  emoji: "🍺" },
  113: { img: "assets/products_bebidas.jpg",  emoji: "🍊" },
  114: { img: "assets/products_bebidas.jpg",  emoji: "💧" },
  115: { img: "assets/products_snacks.jpg",   emoji: "🍪" },
  116: { img: "assets/products_snacks.jpg",   emoji: "🍫" }
};

const GALLERY_PRODUCTS = [
  // Víveres
  { id: 101, name: "Harina PAN Blanca 1kg",       category: "viveres", price: 1.25, stock: 45,  desc: "Harina de maíz blanco precocida, líder en el mercado venezolano." },
  { id: 102, name: "Arroz Blanco Premium 1kg",     category: "viveres", price: 1.10, stock: 30,  desc: "Grano entero seleccionado de alta cocción." },
  { id: 103, name: "Pasta Larga Spaghetti 500g",   category: "viveres", price: 0.95, stock: 25,  desc: "Sémola de trigo duro importada de primera calidad." },
  { id: 104, name: "Aceite Vegetal Comestible 1L", category: "viveres", price: 2.40, stock: 18,  desc: "Aceite 100% puro de girasol refinado." },
  { id: 105, name: "Café Molido Gourmet 250g",     category: "viveres", price: 2.80, stock: 14,  desc: "Tostado y molido artesanal de los Andes venezolanos." },
  { id: 106, name: "Azúcar Refinada 1kg",          category: "viveres", price: 1.30, stock: 22,  desc: "Azúcar blanca refinada de alta pureza." },

  // Lácteos & Charcutería
  { id: 107, name: "Queso Blanco Llanero (kg)",       category: "lacteos", price: 4.80, stock: 4.5, desc: "Queso semiduro tradicional venezolano, ideal para rallar." },
  { id: 108, name: "Leche Pasteurizada Completa 1L",  category: "lacteos", price: 1.95, stock: 15,  desc: "Envasada con vitaminas A y D fortificadas." },
  { id: 110, name: "Mantequilla con Sal 250g",        category: "lacteos", price: 1.75, stock: 16,  desc: "Crema de leche pasteurizada con sal marina." },
  { id: 111, name: "Jamón de Pierna Cocido (kg)",     category: "lacteos", price: 6.50, stock: 8.0, desc: "Charcutería selecta baja en sodio." },

  // Bebidas
  { id: 109, name: "Refresco Cola 2 Litros",         category: "bebidas", price: 2.00, stock: 3.0, desc: "Bebida gaseosa sabor cola original." },
  { id: 112, name: "Malta Artesanal Botella 250ml",   category: "bebidas", price: 0.90, stock: 48,  desc: "Bebida nutritiva de cebada malteada." },
  { id: 113, name: "Jugo Natural de Naranja 1L",     category: "bebidas", price: 1.60, stock: 12,  desc: "100% fruta pasteurizada sin azúcar añadida." },
  { id: 114, name: "Agua Mineral Embotellada 5L",    category: "bebidas", price: 1.50, stock: 20,  desc: "Agua de manantial purificada y ozonizada." },

  // Snacks & Despensa
  { id: 115, name: "Galletas de Soda (Pack Familiar)",  category: "snacks", price: 1.15, stock: 24, desc: "Crujientes con sal, perfectas para desayunos." },
  { id: 116, name: "Chocolate Criollo con Leche 70g",   category: "snacks", price: 1.40, stock: 35, desc: "Elaborado con fino cacao venezolano de exportación." }
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

    const productMedia = PRODUCT_IMAGES[p.id] || { img: null, emoji: '📦' };

    return `
      <div class="p-gallery-card">
        <div class="p-gallery-img-box" style="padding: 0; overflow: hidden; background: #f8fafc;">
          <img
            src="${productMedia.img}"
            alt="${escapeHTML(p.name)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            style="width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.35s ease;"
            onmouseover="this.style.transform='scale(1.07)'"
            onmouseout="this.style.transform='scale(1)'"
          />
          <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:3rem;">${productMedia.emoji}</div>
          <span class="p-gallery-stock-badge ${isLow ? 'low' : ''}">
            ${isLow ? `⚠️ Stock: ${p.stock}` : `✅ Stock: ${p.stock}`}
          </span>
        </div>
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
