/* ========================================================
   MYM DESIGNSX – Product Data & Content
   ======================================================== */

const PRODUCTS = [
  {
    id: 1,
    name: "Buzo Oversize Clásico",
    description: "Buzo oversize premium de algodón orgánico. Perfecto para personalizar con tu diseño favorito. Tela suave al tacto con acabado de alta calidad.",
    price: 89900,
    originalPrice: 109900,
    image: "assets/images/sweatshirt-burgundy.jpeg",
    category: "mujer",
    tags: ["personalizable", "nuevo"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Burgundy", hex: "#722F37" },
      { name: "Negro", hex: "#1A1A1A" },
      { name: "Crema", hex: "#F5F0E1" }
    ],
    customizable: true,
    stock: 25,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: "Camiseta Oversize Hombre",
    description: "Camiseta oversize de corte relajado para hombre. Algodón 100% premium. Ideal para estampados y diseños personalizados.",
    price: 59900,
    originalPrice: null,
    image: "assets/images/tshirt-blue.jpeg",
    category: "hombre",
    tags: ["personalizable", "popular"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Azul Pastel", hex: "#7BA4D9" },
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Negro", hex: "#1A1A1A" }
    ],
    customizable: true,
    stock: 40,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 3,
    name: "Body Bebé Halloween",
    description: "Adorable body para bebé con temática Halloween. 100% algodón suave para la piel sensible del bebé. Personalízalo con el nombre de tu pequeño.",
    price: 39900,
    originalPrice: 49900,
    image: "assets/images/body-baby-halloween.jpeg",
    category: "bebe",
    seasonCategory: "halloween",
    tags: ["personalizable", "temporada"],
    sizes: ["0-3M", "3-6M", "6-12M", "12-18M"],
    colors: [
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Negro", hex: "#1A1A1A" },
      { name: "Naranja", hex: "#FF8C00" }
    ],
    customizable: true,
    stock: 15,
    rating: 4.9,
    reviews: 67
  },
  {
    id: 4,
    name: "Buzo Halloween Naranja",
    description: "Buzo edición especial Halloween en vibrante naranja. Diseño exclusivo de temporada. Personalízalo con murciélagos, fantasmas o tu propio diseño.",
    price: 94900,
    originalPrice: 119900,
    image: "assets/images/sweatshirt-orange-halloween.jpeg",
    category: "unisex",
    seasonCategory: "halloween",
    tags: ["personalizable", "temporada", "oferta"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Naranja", hex: "#FF8C00" },
      { name: "Negro", hex: "#1A1A1A" }
    ],
    customizable: true,
    stock: 10,
    rating: 4.6,
    reviews: 34
  },
  {
    id: 5,
    name: "Camiseta Elegante Halloween",
    description: "Camiseta doblada estilo vintage con temática Halloween. Algodón premium con un toque elegante y misterioso.",
    price: 64900,
    originalPrice: null,
    image: "assets/images/tshirt-cream-halloween.jpeg",
    category: "unisex",
    seasonCategory: "halloween",
    tags: ["personalizable", "elegante"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Crema", hex: "#F5F0E1" },
      { name: "Negro", hex: "#1A1A1A" },
      { name: "Burgundy", hex: "#722F37" }
    ],
    customizable: true,
    stock: 20,
    rating: 4.5,
    reviews: 42
  },
  {
    id: 6,
    name: "Camiseta Dark Halloween",
    description: "Camiseta negra premium con acabado mate. Perfecta para diseños espeluznantes y personalizaciones de Halloween.",
    price: 54900,
    originalPrice: 69900,
    image: "assets/images/tshirt-black-halloween.jpeg",
    category: "unisex",
    seasonCategory: "halloween",
    tags: ["personalizable", "oferta"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Negro", hex: "#1A1A1A" },
      { name: "Gris Oscuro", hex: "#3A3A3A" }
    ],
    customizable: true,
    stock: 30,
    rating: 4.8,
    reviews: 56
  },
  {
    id: 7,
    name: "Camiseta Pastel Maestra",
    description: "Camiseta en tono amarillo pastel ideal para profesoras y educadoras. Perfecta para personalizar con frases inspiradoras.",
    price: 49900,
    originalPrice: null,
    image: "assets/images/tshirt-yellow-teacher.jpeg",
    category: "mujer",
    seasonCategory: "madre",
    tags: ["personalizable", "nuevo"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Amarillo Pastel", hex: "#FADA5E" },
      { name: "Rosa Pastel", hex: "#FFB6C1" },
      { name: "Lavanda", hex: "#C8A8E9" }
    ],
    customizable: true,
    stock: 35,
    rating: 4.9,
    reviews: 78
  },
  {
    id: 8,
    name: "Camiseta Menta Escolar",
    description: "Camiseta color menta perfecta para el regreso a clases. Suave, cómoda y totalmente personalizable con el nombre o diseño favorito.",
    price: 44900,
    originalPrice: 54900,
    image: "assets/images/tshirt-mint-school.jpeg",
    category: "mujer",
    tags: ["personalizable", "oferta"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Menta", hex: "#A8E6CF" },
      { name: "Rosa", hex: "#F4A0B5" },
      { name: "Lila", hex: "#C8A8E9" }
    ],
    customizable: true,
    stock: 22,
    rating: 4.7,
    reviews: 45
  },
  // Productos adicionales con las mismas imágenes reutilizadas para distintas categorías
  {
    id: 9,
    name: "Buzo San Valentín Especial",
    description: "Buzo edición San Valentín en tono burgundy. Ideal para personalizar con mensajes de amor y nombres de pareja.",
    price: 99900,
    originalPrice: 129900,
    image: "assets/images/sweatshirt-burgundy.jpeg",
    category: "mujer",
    seasonCategory: "sanvalentin",
    tags: ["personalizable", "temporada"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Burgundy", hex: "#722F37" },
      { name: "Rosa", hex: "#F4A0B5" },
      { name: "Rojo", hex: "#C62828" }
    ],
    customizable: true,
    stock: 12,
    rating: 4.9,
    reviews: 93
  },
  {
    id: 10,
    name: "Camiseta Navideña Classic",
    description: "Camiseta perfecta para las fiestas navideñas. Personalízala con motivos de Navidad, nombres de familia o frases festivas.",
    price: 54900,
    originalPrice: null,
    image: "assets/images/tshirt-cream-halloween.jpeg",
    category: "unisex",
    seasonCategory: "navidad",
    tags: ["personalizable", "temporada"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Crema", hex: "#F5F0E1" },
      { name: "Rojo", hex: "#C62828" },
      { name: "Verde", hex: "#2E7D32" }
    ],
    customizable: true,
    stock: 28,
    rating: 4.6,
    reviews: 31
  },
  {
    id: 11,
    name: "Camiseta Día del Padre",
    description: "Camiseta oversize perfecta para regalar el Día del Padre. Personalízala con un mensaje especial para papá.",
    price: 59900,
    originalPrice: 74900,
    image: "assets/images/tshirt-blue.jpeg",
    category: "hombre",
    seasonCategory: "padre",
    tags: ["personalizable", "temporada"],
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Azul Pastel", hex: "#7BA4D9" },
      { name: "Gris", hex: "#9E9E9E" },
      { name: "Negro", hex: "#1A1A1A" }
    ],
    customizable: true,
    stock: 18,
    rating: 4.8,
    reviews: 52
  },
  {
    id: 12,
    name: "Camiseta Día de la Madre",
    description: "Camiseta delicada en tonos pastel para el Día de la Madre. Regálale algo único y personalizado.",
    price: 49900,
    originalPrice: null,
    image: "assets/images/tshirt-mint-school.jpeg",
    category: "mujer",
    seasonCategory: "madre",
    tags: ["personalizable", "nuevo"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Menta", hex: "#A8E6CF" },
      { name: "Lavanda", hex: "#C8A8E9" },
      { name: "Rosa", hex: "#F4A0B5" }
    ],
    customizable: true,
    stock: 25,
    rating: 4.9,
    reviews: 88
  }
];

