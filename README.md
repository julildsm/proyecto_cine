# proyecto cine Match

Sitio web de un cine: cartelera, compra de entradas, reseñas, favoritos, perfiles de usuario y un panel de administración. Funciona en un entorno local con XAMPP.

## Funcionalidades

- Cartelera:películas en cartelera y próximos estrenos, con buscador por título y orden por popularidad.
- Ficha de cada película: datos, funciones disponibles y reseñas de otros usuarios.
- Compra de entradas:elección de función, asientos y combos del candy bar, con pago simulado.
- Cuentas de usuario: registro e inicio de sesión, perfil con foto y biografía.
- Favoritos, reseñas y comunidad: guardar películas, puntuarlas con estrellas y seguir a otros usuarios.
- Mis compras y notificaciones:historial, cancelación de entradas con pedido de reembolso y avisos.
- Panel de administrador: resumen general, alta y baja de películas, y aprobación o rechazo de reembolsos.

## Tecnologías utilizadas

Estructura:HTML5 
Estilos: CSS3 (sin frameworks) 
Lógica del navegador:JavaScript 
Servidor: PHP (PDO, sesiones y contraseñas cifradas con `password_hash`) |
Base de datos:MySQL / MariaDB
Entorno local: XAMPP (Apache + MySQL + PHP)

No se usan fuentes, imágenes ni librerías de internet: todo se carga desde la carpeta del proyecto, salvo los combos.

## Herramientas necesarias

- XAMPP:incluye Apache, MySQL/MariaDB, PHP y phpMyAdmin
- Un navegador actualizado (Chrome, Edge o Firefox).
- Opcional: un editor de código como Visual Studio Code.

## Estructura del proyecto

cinematch/
├── api/            Archivos PHP (conexión a la base, login, compras, reseñas, etc.)
├── catalogo/       index.html (la página principal y el catálogo de películas)
├── css/            style.css
├── img/            Imágenes de películas, estrenos y portada
├── js/             app.js
└── cinematch.sql   Script que crea la base de datos y carga los datos de ejemplo

## Usuarios de ejemplo

Al importar cinematch.sql se crea una cuenta de administrador para ver la interfaz del admin:

Usuario: admin (o el correo admin@cinematch.com)
Contraseña: admin123

Con esa cuenta aparece la sección "Panel", desde donde se agregan y quitan películas y se gestionan los reembolsos.

El script también crea algunos usuarios de ejemplo para la comunidad (cinefilo_99, marcos_cines y valeria_film). Para probar la página como usuario común, lo más simple es crear una cuenta nueva desde el botón "Crear cuenta".


