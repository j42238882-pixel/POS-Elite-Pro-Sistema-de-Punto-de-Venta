/* ==========================================================================
   POS ELITE PRO - ADMINISTRATION & SECURITY MODULE
   Product inventory CRUD, customer management, security PIN & configurations
   ========================================================================== */

/**
 * Renderiza la lista de productos en el panel de administración
 */
function renderPTable() {
  const container = document.getElementById('pTable');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted);">
        No hay productos registrados en el inventario.
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="data-row-item">
      <div>
        <b>${escapeHTML(p.name)}</b>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
          Precio: <span style="color: var(--primary); font-weight: 600;">$${p.price.toFixed(2)}</span> &nbsp;|&nbsp; 
          Stock: <span style="font-weight: 600;">${p.stock}</span> unidades
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-warning btn-sm" onclick="openProductModal(${p.id})" title="Editar producto">
          ✏️
        </button>
        <button class="btn btn-danger btn-sm" onclick="delP(${p.id})" title="Eliminar producto">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Abre el modal para crear o editar un producto
 * @param {number|null} id - ID del producto o null para nuevo
 */
function openProductModal(id = null) {
  const p = id ? products.find(x => x.id === id) : { name: "", price: "", stock: "" };

  document.getElementById('modalBody').innerHTML = `
    <h3>${id ? 'Editar' : 'Nuevo'} Producto</h3>
    <div style="text-align: left;">
      <label>Nombre del Producto:</label>
      <input id="mPN" placeholder="Ej: Harina de Maíz 1kg" value="${escapeHTML(p.name)}">

      <label>Precio de Venta ($ USD):</label>
      <input id="mPP" type="number" step="0.01" placeholder="Ej: 1.50" value="${p.price}">

      <label>Existencia en Stock (Unidades o Fracción):</label>
      <input id="mPS" type="number" step="0.01" placeholder="Ej: 25 o 4.5" value="${p.stock}">
    </div>

    <button class="btn btn-success btn-full" style="margin-bottom: 8px;" onclick="saveProduct(${id})">
      ✓ Guardar Producto
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cancelar
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('mPN')?.focus(), 150);
}

/**
 * Guarda los datos de un producto (nuevo o existente)
 * @param {number|null} id - ID del producto
 */
function saveProduct(id) {
  const name = document.getElementById('mPN').value.trim();
  const price = parseFloat(document.getElementById('mPP').value);
  const stock = parseFloat(document.getElementById('mPS').value);

  if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    showToast("⚠️ Ingresa un nombre válido, precio y stock mayor o igual a 0");
    return;
  }

  if (id) {
    const p = products.find(x => x.id === id);
    if (p) {
      p.name = name;
      p.price = price;
      p.stock = stock;
      showToast("Producto actualizado ✅");
    }
  } else {
    products.push({
      id: Date.now(),
      name,
      price,
      stock
    });
    showToast("Producto agregado al catálogo ✅");
  }

  saveDB();
  closeModal();
  renderPTable();
  renderPOS();
}

/**
 * Elimina un producto del catálogo tras confirmación
 * @param {number} id - ID del producto
 */
function delP(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  if (confirm(`¿Estás seguro de eliminar "${p.name}" del catálogo?`)) {
    products = products.filter(x => x.id !== id);
    saveDB();
    showToast("Producto eliminado");
    renderPTable();
    renderPOS();
  }
}

/**
 * Renderiza el directorio de clientes en el panel de administración
 */
function renderCTable() {
  const container = document.getElementById('cTable');
  if (!container) return;

  container.innerHTML = customers.map(c => `
    <div class="data-row-item">
      <div>
        <b>${escapeHTML(c.name)}</b>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
          Identificación: ${escapeHTML(c.id)}
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        ${c.id !== "0" ? `
          <button class="btn btn-warning btn-sm" onclick="openCustomerModal('${c.id}')" title="Editar cliente">
            ✏️
          </button>
          <button class="btn btn-danger btn-sm" onclick="delCustomer('${c.id}')" title="Eliminar cliente">
            🗑️
          </button>
        ` : `
          <span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">Por defecto</span>
        `}
      </div>
    </div>
  `).join('');
}

/**
 * Abre el modal para crear o editar un cliente
 * @param {string|null} id - Cédula/RIF del cliente
 */
function openCustomerModal(id = null) {
  const c = id ? customers.find(x => x.id === id) : { id: "", name: "" };

  document.getElementById('modalBody').innerHTML = `
    <h3>${id ? 'Editar' : 'Nuevo'} Cliente</h3>
    <div style="text-align: left;">
      <label>Cédula de Identidad o RIF:</label>
      <input id="mCID" placeholder="Ej: V-18452120 o J-40192837" value="${escapeHTML(c.id)}" ${id ? 'disabled' : ''}>

      <label>Nombre Completo / Razón Social:</label>
      <input id="mCN" placeholder="Ej: Pedro Pérez o Comercial ABC C.A." value="${escapeHTML(c.name)}">
    </div>

    <button class="btn btn-success btn-full" style="margin-bottom: 8px;" onclick="saveCustomer(${id ? `'${id}'` : 'null'})">
      ✓ Guardar Cliente
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cancelar
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById(id ? 'mCN' : 'mCID')?.focus(), 150);
}

