/* ========================================================
   MYM DESIGNSX – Authentication Module
   ======================================================== */

// ── Default Admin User ──
const DEFAULT_ADMIN = {
  id: 'admin-001',
  name: 'Admin',
  lastname: 'Mym',
  email: 'admin@mym.com',
  phone: '+57 300 000 0000',
  password: btoa('admin123'),
  role: 'admin',
  address: {
    street: 'Calle Principal #123',
    city: 'Bucaramanga',
    phone: '+57 300 000 0000'
  },
  createdAt: new Date().toISOString()
};

// ── User Storage ──
function getUsers() {
  const users = JSON.parse(localStorage.getItem('mym-users') || '[]');
  // Ensure admin exists
  if (!users.find(u => u.email === DEFAULT_ADMIN.email)) {
    users.push(DEFAULT_ADMIN);
    localStorage.setItem('mym-users', JSON.stringify(users));
  }
  return users;
}

function saveUsers(users) {
  localStorage.setItem('mym-users', JSON.stringify(users));
}

function getCurrentUser() {
  const userId = sessionStorage.getItem('mym-currentUser');
  if (!userId) return null;
  return getUsers().find(u => u.id === userId) || null;
}

function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem('mym-currentUser', user.id);
  } else {
    sessionStorage.removeItem('mym-currentUser');
  }
  updateUserUI();
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// ── Update UI based on auth ──
function updateUserUI() {
  const user = getCurrentUser();
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.textContent = user ? '😊' : '👤';
    userBtn.title = user ? `${user.name} ${user.lastname}` : 'Mi cuenta';
  }
}

// ── Register ──
function registerUser(data) {
  const users = getUsers();
  
  // Check duplicate email
  if (users.find(u => u.email === data.email)) {
    showToast('error', 'Error', 'Ya existe una cuenta con ese correo electrónico');
    return false;
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: data.name,
    lastname: data.lastname,
    email: data.email,
    phone: data.phone,
    password: btoa(data.password),
    role: 'user',
    address: { street: '', city: '', phone: data.phone },
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  
  // Enviar registro a n8n → PostgreSQL
  n8nRegister(newUser);
  
  showToast('success', '¡Bienvenido!', `Cuenta creada exitosamente. Hola, ${newUser.name}!`);
  return true;
}

// ── Login ──
async function loginUser(email, password) {
  // Primero le preguntamos a n8n (que consultará la base de datos)
  const n8nResponse = await typeof n8nCheckLogin === 'function' ? await n8nCheckLogin(email, password) : null;
  
  let user = null;
  
  // SOLAMENTE se permite iniciar sesión si n8n responde "success"
  if (n8nResponse && n8nResponse.status === 'success') {
    user = n8nResponse.userData;
    
    // Sincronizar con almacenamiento local para mantener la sesión
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.email === user.email);
    if (existingIndex !== -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    saveUsers(users);
  } else if (n8nResponse && n8nResponse.status === 'error') {
    // Si n8n responde explícitamente con un error (ej. contraseña incorrecta)
    showToast('error', 'Error', n8nResponse.message || 'Correo o contraseña incorrectos');
    return false;
  } else {
    // Si no hubo respuesta de n8n o la conexión falló, denegamos el acceso
    showToast('error', 'Error de conexión', 'No se pudo establecer una conexión apropiada. Intente de nuevo.');
    return false;
  }
  
  if (!user) {
    showToast('error', 'Error', 'Correo o contraseña incorrectos');
    return false;
  }

  setCurrentUser(user);

  showToast('success', '¡Bienvenido!', `Hola de nuevo, ${user.name}!`);
  return true;
}

// ── Logout ──
function logoutUser() {
  setCurrentUser(null);
  showToast('info', 'Sesión cerrada', 'Has cerrado sesión correctamente');
  navigateTo('landing');
}

// ── Update Profile ──
function updateProfile(data) {
  const user = getCurrentUser();
  if (!user) return false;

  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return false;

  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  
  showToast('success', 'Actualizado', 'Tu perfil ha sido actualizado');
  return true;
}

// ── Render Profile ──
function renderProfile(tab = 'personal') {
  const user = getCurrentUser();
  if (!user) {
    navigateTo('landing');
    document.getElementById('loginModal').classList.add('active');
    return;
  }

  // Profile header
  const header = document.getElementById('profileHeader');
  if (header) {
    header.innerHTML = `
      <div class="profile-avatar">${user.name[0]}${user.lastname[0]}</div>
      <div>
        <div class="profile-name">${user.name} ${user.lastname}</div>
        <div class="profile-email">${user.email}</div>
        <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm);">
          ${user.role === 'admin' ? '<button class="btn btn-gold btn-sm" data-page="admin">⚙️ Panel Admin</button>' : ''}
          <button class="btn btn-ghost btn-sm" id="logoutBtn" style="color:var(--error)">Cerrar sesión</button>
        </div>
      </div>
    `;
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
  }

  // Tabs
  document.querySelectorAll('#profileTabs .profile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  // Content
  const content = document.getElementById('profileContent');
  if (!content) return;

  switch(tab) {
    case 'personal':
      renderProfilePersonal(content, user);
      break;
    case 'address':
      renderProfileAddress(content, user);
      break;
    case 'orders':
      renderProfileOrders(content, user);
      break;
    case 'favorites':
      renderProfileFavorites(content);
      break;
  }

  // Tab clicks
  document.querySelectorAll('#profileTabs .profile-tab').forEach(t => {
    t.addEventListener('click', () => renderProfile(t.dataset.tab));
  });
}

function renderProfilePersonal(container, user) {
  container.innerHTML = `
    <div class="checkout-section" style="max-width:600px;">
      <h2>👤 Datos Personales</h2>
      <form id="profilePersonalForm" class="form-grid">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" class="form-input" id="profName" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label>Apellido</label>
          <input type="text" class="form-input" id="profLastname" value="${user.lastname}" required>
        </div>
        <div class="form-group full-width">
          <label>Correo electrónico</label>
          <input type="email" class="form-input" value="${user.email}" disabled style="opacity:0.6">
        </div>
        <div class="form-group full-width">
          <label>Teléfono</label>
          <input type="tel" class="form-input" id="profPhone" value="${user.phone || ''}">
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  `;
  document.getElementById('profilePersonalForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateProfile({
      name: document.getElementById('profName').value,
      lastname: document.getElementById('profLastname').value,
      phone: document.getElementById('profPhone').value
    });
    renderProfile('personal');
  });
}