const CATEGORIES = [
  { id: "mujer", name: "Mujer", icon: "👗", count: 4, color: "cat-mujer" },
  { id: "hombre", name: "Hombre", icon: "👔", count: 2, color: "cat-hombre" },
  { id: "bebe", name: "Bebé", icon: "🍼", count: 1, color: "cat-bebe" },
  { id: "halloween", name: "Halloween", icon: "🎃", count: 4, color: "cat-halloween" },
  { id: "navidad", name: "Navidad", icon: "🎄", count: 1, color: "cat-navidad" },
  { id: "sanvalentin", name: "San Valentín", icon: "💕", count: 1, color: "cat-sanvalentin" },
  { id: "madre", name: "Día de la Madre", icon: "💐", count: 2, color: "cat-madre" },
  { id: "padre", name: "Día del Padre", icon: "🎩", count: 1, color: "cat-padre" }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "María García",
    role: "Cliente frecuente",
    initials: "MG",
    rating: 5,
    text: "¡Increíble calidad! Personalicé un buzo para mi novio y quedó espectacular. El proceso fue súper fácil y la entrega fue rápida. 100% recomendado."
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Primera compra",
    initials: "CR",
    rating: 5,
    text: "Compré una camiseta personalizada para el cumpleaños de mi hija y le encantó. La tela es de excelente calidad y el estampado no se desgasta."
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Compradora frecuente",
    initials: "AM",
    rating: 4,
    text: "Ya llevo 5 pedidos y cada uno ha sido perfecto. Me encanta poder personalizar los diseños. Las camisetas son súper cómodas."
  },
  {
    id: 4,
    name: "Diego López",
    role: "Cliente empresarial",
    initials: "DL",
    rating: 5,
    text: "Pedimos camisetas corporativas para nuestro equipo. Excelente atención, buena calidad y precios muy competitivos. Volveremos a pedir."
  },
  {
    id: 5,
    name: "Laura Sánchez",
    role: "Mamá feliz",
    initials: "LS",
    rating: 5,
    text: "Los bodies de bebé son hermosos. Personalicé uno para Halloween y otro para Navidad. Mi bebé se veía adorable. ¡Volvería a comprar mil veces!"
  },
  {
    id: 6,
    name: "Andrés Pérez",
    role: "Diseñador gráfico",
    initials: "AP",
    rating: 4,
    text: "Como diseñador, aprecio la calidad de impresión. Los colores se ven vibrantes y fieles al diseño original. Muy satisfecho con el resultado."
  }
];

