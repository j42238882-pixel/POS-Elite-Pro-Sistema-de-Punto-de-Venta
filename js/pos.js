/* ==========================================================================
   POS ELITE PRO - SALES (POS) MODULE
   Handles product catalog, interactive cart, pricing calculations & checkout
   ========================================================================== */

/**
 * Renderiza el catálogo de productos con filtrado por búsqueda en tiempo real
 */
function renderPOS() {
  const query = (document.getElementById('posSearch')?.value || '').toLowerCase();
  const grid = document.getElementById('posGrid');
  if (!grid) return;

  const filtered = products.filter(p => p.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 6px;">🔍 No se encontraron productos</p>
        <small>Intenta con otro término o agrega un nuevo producto desde el panel de administración.</small>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isLowStock = p.stock > 0 && p.stock <= 5;
    const isOutOfStock = p.stock <= 0;
    const stockClass = isOutOfStock ? 'stock-empty' : (isLowStock ? 'stock-low' : '');
    const stockLabel = isOutOfStock ? 'Agotado' : (isLowStock ? `Bajo: ${p.stock}` : `Stock: ${p.stock}`);
    const priceVES = (p.price * exchangeRate).toFixed(2);

    return `
      <div class="product-card ${stockClass}" onclick="${isOutOfStock ? '' : `addToCart(${p.id})`}">
        <div class="product-top">
          <span class="product-stock-badge">${stockLabel}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">#${p.id}</span>
        </div>
        <div class="product-name" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</div>
        <div class="product-pricing">
          <div class="price-usd">$${p.price.toFixed(2)}</div>
          <div class="price-ves">Bs. ${priceVES}</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Agrega un producto al carrito de compras
 * @param {number} id - ID del producto
 */
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock <= 0) {
    showToast("⚠️ Producto sin existencias disponibles");
    return;
  }

  const item = cart.find(x => x.id === id);
  const qtyToAdd = p.stock >= 1 ? 1 : p.stock;

  if (item) {
    item.qty = Number((item.qty + qtyToAdd).toFixed(3));
  } else {
    cart.push({ ...p, qty: qtyToAdd });
  }

  p.stock = Number((p.stock - qtyToAdd).toFixed(3));
  updateCartUI();
}

/**
 * Permite la edición manual o fraccionada de la cantidad de un ítem en el carrito
 */
function manualCartQty(id, value, event) {
  const item = cart.find(x => x.id === id);
  const prod = products.find(x => x.id === id);
  if (!item || !prod) return;

  if (value === "" || value === "." || value.endsWith(".")) return;
  const n = parseFloat(value);
  if (isNaN(n) || n < 0) return;

  const availableTotal = Number((prod.stock + item.qty).toFixed(3));
  if (n <= availableTotal) {
    item.qty = n;
    prod.stock = Number((availableTotal - n).toFixed(3));
  } else {
    item.qty = availableTotal;
    prod.stock = 0;
    showToast(`Stock máximo disponible alcanzado: ${item.qty}`);
    if (event && event.target) event.target.value = availableTotal;
  }

  updateCartTotalsOnly();
  renderPOS();
}

/**
 * Actualiza los subtotales y totales globales en USD y VES
 */
function updateCartTotalsOnly() {
  const totalUSD = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalVES = totalUSD * exchangeRate;

  const usdEl = document.getElementById('posTotalUSD');
  const vesEl = document.getElementById('posTotalVES');
  const countEl = document.getElementById('cartItemCount');

  if (usdEl) usdEl.innerText = `$${totalUSD.toFixed(2)}`;
  if (vesEl) vesEl.innerText = `Bs. ${totalVES.toFixed(2)}`;
  if (countEl) countEl.innerText = cart.length;
}

/**
 * Renderiza la interfaz completa del carrito de compras
 */
function updateCartUI() {
  const cartContainer = document.getElementById('posCart');
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty-state">
        <span style="font-size: 2.2rem; opacity: 0.5;">🛒</span>
        <p style="margin: 0; font-weight: 500;">El carrito está vacío</p>
        <small style="opacity: 0.7;">Haz clic en un producto para agregarlo</small>
      </div>
    `;
    updateCartTotalsOnly();
    renderPOS();
    return;
  }

  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-title" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
        <div class="cart-item-unit-price">$${item.price.toFixed(2)} c/u</div>
      </div>
      <div class="cart-item-controls">
        <input 
          type="number" 
          step="any" 
          class="qty-input" 
          value="${item.qty}" 
          title="Cantidad o peso"
          oninput="manualCartQty(${item.id}, this.value, event)"
        >
        <button class="btn btn-danger btn-sm" onclick="removeCartItem(${item.id})" title="Eliminar ítem">✕</button>
      </div>
      <div class="cart-item-total">
        $${(item.price * item.qty).toFixed(2)}
      </div>
    </div>
  `).join('');

  updateCartTotalsOnly();
  renderPOS();
}

/**
 * Elimina un ítem del carrito y restaura su stock original
 * @param {number} id - ID del producto
 */
function removeCartItem(id) {
  const idx = cart.findIndex(x => x.id === id);
  if (idx === -1) return;

  const item = cart[idx];
  const prod = products.find(x => x.id === id);
  if (prod) {
    prod.stock = Number((prod.stock + item.qty).toFixed(3));
  }

  cart.splice(idx, 1);
  updateCartUI();
}

/**
 * Vacía por completo el carrito devolviendo los productos al inventario
 */
function clearCart() {
  if (cart.length === 0) return;
  cart.forEach(item => {
    const prod = products.find(x => x.id === item.id);
    if (prod) {
      prod.stock = Number((prod.stock + item.qty).toFixed(3));
    }
  });
  cart = [];
  updateCartUI();
  showToast("Carrito vaciado");
}

/**
 * Renderiza el selector de clientes en el carrito
 */
function renderClients() {
  const q = (document.getElementById('posSearchClient')?.value || '').toLowerCase();
  const select = document.getElementById('posClientSelect');
  if (!select) return;

  const filtered = customers.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));

  select.innerHTML = filtered.map(c => `
    <option value="${escapeHTML(c.id)}">${escapeHTML(c.name)} (${escapeHTML(c.id)})</option>
  `).join('');
}

/**
 * Abre el modal interactivo de procesamiento de pago
 */
function openPayModal() {
  if (!cart.length) {
    showToast("⚠️ Agrega al menos un producto al carrito para facturar");
    return;
  }

  const totalUSD = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalVES = totalUSD * exchangeRate;
  const clientId = document.getElementById('posClientSelect')?.value || "0";
  const clientObj = customers.find(c => c.id === clientId) || { name: "Consumidor Final" };

  document.getElementById('modalBody').innerHTML = `
    <h3>Registrar Venta</h3>
    <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px; text-align: left;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: var(--text-muted); font-size: 0.85rem;">Cliente:</span>
        <b style="font-size: 0.85rem;">${escapeHTML(clientObj.name)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: var(--text-muted); font-size: 0.85rem;">Total en Divisa:</span>
        <b style="color: var(--primary); font-size: 1.1rem;">$${totalUSD.toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-muted); font-size: 0.85rem;">Total en Bolívares:</span>
        <b style="font-size: 0.95rem;">Bs. ${totalVES.toFixed(2)}</b>
      </div>
    </div>

    <div style="text-align: left; margin-bottom: 16px;">
      <label for="payMethodSelect">Método de Pago:</label>
      <select id="payMethodSelect">
        <option value="Efectivo">💵 Efectivo (USD / VES)</option>
        <option value="Pago Móvil">📱 Pago Móvil</option>
        <option value="Biopago">🖩 Biopago BDV</option>
        <option value="Tarjeta">💳 Tarjeta (Punto de Venta)</option>
      </select>
    </div>

    <button class="btn btn-success btn-full" style="margin-bottom: 8px;" onclick="prepareSale('ACTIVA')">
      ✓ Procesar Pago Inmediato
    </button>
    <button class="btn btn-debt btn-full" style="margin-bottom: 8px;" onclick="prepareSale('CREDITO')">
      📑 Otorgar a Crédito (Por Cobrar)
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cancelar
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
}

/**
 * Procesa la venta, registra la transacción en el historial y guarda en almacenamiento
 * @param {'ACTIVA'|'CREDITO'} status - Condición de la venta
 */
function prepareSale(status) {
  const clientId = document.getElementById('posClientSelect').value;
  if (status === 'CREDITO' && clientId === "0") {
    alert("⚠️ Para otorgar una venta a crédito debe seleccionar o registrar un cliente específico (no puede ser Consumidor Final).");
    return;
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const clientData = customers.find(c => c.id === clientId) || { id: "0", name: "Consumidor Final" };

  let payMethod = document.getElementById('payMethodSelect')?.value || "Efectivo";
  if (status === 'CREDITO') {
    payMethod = "Por Cobrar";
  }

  const currentSaleId = invoiceCounter;

  const sale = {
    id: currentSaleId,
    date: new Date().toLocaleString(),
    day: new Date().toLocaleDateString(),
    customer: clientData,
    items: [...cart],
    total: total,
    paid: status === 'ACTIVA' ? total : 0,
    status: status,
    method: payMethod,
    rate: exchangeRate
  };

  sales.push(sale);
  invoiceCounter++;
  saveDB();

  // Sincronizar venta con la API REST en tiempo real
  if (typeof ApiClient !== 'undefined' && ApiClient.isOnline()) {
    ApiClient.createSale({
      customer: sale.customer,
      items: sale.items,
      totalUSD: sale.total,
      totalVES: sale.total * sale.rate,
      rate: sale.rate,
      method: payMethod
    }).catch(e => console.warn("[API] Error sincronizando venta:", e));
  }

  const formattedId = String(currentSaleId).padStart(4, '0');

  document.getElementById('modalBody').innerHTML = `
    <div style="text-align: center; padding: 10px 0;">
      <div style="font-size: 2.5rem; margin-bottom: 8px;">🎉</div>
      <h3 style="margin-bottom: 4px;">Venta Registrada con Éxito</h3>
      <p style="color: var(--text-muted); margin-bottom: 15px;">Ticket Nº <b>#${formattedId}</b></p>
      
      <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Total Pagado:</span>
          <b>$${status === 'ACTIVA' ? total.toFixed(2) : '0.00'}</b>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Condición:</span>
          <b>${status === 'ACTIVA' ? 'Pagada (' + payMethod + ')' : 'Pendiente a Crédito'}</b>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <button class="btn btn-primary btn-full" onclick="printDoc(${currentSaleId}, 'ticket')">
          🖨️ Ticket Térmico
        </button>
        <button class="btn btn-warning btn-full" onclick="printDoc(${currentSaleId}, 'a4')">
          📄 Factura A4
        </button>
      </div>

      <button class="btn btn-neutral btn-full" onclick="finishAll()">
        Finalizar y Nueva Venta
      </button>
    </div>
  `;
}

/**
 * Limpia el carrito tras una venta exitosa y refresca el estado
 */
function finishAll() {
  cart = [];
  updateCartUI();
  closeModal();
  renderClients();
  renderPOS();
}
