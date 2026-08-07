/* ========================================================
   MYM DESIGNSX – App Core (SPA Router, Theme, Renders)
   ======================================================== */

// ── State ──
const AppState = {
  currentPage: 'landing',
  currentProductId: null,
  currentFilter: null,
  testimonialSlide: 0
};

// ── SPA Router ──
function navigateTo(page, options = {}) {
  // Hide all pages
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));

  // Show target page
  const target = document.getElementById(page);
  if (target) {
    target.classList.remove('hidden');
    AppState.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active nav
    document.querySelectorAll('.navbar-nav .nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.navbar-nav [data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
    if (page === 'landing') {
      const homeLink = document.querySelector('.navbar-nav [data-page="landing"]');
      if (homeLink) homeLink.classList.add('active');
    }

    // Page-specific logic
    switch(page) {
      case 'landing':
        renderLanding();
        break;
      case 'catalog':
        renderCatalog(options.filter || null);
        break;
      case 'productDetail':
        if (options.productId) renderProductDetail(options.productId);
        break;
      case 'customizer':
        if (options.productId) initCustomizer(options.productId);
        break;
      case 'checkout':
        renderCheckout();
        break;
      case 'ticket':
        if (options.orderId) renderTicket(options.orderId);
        break;
      case 'profile':
        renderProfile(options.tab || 'personal');
        break;
      case 'orderTracking':
        if (options.orderId) renderOrderTracking(options.orderId);
        break;
      case 'admin':
        renderAdmin(options.tab || 'products');
        break;
    }
  }

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('mobile-open');
  document.getElementById('menuToggle').classList.remove('active');
}

// ── Theme Toggle ──
function initTheme() {
  const saved = localStorage.getItem('mym-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mym-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const ball = document.querySelector('.toggle-ball');
  if (ball) ball.textContent = theme === 'light' ? '☀️' : '🌙';
}

// ── Toast Notifications ──
function showToast(type, title, message) {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Render: Landing Page ──
function renderLanding() {
  renderFeaturedProducts();
  renderCategories();
  renderTestimonials();
  renderFAQ();
}

function renderFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = PRODUCTS.slice(0, 8);
  grid.innerHTML = featured.map(p => createProductCard(p)).join('');
}

function createProductCard(product) {
  const isFav = isFavorite(product.id);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  let badge = '';
  if (product.tags.includes('nuevo')) badge = '<span class="product-card-badge badge-new">Nuevo</span>';
  else if (product.tags.includes('oferta')) badge = `<span class="product-card-badge badge-sale">-${discount}%</span>`;
  else if (product.tags.includes('temporada')) badge = '<span class="product-card-badge badge-seasonal">Temporada</span>';
  else if (product.tags.includes('personalizable')) badge = '<span class="product-card-badge badge-custom">Custom</span>';

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${badge}
        <button class="product-card-fav ${isFav ? 'active' : ''}" data-fav-id="${product.id}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-card-info">
        <div class="product-card-category">${product.category}${product.seasonCategory ? ' · ' + product.seasonCategory : ''}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <div class="product-card-actions">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); quickAddToCart(${product.id})">🛒 Agregar</button>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); navigateTo('customizer', {productId: ${product.id}})">✨ Personalizar</button>
        </div>
      </div>
    </div>
  `;
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card ${cat.color}" data-page="catalog" data-filter="${cat.id}">
      <div class="category-card-icon">${cat.icon}</div>
      <div class="category-card-name">${cat.name}</div>
      <div class="category-card-count">${cat.count} productos</div>
    </div>
  `).join('');
}

function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const dots = document.getElementById('testimonialsDots');
  if (!track || !dots) return;

  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.initials}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-role">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');

  const totalDots = Math.ceil(TESTIMONIALS.length / 3);
  dots.innerHTML = Array.from({ length: totalDots }, (_, i) =>
    `<div class="dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>`
  ).join('');

  // Auto-play
  startTestimonialSlider();
}

function startTestimonialSlider() {
  const track = document.getElementById('testimonialsTrack');
  const dots = document.querySelectorAll('#testimonialsDots .dot');
  if (!track || dots.length === 0) return;

  if (window._testimonialInterval) clearInterval(window._testimonialInterval);
  
  window._testimonialInterval = setInterval(() => {
    AppState.testimonialSlide = (AppState.testimonialSlide + 1) % dots.length;
    updateTestimonialSlide();
  }, 5000);
}

