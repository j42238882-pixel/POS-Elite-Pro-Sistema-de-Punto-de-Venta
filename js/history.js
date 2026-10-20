/* ==========================================================================
   POS ELITE PRO - HISTORY & REPORTS MODULE
   Sales audit, KPI calculations, credit debt management & Daily Z-Report
   ========================================================================== */

/**
 * Renderiza el listado de historial de ventas y recalcula los indicadores KPI
 */
function renderHistory() {
  const query = (document.getElementById('searchHist')?.value || '').toLowerCase();
  const today = new Date().toLocaleDateString();

  let totalVentasHoy = 0;
  let totalCreditos = 0;
  let ticketsHoyCount = 0;

  sales.forEach(s => {
    if (s.day === today) {
      ticketsHoyCount++;
      if (s.status === 'ACTIVA') {
        totalVentasHoy += (s.paid || s.total || 0);
      }
    }
    if (s.status === 'CREDITO') {
      totalCreditos += ((s.total || 0) - (s.paid || 0));
    }
  });

  // Actualizar tarjetas de métricas KPI
  const sumDailyEl = document.getElementById('sumDaily');
  const sumDebtEl = document.getElementById('sumDebt');
  const countTicketsEl = document.getElementById('countTickets');

  if (sumDailyEl) sumDailyEl.innerText = `$${totalVentasHoy.toFixed(2)}`;
  if (sumDebtEl) sumDebtEl.innerText = `$${totalCreditos.toFixed(2)}`;
  if (countTicketsEl) countTicketsEl.innerText = ticketsHoyCount;

  const historyContainer = document.getElementById('historyList');
  if (!historyContainer) return;

  const filtered = sales.filter(s =>
    s.id.toString().includes(query) ||
    (s.customer?.name || '').toLowerCase().includes(query) ||
    (s.customer?.id || '').toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    historyContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border);">
        <p style="font-size: 1.1rem; margin-bottom: 4px;">📂 No se encontraron registros de ventas</p>
        <small>Realiza una venta en el módulo POS o verifica los términos de búsqueda.</small>
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = [...filtered].reverse().map(s => {
    const formattedId = String(s.id).padStart(4, '0');
    const isCredit = s.status === 'CREDITO';
    const isAnulada = s.status === 'ANULADA';
    const pendingBalance = isCredit ? ((s.total || 0) - (s.paid || 0)) : 0;
    const clientName = s.customer?.name || "Consumidor Final";
    const clientId = s.customer?.id && s.customer.id !== "0" ? `(${s.customer.id})` : '';

    const itemsSummary = (s.items || []).map(i => `${i.qty}x ${escapeHTML(i.name)}`).join(', ');

    return `
      <div class="history-card ${s.status ? s.status.toLowerCase() : ''}">
        <div class="history-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="ticket-number-badge">#${formattedId}</span>
            <span style="font-weight: 600; font-size: 0.9rem;">${escapeHTML(clientName)} ${escapeHTML(clientId)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge-status ${s.status ? s.status.toLowerCase() : ''}">
              ${s.status}
            </span>
            <span class="badge-method">${escapeHTML(s.method || 'N/A')}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${s.date}</span>
          </div>
        </div>

        <div class="history-items-summary">
          📦 <b>Detalle:</b> ${itemsSummary || 'Sin productos'}
        </div>

        ${isCredit ? `
          <div style="background: var(--debt-bg); border: 1px solid var(--debt-border); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; justify-content: space-between;">
            <span>Abonado: <b>$${(s.paid || 0).toFixed(2)}</b></span>
            <span style="color: var(--debt); font-weight: 700;">Saldo Pendiente: $${pendingBalance.toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="history-footer">
          <div class="history-total-group">
            <span style="font-size: 0.85rem; color: var(--text-muted);">Total:</span>
            <span class="history-total-usd">$${(s.total || 0).toFixed(2)}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              (Bs. ${((s.total || 0) * (s.rate || exchangeRate)).toFixed(2)})
            </span>
          </div>

          <div class="history-actions">
            ${isCredit && pendingBalance > 0 ? `
              <button class="btn btn-debt btn-sm" onclick="openAbonoModal(${s.id})">
                💰 Abonar
              </button>
            ` : ''}
            <button class="btn btn-neutral btn-sm" onclick="printDoc(${s.id}, 'ticket')" title="Imprimir Ticket">
              🖨️ Ticket
            </button>
            <button class="btn btn-neutral btn-sm" onclick="printDoc(${s.id}, 'a4')" title="Ver Factura A4">
              📄 A4
            </button>
            ${!isAnulada ? `
              <button class="btn btn-danger btn-sm" onclick="voidSale(${s.id})" title="Anular venta y reponer inventario">
                ✕ Anular
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Abre el modal para registrar un abono a una venta a crédito
 * @param {number} saleId - ID de la venta
 */
function openAbonoModal(saleId) {
  const s = sales.find(x => x.id === saleId);
  if (!s) return;

  const pending = Number(((s.total || 0) - (s.paid || 0)).toFixed(2));

  document.getElementById('modalBody').innerHTML = `
    <h3>Abonar a Crédito #${String(s.id).padStart(4, '0')}</h3>
    <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); margin-bottom: 14px; text-align: left;">
      <p style="margin: 0 0 4px 0;"><b>Cliente:</b> ${escapeHTML(s.customer?.name)}</p>
      <p style="margin: 0 0 4px 0;"><b>Total Factura:</b> $${s.total.toFixed(2)}</p>
      <p style="margin: 0 0 4px 0;"><b>Abonado hasta ahora:</b> $${(s.paid || 0).toFixed(2)}</p>
      <p style="margin: 0; color: var(--debt); font-weight: bold;">Saldo Restante: $${pending.toFixed(2)}</p>
    </div>

    <label style="text-align: left; display: block;">Monto a Abonar (USD):</label>
    <input type="number" step="0.01" id="abonoAmountInput" max="${pending}" value="${pending}" style="font-size: 1.2rem; font-weight: bold; text-align: center;">

    <button class="btn btn-success btn-full" style="margin-bottom: 8px;" onclick="processAbono(${s.id})">
      ✓ Confirmar Abono
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cancelar
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('abonoAmountInput')?.focus(), 150);
}

/**
 * Procesa el abono monetario registrado
 * @param {number} saleId - ID de la venta
 */
function processAbono(saleId) {
  const s = sales.find(x => x.id === saleId);
  if (!s) return;

  const inputVal = parseFloat(document.getElementById('abonoAmountInput').value);
  const pending = Number(((s.total || 0) - (s.paid || 0)).toFixed(2));

  if (isNaN(inputVal) || inputVal <= 0) {
    showToast("⚠️ Ingresa un monto de abono válido mayor a 0");
    return;
  }

  if (inputVal > pending) {
    showToast(`⚠️ El abono no puede superar la deuda ($${pending.toFixed(2)})`);
    return;
  }

  s.paid = Number(((s.paid || 0) + inputVal).toFixed(2));
  if (s.paid >= s.total) {
    s.status = 'ACTIVA';
    s.method = 'Abonos/Liquidado';
    showToast("🎉 ¡Crédito liquidado por completo!");
  } else {
    showToast(`✓ Abono de $${inputVal.toFixed(2)} registrado con éxito`);
  }

  saveDB();
  closeModal();
  renderHistory();
}

/**
 * Anula una venta registrada y repone automáticamente las unidades al stock
 * @param {number} saleId - ID de la venta
 */
function voidSale(saleId) {
  const s = sales.find(x => x.id === saleId);
  if (!s) return;

  if (!confirm(`⚠️ ¿Estás seguro de anular la venta #${String(s.id).padStart(4, '0')}? Se repondrá el inventario de los productos vendidos.`)) {
    return;
  }

  // Reponer inventario
  (s.items || []).forEach(item => {
    const prod = products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Number((prod.stock + item.qty).toFixed(3));
    }
  });

  s.status = 'ANULADA';
  s.paid = 0;
  saveDB();
  showToast("Venta anulada e inventario repuesto ✅");
  renderHistory();
  renderPOS();
}

/**
 * Abre el modal del Reporte Z (Cierre de Caja del Día)
 */
function openCierreModal() {
  const today = new Date().toLocaleDateString();
  const ventasHoy = sales.filter(s => s.day === today);

  let cashIn = 0;
  let creditPending = 0;
  let mEfectivo = 0, mPMovil = 0, mBiopago = 0, mTarjeta = 0, mAbono = 0;

  ventasHoy.forEach(s => {
    if (s.status === 'ACTIVA') {
      cashIn += (s.total || 0);
      if (s.method === 'Efectivo') mEfectivo += (s.total || 0);
      else if (s.method === 'Pago Móvil') mPMovil += (s.total || 0);
      else if (s.method === 'Biopago') mBiopago += (s.total || 0);
      else if (s.method === 'Tarjeta') mTarjeta += (s.total || 0);
      else if (s.method === 'Abonos/Efectivo' || s.method === 'Abonos/Liquidado') mAbono += (s.total || 0);
      else mEfectivo += (s.total || 0);
    }
    if (s.status === 'CREDITO') {
      cashIn += (s.paid || 0);
      creditPending += ((s.total || 0) - (s.paid || 0));
      if (s.paid > 0) mAbono += (s.paid || 0);
    }
  });

  document.getElementById('modalBody').innerHTML = `
    <h3>Cierre de Caja Diario (Reporte Z)</h3>
    <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 15px; text-align: left; font-size: 0.9rem;">
      <p style="margin: 0 0 6px 0;"><b>Fecha de Corte:</b> ${today}</p>
      <p style="margin: 0 0 8px 0;"><b>Tickets Procesados Hoy:</b> ${ventasHoy.length}</p>
      <hr style="margin: 8px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>💵 Efectivo:</span> <b>$${mEfectivo.toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>📱 Pago Móvil:</span> <b>$${mPMovil.toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>🖩 Biopago:</span> <b>$${mBiopago.toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>💳 Tarjeta (Punto):</span> <b>$${mTarjeta.toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>💰 Abonos Recibidos:</span> <b>$${mAbono.toFixed(2)}</b>
      </div>
      <hr style="margin: 8px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-weight: bold;">TOTAL INGRESOS (USD):</span> 
        <b style="color: var(--success); font-size: 1.15rem;">$${cashIn.toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-weight: bold;">TOTAL EN BOLÍVARES:</span> 
        <b>Bs. ${(cashIn * exchangeRate).toFixed(2)}</b>
      </div>
      <div style="display: flex; justify-content: space-between; color: var(--danger); font-size: 0.85rem; margin-top: 6px;">
        <span>Créditos Otorgados (Por cobrar):</span> 
        <b>$${creditPending.toFixed(2)}</b>
      </div>
    </div>

    <button class="btn btn-primary btn-full" style="margin-bottom: 8px;" onclick="printCierre()">
      🖨️ Imprimir Cierre (Ticket Térmico)
    </button>
    <button class="btn btn-neutral btn-full" onclick="closeModal()">
      Cerrar Ventana
    </button>
  `;

  document.getElementById('modalOverlay').style.display = 'flex';
}
