# Mym Designsx - Tienda de Productos Personalizados

Este es un proyecto de una tienda web de productos personalizados (camisetas, buzos, bodies de bebé, etc). La tienda está hecha con HTML, CSS y JavaScript puro, sin usar frameworks. Para el backend se usa **n8n** que se encarga de guardar los usuarios en una base de datos PostgreSQL, verificar el login y enviar recibos de compra por Gmail.

## Que hace la tienda

- Los usuarios pueden ver un catalogo de productos, filtrarlos por categoria, talla, color, etc.
- Hay un personalizador donde puedes agregarle texto, cambiarle la fuente, el color, o subir tu propia imagen al producto.
- Tiene carrito de compras con calculo de IVA del 19%.
- Para comprar hay que registrarse e iniciar sesion. Los datos se guardan en PostgreSQL.
- Al hacer una compra se envia un recibo por correo (Gmail) y se registra el pedido en Google Sheets.
- Tiene un panel de administracion para ver los productos y los pedidos.
- Tiene modo oscuro y modo claro.
- El pago es simulado, no se cobra nada real.

## Estructura del proyecto

```
├── index.html              -> Pagina principal (todo esta en un solo HTML, es una SPA)
├── n8n.json                -> El flujo de n8n para importar
├── css/
│   └── styles.css          -> Todos los estilos
├── js/
│   ├── data.js             -> Los productos, categorias, testimonios y datos
│   ├── n8n.js              -> Las funciones que conectan con n8n
│   ├── app.js              -> El router, tema oscuro/claro, renders
│   ├── auth.js             -> Registro, login, perfil
│   ├── cart.js             -> Carrito de compras
│   ├── customizer.js       -> El personalizador de productos
│   ├── orders.js           -> Checkout y tickets de compra
│   └── admin.js            -> Panel de administracion
└── assets/images/          -> Las imagenes de los productos
```

## Como correr la tienda

La tienda es solo HTML/CSS/JS asi que no necesita instalacion. Solo abre el archivo `index.html` en el navegador.

Si usas VS Code puedes instalar la extension **Live Server** y darle click derecho al archivo -> "Open with Live Server".

**Importante:** sin n8n configurado no se puede registrar ni iniciar sesion, porque el login depende de la base de datos.

## Como configurar n8n

n8n es una herramienta de automatizacion que usamos como backend. Se configura visual, conectando nodos.

### 1. Instalar n8n

Necesitas tener Node.js instalado. Despues en la terminal:

```bash
npm install -g n8n
n8n start
```

Se abre en `http://localhost:5678`

### 2. Importar el flujo

En n8n ve a Settings > Import from File y selecciona el archivo `n8n.json` de este proyecto. Se van a importar los 3 flujos.

### 3. Configurar la base de datos (PostgreSQL)

Puedes usar un servicio gratis como Neon (neon.tech), Supabase o Railway para tener tu base de datos PostgreSQL.

Crea esta tabla:

```sql
CREATE TABLE registro_mym (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

```

Despues en n8n, en los nodos de PostgreSQL (los que dicen "Insert rows" y "Execute a SQL query"), dale click y configura las credenciales con los datos de tu base de datos (host, usuario, contraseña, nombre de la base de datos, puerto).

### 4. Configurar Gmail

En n8n dale click al nodo "Send a message" (el de Gmail) y configura las credenciales de Gmail con OAuth2. n8n te va a pedir que conectes una cuenta de Google. Necesitas crear credenciales OAuth2 en Google Cloud Console.

### 5. Configurar Google Sheets

En n8n dale click al nodo "Append row in sheet" y conecta tu cuenta de Google. Crea una hoja de calculo en Google Sheets con estas columnas en la primera fila:

```
id | orderNumber | name | email | phone | address | city | Purchase Information | subtotal | tax Included | total
```

Y selecciona esa hoja en el nodo.

### 6. Exponer n8n con ngrok

Si estas corriendo n8n en tu computadora local, necesitas ngrok para que el frontend pueda conectarse:

```bash
ngrok http 5678
```

Te va a dar una URL como `https://algo-random.ngrok-free.dev`. Copia esa URL.

### 7. Poner las URLs en el codigo

Abre `js/n8n.js` y cambia la baseUrl por tu URL de ngrok:

```javascript
const N8N_CONFIG = {
  baseUrl: 'https://TU-URL-DE-NGROK-AQUI',  // <- cambia esto por tu URL
  webhooks: {
    register:   '/webhook/TU-UUID',      // <- estos los sacas de n8n
    checkLogin: '/webhook/TU-UUID',
    purchase:   '/webhook/TU-UUID',
  },
  debug: true
};
```

Los UUIDs los sacas haciendo click en cada nodo Webhook dentro de n8n y copiando la URL que aparece.

### 8. Activar los flujos

Dentro de n8n activa cada flujo con el toggle de arriba a la derecha. Si no estan activados los webhooks no van a funcionar.

## Usuario admin

La tienda tiene un admin por defecto para entrar al panel de administracion:

- **Email:** admin@mym.com
- **Contraseña:** admin123

Para que funcione tiene que estar registrado en la base de datos. Puedes insertarlo manualmente asi:

```sql
INSERT INTO registro_mym (id, name, lastname, email, phone, password, created_at)
VALUES ('admin-001', 'Admin', 'Mym', 'admin@mym.com', '+57 300 000 0000', 'YWRtaW4xMjM=', NOW());
```

(`YWRtaW4xMjM=` es "admin123" codificado en Base64, que es como la app guarda las contraseñas)

## Como funciona cada flujo de n8n

**Registro:** El usuario se registra en la web -> se envia al webhook -> n8n lo guarda en PostgreSQL.

**Login:** El usuario ingresa email y contraseña -> se envia al webhook -> n8n consulta la base de datos -> si coincide responde con los datos del usuario, si no responde con error.

**Compra:** El usuario confirma la compra -> se envia al webhook -> n8n envia el recibo por Gmail al correo del usuario -> despues registra la compra en Google Sheets.

## Tecnologias

- HTML, CSS, JavaScript (vanilla, sin frameworks)
- n8n (automatizacion de backend)
- PostgreSQL (base de datos)
- Gmail API (envio de recibos)
- Google Sheets API (registro de pedidos)
- ngrok (para exponer n8n)

## Autor

Eidan Cuadros - 2026
