/* ========================================================
   MYM DESIGNSX – n8n Webhook Integration Module
   
   Conecta la tienda con flujos de n8n para:
   - Guardar registros/logins en PostgreSQL
   - Enviar recibos de compra por Gmail
   
   ⚠️ CONFIGURACIÓN: Reemplaza las URLs con tus webhooks reales de n8n
   ======================================================== */

// ── Configuración de Webhooks ──
// Configurado para n8n local (por defecto en el puerto 5678)
const N8N_CONFIG = {
  // URL base de tu instancia de n8n, expuesta con ngrok (sin / al final).
  // Ver el paso 7 del README: reemplaza este valor por tu propia URL.
  baseUrl: 'https://TU-URL-DE-NGROK-AQUI',

  // Endpoints de webhooks
  // NOTA: Si estás probando/creando el flujo en n8n, cambia "/webhook/" por "/webhook-test/"
  webhooks: {
    register:     '/webhook/d6e7e6d6-3d2b-4a00-98e0-f63afb8369ca',      // Registro de usuario → PostgreSQL
    checkLogin:   '/webhook/f4192917-d1af-40b6-bf92-39209b463c5f',    // Verifica si el usuario existe en BD
    purchase:     '/webhook/a87d75db-9330-4514-962e-88a1bb7196b6',      // Compra → Gmail (recibo) + PostgreSQL
  },

  // Si es true, muestra logs en consola para depuración
  debug: true
};

// ── Función genérica para enviar datos a n8n ──
async function sendToN8N(webhookKey, data) {
  const endpoint = N8N_CONFIG.webhooks[webhookKey];
  if (!endpoint) {
    console.warn(`[n8n] Webhook key "${webhookKey}" no encontrado en la configuración`);
    return null;
  }

  let url = '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
  } else {
    url = N8N_CONFIG.baseUrl + endpoint;
  }

  // Log en modo debug
  if (N8N_CONFIG.debug) {
    console.log(`[n8n] 📤 Enviando a ${webhookKey}:`, url);
    console.log(`[n8n] 📦 Payload:`, JSON.stringify(data, null, 2));
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Evita la pantalla de advertencia de ngrok
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.text();
      if (N8N_CONFIG.debug) {
        console.log(`[n8n] ✅ ${webhookKey} enviado exitosamente:`, result);
      }
      return result;
    } else {
      console.warn(`[n8n] ⚠️ ${webhookKey} respondió con status ${response.status}`);
      return null;
    }
  } catch (error) {
    // Fallo silencioso: la tienda sigue funcionando sin n8n
    console.warn(`[n8n] ❌ No se pudo conectar con n8n (${webhookKey}):`, error.message);
    if (N8N_CONFIG.debug) {
      console.info('[n8n] ℹ️ La tienda sigue funcionando normalmente. Configura las URLs de n8n en js/n8n.js');
    }
    return null;
  }
}

// ════════════════════════════════════════════════════════
// FUNCIONES ESPECÍFICAS POR EVENTO
// ════════════════════════════════════════════════════════

/**
 * Envía datos de registro de usuario a n8n → PostgreSQL
 * @param {Object} userData - Datos del usuario registrado
 */
async function n8nRegister(userData) {
  const payload = {
    event: 'user_register',
    timestamp: new Date().toISOString(),
    user: {
      id: userData.id,
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // Necesario para validar login después
      createdAt: userData.createdAt || new Date().toISOString()
    }
  };

  const result = await sendToN8N('register', payload);
  
  if (result !== null) {
    showToast('info', 'Sincronizado', 'Registro enviado a la base de datos');
  }
  
  return result;
}

/**
 * Consulta a n8n (Base de datos) para validar credenciales
 * @param {string} email - Correo del usuario
 * @param {string} password - Contraseña
 */
async function n8nCheckLogin(email, password) {
  const payload = {
    event: 'check_login',
    timestamp: new Date().toISOString(),
    credentials: {
      email: email,
      password: btoa(password) // codificado para que viaje igual que en local
    }
  };

  const resultStr = await sendToN8N('checkLogin', payload);
  try {
    if (resultStr) {
      const resultJson = JSON.parse(resultStr);
      return resultJson; // Esperamos { status: 'success', userData: { ... } }
    }
  } catch (e) {
    if (N8N_CONFIG.debug) {
      console.warn('[n8n] Error parseando respuesta de checkLogin:', e);
    }
  }
  return null;
}

/**
 * Envía datos de compra a n8n → Gmail (recibo) + PostgreSQL
 * @param {Object} order - Datos completos del pedido
 * @param {Object} user - Datos del usuario comprador
 */
async function n8nPurchase(order, user) {
  // Construir lista de items con nombres de productos
  const items = order.items.map(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return {
      name: product ? product.name : `Producto #${item.productId}`,
      image: product ? product.image : '',
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      customization: item.customization || null
    };
  });

  const payload = {
    event: 'purchase',
    timestamp: new Date().toISOString(),
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      orderCode: order.orderCode,
      date: order.date,
      status: order.status
    },
    customer: {
      id: user.id,
      name: `${user.name} ${user.lastname}`,
      email: user.email,
      phone: user.phone || ''
    },
    shipping: {
      name: `${order.shipping.name} ${order.shipping.lastname}`,
      address: order.shipping.address,
      city: order.shipping.city,
      phone: order.shipping.phone
    },
    items: items,
    totals: {
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: 0,
      total: order.total
    },
    // Datos formateados para el template del email
    formattedTotals: {
      subtotal: formatPrice(order.subtotal),
      tax: formatPrice(order.tax),
      total: formatPrice(order.total)
    }
  };

  const result = await sendToN8N('purchase', payload);
  
  if (result !== null) {
    showToast('info', 'Recibo enviado', 'El recibo fue enviado a tu correo electrónico');
  }
  
  return result;
}
