/* ==========================================================================
   POS ELITE PRO - DATABASE & PERSISTENCE LAYER
   Handles local storage, Node.js filesystem persistence, hashing & backups
   ========================================================================== */

let cryptoModule = null;
let fsModule = null;
let pathModule = null;
let osModule = null;

try {
  if (typeof require !== 'undefined') {
    cryptoModule = require('crypto');
    fsModule = require('fs');
    pathModule = require('path');
    osModule = require('os');
  }
} catch (e) {
  console.info("Modo navegador activo: Persistencia local vía localStorage");
}

/**
 * Escapes special HTML characters to prevent XSS
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/**
 * Secure PIN Hashing using SHA-256
 */
function hashPIN(pin) {
  if (cryptoModule && cryptoModule.createHash) {
    return cryptoModule.createHash('sha256').update(pin).digest('hex');
  }
  // Algoritmo de hashing determinista para entorno de navegador standalone
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "fallback_" + Math.abs(hash);
}

// Configuración de rutas para almacenamiento físico en Electron
let dbDir = "";
let dbPath = "";
if (fsModule && pathModule && osModule) {
  try {
    dbDir = pathModule.join(osModule.homedir(), 'POS-Elite-Data');
    if (!fsModule.existsSync(dbDir)) {
      fsModule.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = pathModule.join(dbDir, 'pos_db.json');
  } catch (err) {
    console.error("Error al configurar ruta de base de datos en disco:", err);
  }
}

// Estado centralizado de la aplicación
let products = [];
let customers = [];
let sales = [];
let cart = [];
let storeName = "ELITE POS PRO";
let exchangeRate = 36.50;
let invoiceCounter = 1;
let adminPass = "1234";
let isAdminUnlocked = false;
let ticketWidth = "58mm";
let ticketFontSize = "12px";

/**
 * Catálogo semilla demostrativo para dar vida inmediata al portafolio
 */
const DEFAULT_SEED_PRODUCTS = [
  { id: 101, name: "Harina PAN Blanca 1kg", price: 1.25, stock: 45 },
  { id: 102, name: "Arroz Blanco Premium 1kg", price: 1.10, stock: 30 },
  { id: 103, name: "Pasta Larga Spaghetti 500g", price: 0.95, stock: 25 },
  { id: 104, name: "Aceite Vegetal Comestible 1L", price: 2.40, stock: 18 },
  { id: 105, name: "Café Molido Gourmet 250g", price: 2.80, stock: 14 },
  { id: 106, name: "Azúcar Refinada 1kg", price: 1.30, stock: 22 },
  { id: 107, name: "Queso Blanco Llanero (kg)", price: 4.80, stock: 4.5 }, // Alerta de stock bajo
  { id: 108, name: "Leche Completa Pasteurizada 1L", price: 1.95, stock: 15 },
  { id: 109, name: "Refresco 2 Litros", price: 2.00, stock: 3.0 }, // Alerta de stock bajo
  { id: 110, name: "Mantequilla con Sal 250g", price: 1.75, stock: 16 }
];

const DEFAULT_SEED_CUSTOMERS = [
  { id: "0", name: "Consumidor Final" },
  { id: "V-18.452.120", name: "Carlos Mendoza" },
  { id: "V-21.309.874", name: "Elena Gómez" },
  { id: "J-40192837", name: "Inversiones San José" }
];

/**
 * Carga inicial de datos desde Disco o LocalStorage
 */
function initDB() {
  let dbData = null;

  // 1. Intentar cargar desde archivo físico si existe en Electron
  if (fsModule && dbPath && fsModule.existsSync(dbPath)) {
    try {
      dbData = JSON.parse(fsModule.readFileSync(dbPath, 'utf8'));
    } catch (err) {
      console.error("Error al leer base de datos física:", err);
    }
  }

  // 2. Si no hay datos físicos, intentar leer de localStorage
  if (!dbData && localStorage.getItem('pos_p')) {
    try {
      dbData = {
        products: JSON.parse(localStorage.getItem('pos_p')) || [],
        customers: JSON.parse(localStorage.getItem('pos_c')) || DEFAULT_SEED_CUSTOMERS,
        sales: JSON.parse(localStorage.getItem('pos_s')) || [],
        storeName: localStorage.getItem('pos_name') || "ELITE POS PRO",
        exchangeRate: parseFloat(localStorage.getItem('pos_rate')) || 36.50,
        invoiceCounter: parseInt(localStorage.getItem('pos_invoice_counter')) || 1,
        ticketWidth: localStorage.getItem('pos_t_width') || "58mm",
        ticketFontSize: localStorage.getItem('pos_t_font') || "12px",
        adminPass: localStorage.getItem('pos_pass') || hashPIN("1234")
      };
    } catch (e) {
      console.warn("Error leyendo localStorage, se aplicarán valores iniciales.");
    }
  }

  // 3. Si es la primera vez que se ejecuta (está vacío), inyectar datos de demostración
  if (!dbData || !dbData.products || dbData.products.length === 0) {
    const today = new Date().toLocaleDateString();
    dbData = {
      products: DEFAULT_SEED_PRODUCTS,
      customers: DEFAULT_SEED_CUSTOMERS,
      sales: [
        {
          id: 1,
          date: new Date(Date.now() - 3600000).toLocaleString(),
          day: today,
          customer: { id: "V-18.452.120", name: "Carlos Mendoza" },
          items: [
            { id: 101, name: "Harina PAN Blanca 1kg", price: 1.25, qty: 2 },
            { id: 105, name: "Café Molido Gourmet 250g", price: 2.80, qty: 1 }
          ],
          total: 5.30,
          paid: 5.30,
          status: "ACTIVA",
          method: "Pago Móvil",
          rate: 36.50
        },
        {
          id: 2,
          date: new Date(Date.now() - 1800000).toLocaleString(),
          day: today,
          customer: { id: "V-21.309.874", name: "Elena Gómez" },
          items: [
            { id: 104, name: "Aceite Vegetal Comestible 1L", price: 2.40, qty: 1 },
            { id: 107, name: "Queso Blanco Llanero (kg)", price: 4.80, qty: 1.5 }
          ],
          total: 9.60,
          paid: 4.60,
          status: "CREDITO",
          method: "Por Cobrar",
          rate: 36.50
        }
      ],
      storeName: "ELITE POS PRO",
      exchangeRate: 36.50,
      invoiceCounter: 3,
      ticketWidth: "58mm",
      ticketFontSize: "12px",
      adminPass: hashPIN("1234")
    };
  }

  // Asignar variables globales de estado
  products = dbData.products || [];
  customers = dbData.customers || DEFAULT_SEED_CUSTOMERS;
  sales = dbData.sales || [];
  storeName = dbData.storeName || "ELITE POS PRO";
  exchangeRate = dbData.exchangeRate || 36.50;
  invoiceCounter = dbData.invoiceCounter || (sales.length + 1);
  ticketWidth = dbData.ticketWidth || "58mm";
  ticketFontSize = dbData.ticketFontSize || "12px";
  adminPass = dbData.adminPass || hashPIN("1234");

  // Asegurar que el PIN esté hasheado
  if (!/^[a-f0-9]{64}$/i.test(adminPass) && !adminPass.startsWith("fallback_")) {
    adminPass = hashPIN(adminPass);
  }

  // Guardar estado inicial consolidado
  saveDB();
}

/**
 * Persiste los datos tanto en archivo local (Electron) como en localStorage
 */
function saveDB() {
  try {
    const dataToSave = {
      products,
      customers,
      sales,
      storeName,
      exchangeRate,
      invoiceCounter,
      ticketWidth,
      ticketFontSize,
      adminPass
    };

    // 1. Guardar en disco si Node.js está disponible
    if (fsModule && dbPath) {
      fsModule.writeFileSync(dbPath, JSON.stringify(dataToSave, null, 2), 'utf8');
    }

    // 2. Guardar siempre en localStorage como réplica o respaldo
    localStorage.setItem('pos_p', JSON.stringify(products));
    localStorage.setItem('pos_c', JSON.stringify(customers));
    localStorage.setItem('pos_s', JSON.stringify(sales));
    localStorage.setItem('pos_name', storeName);
    localStorage.setItem('pos_rate', exchangeRate.toString());
    localStorage.setItem('pos_invoice_counter', invoiceCounter.toString());
    localStorage.setItem('pos_t_width', ticketWidth);
    localStorage.setItem('pos_t_font', ticketFontSize);
    localStorage.setItem('pos_pass', adminPass);

    // 3. Sincronización transparente con la API REST (si está online)
    if (typeof ApiClient !== 'undefined' && ApiClient.isOnline()) {
      ApiClient.updateConfig({ exchangeRate, storeName, ticketWidth, ticketFontSize }).catch(() => {});
    }
  } catch (e) {
    console.error("Error al persistir datos:", e);
  }
}

/**
 * Exportar copia de seguridad en archivo .json descargable
 */
function exportBackup() {
  const backupData = {
    pos_p: JSON.stringify(products),
    pos_c: JSON.stringify(customers),
    pos_s: JSON.stringify(sales),
    pos_name: storeName,
    pos_rate: exchangeRate.toString(),
    pos_invoice_counter: invoiceCounter.toString(),
    pos_t_width: ticketWidth,
    pos_t_font: ticketFontSize,
    pos_pass: adminPass,
    exported_at: new Date().toISOString()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("download", `respaldo_pos_elite_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Copia de seguridad exportada con éxito ✅");
}

/**
 * Disparador para abrir selector de archivo de importación
 */
function triggerImport() {
  document.getElementById('importFileInput').click();
}

/**
 * Importar copia de seguridad desde un archivo .json seleccionado
 */
function importBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (data.pos_p || data.pos_c || data.pos_s) {
        if (confirm("⚠️ ¿Estás seguro de importar estos datos? Se sobrescribirá toda la información actual del sistema.")) {
          if (data.pos_p) products = JSON.parse(data.pos_p);
          if (data.pos_c) customers = JSON.parse(data.pos_c);
          if (data.pos_s) sales = JSON.parse(data.pos_s);
          if (data.pos_name) storeName = data.pos_name;
          if (data.pos_rate) exchangeRate = parseFloat(data.pos_rate);
          if (data.pos_invoice_counter) invoiceCounter = parseInt(data.pos_invoice_counter);
          if (data.pos_t_width) ticketWidth = data.pos_t_width;
          if (data.pos_t_font) ticketFontSize = data.pos_t_font;
          if (data.pos_pass) adminPass = data.pos_pass;

          saveDB();
          showToast("Datos importados con éxito ✅");
          setTimeout(() => { location.reload(); }, 1000);
        }
      } else {
        alert("El archivo de respaldo no tiene un formato válido ❌");
      }
    } catch (err) {
      alert("Error al procesar el archivo de respaldo ❌");
    }
  };
  reader.readAsText(file);
}