/**
 * Guarda los datos de un cliente
 * @param {string|null} origId - ID original si se edita
 */
function saveCustomer(origId) {
  const cId = (origId || document.getElementById('mCID').value).trim();
  const name = document.getElementById('mCN').value.trim();

  if (!cId || !name) {
    showToast("⚠️ Debes ingresar identificación y nombre del cliente");
    return;
  }

  if (origId) {
    const c = customers.find(x => x.id === origId);
    if (c) c.name = name;
  } else {
    if (customers.some(x => x.id.toLowerCase() === cId.toLowerCase())) {
      alert("Ya existe un cliente con esa cédula o RIF.");
      return;
    }
    customers.push({ id: cId, name });
  }

  saveDB();
  closeModal();
  renderCTable();
  renderClients();
  showToast("Cliente guardado con éxito ✅");
}

/**
 * Elimina un cliente si no es el Consumidor Final
 * @param {string} id - Cédula o RIF
 */
function delCustomer(id) {
  if (id === "0") return;
  const c = customers.find(x => x.id === id);
  if (!c) return;

  if (confirm(`¿Estás seguro de eliminar a ${c.name}?`)) {
    customers = customers.filter(x => x.id !== id);
    saveDB();
    renderCTable();
    renderClients();
    showToast("Cliente eliminado");
  }
}

/**
 * Actualiza el nombre de fantasía o razón social del negocio
 */
function updateStoreName() {
  const val = document.getElementById('configStoreName').value.trim();
  if (val) {
    storeName = val;
    const brandEl = document.getElementById('brandName');
    if (brandEl) brandEl.innerText = storeName;
    saveDB();
    showToast("Nombre del negocio actualizado ✅");
  }
}

/**
 * Actualiza la configuración de impresión térmica
 */
function updatePrintSettings() {
  const w = document.getElementById('configTicketWidth').value.trim();
  const f = document.getElementById('configTicketFontSize').value.trim();
  if (w && f) {
    ticketWidth = w;
    ticketFontSize = f;
    saveDB();
    showToast("Ajustes de ticket térmico guardados ✅");
  }
}

/**
 * Abre el modal de edición rápida de la Tasa de Cambio (USD/VES)
 */
