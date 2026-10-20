import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Product, Customer, Sale, StoreConfig, ApiResponse, TeamMember } from '../types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Archivo de persistencia de la API
const DATA_FILE = path.join(__dirname, '../../data/api_db.json');

// Catálogo semilla inicial
const DEFAULT_PRODUCTS: Product[] = [
  { id: 101, name: "Harina PAN Blanca 1kg", price: 1.25, stock: 45, category: "Alimentos" },
  { id: 102, name: "Arroz Blanco Premium 1kg", price: 1.10, stock: 30, category: "Alimentos" },
  { id: 103, name: "Pasta Larga Spaghetti 500g", price: 0.95, stock: 25, category: "Alimentos" },
  { id: 104, name: "Aceite Vegetal Comestible 1L", price: 2.40, stock: 18, category: "Alimentos" },
  { id: 105, name: "Café Molido Gourmet 250g", price: 2.80, stock: 14, category: "Bebidas" },
  { id: 106, name: "Azúcar Refinada 1kg", price: 1.30, stock: 22, category: "Alimentos" },
  { id: 107, name: "Queso Blanco Llanero (kg)", price: 4.80, stock: 4.5, category: "Lácteos" },
  { id: 108, name: "Leche Completa Pasteurizada 1L", price: 1.95, stock: 15, category: "Lácteos" },
  { id: 109, name: "Refresco 2 Litros", price: 2.00, stock: 3.0, category: "Bebidas" },
  { id: 110, name: "Mantequilla con Sal 250g", price: 1.75, stock: 16, category: "Lácteos" }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "0", name: "Consumidor Final" },
  { id: "V-18.452.120", name: "Carlos Mendoza", phone: "0414-1234567" },
  { id: "V-21.309.874", name: "Elena Gómez", phone: "0424-7654321" },
  { id: "J-40192837", name: "Inversiones San José", phone: "0212-9876543" }
];

const DEFAULT_CONFIG: StoreConfig = {
  storeName: "ELITE POS PRO",
  exchangeRate: 36.50,
  ticketWidth: "58mm",
  ticketFontSize: "12px"
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Juan Urbina",
    role: "Backend & API Architecture Lead",
    gitBranch: "feature/juan-urbina-api-backend",
    responsibilities: [
      "Diseño y desarrollo de la API REST con TypeScript y Express",
      "Controladores para productos, ventas, inventario y tasa de cambio",
      "Persistencia de datos y sincronización cliente-servidor"
    ]
  },
  {
    name: "Daniel Rodríguez",
    role: "Frontend Engineer & UI/UX Specialist",
    gitBranch: "feature/daniel-rodriguez-pos-frontend",
    responsibilities: [
      "Desarrollo e integración de las 3 páginas del frontend",
      "Consumo de la API con fallback offline y dual moneda (USD/VES)",
      "Sistema de tickets térmicos, reportes Z y experiencia de usuario"
    ]
  },
  {
    name: "Maykelis Meléndez",
    role: "DevOps & Cloud Deployment Lead",
    gitBranch: "feature/maykelis-melendez-devops-ci-cd",
    responsibilities: [
      "Pipeline de CI/CD automatizado con GitHub Actions",
      "Configuración y despliegue continuo en Netlify con Serverless Functions",
      "Estrategia de ramas Git, convenciones de commit y control de calidad"
    ]
  }
];

// Estructura interna de datos
interface DatabaseSchema {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  config: StoreConfig;
}

let db: DatabaseSchema = {
  products: [...DEFAULT_PRODUCTS],
  customers: [...DEFAULT_CUSTOMERS],
  sales: [],
  config: { ...DEFAULT_CONFIG }
};

// Carga y guardado de persistencia
function loadDatabase(): void {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(raw);
      console.log(`[DB] Base de datos cargada desde ${DATA_FILE}`);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.warn('[DB] Usando base de datos en memoria:', err);
  }
}

function saveDatabase(): void {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error guardando base de datos:', err);
  }
}

// Cargar DB al inicio
loadDatabase();

// =========================================================================
// RUTAS DE LA API REST
// =========================================================================

/**
 * Health Check & Status
 */
