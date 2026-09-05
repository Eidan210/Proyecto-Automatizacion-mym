# Mym Designsx — tienda de productos personalizados

Tienda web de prendas personalizables (camisetas, buzos, bodies) construida como SPA en
JavaScript puro, sin frameworks ni build. El backend se resuelve con flujos de **n8n**, que
persisten los usuarios en PostgreSQL, envían el recibo por Gmail y registran cada pedido en
Google Sheets.

`JavaScript (ES6+)` · `HTML5` · `CSS3` · `n8n` · `PostgreSQL` · `Google Sheets` · `Gmail`

---

## El problema

Una tienda de productos personalizados necesita que el cliente diseñe su propia prenda, compre
en línea y reciba su recibo — sin pagar la comisión de una plataforma de e-commerce de terceros
ni depender de su catálogo cerrado.

## La solución

Un frontend completo en JS vanilla con un backend de automatización detrás:

- **Catálogo** con filtros por categoría, talla y color
- **Personalizador**: texto, tipografía, color e imagen propia sobre la prenda
- **Carrito** con cálculo de IVA del 19%
- **Registro y login** contra PostgreSQL, resueltos por n8n
- **Checkout** que dispara el recibo por Gmail y registra el pedido en Google Sheets
- **Panel de administración** para revisar productos y pedidos
- **Modo claro / oscuro**

El pago es simulado: no se cobra nada real.

## Estructura

El código de la aplicación vive en [`app/`](./app/):

```
app/
├── index.html          → la SPA entera en un solo HTML
├── n8n.json            → el flujo de n8n, listo para importar
├── css/styles.css
├── js/
│   ├── data.js         → productos, categorías y datos
│   ├── n8n.js          → funciones que hablan con n8n
│   ├── app.js          → router, tema claro/oscuro, renders
│   ├── auth.js         → registro, login y perfil
│   ├── cart.js         → carrito de compras
│   ├── customizer.js   → personalizador de prendas
│   ├── orders.js       → checkout y tickets de compra
│   └── admin.js        → panel de administración
└── assets/images/
```

Ocho módulos con una responsabilidad cada uno. La guía completa de instalación de n8n está en
el [README de la aplicación](./app/README.md).

## Cómo ejecutarlo

No necesita instalación: abre `app/index.html` en el navegador, o usa la extensión
**Live Server** de VS Code.

> Sin n8n configurado el catálogo y el personalizador funcionan, pero no se puede registrar ni
> iniciar sesión: el login depende de la base de datos. Los pasos para levantar n8n e importar
> `n8n.json` están en el README de la aplicación.

## Lo que demuestra

Arquitectura de un frontend grande sin framework: ocho módulos con responsabilidad única,
integración con servicios externos (PostgreSQL, Gmail, Google Sheets) a través de n8n, y estado
de carrito y sesión resueltos a mano.

---

Parte de mi portafolio → **[eidan210.github.io/portafolio-junior](https://eidan210.github.io/portafolio-junior/)**
