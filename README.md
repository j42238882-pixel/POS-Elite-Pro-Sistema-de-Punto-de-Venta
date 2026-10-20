# 🚀 POS Elite Pro

![descripcion](https://github.com/DanyR1411/POS-Elite/blob/main/assets/pos%20elite%20logo-bg.png)

> Sistema de Punto de Venta profesional para pequeños y medianos negocios, desarrollado con Electron. Diseñado para funcionar sin conexión a Internet, con almacenamiento local de datos y soporte para impresión de tickets térmicos.

---

## ✨ Características principales

### 🛒 Módulo de Ventas (POS)
- Catálogo de productos con búsqueda en tiempo real
- Carrito de compras con control de cantidades editables
- Soporte para fracciones de unidades (pesaje, litros, etc.)
- Selección y búsqueda de clientes por venta
- Totales automáticos en **USD** y **Bolívares (VES)**
- Alertas visuales de stock bajo (≤ 5 unidades)

### 💰 Formas de pago
- 💵 Efectivo
- 📱 Pago Móvil
- 🖩 Biopago
- 💳 Tarjeta (Punto de venta)
- 💳 Crédito (ventas a cuenta)

### 📊 Historial y Reportes
- Registro completo de todas las ventas con número de ticket
- Búsqueda por número de ticket o nombre de cliente
- Resumen diario de ventas netas (USD)
- Total de créditos pendientes por cobrar
- **Cierre de caja (Reporte Z)** detallado por método de pago
- Anulación de ventas con reposición automática de stock

### 💳 Gestión de Créditos
- Registro de ventas a crédito vinculadas a clientes
- Registro de abonos parciales o totales
- Liquidación automática al completar el pago

### ⚙️ Administración
- Gestión completa de productos (crear, editar, eliminar)
- Gestión de clientes con Cédula/RIF
- Configuración del nombre del negocio
- Ajuste de la **tasa de cambio USD/VES** desde la barra de navegación
- Cambio de contraseña de administrador (PIN protegido con SHA-256)
- Modo claro / oscuro 🌙

### 🖨️ Impresión
- Ticket **térmico** configurable (ancho: 58mm / 80mm, tamaño de fuente personalizable)
- Factura en formato **A4**
- Reporte de cierre de caja imprimible
- Compatible con impresoras térmicas estándar

### 💾 Almacenamiento de datos
- Base de datos local en archivo **JSON** (`~/POS-Elite-Data/pos_db.json`)
- Migración automática desde `localStorage` si existe data previa
- Exportación e importación de backup en formato `.json`
- Fallback a `localStorage` si no está disponible el sistema de archivos

---

## 🖥️ Tecnologías

| Tecnología | Uso |
|---|---|
| [Electron](https://www.electronjs.org/) v29 | Framework de aplicación de escritorio |
| HTML5 + CSS3 | Interfaz de usuario |
| JavaScript (Vanilla) | Lógica de negocio |
| Node.js (`fs`, `crypto`, `path`, `os`) | Almacenamiento y seguridad |
| electron-builder | Empaquetado e instalador Windows (NSIS) |

---

## 🚀 Instalación y uso

### Requisitos
- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/pos-elite.git
cd pos-elite

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm start
```

### Generar instalador para Windows

```bash
npm run build
```
> El instalador `.exe` se generará en la carpeta `dist/`.

---

## 🔐 Seguridad

- El acceso a las secciones de **Historial** y **Administración** está protegido por un PIN de administrador.
- El PIN se almacena hasheado con **SHA-256** (nunca en texto plano).
- El PIN por defecto es `1234`. **Se recomienda cambiarlo en el primer uso.**
- El sistema puede bloquearse manualmente con el botón 🔓 de la barra de navegación.

---

## 📁 Estructura del proyecto

```
pos-elite/
├── index.html       # Interfaz completa de la aplicación (UI + lógica)
├── main.js          # Proceso principal de Electron
├── package.json     # Configuración del proyecto y dependencias
├── icon.ico         # Ícono de la aplicación
└── icon2.ico        # Ícono alternativo
```

---

## 📸 Vistas de la aplicación

| Vista | Descripción |
|---|---|
| 🛒 **Venta** | Catálogo de productos + carrito de compras |
| 📊 **Historial** | Registro de ventas, créditos y cierre de caja |
| ⚙️ **Admin** | Gestión de productos, clientes y configuración |

---

## 📄 Licencia

Este proyecto está bajo la licencia **ISC**.

---

> **POS Elite Pro** — Desarrollado para negocios venezolanos con soporte nativo para dual moneda (USD / VES) y los métodos de pago locales más utilizados.