app.get('/api/status', (_req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: "POS Elite Pro API Server Online",
    timestamp: new Date().toISOString(),
    meta: {
      version: "2.0.0-ts",
      environment: process.env.NODE_ENV || "development",
      total: db.products.length
    },
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      storeName: db.config.storeName,
      exchangeRate: db.config.exchangeRate,
      totalProducts: db.products.length,
      totalSales: db.sales.length
    }
  });
});

/**
 * Información del equipo de desarrollo y ramas Git
 */
app.get('/api/team', (_req: Request, res: Response<ApiResponse<TeamMember[]>>) => {
  res.json({
    success: true,
    message: "Integrantes del equipo y ramas asignadas",
    timestamp: new Date().toISOString(),
    data: TEAM_MEMBERS
  });
});

/**
 * PRODUCTOS: Obtener catálogo
 */
app.get('/api/products', (_req: Request, res: Response<ApiResponse<Product[]>>) => {
  res.json({
    success: true,
    data: db.products,
    timestamp: new Date().toISOString(),
    meta: { total: db.products.length }
  });
});

/**
 * PRODUCTOS: Crear producto
 */
app.post('/api/products', (req: Request, res: Response<ApiResponse<Product>>) => {
  const { name, price, stock, category } = req.body;
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: "Faltan campos obligatorios (name, price, stock)",
      timestamp: new Date().toISOString()
    });
  }

  const newId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 101;
  const newProduct: Product = {
    id: newId,
    name: String(name).trim(),
    price: Number(price),
    stock: Number(stock),
    category: category ? String(category) : "General"
  };

  db.products.push(newProduct);
  saveDatabase();

  return res.status(201).json({
    success: true,
    message: "Producto agregado con éxito",
    data: newProduct,
    timestamp: new Date().toISOString()
  });
});

/**
 * PRODUCTOS: Actualizar producto por ID
 */
app.put('/api/products/:id', (req: Request, res: Response<ApiResponse<Product>>) => {
  const id = Number(req.params.id);
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Producto con ID ${id} no encontrado`,
      timestamp: new Date().toISOString()
    });
  }

  const { name, price, stock, category } = req.body;
  if (name !== undefined) db.products[index].name = String(name).trim();
  if (price !== undefined) db.products[index].price = Number(price);
  if (stock !== undefined) db.products[index].stock = Number(stock);
  if (category !== undefined) db.products[index].category = String(category);

  saveDatabase();

  return res.json({
    success: true,
    message: "Producto actualizado",
    data: db.products[index],
    timestamp: new Date().toISOString()
  });
});

/**
 * PRODUCTOS: Eliminar producto por ID
 */
app.delete('/api/products/:id', (req: Request, res: Response<ApiResponse>) => {
  const id = Number(req.params.id);
  const initialLen = db.products.length;
  db.products = db.products.filter(p => p.id !== id);

  if (db.products.length === initialLen) {
    return res.status(404).json({
      success: false,
      message: `Producto con ID ${id} no encontrado`,
      timestamp: new Date().toISOString()
    });
  }

  saveDatabase();

  return res.json({
    success: true,
    message: `Producto ${id} eliminado correctamente`,
    timestamp: new Date().toISOString()
  });
});

/**
 * CLIENTES: Obtener lista
 */
app.get('/api/customers', (_req: Request, res: Response<ApiResponse<Customer[]>>) => {
  res.json({
    success: true,
    data: db.customers,
    timestamp: new Date().toISOString(),
    meta: { total: db.customers.length }
  });
});

/**
 * CLIENTES: Registrar nuevo cliente
 */
app.post('/api/customers', (req: Request, res: Response<ApiResponse<Customer>>) => {
  const { id, name, phone } = req.body;
  if (!id || !name) {
    return res.status(400).json({
      success: false,
      message: "Cédula/RIF y Nombre son obligatorios",
      timestamp: new Date().toISOString()
    });
  }

  const existing = db.customers.find(c => c.id === String(id).trim());
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Ya existe un cliente con esa Cédula/RIF",
      timestamp: new Date().toISOString()
    });
  }

  const newCustomer: Customer = {
    id: String(id).trim(),
    name: String(name).trim(),
    phone: phone ? String(phone).trim() : undefined
  };

  db.customers.push(newCustomer);
  saveDatabase();

  return res.status(201).json({
    success: true,
    message: "Cliente registrado",
    data: newCustomer,
    timestamp: new Date().toISOString()
  });
});

/**
 * VENTAS: Historial de transacciones
 */
app.get('/api/sales', (_req: Request, res: Response<ApiResponse<Sale[]>>) => {
  res.json({
    success: true,
    data: db.sales,
    timestamp: new Date().toISOString(),
    meta: { total: db.sales.length }
  });
});

/**
 * VENTAS: Procesar nueva venta (descuenta inventario)
 */
app.post('/api/sales', (req: Request, res: Response<ApiResponse<Sale>>) => {
  const { customer, items, totalUSD, totalVES, rate, method, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "La venta debe incluir al menos un producto",
      timestamp: new Date().toISOString()
    });
  }

  // Descontar inventario de cada item
  for (const item of items) {
    const prod = db.products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, Math.round((prod.stock - item.qty) * 100) / 100);
    }
  }

  const nextSaleId = db.sales.length > 0 ? Math.max(...db.sales.map(s => s.id)) + 1 : 1;
  const newSale: Sale = {
    id: nextSaleId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('es-VE'),
    customer: customer || { id: "0", name: "Consumidor Final" },
    items,
    totalUSD: Number(totalUSD) || 0,
    totalVES: Number(totalVES) || 0,
    rate: Number(rate) || db.config.exchangeRate,
    method: method || "efectivo",
    notes: notes ? String(notes) : undefined,
    isCredit: method === 'credito',
    creditPaid: method !== 'credito'
  };

  db.sales.unshift(newSale); // Más reciente primero
  saveDatabase();

  return res.status(201).json({
    success: true,
    message: `Venta #${nextSaleId} procesada exitosamente`,
    data: newSale,
    timestamp: new Date().toISOString()
  });
});

