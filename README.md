# Método ALPHA · Landing page

Landing page de conversión para Método ALPHA, sistema de preparación de oposiciones a Policía Nacional.

## Stack

- HTML+CSS+JS vanilla (sin frameworks).
- Cero dependencias externas (solo Google Fonts).
- Responsive mobile-first.
- Animaciones CSS + Intersection Observer.

## Archivos

- `index.html` — La landing completa (todo inline en un solo archivo).
- `netlify.toml` — Configuración de despliegue.
- `_redirects` — Redirecciones (opcional).

## Despliegue en Netlify

### Opción A · Drag & drop (más rápido)

1. Ve a https://app.netlify.com/drop.
2. Arrastra esta carpeta entera.
3. Listo. Te dan una URL tipo `random-name-12345.netlify.app`.
4. Después puedes cambiar el subdominio o conectar tu dominio propio.

### Opción B · Conectar repositorio Git

1. Sube esta carpeta a un repo nuevo en GitHub.
2. En Netlify: "Add new site" → "Import from Git" → Selecciona el repo.
3. Build command: vacío. Publish directory: `.`
4. Deploy.

## Dominio personalizado

Una vez desplegado, en Netlify:
1. Site settings → Domain management.
2. Añadir dominio personalizado (ej: `metodoalpha.com` o `metodo.elrincondelpolicia.es`).
3. Seguir las instrucciones DNS.

## Iteración

Para cambiar contenido, edita directamente `index.html` y vuelve a hacer deploy.

Para añadir analytics, mete el snippet de Plausible/GA antes del `</head>`.