const FAQ_DATA = [
  {
    question: "¿Cómo personalizo un producto?",
    answer: "Es muy fácil. Selecciona el producto que deseas, haz clic en \"Personalizar\" y podrás agregar texto, elegir colores, seleccionar fuentes tipográficas e incluso subir tu propia imagen. Verás un preview en tiempo real antes de agregar al carrito."
  },
  {
    question: "¿Cuánto tarda la entrega?",
    answer: "Los pedidos personalizados se entregan entre 5 y 7 días hábiles dentro de Colombia. Los productos sin personalización se envían entre 3 y 5 días hábiles. Recibirás actualizaciones del estado de tu pedido en tu perfil."
  },
  {
    question: "¿Puedo subir mi propia imagen para el diseño?",
    answer: "¡Sí! Aceptamos imágenes en formato JPG, PNG y SVG con una resolución mínima de 300 DPI para garantizar la mejor calidad de impresión. Puedes subir tu imagen directamente desde el personalizador."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Actualmente aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express). Todos los pagos son procesados de forma segura. Próximamente agregaremos más métodos de pago."
  },
  {
    question: "¿Puedo devolver un producto personalizado?",
    answer: "Los productos personalizados no admiten devolución por cambio de opinión, pero sí por defectos de fabricación. Si tu producto tiene algún defecto, contáctanos dentro de los 5 días posteriores a la entrega."
  },
  {
    question: "¿Tienen tallas grandes disponibles?",
    answer: "Sí, nuestras tallas van desde XS hasta XXL en la mayoría de productos. Para bebés, tenemos tallas desde 0-3 meses hasta 18 meses. Consulta la guía de tallas en cada producto."
  }
];

const CUSTOM_FONTS = [
  { name: "Outfit", label: "Moderna", family: "'Outfit', sans-serif" },
  { name: "Georgia", label: "Clásica", family: "Georgia, serif" },
  { name: "Courier", label: "Retro", family: "'Courier New', monospace" },
  { name: "Impact", label: "Bold", family: "Impact, sans-serif" },
  { name: "Comic Sans", label: "Divertida", family: "'Comic Sans MS', cursive" },
  { name: "Times", label: "Elegante", family: "'Times New Roman', serif" }
];

const TEXT_COLORS = [
  "#FFFFFF", "#000000", "#F4A0B5", "#C8A8E9", "#A8E6CF",
  "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FF8C00"
];

// Utility: format price to COP
function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Utility: generate unique ID
function generateId() {
  return 'MYM-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Utility: generate order code
function generateOrderCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}
