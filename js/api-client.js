/**
 * POS Elite Pro - API Client Service
 * Conecta el frontend con la API REST (Localhost:3001 o Netlify Cloud /api)
 * Soporta fallback automático a localStorage en caso de desconexión.
 */

const ApiClient = (function () {
  // URLs tentativas: primero relativa (Netlify / producción), luego localhost
  const LOCAL_API_URL = "http://localhost:3001/api";
  const CLOUD_API_URL = "/api";

  let activeApiBase = null;
  let isConnected = false;

  /**
   * Intenta detectar la API disponible
   */
  async function detectApi() {
    // 1. Probar ruta relativa (útil cuando corre en Netlify o con proxy)
    try {
      const res = await fetch(`${CLOUD_API_URL}/status`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        activeApiBase = CLOUD_API_URL;
        isConnected = true;
        updateBadge(true, "Netlify Cloud API");
        return true;
      }
    } catch (_) {}

    // 2. Probar servidor local en puerto 3001
    try {
      const res = await fetch(`${LOCAL_API_URL}/status`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        activeApiBase = LOCAL_API_URL;
        isConnected = true;
        updateBadge(true, "Local API :3001");
        return true;
      }
    } catch (_) {}

    // 3. Fallback modo offline
    activeApiBase = null;
    isConnected = false;
    updateBadge(false, "Modo Offline (Local)");
    return false;
  }

  /**
   * Actualiza la insignia visual en la barra de navegación
   */
  function updateBadge(online, label) {
    const badges = document.querySelectorAll(".api-status-badge");
    badges.forEach(b => {
      if (online) {
        b.className = "api-status-badge online";
        b.innerHTML = `<span class="dot"></span> <b>API Online:</b> ${label}`;
        b.title = "Conectado al Servidor REST API. Sincronización en tiempo real activa.";
      } else {
        b.className = "api-status-badge offline";
        b.innerHTML = `<span class="dot"></span> <b>${label}</b>`;
        b.title = "Sin conexión al servidor API. Usando persistencia local (localStorage / disco).";
      }
    });
  }

  /**
   * Petición genérica con fallback
   */
  async function request(endpoint, options = {}) {
    if (!activeApiBase) {
      await detectApi();
    }
    if (!activeApiBase) return null;

    try {
      const res = await fetch(`${activeApiBase}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn(`[ApiClient] Error en petición a ${endpoint}:`, e);
      return null;
    }
  }

  return {
    detect: detectApi,
    isOnline: () => isConnected,
    getBaseUrl: () => activeApiBase,

    // Status
    getStatus: () => request('/status'),
    getTeam: () => request('/team'),

    // Productos
    getProducts: async () => {
      const res = await request('/products');
      return res && res.data ? res.data : null;
    },
    saveProduct: async (product) => {
      return await request('/products', {
        method: 'POST',
        body: JSON.stringify(product)
      });
    },
    updateProduct: async (id, product) => {
      return await request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
      });
    },
    deleteProduct: async (id) => {
      return await request(`/products/${id}`, { method: 'DELETE' });
    },

    // Clientes
    getCustomers: async () => {
      const res = await request('/customers');
      return res && res.data ? res.data : null;
    },
    saveCustomer: async (customer) => {
      return await request('/customers', {
        method: 'POST',
        body: JSON.stringify(customer)
      });
    },

    // Ventas
    getSales: async () => {
      const res = await request('/sales');
      return res && res.data ? res.data : null;
    },
    createSale: async (saleData) => {
      return await request('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData)
      });
    },
    voidSale: async (id) => {
      return await request(`/sales/${id}`, { method: 'DELETE' });
    },

    // Configuración
    getConfig: async () => {
      const res = await request('/config');
      return res && res.data ? res.data : null;
    },
    updateConfig: async (configData) => {
      return await request('/config', {
        method: 'POST',
        body: JSON.stringify(configData)
      });
    }
  };
})();

// Detección automática al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  ApiClient.detect();
  // Verificar cada 15 segundos
  setInterval(ApiClient.detect, 15000);
});
