/* ========================================================
   MYM DESIGNSX – Orders & Checkout Module
   ======================================================== */

// ── Orders Storage ──
function getOrders() {
  return JSON.parse(localStorage.getItem('mym-orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('mym-orders', JSON.stringify(orders));
}

// ── Render Checkout ──
function renderCheckout() {
  const user = getCurrentUser();
  if (!user) return;

  const cart = getCart();
  if (cart.length === 0) {
    navigateTo('landing');
    return;
  }

  // Pre-fill shipping info
  if (user.name) document.getElementById('shipName').value = user.name;
  if (user.lastname) document.getElementById('shipLastname').value = user.lastname;
  if (user.phone) document.getElementById('shipPhone').value = user.phone;
  if (user.address?.street) document.getElementById('shipAddress').value = user.address.street;
  if (user.address?.city) document.getElementById('shipCity').value = user.address.city;
  if (user.email) document.getElementById('shipEmail').value = user.email;

  // Render order summary
  const itemsContainer = document.getElementById('checkoutItems');
  const totalsContainer = document.getElementById('checkoutTotals');

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return '';
      return `
        <div class="order-item">
          <div class="order-item-img">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="order-item-details">
            <div class="order-item-name">${product.name}</div>
            <div class="order-item-meta">${item.size} · Cant: ${item.quantity}${item.customization ? ' · ✨ Personalizado' : ''}</div>
          </div>
          <div class="order-item-price">${formatPrice(product.price * item.quantity)}</div>
        </div>
      `;
    }).join('');
  }

  const { subtotal, tax, total } = getCartTotals();
  if (totalsContainer) {
    totalsContainer.innerHTML = `
      <div class="row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="row"><span>IVA (19%)</span><span>${formatPrice(tax)}</span></div>
      <div class="row"><span>Envío</span><span style="color:var(--success)">Gratis</span></div>
      <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
    `;
  }

  // Card number formatting
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(\d{4})/g, '$1 ').trim();
      e.target.value = val;
    });
  }

  // Expiry formatting
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
      e.target.value = val;
    });
  }

  // CVV - numbers only
  const cardCvv = document.getElementById('cardCvv');
  if (cardCvv) {
    cardCvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }
}

// ── Confirm Payment ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirmPayment')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user) return;

    // Validate fields
    const fields = ['shipName', 'shipLastname', 'shipAddress', 'shipCity', 'shipPhone', 'shipEmail', 'cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];
    let valid = true;
    
    fields.forEach(id => {
      const input = document.getElementById(id);
      if (!input || !input.value.trim()) {
        if (input) input.classList.add('error');
        valid = false;
      } else {
        if (input) input.classList.remove('error');
      }
    });

    if (!valid) {
      showToast('error', 'Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    // Card number validation (must be 16 digits)
    const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
    if (cardNum.length < 16) {
      showToast('error', 'Tarjeta inválida', 'El número de tarjeta debe tener 16 dígitos');
      return;
    }

    // Process order
    const cart = getCart();
    const { subtotal, tax, total } = getCartTotals();

    const order = {
      id: 'order-' + Date.now(),
      userId: user.id,
      orderNumber: generateId(),
      orderCode: generateOrderCode(),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customization: item.customization,
        unitPrice: PRODUCTS.find(p => p.id === item.productId)?.price || 0
      })),
      shipping: {
        name: document.getElementById('shipName').value,
        lastname: document.getElementById('shipLastname').value,
        address: document.getElementById('shipAddress').value,
        city: document.getElementById('shipCity').value,
        phone: document.getElementById('shipPhone').value
      },
      subtotal,
      tax,
      total,
      status: 'confirmed',
      statusHistory: [
        { status: 'confirmed', date: new Date().toISOString() }
      ]
    };

    // Save order
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);

    // Enviar compra a n8n → Gmail (recibo) + PostgreSQL
    const receiptEmail = document.getElementById('shipEmail').value;
    const userForReceipt = { ...user, email: receiptEmail };
    n8nPurchase(order, userForReceipt);

    // Update product stock
    cart.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (product) product.stock = Math.max(0, product.stock - item.quantity);
    });

    // Clear cart
    clearCart();

    // Navigate to ticket
    showToast('success', '¡Compra exitosa!', 'Tu pedido ha sido procesado correctamente');
    navigateTo('ticket', { orderId: order.id });
  });
});

