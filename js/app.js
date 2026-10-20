/* ==========================================================================
   POS ELITE PRO - MAIN APPLICATION CONTROLLER
   Navigation, view transitions, theme toggle, toast & initialization
   ========================================================================== */

/**
 * Muestra una vista específica de la aplicación
 * @param {string} viewId - ID del contenedor de la vista ('posView' | 'historyView' | 'adminView')
 * @param {HTMLElement} navElement - Elemento nav-link pulsado
 */
function showView(viewId, navElement) {
  // Proteger vistas restringidas con PIN
  if ((viewId === 'historyView' || viewId === 'adminView') && !isAdminUnlocked) {
    openLoginModal(viewId, navElement);
    return;
  }

  // Desactivar todas las vistas
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });

  // Desactivar todos los enlaces de navegación
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Activar la vista seleccionada y su enlace
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }
  if (navElement) {
    navElement.classList.add('active');
  }

  // Refrescar datos según la vista
  if (viewId === 'posView') {
    renderPOS();
    renderClients();
    updateCartUI();
  } else if (viewId === 'historyView') {
    renderHistory();
  } else if (viewId === 'adminView') {
    renderPTable();
    renderCTable();
  }
}

/**
 * Alterna entre el tema claro y oscuro
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('pos_theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
  showToast(isDark ? "Modo oscuro activado 🌙" : "Modo claro activado ☀️");
}

/**
 * Actualiza el ícono del botón de tema
 */
function updateThemeIcon(isDark) {
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.innerHTML = isDark ? "☀️" : "🌙";
    btn.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  }
}

/**
 * Cierra cualquier modal abierto en pantalla
 */
function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Muestra una notificación emergente (Toast)
 * @param {string} message - Texto del mensaje
 * @param {number} duration - Duración en milisegundos
 */
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");

  clearTimeout(toast.timeoutId);
  toast.timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/**
 * Inicialización de la aplicación
 */
function initApp() {
  // 1. Cargar persistencia de datos (Disco / LocalStorage)
  initDB();

  // 2. Restaurar tema guardado por el usuario
  const savedTheme = localStorage.getItem('pos_theme');
  const isDark = savedTheme === 'dark';
  if (isDark) {
    document.body.classList.add('dark-mode');
  }
  updateThemeIcon(isDark);

  // 3. Poblar inputs del panel de administración
  const widthInput = document.getElementById('configTicketWidth');
  const fontInput = document.getElementById('configTicketFontSize');
  const storeInput = document.getElementById('configStoreName');
  const brandEl = document.getElementById('brandName');
  const navRateEl = document.getElementById('navRate');

  if (widthInput) widthInput.value = ticketWidth;
  if (fontInput) fontInput.value = ticketFontSize;
  if (storeInput) storeInput.value = storeName;
  if (brandEl) brandEl.innerText = storeName;
  if (navRateEl) navRateEl.innerText = exchangeRate.toFixed(2);

  // 4. Renderizar vista inicial POS
  renderPOS();
  renderClients();
  updateCartUI();

  // 5. Configurar cierre de modal con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  console.log("🚀 POS Elite Pro inicializado correctamente.");
}

// Arrancar al cargar el DOM
window.addEventListener('DOMContentLoaded', initApp);
