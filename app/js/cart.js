/* ========================================================
   MYM DESIGNSX – Cart Module
   ======================================================== */

// ── Cart Storage ──
function getCart() {
  return JSON.parse(localStorage.getItem('mym-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('mym-cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartSidebar();
}

// ── Add to Cart ──
function addToCart(productId, quantity = 1, size = null, color = null, customization = null) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const cart = getCart();
  
  // Check if same product with same options exists
  const existingIndex = cart.findIndex(item => 
    item.productId === productId && 
    item.size === size && 
    item.color === color &&
    JSON.stringify(item.customization) === JSON.stringify(customization)
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId,
      quantity,
      size: size || product.sizes[0],
      color: color || product.colors[0].hex,
      customization: customization || null,
      addedAt: new Date().toISOString()
    });
  }

  saveCart(cart);
  showToast('success', '¡Agregado!', `${product.name} se agregó al carrito`);
  
  // Open cart sidebar briefly
  document.getElementById('cartSidebar').classList.add('active');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ── Remove from Cart ──
function removeFromCart(cartItemId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== cartItemId);
  saveCart(cart);
  showToast('info', 'Eliminado', 'Producto eliminado del carrito');
}

// ── Update Quantity ──
function updateCartQuantity(cartItemId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(cartItemId);
    return;
  }

  saveCart(cart);
}

// ── Cart Calculations ──
function getCartTotals() {
  const cart = getCart();
  let subtotal = 0;
  
  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
    }
  });

  const taxRate = 0.19; // IVA 19%
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  return { subtotal, tax, total, itemCount: cart.reduce((s, i) => s + i.quantity, 0) };
}

// ── Update Cart Badge ──
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const { itemCount } = getCartTotals();
  badge.textContent = itemCount;
  badge.classList.toggle('hidden', itemCount === 0);
}

// ── Render Cart Sidebar ──
function renderCartSidebar() {
  const cart = getCart();
  const itemsContainer = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const countLabel = document.getElementById('cartCountLabel');

  if (!itemsContainer) return;

  const { subtotal, tax, total, itemCount } = getCartTotals();
  
  if (countLabel) countLabel.textContent = `(${itemCount} item${itemCount !== 1 ? 's' : ''})`;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p style="font-weight:600;">Tu carrito está vacío</p>
        <p style="font-size:0.85rem;">Explora nuestro catálogo y encuentra productos increíbles</p>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = '';

  itemsContainer.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return '';
    
    const colorName = product.colors.find(c => c.hex === item.color)?.name || '';
    const customLabel = item.customization ? `✨ "${item.customization.text || 'Personalizado'}"` : '';

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="cart-item-info">
          <div>
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-custom">${item.size} · ${colorName} ${customLabel}</div>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-item-qty">
              <button onclick="updateCartQuantity('${item.id}', -1)">−</button>
              <span>${item.quantity}</span>
              <button onclick="updateCartQuantity('${item.id}', 1)">+</button>
            </div>
            <span class="cart-item-price">${formatPrice(product.price * item.quantity)}</span>
          </div>
          <span class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑️ Eliminar</span>
        </div>
      </div>
    `;
  }).join('');

  // Totals
  document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('cartTax').textContent = formatPrice(tax);
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

// ── Clear Cart ──
function clearCart() {
  localStorage.removeItem('mym-cart');
  updateCartBadge();
  renderCartSidebar();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderCartSidebar();
});
