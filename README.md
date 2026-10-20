# 🚀 POS Elite Pro - Enterprise Edition

![POS Elite Logo](https://github.com/DanyR1411/POS-Elite/blob/main/assets/pos%20elite%20logo-bg.png)

> **Sistema de Punto de Venta Profesional, Dual-Moneda (USD/VES) & Arquitectura Híbrida (Offline-First + REST API en TypeScript + CI/CD en GitHub Actions + Despliegue en Netlify)**

---

## 👥 Equipo de Desarrollo y Ramas de Trabajo Git

| Participante | Rol Principal | Rama Asignada |
|---|---|---|
| **Juan Urbina** | Backend & API Architecture Lead | `feature/juan-urbina-api-backend` |
| **Daniel Rodríguez** | Frontend Engineer & POS Specialist | `feature/daniel-rodriguez-pos-frontend` |
| **Maykelis Meléndez** | DevOps & Cloud Deployment Lead | `feature/maykelis-melendez-devops-ci-cd` |

---

## 🌐 Estructura Frontend de 3 Páginas

El proyecto cuenta con 3 páginas web completamente interconectadas con diseño moderno, modo claro/oscuro y estado en tiempo real de la API:

1. **`index.html` — Página 1: Portafolio de Ingeniería de Software**
   - Caso de estudio, especificaciones técnicas, galería de productos, simulador embebido y presentación del equipo.
2. **`pos.html` — Página 2: Sistema Punto de Venta (POS) en Vivo**
   - Catálogo interactivo, carrito de compras, cálculo dual USD/VES en tiempo real, múltiples métodos de pago (Efectivo, Pago Móvil, Biopago, Punto de Venta, Crédito), reportes Z e impresión térmica (58mm/80mm).
3. **`proyectoproximo.html` — Página 3: Próximo Proyecto & API Gateway Hub**
   - Roadmap de arquitectura cloud multi-sucursal, facturación electrónica y **Consola Interactiva para Probar la API REST en Vivo**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | HTML5 Semántico, CSS3 Vanilla, JavaScript Modular (ES6+), Tailwind CSS |
| **Backend API** | Node.js, Express, **TypeScript (Strict Mode)**, CORS |
| **Nube & Serverless** | Netlify Hosting, Netlify Functions (`netlify/functions/api.js`), `netlify.toml` |
| **DevOps / CI/CD** | GitHub Actions (`deploy.yml` y `ci.yml`), Node.js 20 |
| **Desktop / Local** | Electron v29, electron-builder (Instalador Windows NSIS) |
| **Persistencia** | Híbrida: REST API JSON + Archivo físico en disco + LocalStorage Fallback |

---

## 📡 Servidor REST API (TypeScript)

El proyecto incluye un servidor REST API desarrollado con **TypeScript y Express** que sincroniza el estado del punto de venta en tiempo real.

### Endpoints Principales:

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/status` | Verificación de salud y métricas del servidor (Health Check) |
| `GET` | `/api/team` | Integrantes del equipo y ramas asignadas |
| `GET` | `/api/products` | Catálogo completo de productos con precios en USD |
| `POST` | `/api/products` | Crear nuevo producto en inventario |
| `PUT` | `/api/products/:id` | Actualizar precio, stock o categoría |
| `DELETE` | `/api/products/:id` | Eliminar producto |
| `GET` | `/api/customers` | Directorio de clientes con Cédula/RIF |
| `POST` | `/api/customers` | Registrar nuevo cliente |
| `GET` | `/api/sales` | Historial de transacciones y facturación |
| `POST` | `/api/sales` | Procesar nueva venta con descuento automático de stock |
| `DELETE` | `/api/sales/:id` | Anular venta con reposición de inventario |
| `GET` | `/api/config` | Obtener configuración del negocio y tasa USD/VES |
| `POST` | `/api/config` | Actualizar tasa oficial o datos del comercio |

---

## ⚡ Comandos Bash de la Evaluación

Para reproducir exactamente la secuencia solicitada en la defensa:

```bash
# 1. Visualizar estructura completa con Bash
ls -la

# 2. Navegar al directorio de Tailwind CSS
cd tailwind

# 3. Listar archivos de Tailwind
ls -la

# 4. Volver a la raíz del proyecto
cd ..

# 5. Compilar TypeScript y Tailwind
npm run build

# 6. Iniciar el Servidor API REST
npm run server
```

---

## 🐙 Flujo Git: Ramas y Convenciones de Commit

### Inicializar y listar ramas por participante:

```bash
# Ejecutar script automático de ramas
bash scripts/git-branches-setup.sh
# O en Windows:
.\scripts\git-branches-setup.bat

# Listar todas las ramas
git branch -a -v
```

### Convención de Commits (Conventional Commits):

```bash
# Formato: <tipo>(<alcance>): <descripción>
git commit -m "feat(api): agregar endpoint de sincronizacion de ventas"
git commit -m "fix(pos): corregir redondeo de tasa de cambio en bolivares"
git commit -m "ci(github-actions): configurar pipeline de build y deploy a netlify"
git commit -m "docs(presentation): anadir guia y criterios de evaluacion"
```

---

## 🚀 Despliegue Continuo (CI/CD) en Netlify

El archivo [deploy.yml](file:///.github/workflows/deploy.yml) ejecuta automáticamente:
1. Verificación estricta de tipos TypeScript (`npx tsc --noEmit`).
2. Compilación del servidor backend y CSS (`npm run build`).
3. Despliegue automático a **Netlify** generando enlaces de Preview para Pull Requests y Production para `main`.

### Variables Secretas en GitHub:
- `NETLIFY_AUTH_TOKEN`: Token de acceso personal generado en Netlify.
- `NETLIFY_SITE_ID`: Identificador de la aplicación creada en Netlify.

---

## 📊 Rúbrica y Criterios de Evaluación para la Presentación

### 1. Criterios de Calificación (100 Puntos)
- **Arquitectura de Software y TypeScript (25 pts):** Tipado estricto, interfaces compartidas y modularidad sin errores de compilación.
- **Servidor REST API (20 pts):** Endpoints CRUD funcionales, persistencia y sincronización cliente-servidor.
- **Frontend Interconectado de 3 Páginas (20 pts):** Navegación fluida entre Portafolio, POS y Proyecto Próximo, modo claro/oscuro y diseño responsivo.
- **Flujo Git y Ramas Colaborativas (15 pts):** Rama individual por cada integrante, commits descriptivos y ordenados.
- **CI/CD con GitHub Actions y Netlify (20 pts):** Pipeline automatizado de compilación y despliegue continuo en la nube con Serverless Functions.

---

## 📄 Licencia

Este proyecto está bajo la licencia **ISC**. Desarrollado por **Juan Urbina**, **Daniel Rodríguez** y **Maykelis Meléndez**.