function openRateModal() {
  document.getElementById('modalBody').innerHTML = `
    <h3>Ajustar Tasa de Cambio</h3>
    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">
      Ingresa el valor del dólar en Bolívares (VES). Todos los precios en el catálogo y carrito se recalcularán al instante.
    </p>

    <label style="text-align: left; display: block;">Tasa en Bs. / USD:</label>
    <input 
      type="number" 
      step="0.01" 
      id="newRateVal" 
      value="${exchangeRate}" 
      style="text-align: center; font-size: 1.4rem; font-weight: 800; color: var(--primary);"
    >

    <button class="btn btn-success btn-full" style="margin-bottom: 8px;" onclick="saveNewRate()">
      ✓ Guardar y Aplicar Tasa
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cancelar
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('newRateVal')?.focus(), 150);
}

/**
 * Guarda la nueva tasa cambiaria y recalcula la interfaz
 */
function saveNewRate() {
  const r = parseFloat(document.getElementById('newRateVal').value);
  if (r > 0) {
    exchangeRate = r;
    const navRateEl = document.getElementById('navRate');
    if (navRateEl) navRateEl.innerText = r.toFixed(2);
    saveDB();
    updateCartTotalsOnly();
    renderPOS();
    closeModal();
    showToast(`Tasa actualizada a Bs. ${r.toFixed(2)} ✅`);
  } else {
    showToast("⚠️ Ingresa un valor de tasa válido mayor a 0");
  }
}

/**
 * Cambia la contraseña o PIN de administrador
 */
function changePassword() {
  const p = document.getElementById('newAdminPass').value.trim();
  if (p.length >= 4) {
    adminPass = hashPIN(p);
    saveDB();
    document.getElementById('newAdminPass').value = "";
    showToast("Contraseña administrativa actualizada con éxito 🔐");
  } else {
    showToast("⚠️ El PIN debe tener un mínimo de 4 caracteres o dígitos");
  }
}

/**
 * Bloquea la sesión administrativa
 */
function lockSystem() {
  isAdminUnlocked = false;
  const lockBtn = document.getElementById('lockBtn');
  if (lockBtn) lockBtn.style.display = 'none';
  showView('posView', document.getElementById('navPos'));
  showToast("Sistema bloqueado 🔒");
}

/**
 * Abre el modal de desbloqueo con PIN administrativo
 * @param {string} targetView - Vista objetivo ('historyView' | 'adminView')
 * @param {HTMLElement} element - Enlace de navegación pulsado
 */
function openLoginModal(targetView, element) {
  document.getElementById('modalBody').innerHTML = `
    <div style="font-size: 2.2rem; margin-bottom: 6px;">🔐</div>
    <h3>Acceso Protegido</h3>
    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 14px;">
      Esta sección requiere el PIN de administrador para auditoría y cambios. (Por defecto: <b>1234</b>)
    </p>

    <input 
      type="password" 
      id="loginPassInput" 
      placeholder="Ingresa PIN de seguridad" 
      style="text-align: center; font-size: 1.2rem; letter-spacing: 0.2em;"
      onkeydown="if(event.key === 'Enter') verifyLogin('${targetView}', this)"
    >

    <button class="btn btn-primary btn-full" style="margin-bottom: 8px;" onclick="verifyLogin('${targetView}', this)">
      Desbloquear Acceso
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cancelar
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('loginPassInput')?.focus(), 150);
}

/**
 * Verifica el PIN ingresado con el hash SHA-256 almacenado
 */
function verifyLogin(targetView, element) {
  const inputPin = document.getElementById('loginPassInput').value;
  const inputHash = hashPIN(inputPin);

  if (inputHash === adminPass || inputPin === "1234" && adminPass === hashPIN("1234")) {
    isAdminUnlocked = true;
    closeModal();
    const lockBtn = document.getElementById('lockBtn');
    if (lockBtn) lockBtn.style.display = 'flex';

    // Obtener el nav-link correcto
    const navEl = targetView === 'historyView' ? document.getElementById('navHistory') : document.getElementById('navAdmin');
    showView(targetView, navEl);
    showToast("Acceso concedido 🔓");
  } else {
    showToast("❌ PIN incorrecto. Intenta de nuevo.");
    const inputEl = document.getElementById('loginPassInput');
    if (inputEl) {
      inputEl.value = "";
      inputEl.focus();
    }
  }
}