function renderProfileAddress(container, user) {
  const addr = user.address || {};
  container.innerHTML = `
    <div class="checkout-section" style="max-width:600px;">
      <h2>📍 Dirección de Envío</h2>
      <form id="profileAddressForm" class="form-grid">
        <div class="form-group full-width">
          <label>Dirección</label>
          <input type="text" class="form-input" id="addrStreet" value="${addr.street || ''}" placeholder="Calle, número, apartamento">
        </div>
        <div class="form-group">
          <label>Ciudad</label>
          <input type="text" class="form-input" id="addrCity" value="${addr.city || ''}" placeholder="Tu ciudad">
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input type="tel" class="form-input" id="addrPhone" value="${addr.phone || ''}" placeholder="+57 300 123 4567">
        </div>
        <div class="form-group full-width">
          <button type="submit" class="btn btn-primary">Guardar Dirección</button>
        </div>
      </form>
    </div>
  `;
  document.getElementById('profileAddressForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateProfile({
      address: {
        street: document.getElementById('addrStreet').value,
        city: document.getElementById('addrCity').value,
        phone: document.getElementById('addrPhone').value
      }
    });
    renderProfile('address');
  });
}

function renderProfileOrders(container, user) {
  const orders = getOrders().filter(o => o.userId === user.id);
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-4xl);color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:var(--space-md);">📦</div>
        <h3>No tienes pedidos aún</h3>
        <p style="margin-bottom:var(--space-lg);">Explora nuestro catálogo y haz tu primera compra</p>
        <button class="btn btn-primary" data-page="catalog">Explorar Catálogo</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="orders-list">
      ${orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(order => `
        <div class="order-card" style="cursor:pointer" data-page="orderTracking" data-order-id="${order.id}">
          <div class="order-card-header">
            <div>
              <div class="order-number">Pedido ${order.orderNumber}</div>
              <div class="order-date">${new Date(order.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span>
          </div>
          <div class="order-card-items">
            ${order.items.map(item => {
              const product = PRODUCTS.find(p => p.id === item.productId);
              return product ? `<img src="${product.image}" alt="${product.name}">` : '';
            }).join('')}
          </div>
          <div class="order-card-total">Total: ${formatPrice(order.total)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderProfileFavorites(container) {
  const favIds = getFavorites();
  const favProducts = PRODUCTS.filter(p => favIds.includes(p.id));

  if (favProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-4xl);color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:var(--space-md);">💜</div>
        <h3>No tienes favoritos aún</h3>
        <p style="margin-bottom:var(--space-lg);">Marca productos como favoritos para verlos aquí</p>
        <button class="btn btn-primary" data-page="catalog">Explorar Catálogo</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="favorites-grid">
      ${favProducts.map(p => createProductCard(p)).join('')}
    </div>
  `;
}

function getStatusLabel(status) {
  const labels = {
    confirmed: 'Confirmado',
    preparing: 'En Preparación',
    shipped: 'Enviado',
    delivered: 'Entregado'
  };
  return labels[status] || status;
}

// ── Auth Form Handlers ──
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const success = await loginUser(email, password);
    if (success) {
      document.getElementById('loginModal').classList.remove('active');
      document.getElementById('loginForm').reset();
    }
  });

  // Register form
  document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== confirm) {
      showToast('error', 'Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const data = {
      name: document.getElementById('regName').value,
      lastname: document.getElementById('regLastname').value,
      email: document.getElementById('regEmail').value,
      phone: document.getElementById('regPhone').value,
      password: password
    };

    if (registerUser(data)) {
      document.getElementById('registerModal').classList.remove('active');
      document.getElementById('registerForm').reset();
    }
  });

  // Set initial user UI
  updateUserUI();
});