// ── Render Ticket ──
function renderTicket(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const card = document.getElementById('ticketCard');
  if (!card) return;

  card.innerHTML = `
    <div class="ticket-header">
      <div>
        <div class="ticket-order-number">${order.orderNumber}</div>
        <div class="ticket-date">${new Date(order.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div class="ticket-code">${order.orderCode}</div>
    </div>
    <div class="ticket-products">
      ${order.items.map(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return '';
        return `
          <div class="ticket-product">
            <div>
              <div class="product-name">${product.name} × ${item.quantity}</div>
              <div class="product-custom">${item.size}${item.customization ? ' · ✨ ' + (item.customization.text || 'Personalizado') : ''}</div>
            </div>
            <span>${formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        `;
      }).join('')}
    </div>
    <hr class="ticket-divider">
    <div class="ticket-totals">
      <div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
      <div class="row"><span>IVA (19%)</span><span>${formatPrice(order.tax)}</span></div>
      <div class="row"><span>Envío</span><span style="color:var(--success)">Gratis</span></div>
      <div class="row total"><span>Total Pagado</span><span>${formatPrice(order.total)}</span></div>
    </div>
    <div style="margin-top:var(--space-lg);padding-top:var(--space-lg);border-top:1px dashed var(--border-color);text-align:center;">
      <p style="font-size:0.8rem;color:var(--text-muted);">Envío a: ${order.shipping.address}, ${order.shipping.city}</p>
      <p style="font-size:0.8rem;color:var(--text-muted);">Estado: <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></p>
    </div>
  `;
}

// ── Render Order Tracking ──
function renderOrderTracking(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const container = document.getElementById('orderTrackingContent');
  if (!container) return;

  const statuses = ['confirmed', 'preparing', 'shipped', 'delivered'];
  const currentIdx = statuses.indexOf(order.status);
  const progressWidth = currentIdx >= 0 ? (currentIdx / (statuses.length - 1)) * 100 : 0;

  container.innerHTML = `
    <h1 style="font-size:2rem;font-weight:800;margin-bottom:var(--space-sm);">Seguimiento del Pedido</h1>
    <p style="color:var(--text-secondary);margin-bottom:var(--space-2xl);">${order.orderNumber}</p>
    
    <div class="order-timeline">
      <div class="timeline-progress" style="width:${progressWidth}%"></div>
      ${statuses.map((s, i) => `
        <div class="timeline-step ${i <= currentIdx ? 'completed' : ''} ${i === currentIdx ? 'active' : ''}">
          <div class="step-dot">${i <= currentIdx ? '✓' : (i + 1)}</div>
          <div class="step-label">${getStatusLabel(s)}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2xl);margin-top:var(--space-3xl);">
      <div class="checkout-section">
        <h2>📦 Detalle del Pedido</h2>
        <div style="display:flex;flex-direction:column;gap:var(--space-md);">
          ${order.items.map(item => {
            const product = PRODUCTS.find(p => p.id === item.productId);
            if (!product) return '';
            return `
              <div class="order-item">
                <div class="order-item-img">
                  <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="order-item-details">
                  <div class="order-item-name">${product.name}</div>
                  <div class="order-item-meta">Talla: ${item.size} · Cant: ${item.quantity}${item.customization ? ' · ✨ ' + (item.customization.text || 'Personalizado') : ''}</div>
                </div>
                <div class="order-item-price">${formatPrice(item.unitPrice * item.quantity)}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="margin-top:var(--space-lg);padding-top:var(--space-lg);border-top:1px solid var(--border-color);">
          <div class="order-totals">
            <div class="row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
            <div class="row"><span>IVA (19%)</span><span>${formatPrice(order.tax)}</span></div>
            <div class="row total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
          </div>
        </div>
      </div>
      <div>
        <div class="checkout-section">
          <h2>📍 Información de Envío</h2>
          <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;">
            <strong>${order.shipping.name} ${order.shipping.lastname}</strong><br>
            ${order.shipping.address}<br>
            ${order.shipping.city}<br>
            📞 ${order.shipping.phone}
          </p>
        </div>
        <div class="checkout-section" style="margin-top:var(--space-lg);">
          <h2>📋 Historial de Estado</h2>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
            ${(order.statusHistory || []).map(h => `
              <div style="display:flex;justify-content:space-between;font-size:0.85rem;padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color);">
                <span class="status-badge status-${h.status}">${getStatusLabel(h.status)}</span>
                <span style="color:var(--text-muted)">${new Date(h.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
