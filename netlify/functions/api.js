/**
 * Netlify Serverless Function - POS Elite Pro REST API
 * Proporciona soporte de API Cloud cuando el proyecto está desplegado en Netlify
 */

let memoryProducts = [
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

let memoryCustomers = [
  { id: "0", name: "Consumidor Final" },
  { id: "V-18.452.120", name: "Carlos Mendoza", phone: "0414-1234567" },
  { id: "V-21.309.874", name: "Elena Gómez", phone: "0424-7654321" },
  { id: "J-40192837", name: "Inversiones San José", phone: "0212-9876543" }
];

let memorySales = [];
let memoryConfig = {
  storeName: "ELITE POS PRO",
  exchangeRate: 36.50,
  ticketWidth: "58mm",
  ticketFontSize: "12px"
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  // Parsear la ruta relativa: /api/products -> products
  const rawPath = event.path.replace(/\/\.netlify\/functions\/api\/?/, "").replace(/^\/api\/?/, "");
  const parts = rawPath.split("/").filter(Boolean);
  const resource = parts[0] || "status";
  const id = parts[1];

  try {
    // GET /api/status
    if (resource === "status" && event.httpMethod === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "POS Elite Pro Netlify Serverless Cloud API Online",
          timestamp: new Date().toISOString(),
          meta: { version: "2.0.0-cloud", provider: "Netlify Functions" },
          data: {
            storeName: memoryConfig.storeName,
            exchangeRate: memoryConfig.exchangeRate,
            totalProducts: memoryProducts.length,
            totalSales: memorySales.length
          }
        })
      };
    }

    // GET /api/team
    if (resource === "team" && event.httpMethod === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          data: [
            { name: "Juan Urbina", role: "Backend & API Lead", branch: "feature/juan-urbina-api-backend" },
            { name: "Daniel Rodríguez", role: "Frontend & POS Specialist", branch: "feature/daniel-rodriguez-pos-frontend" },
            { name: "Maykelis Meléndez", role: "DevOps & Cloud Deployment Lead", branch: "feature/maykelis-melendez-devops-ci-cd" }
          ]
        })
      };
    }

    // /api/products
    if (resource === "products") {
      if (event.httpMethod === "GET") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: memoryProducts, timestamp: new Date().toISOString() })
        };
      }
      if (event.httpMethod === "POST") {
        const payload = JSON.parse(event.body || "{}");
        const newProduct = {
          id: memoryProducts.length > 0 ? Math.max(...memoryProducts.map(p => p.id)) + 1 : 101,
          name: payload.name || "Nuevo Producto",
          price: Number(payload.price) || 1.0,
          stock: Number(payload.stock) || 10,
          category: payload.category || "General"
        };
        memoryProducts.push(newProduct);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, message: "Producto creado", data: newProduct })
        };
      }
    }

    // /api/customers
    if (resource === "customers") {
      if (event.httpMethod === "GET") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: memoryCustomers })
        };
      }
      if (event.httpMethod === "POST") {
        const payload = JSON.parse(event.body || "{}");
        const newCustomer = { id: payload.id, name: payload.name, phone: payload.phone };
        memoryCustomers.push(newCustomer);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, message: "Cliente registrado", data: newCustomer })
        };
      }
    }

    // /api/sales
    if (resource === "sales") {
      if (event.httpMethod === "GET") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: memorySales })
        };
      }
      if (event.httpMethod === "POST") {
        const payload = JSON.parse(event.body || "{}");
        const nextId = memorySales.length > 0 ? Math.max(...memorySales.map(s => s.id)) + 1 : 1;
        const newSale = {
          id: nextId,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("es-VE"),
          customer: payload.customer || { id: "0", name: "Consumidor Final" },
          items: payload.items || [],
          totalUSD: Number(payload.totalUSD) || 0,
          totalVES: Number(payload.totalVES) || 0,
          rate: Number(payload.rate) || memoryConfig.exchangeRate,
          method: payload.method || "efectivo"
        };
        memorySales.unshift(newSale);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, message: `Venta #${nextId} procesada en la nube`, data: newSale })
        };
      }
    }

    // /api/config
    if (resource === "config") {
      if (event.httpMethod === "GET") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: memoryConfig })
        };
      }
      if (event.httpMethod === "POST") {
        const payload = JSON.parse(event.body || "{}");
        if (payload.exchangeRate !== undefined) memoryConfig.exchangeRate = Number(payload.exchangeRate);
        if (payload.storeName !== undefined) memoryConfig.storeName = payload.storeName;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: memoryConfig, message: "Configuración actualizada" })
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, message: `Ruta no encontrada: ${resource}` })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