function updateTestimonialSlide() {
  const track = document.getElementById('testimonialsTrack');
  const dots = document.querySelectorAll('#testimonialsDots .dot');
  if (!track) return;

  const cardWidth = track.querySelector('.testimonial-card')?.offsetWidth || 0;
  const gap = 24;
  const offset = AppState.testimonialSlide * (cardWidth + gap) * 3;
  track.style.transform = `translateX(-${offset}px)`;

  dots.forEach((d, i) => d.classList.toggle('active', i === AppState.testimonialSlide));
}

function renderFAQ() {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.innerHTML = FAQ_DATA.map((faq, i) => `
    <div class="faq-item" data-faq="${i}">
      <button class="faq-question">
        <span>${faq.question}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer">
        <p>${faq.answer}</p>
      </div>
    </div>
  `).join('');
}

// ── Render: Catalog ──
function renderCatalog(filter) {
  AppState.currentFilter = filter;
  renderCatalogFilterChips();
  renderFilterSidebar();
  filterAndRenderProducts();
}

function renderCatalogFilterChips() {
  const container = document.getElementById('catalogFilterChips');
  if (!container) return;
  const chips = [
    { id: null, label: 'Todos' },
    { id: 'personalizable', label: '✨ Personalizable' },
    ...CATEGORIES.map(c => ({ id: c.id, label: c.icon + ' ' + c.name }))
  ];
  container.innerHTML = chips.map(c => `
    <button class="filter-chip ${AppState.currentFilter === c.id ? 'active' : ''}" data-chip-filter="${c.id}">
      ${c.label}
    </button>
  `).join('');
}

function renderFilterSidebar() {
  // Categories
  const catContainer = document.getElementById('filterCategories');
  if (catContainer) {
    catContainer.innerHTML = CATEGORIES.map(c => `
      <label class="filter-option">
        <input type="checkbox" value="${c.id}" ${AppState.currentFilter === c.id ? 'checked' : ''}>
        <span>${c.icon} ${c.name}</span>
      </label>
    `).join('');
  }

  // Sizes
  const sizesContainer = document.getElementById('filterSizes');
  if (sizesContainer) {
    const allSizes = [...new Set(PRODUCTS.flatMap(p => p.sizes))];
    sizesContainer.innerHTML = allSizes.map(s => `
      <button class="size-btn" data-size="${s}">${s}</button>
    `).join('');
  }

  // Colors
  const colorsContainer = document.getElementById('filterColors');
  if (colorsContainer) {
    const allColors = [];
    const seenHex = new Set();
    PRODUCTS.forEach(p => p.colors.forEach(c => {
      if (!seenHex.has(c.hex)) {
        seenHex.add(c.hex);
        allColors.push(c);
      }
    }));
    colorsContainer.innerHTML = allColors.map(c => `
      <div class="color-swatch" style="background:${c.hex};${c.hex === '#FFFFFF' ? 'border:1px solid var(--border-color)' : ''}" title="${c.name}" data-color="${c.hex}"></div>
    `).join('');
  }
}

function filterAndRenderProducts() {
  let filtered = [...PRODUCTS];
  const searchVal = document.getElementById('catalogSearch')?.value?.toLowerCase() || '';
  
  if (searchVal) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchVal) || 
      p.description.toLowerCase().includes(searchVal) ||
      p.category.toLowerCase().includes(searchVal)
    );
  }

  if (AppState.currentFilter) {
    if (AppState.currentFilter === 'personalizable') {
      filtered = filtered.filter(p => p.customizable);
    } else {
      filtered = filtered.filter(p => 
        p.category === AppState.currentFilter || 
        p.seasonCategory === AppState.currentFilter
      );
    }
  }

  const grid = document.getElementById('catalogGrid');
  const count = document.getElementById('productsCount');
  if (grid) grid.innerHTML = filtered.length ? filtered.map(p => createProductCard(p)).join('') : '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:var(--space-3xl);">No se encontraron productos 😔</p>';
  if (count) count.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;
}

