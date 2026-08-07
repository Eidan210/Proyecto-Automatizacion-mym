/* ========================================================
   MYM DESIGNSX – Admin Panel Module
   ======================================================== */

// ── Render Admin Panel ──
function renderAdmin(tab = 'products') {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    showToast('error', 'Acceso denegado', 'Necesitas permisos de administrador');
    navigateTo('landing');
    return;
  }

  renderAdminStats();
  
  // Tabs
  document.querySelectorAll('#adminTabs .admin-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  // Tab click handlers
  document.querySelectorAll('#adminTabs .admin-tab').forEach(t => {
    t.onclick = () => renderAdmin(t.dataset.tab);
  });

  const content = document.getElementById('adminContent');
  if (!content) return;

  switch(tab) {
    case 'products':
      renderAdminProducts(content);
      break;
    case 'orders':
      renderAdminOrders(content);
      break;
    case 'categories':
      renderAdminCategories(content);
      break;
  }
}

// ── Admin Stats ──
function renderAdminStats() {
  const container = document.getElementById('adminStats');
  if (!container) return;

  const orders = getOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalProducts = PRODUCTS.length;
  const totalOrders = orders.length;
  const totalUsers = getUsers().filter(u => u.role !== 'admin').length;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon">💰</div>
      <div class="stat-card-value">${formatPrice(totalRevenue)}</div>
      <div class="stat-card-label">Ventas Totales</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">📦</div>
      <div class="stat-card-value">${totalOrders}</div>
      <div class="stat-card-label">Pedidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">🛍️</div>
      <div class="stat-card-value">${totalProducts}</div>
      <div class="stat-card-label">Productos</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">👥</div>
      <div class="stat-card-value">${totalUsers}</div>
      <div class="stat-card-label">Clientes</div>
    </div>
  `;
}

// ── Admin Products ──
function renderAdminProducts(container) {
  container.innerHTML = `
    <div class="admin-table-container">
      <div class="admin-table-header">
        <h3 style="font-size:1.1rem;font-weight:700;">Productos (${PRODUCTS.length})</h3>
        <button class="btn btn-primary btn-sm" id="addProductBtn">+ Nuevo Producto</button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${PRODUCTS.map(p => `
            <tr>
              <td>
                <div class="product-cell">
                  <img src="${p.image}" alt="${p.name}">
                  <div>
                    <div style="font-weight:600;font-size:0.85rem;">${p.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">ID: ${p.id}</div>
                  </div>
                </div>
              </td>
              <td><span class="product-card-category" style="font-size:0.7rem;">${p.category}</span></td>
              <td style="font-weight:600;">${formatPrice(p.price)}</td>
              <td>
                <span style="color:${p.stock <= 10 ? 'var(--error)' : p.stock <= 20 ? 'var(--warning)' : 'var(--success)'};font-weight:600;">
                  ${p.stock}
                </span>
                ${p.stock <= 10 ? '<span style="font-size:0.7rem;color:var(--error);"> ⚠️ Bajo</span>' : ''}
              </td>
              <td><span class="status-badge ${p.stock > 0 ? 'status-delivered' : 'status-confirmed'}">${p.stock > 0 ? 'Activo' : 'Agotado'}</span></td>
              <td>
                <div class="actions-cell">
                  <button class="btn-edit" title="Editar" onclick="editProductAdmin(${p.id})">✏️</button>
                  <button class="btn-delete" title="Eliminar" onclick="deleteProductAdmin(${p.id})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('addProductBtn')?.addEventListener('click', () => {
    showToast('info', 'Próximamente', 'La creación de productos estará disponible con el backend');
  });
}

// ── Admin Orders ──
function renderAdminOrders(container) {
  const orders = getOrders();

  container.innerHTML = `
    <div class="admin-table-container">
      <div class="admin-table-header">
        <h3 style="font-size:1.1rem;font-weight:700;">Pedidos (${orders.length})</h3>
      </div>
      ${orders.length === 0 ? `
        <div style="text-align:center;padding:var(--space-3xl);color:var(--text-muted);">
          <p style="font-size:1.2rem;">📦</p>
          <p>No hay pedidos aún</p>
        </div>
      ` : `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(order => {
              const orderUser = getUsers().find(u => u.id === order.userId);
              return `
                <tr>
                  <td>
                    <div style="font-weight:600;font-size:0.85rem;">${order.orderNumber}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);">${order.orderCode}</div>
                  </td>
                  <td>${orderUser ? `${orderUser.name} ${orderUser.lastname}` : 'Desconocido'}</td>
                  <td style="font-size:0.85rem;">${new Date(order.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</td>
                  <td style="font-weight:600;">${formatPrice(order.total)}</td>
                  <td>
                    <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)">
                      <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                      <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>En Preparación</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
                    </select>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-edit" title="Ver detalle" data-page="orderTracking" data-order-id="${order.id}">👁️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

// ── Admin Categories ──
function renderAdminCategories(container) {
  container.innerHTML = `
    <div class="admin-table-container">
      <div class="admin-table-header">
        <h3 style="font-size:1.1rem;font-weight:700;">Categorías (${CATEGORIES.length})</h3>
        <button class="btn btn-primary btn-sm" onclick="showToast('info', 'Próximamente', 'La gestión de categorías estará disponible con el backend')">+ Nueva Categoría</button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Icono</th>
            <th>Nombre</th>
            <th>ID</th>
            <th>Productos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${CATEGORIES.map(cat => `
            <tr>
              <td style="font-size:1.5rem;">${cat.icon}</td>
              <td style="font-weight:600;">${cat.name}</td>
              <td style="font-size:0.85rem;color:var(--text-muted);">${cat.id}</td>
              <td>${cat.count}</td>
              <td>
                <div class="actions-cell">
                  <button class="btn-edit" title="Editar" onclick="showToast('info', 'Próximamente', 'Edición disponible con el backend')">✏️</button>
                  <button class="btn-delete" title="Eliminar" onclick="showToast('info', 'Próximamente', 'Eliminación disponible con el backend')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Update Order Status ──
function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const previousStatus = order.status;
  order.status = newStatus;
  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({
    status: newStatus,
    date: new Date().toISOString()
  });

  saveOrders(orders);

  showToast('success', 'Estado actualizado', `Pedido actualizado a: ${getStatusLabel(newStatus)}`);
  renderAdminStats();
}

// ── Admin Actions ──
function editProductAdmin(productId) {
  showToast('info', 'Próximamente', 'La edición de productos estará disponible con el backend');
}

function deleteProductAdmin(productId) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    const idx = PRODUCTS.findIndex(p => p.id === productId);
    if (idx >= 0) {
      PRODUCTS.splice(idx, 1);
      showToast('success', 'Eliminado', 'Producto eliminado correctamente');
      renderAdmin('products');
    }
  }
}