/**
 * VENTAS: Anular venta (restituye inventario)
 */
app.delete('/api/sales/:id', (req: Request, res: Response<ApiResponse>) => {
  const id = Number(req.params.id);
  const saleIndex = db.sales.findIndex(s => s.id === id);

  if (saleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Venta #${id} no encontrada`,
      timestamp: new Date().toISOString()
    });
  }

  const sale = db.sales[saleIndex];

  // Restituir inventario
  for (const item of sale.items) {
    const prod = db.products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.round((prod.stock + item.qty) * 100) / 100;
    }
  }

  db.sales.splice(saleIndex, 1);
  saveDatabase();

  return res.json({
    success: true,
    message: `Venta #${id} anulada e inventario restituido`,
    timestamp: new Date().toISOString()
  });
});

/**
 * CONFIGURACIÓN: Obtener configuración
 */
app.get('/api/config', (_req: Request, res: Response<ApiResponse<StoreConfig>>) => {
  res.json({
    success: true,
    data: db.config,
    timestamp: new Date().toISOString()
  });
});

/**
 * CONFIGURACIÓN: Actualizar tasa o nombre
 */
app.post('/api/config', (req: Request, res: Response<ApiResponse<StoreConfig>>) => {
  const { exchangeRate, storeName, ticketWidth, ticketFontSize } = req.body;

  if (exchangeRate !== undefined) db.config.exchangeRate = Number(exchangeRate);
  if (storeName !== undefined) db.config.storeName = String(storeName).trim();
  if (ticketWidth !== undefined) db.config.ticketWidth = ticketWidth;
  if (ticketFontSize !== undefined) db.config.ticketFontSize = ticketFontSize;

  saveDatabase();

  return res.json({
    success: true,
    message: "Configuración actualizada correctamente",
    data: db.config,
    timestamp: new Date().toISOString()
  });
});

// Arrancar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 POS ELITE PRO - SERVIDOR API REST INICIADO`);
    console.log(`📡 Puerto: http://localhost:${PORT}`);
    console.log(`📋 Health Check: http://localhost:${PORT}/api/status`);
    console.log(`🛒 Catálogo API: http://localhost:${PORT}/api/products`);
    console.log(`👥 Equipo: http://localhost:${PORT}/api/team`);
    console.log(`=======================================================`);
  });
}

export default app;