// ── Render: Product Detail ──
function renderProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  AppState.currentProductId = productId;

  const container = document.getElementById('productDetailContent');
  if (!container) return;

  container.innerHTML = `
    <div class="product-gallery">
      <div class="product-gallery-main">
        <img src="${product.image}" alt="${product.name}" id="mainGalleryImg">
      </div>
    </div>
    <div class="product-info">
      <div class="breadcrumb">
        <a data-page="landing">Inicio</a> / <a data-page="catalog">Catálogo</a> / <span>${product.name}</span>
      </div>
      <h1>${product.name}</h1>
      <span class="product-category-tag">${product.category}${product.seasonCategory ? ' · ' + product.seasonCategory : ''}</span>
      <div class="product-price-block">
        <span class="price-current">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
        ${product.originalPrice ? `<span class="price-discount">-${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>` : ''}
      </div>
      <p class="product-description">${product.description}</p>
      <div class="product-options">
        <div class="option-group">
          <label>Talla</label>
          <div class="size-options" id="detailSizes">
            ${product.sizes.map((s, i) => `<button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>`).join('')}
          </div>
        </div>
        <div class="option-group">
          <label>Color</label>
          <div class="color-options" id="detailColors">
            ${product.colors.map((c, i) => `<div class="color-option ${i === 0 ? 'active' : ''}" style="background:${c.hex};${c.hex === '#FFFFFF' ? 'box-shadow:inset 0 0 0 1px var(--border-color)' : ''}" data-color="${c.hex}" title="${c.name}"></div>`).join('')}
          </div>
        </div>
        <div class="option-group">
          <label>Cantidad</label>
          <div class="quantity-selector">
            <div class="quantity-controls">
              <button id="qtyMinus">−</button>
              <div class="qty-value" id="qtyValue">1</div>
              <button id="qtyPlus">+</button>
            </div>
            <span style="font-size:0.85rem;color:var(--text-muted)">${product.stock} disponibles</span>
          </div>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-lg" id="addToCartBtn">🛒 Agregar al Carrito</button>
        ${product.customizable ? `<button class="btn btn-outline btn-lg" id="customizeBtn">✨ Personalizar</button>` : ''}
      </div>
      <div style="margin-top:var(--space-xl);display:flex;gap:var(--space-xl);color:var(--text-muted);font-size:0.85rem;">
        <span>⭐ ${product.rating} (${product.reviews} reseñas)</span>
        <span>📦 Envío gratis</span>
        <span>🔄 Devolución en 30 días</span>
      </div>
    </div>
  `;

  // Quantity controls
  let qty = 1;
  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    if (qty > 1) { qty--; document.getElementById('qtyValue').textContent = qty; }
  });
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    if (qty < product.stock) { qty++; document.getElementById('qtyValue').textContent = qty; }
  });

  // Size selection
  container.querySelectorAll('#detailSizes .size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#detailSizes .size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Color selection
  container.querySelectorAll('#detailColors .color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#detailColors .color-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Add to cart
  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    const size = container.querySelector('#detailSizes .size-btn.active')?.dataset.size || product.sizes[0];
    const color = container.querySelector('#detailColors .color-option.active')?.dataset.color || product.colors[0].hex;
    addToCart(product.id, qty, size, color);
  });

  // Customize
  document.getElementById('customizeBtn')?.addEventListener('click', () => {
    navigateTo('customizer', { productId: product.id });
  });
}

// ── Favorites ──
function getFavorites() {
  return JSON.parse(localStorage.getItem('mym-favorites') || '[]');
}

function isFavorite(productId) {
  return getFavorites().includes(productId);
}

