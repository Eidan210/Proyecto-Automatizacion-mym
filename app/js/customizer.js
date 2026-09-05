/* ========================================================
   MYM DESIGNSX – Customizer Module
   ======================================================== */

// ── Customizer State ──
const CustomizerState = {
  productId: null,
  text: '',
  font: "'Outfit', sans-serif",
  fontLabel: 'Moderna',
  textColor: '#FFFFFF',
  uploadedImage: null,
  selectedSize: null,
  selectedColor: null
};

// ── Init Customizer ──
function initCustomizer(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  CustomizerState.productId = productId;
  CustomizerState.text = '';
  CustomizerState.font = "'Outfit', sans-serif";
  CustomizerState.fontLabel = 'Moderna';
  CustomizerState.textColor = '#FFFFFF';
  CustomizerState.uploadedImage = null;
  CustomizerState.selectedSize = product.sizes[0];
  CustomizerState.selectedColor = product.colors[0].hex;

  // Set preview image
  const img = document.getElementById('customizerImg');
  if (img) img.src = product.image;

  // Set overlay defaults
  updateCustomizerPreview();

  // Render font options
  renderFontOptions();
  
  // Render color picker
  renderTextColorPicker();

  // Text input
  const textInput = document.getElementById('customText');
  if (textInput) {
    textInput.value = '';
    textInput.addEventListener('input', (e) => {
      CustomizerState.text = e.target.value;
      document.getElementById('charCount').textContent = e.target.value.length;
      updateCustomizerPreview();
    });
  }

  // Upload area
  const uploadArea = document.getElementById('uploadArea');
  const uploadInput = document.getElementById('uploadInput');
  
  if (uploadArea && uploadInput) {
    uploadArea.onclick = () => uploadInput.click();
    
    uploadArea.ondragover = (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--pastel-lavender)';
      uploadArea.style.background = 'var(--pastel-lavender-light)';
    };
    
    uploadArea.ondragleave = () => {
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
    };
    
    uploadArea.ondrop = (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
      const file = e.dataTransfer.files[0];
      if (file) handleImageUpload(file);
    };

    uploadInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleImageUpload(file);
    };
  }

  // Remove upload
  document.getElementById('removeUpload')?.addEventListener('click', () => {
    CustomizerState.uploadedImage = null;
    document.getElementById('uploadPreview').classList.add('hidden');
    document.getElementById('uploadArea').classList.remove('hidden');
    updateCustomizerPreview();
  });

  // Add to cart button
  const addBtn = document.getElementById('addCustomToCart');
  if (addBtn) {
    // Remove old listeners by cloning
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    
    newBtn.addEventListener('click', () => {
      const customization = {
        text: CustomizerState.text,
        font: CustomizerState.fontLabel,
        textColor: CustomizerState.textColor,
        hasImage: !!CustomizerState.uploadedImage
      };

      if (!CustomizerState.text && !CustomizerState.uploadedImage) {
        showToast('warning', 'Personaliza', 'Agrega al menos un texto o una imagen');
        return;
      }

      addToCart(
        productId, 
        1, 
        CustomizerState.selectedSize, 
        CustomizerState.selectedColor, 
        customization
      );

      navigateTo('catalog');
    });
  }

  // Back button
  const backBtn = document.getElementById('customizerBack');
  if (backBtn) {
    const newBack = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBack, backBtn);
    newBack.addEventListener('click', () => {
      navigateTo('productDetail', { productId });
    });
  }
}

// ── Update Preview ──
function updateCustomizerPreview() {
  const overlay = document.getElementById('customizerOverlay');
  if (!overlay) return;

  if (CustomizerState.uploadedImage) {
    overlay.innerHTML = `<img src="${CustomizerState.uploadedImage}" style="max-width:60%;max-height:60%;border-radius:8px;object-fit:contain;">`;
    if (CustomizerState.text) {
      overlay.innerHTML += `<div style="margin-top:8px;font-family:${CustomizerState.font};color:${CustomizerState.textColor};font-size:1.2rem;">${escapeHtml(CustomizerState.text)}</div>`;
    }
  } else {
    overlay.style.fontFamily = CustomizerState.font;
    overlay.style.color = CustomizerState.textColor;
    overlay.textContent = CustomizerState.text || 'Tu texto aquí';
  }
}

// ── Render Font Options ──
function renderFontOptions() {
  const container = document.getElementById('fontOptions');
  if (!container) return;

  container.innerHTML = CUSTOM_FONTS.map(f => `
    <div class="font-option ${f.family === CustomizerState.font ? 'active' : ''}" 
         data-font="${f.family}" data-label="${f.label}"
         style="font-family:${f.family}">
      ${f.label}
    </div>
  `).join('');

  container.querySelectorAll('.font-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.font-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      CustomizerState.font = opt.dataset.font;
      CustomizerState.fontLabel = opt.dataset.label;
      updateCustomizerPreview();
    });
  });
}

// ── Render Text Color Picker ──
function renderTextColorPicker() {
  const container = document.getElementById('textColorPicker');
  if (!container) return;

  container.innerHTML = TEXT_COLORS.map(color => `
    <div class="color-picker-swatch ${color === CustomizerState.textColor ? 'active' : ''}" 
         style="background:${color};${color === '#FFFFFF' ? 'box-shadow:inset 0 0 0 1px var(--border-color)' : ''}"
         data-text-color="${color}">
    </div>
  `).join('') + `<input type="color" id="customColorPicker" value="${CustomizerState.textColor}" style="width:32px;height:32px;border:none;cursor:pointer;border-radius:50%;padding:0;">`;

  container.querySelectorAll('.color-picker-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      container.querySelectorAll('.color-picker-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      CustomizerState.textColor = swatch.dataset.textColor;
      updateCustomizerPreview();
    });
  });

  document.getElementById('customColorPicker')?.addEventListener('input', (e) => {
    CustomizerState.textColor = e.target.value;
    container.querySelectorAll('.color-picker-swatch').forEach(s => s.classList.remove('active'));
    updateCustomizerPreview();
  });
}

// ── Handle Image Upload ──
function handleImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    showToast('error', 'Error', 'Solo se permiten archivos de imagen');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('error', 'Error', 'La imagen no puede superar 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    CustomizerState.uploadedImage = e.target.result;
    
    const preview = document.getElementById('uploadPreview');
    const uploadedImg = document.getElementById('uploadedImg');
    const uploadArea = document.getElementById('uploadArea');
    
    if (uploadedImg) uploadedImg.src = e.target.result;
    if (preview) preview.classList.remove('hidden');
    if (uploadArea) uploadArea.classList.add('hidden');
    
    updateCustomizerPreview();
    showToast('success', '¡Subida!', 'Imagen cargada correctamente');
  };
  reader.readAsDataURL(file);
}

// ── Escape HTML ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
