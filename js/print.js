/* ==========================================================================
   POS ELITE PRO - PRINTING ENGINE
   Generates thermal tickets (58mm/80mm) and standard A4 formal invoices
   ========================================================================== */

/**
 * Imprime un documento de venta (Ticket térmico o Factura A4)
 * @param {number} id - ID de la venta
 * @param {'ticket'|'a4'} fmt - Formato de impresión
 */
function printDoc(id, fmt) {
  const s = sales.find(x => x.id === id);
  if (!s) return;

  const win = window.open('', '_blank');
  const r = s.rate || exchangeRate;
  const clientName = s.customer?.name || "Consumidor Final";
  const clientId = s.customer?.id || "N/A";
  const formattedId = String(s.id).padStart(4, '0');
  const displayMethod = s.method ? `<br><b>Forma de pago:</b> ${escapeHTML(s.method)}` : '';
  const escapedStoreName = escapeHTML(storeName);
  const escapedClientName = escapeHTML(clientName);
  const escapedClientId = escapeHTML(clientId);

  let styles = `
    <style>
      @page { margin: 0; size: auto; }
      body {
        margin: 0;
        padding: 8px;
        font-family: 'Courier New', Courier, monospace;
        width: ${fmt === 'ticket' ? ticketWidth : '100%'};
        box-sizing: border-box;
      }
      .ticket {
        max-width: 100%;
        font-size: ${ticketFontSize};
        line-height: 1.25;
      }
      hr {
        border: none;
        border-top: 1px dashed #000;
        margin: 8px 0;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
      }
      .total-line {
        font-weight: bold;
        font-size: 1.05em;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
    </style>
  `;

  let htmlContent = "";

  if (fmt === 'ticket') {
    htmlContent = `
      ${styles}
      <div class="ticket">
        <center>
          <h2 style="margin: 4px 0; text-transform: uppercase;">${escapedStoreName}</h2>
          <small>Ticket Nº: <b>#${formattedId}</b></small><br>
          <small>${s.date}</small>
        </center>
        <hr>
        <div style="font-size: 0.85em; margin-bottom: 6px;">
          <b>Cliente:</b> ${escapedClientName}<br>
          <b>CI/RIF:</b> ${escapedClientId}
        </div>
        <hr>
        ${(s.items || []).map(i => `
          <div class="line">
            <span>${i.qty} x ${escapeHTML(i.name)}</span>
            <span>$${(i.price * i.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        <hr>
        <div class="total-line">
          <div class="line"><span>TOTAL USD:</span> <span>$${(s.total || 0).toFixed(2)}</span></div>
          <div class="line"><span>TOTAL VES:</span> <span>Bs. ${((s.total || 0) * r).toFixed(2)}</span></div>
        </div>
        <hr>
        <center>
          <small>Condición: <b>${s.status || 'N/A'}</b></small>
          ${displayMethod}
          <br><br>
          <b>¡Gracias por su compra!</b>
        </center>
        <br><br>
      </div>
    `;
  } else {
    // Formato estándar formal A4
    htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #111;">
        <table width="100%">
          <tr>
            <td>
              <h1 style="margin: 0; color: #2563eb;">${escapedStoreName}</h1>
              <p style="margin: 4px 0; color: #666;">Comprobante de Venta Electrónico</p>
            </td>
            <td align="right">
              <h2 style="margin: 0;">FACTURA Nº: #${formattedId}</h2>
              <p style="margin: 4px 0; color: #666;">Fecha: ${s.date}</p>
            </td>
          </tr>
        </table>
        <hr style="border: none; border-top: 2px solid #2563eb; margin: 20px 0;">
        <p><b>Cliente:</b> ${escapedClientName} &nbsp;|&nbsp; <b>Identificación (CI/RIF):</b> ${escapedClientId}</p>
        <table width="100%" border="1" style="border-collapse: collapse; margin-top: 15px;" cellpadding="8">
          <tr style="background: #f1f5f9; text-align: left;">
            <th>Cant.</th>
            <th>Descripción del Producto</th>
            <th>Precio Unit. ($)</th>
            <th>Subtotal ($)</th>
          </tr>
          ${(s.items || []).map(i => `
            <tr>
              <td>${i.qty}</td>
              <td>${escapeHTML(i.name)}</td>
              <td>$${i.price.toFixed(2)}</td>
              <td>$${(i.price * i.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr style="font-size: 1.1em; background: #fafafa;">
            <td colspan="3" align="right"><b>TOTAL GENERAL (USD):</b></td>
            <td><b>$${(s.total || 0).toFixed(2)}</b></td>
          </tr>
          <tr style="font-size: 1.1em; background: #fafafa;">
            <td colspan="3" align="right"><b>TOTAL GENERAL (VES):</b></td>
            <td><b>Bs. ${((s.total || 0) * r).toFixed(2)}</b></td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <p style="margin: 0;"><b>Condición:</b> ${s.status || 'N/A'} &nbsp;|&nbsp; <b>Tasa Aplicada:</b> Bs. ${Number(r).toFixed(2)}/USD ${displayMethod}</p>
        </div>
      </div>
    `;
  }

  win.document.write(htmlContent);
  win.document.close();
  setTimeout(() => {
    win.print();
    win.close();
  }, 350);
}

/**
 * Genera e imprime el reporte de Cierre de Caja del Día (Reporte Z)
 */
function printCierre() {
  const today = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
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
      else if (s.method === 'Abonos/Efectivo') mAbono += (s.total || 0);
      else mEfectivo += (s.total || 0);
    }
    if (s.status === 'CREDITO') {
      cashIn += (s.paid || 0);
      creditPending += ((s.total || 0) - (s.paid || 0));
      if (s.paid > 0) mAbono += (s.paid || 0);
    }
  });

  const win = window.open('', '_blank');
  const styles = `
    <style>
      @page { margin: 0; size: auto; }
      body {
        margin: 0;
        padding: 8px;
        font-family: 'Courier New', Courier, monospace;
        width: ${ticketWidth};
        box-sizing: border-box;
      }
      .ticket {
        max-width: 100%;
        font-size: ${ticketFontSize};
        line-height: 1.25;
      }
      hr {
        border: none;
        border-top: 1px dashed #000;
        margin: 8px 0;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
    </style>
  `;

  const html = `
    ${styles}
    <div class="ticket">
      <center>
        <h2 style="margin: 4px 0; text-transform: uppercase;">${escapeHTML(storeName)}</h2>
        <h3 style="margin: 2px 0;">REPORTE DE CIERRE (Z)</h3>
        <small>Fecha: ${today}</small><br>
        <small>Hora: ${time}</small>
      </center>
      <hr>
      <div class="line"><span>Total Transacciones:</span> <b>${ventasHoy.length}</b></div>
      <hr>
      <b>DESGLOSE DE INGRESOS (USD)</b><br>
      <div class="line"><span>Efectivo:</span> <span>$${mEfectivo.toFixed(2)}</span></div>
      <div class="line"><span>Pago Móvil:</span> <span>$${mPMovil.toFixed(2)}</span></div>
      <div class="line"><span>Biopago:</span> <span>$${mBiopago.toFixed(2)}</span></div>
      <div class="line"><span>Tarjeta (Punto):</span> <span>$${mTarjeta.toFixed(2)}</span></div>
      <div class="line"><span>Abonos Recibidos:</span> <span>$${mAbono.toFixed(2)}</span></div>
      <hr>
      <div class="line" style="font-weight: bold; font-size: 1.05em;">
        <span>INGRESOS TOTALES (USD):</span> <span>$${cashIn.toFixed(2)}</span>
      </div>
      <div class="line" style="font-weight: bold;">
        <span>EQUIVALENTE EN VES:</span> <span>Bs. ${(cashIn * exchangeRate).toFixed(2)}</span>
      </div>
      <hr>
      <div class="line" style="color: #444;">
        <span>Créditos Otorgados Hoy:</span> <span>$${creditPending.toFixed(2)}</span>
      </div>
      <hr>
      <center><br><b>*** FIN DEL REPORTE Z ***</b><br><br><br></center>
    </div>
  `;

  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.print();
    win.close();
  }, 350);
}