function toggleFavorite(productId) {
  let favs = getFavorites();
  if (favs.includes(productId)) {
    favs = favs.filter(id => id !== productId);
    showToast('info', 'Eliminado', 'Producto eliminado de favoritos');
  } else {
    favs.push(productId);
    showToast('success', '¡Agregado!', 'Producto agregado a favoritos');
  }
  localStorage.setItem('mym-favorites', JSON.stringify(favs));
  
  // Update UI
  document.querySelectorAll(`[data-fav-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active', favs.includes(productId));
    btn.textContent = favs.includes(productId) ? '❤️' : '🤍';
  });
}

// ── Render: Categories Dropdown ──
function renderCategoriesDropdown() {
  const menu = document.getElementById('navCategoriesMenu');
  if (!menu) return;
  menu.innerHTML = CATEGORIES.map(c => `
    <a data-page="catalog" data-filter="${c.id}">${c.icon} ${c.name}</a>
  `).join('');
}

// ── Scroll Animations (Intersection Observer) ──
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .category-card, .step-card').forEach(el => {
    observer.observe(el);
  });
}

// ── Global Event Delegation ──
function initEventDelegation() {
  // Navigation clicks
  document.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-page]');
    if (navEl) {
      e.preventDefault();
      const page = navEl.dataset.page;
      const filter = navEl.dataset.filter || null;
      const productId = navEl.dataset.productId ? parseInt(navEl.dataset.productId) : null;
      const tab = navEl.dataset.tab || null;
      const orderId = navEl.dataset.orderId || null;
      navigateTo(page, { filter, productId, tab, orderId });
    }

    // Product card click
    const productCard = e.target.closest('.product-card');
    if (productCard && !e.target.closest('.product-card-fav') && !e.target.closest('.product-card-actions')) {
      const productId = parseInt(productCard.dataset.productId);
      navigateTo('productDetail', { productId });
    }

    // Category card click
    const catCard = e.target.closest('.category-card');
    if (catCard) {
      const filter = catCard.dataset.filter;
      navigateTo('catalog', { filter });
    }

    // Filter chips
    const chip = e.target.closest('[data-chip-filter]');
    if (chip) {
      const filter = chip.dataset.chipFilter === 'null' ? null : chip.dataset.chipFilter;
      AppState.currentFilter = filter;
      renderCatalogFilterChips();
      filterAndRenderProducts();
    }

    // FAQ toggle
    const faqQ = e.target.closest('.faq-question');
    if (faqQ) {
      const item = faqQ.closest('.faq-item');
      item.classList.toggle('active');
    }

    // Testimonial dots
    const dot = e.target.closest('.testimonials-dots .dot');
    if (dot) {
      AppState.testimonialSlide = parseInt(dot.dataset.slide);
      updateTestimonialSlide();
    }

    // Modal close
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      const modalId = closeBtn.dataset.closeModal;
      document.getElementById(modalId)?.classList.remove('active');
    }

    // Close modals on overlay click
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });

  // Search
  document.getElementById('catalogSearch')?.addEventListener('input', () => {
    filterAndRenderProducts();
  });

  // Cart button
  document.getElementById('cartBtn')?.addEventListener('click', toggleCart);
  document.getElementById('cartClose')?.addEventListener('click', toggleCart);
  document.getElementById('cartOverlay')?.addEventListener('click', toggleCart);

  // User button
  document.getElementById('userBtn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (user) {
      navigateTo('profile');
    } else {
      document.getElementById('loginModal').classList.add('active');
    }
  });

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  // Logo click
  document.getElementById('navLogo')?.addEventListener('click', () => navigateTo('landing'));

  // Mobile menu
  document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('menuToggle').classList.toggle('active');
    document.getElementById('navLinks').classList.toggle('mobile-open');
  });

  // Auth modal switches
  document.getElementById('showRegister')?.addEventListener('click', () => {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('registerModal').classList.add('active');
  });
  document.getElementById('showLogin')?.addEventListener('click', () => {
    document.getElementById('registerModal').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
  });

  // Checkout button
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      showToast('warning', 'Inicia sesión', 'Necesitas iniciar sesión para continuar');
      document.getElementById('loginModal').classList.add('active');
      return;
    }
    const cartItems = getCart();
    if (cartItems.length === 0) {
      showToast('info', 'Carrito vacío', 'Agrega productos antes de continuar');
      return;
    }
    closeCart();
    navigateTo('checkout');
  });

  // Categories dropdown hover/click
  const catDropdown = document.getElementById('navCategoriesDropdown');
  const catBtn = document.getElementById('navCategoriesBtn');
  if (catBtn && catDropdown) {
    catBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      catDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => catDropdown.classList.remove('open'));
  }

  // Navbar scroll
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Print ticket
  document.getElementById('printTicket')?.addEventListener('click', () => window.print());
}

// ── Cart Toggle ──
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
  document.body.style.overflow = document.getElementById('cartSidebar').classList.contains('active') ? 'hidden' : '';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ── Quick Add to Cart ──
function quickAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  addToCart(productId, 1, product.sizes[0], product.colors[0].hex);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCategoriesDropdown();
  initEventDelegation();
  navigateTo('landing');
  updateCartBadge();
  
  // Page loader
  setTimeout(() => {
    document.getElementById('pageLoader')?.classList.add('loaded');
    setTimeout(() => document.getElementById('pageLoader')?.remove(), 500);
  }, 800);

  // Scroll animations after render
  setTimeout(initScrollAnimations, 100);
});
