// ===== Datos =====
// Las películas y los próximos estrenos se escriben a mano en index.html (sección "catalogo").
// Solo los combos del candy bar siguen viniendo de la base de datos (api/combos.php).
let peliculas = [];
let proximos = [];
let combos = [];

// Evita que un texto escrito por una persona se interprete como HTML
function limpiar(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ===== Cuentas =====
// Las cuentas viven en MySQL: la página le pide todo a la carpeta api/ con fetch().
// TEMPORAL: favoritos, a quién sigo, reseñas, compras y notificaciones todavía se guardan
// en el navegador. Para eso se guarda una copia local de cada usuario (con su mismo id).
// Se va sacando a medida que cada parte pasa a la base de datos.
// Carpeta donde están los PHP, vista desde el index.html.
// Si tu index.html está en otra carpeta, cambiá solo esta línea (por ejemplo "../api/").
const CARPETA_API = "../api/";

const MENSAJE_SIN_CONEXION = "No se pudo conectar con el servidor. Abrí la página desde http://localhost/cinematch/ con Apache y MySQL encendidos.";

const usuariosIniciales = [
  { id: 1, nombre: "admin", rol: "admin", bio: "Administración de Cine Match.", foto: "", siguiendo: [], favoritos: [] },
  { id: 3, nombre: "marcos_cines", nombreCompleto: "Marcos Cine", rol: "usuario", bio: "", foto: "", resenasBase: 34, siguiendo: [], favoritos: [] },
  { id: 4, nombre: "valeria_film", nombreCompleto: "Valeria Gómez", rol: "usuario", bio: "", foto: "", resenasBase: 52, siguiendo: [], favoritos: [] }
];

let usuarios = JSON.parse(localStorage.getItem("cineMatchExtras")) || usuariosIniciales;
let usuarioActual = null;
let fotoPendiente = null; // foto nueva elegida en "Editar perfil" (null = no se tocó)

function guardarUsuarios() {
  localStorage.setItem("cineMatchExtras", JSON.stringify(usuarios));
}

// Manda datos por POST a un archivo PHP y devuelve { ok, datos }
async function enviar(url, campos) {
  const formulario = new FormData();
  Object.keys(campos).forEach((nombre) => formulario.append(nombre, campos[nombre]));
  try {
    const respuesta = await fetch(url, { method: "POST", body: formulario });
    const texto = await respuesta.text();
    try {
      return { ok: respuesta.ok, estado: respuesta.status, datos: JSON.parse(texto) };
    } catch (error) {
      // El servidor contestó, pero no con JSON: mostramos qué contestó para encontrar el problema
      console.error("Respuesta de " + url + " (código " + respuesta.status + "):", texto);
      const detalle = texto.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
      return { ok: false, datos: { error: "El servidor no respondió como se esperaba (código " + respuesta.status + ") en " + url + ". Respuesta: " + (detalle || "vacía") } };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, datos: { error: MENSAJE_SIN_CONEXION } };
  }
}

// Pregunta al servidor quién tiene la sesión iniciada (null si nadie)
async function traerSesion() {
  try {
    const respuesta = await fetch(CARPETA_API + "sesion.php");
    return respuesta.ok ? await respuesta.json() : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Une los datos del servidor con la copia local (favoritos, a quién sigo)
function vincularConLocal(datos) {
  let local = usuarios.find((u) => u.id === datos.id);
  if (!local) {
    local = { id: datos.id, siguiendo: [], favoritos: [] };
    usuarios.push(local);
  }
  local.nombre = datos.nombre;
  local.nombreCompleto = datos.nombre_completo || undefined;
  local.rol = datos.rol;
  local.bio = datos.bio || "";
  local.foto = datos.foto || "";
  guardarUsuarios();
  return local;
}

async function cargarSesion() {
  const datos = await traerSesion();
  usuarioActual = datos ? vincularConLocal(datos) : null;
  await cargarDatosDeLaCuenta();
  actualizarCuenta();
  if (location.protocol === "file:") {
    alert("Abriste la página con doble clic. Para que use la base de datos, abrila desde http://localhost/");
  }
}

// Favoritos y notificaciones de la persona que tiene la sesión iniciada
async function cargarDatosDeLaCuenta() {
  await Promise.all([cargarFavoritos(), cargarNotificaciones()]);
}

function esAdmin() {
  return usuarioActual !== null && usuarioActual.rol === "admin";
}

function idDueno() {
  return usuarioActual ? usuarioActual.id : 0;
}

function nombreDe(id) {
  const u = usuarios.find((x) => x.id === id);
  return u ? u.nombre : "cinefilo_99";
}

// Si la persona no tiene foto, se le arma una con su inicial
function fotoDe(u) {
  if (u.foto) {
    return u.foto;
  }
  const letra = limpiar(u.nombre.charAt(0).toUpperCase());
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='#a78bfa'/>" +
    "<text x='50' y='67' font-size='52' font-weight='700' text-anchor='middle' fill='#111' font-family='sans-serif'>" + letra + "</text></svg>");
}

function avisarSinCuenta(accion) {
  alert("Necesitás una cuenta para " + accion + ". Iniciá sesión o creá una cuenta.");
  abrirCuenta("login");
}

function panelInvitado(texto) {
  return `
    <div class="panel vacio">
      <p>${texto}</p><br>
      <div class="botones centrado">
        <button class="boton" onclick="abrirCuenta('login')">Iniciar sesión</button>
        <button class="boton-borde" onclick="abrirCuenta('registro')">Crear cuenta</button>
      </div>
    </div>`;
}

// Arma la parte de arriba a la derecha según quién esté usando la página
function actualizarCuenta() {
  let html = `
    <button class="boton-borde chico" onclick="abrirCuenta('login')">Iniciar sesión</button>
    <button class="boton chico" onclick="abrirCuenta('registro')">Crear cuenta</button>`;

  if (usuarioActual) {
    html = `
      <button class="usuario" onclick="navegar('perfil')">
        <img src="${fotoDe(usuarioActual)}" alt="Foto de perfil">
        <span>@${limpiar(usuarioActual.nombre)}</span>
      </button>
      ${esAdmin() ? '<button class="insignia-admin" onclick="navegar(\'admin\')">Panel de administrador</button>' : ""}
      <button class="boton-borde chico" onclick="cerrarSesion()">Cerrar sesión</button>`;
  }
  document.querySelector("#zona-cuenta").innerHTML = html;

  // Vista del administrador: menú propio y sin las opciones de usuario
  document.querySelector("body").classList.toggle("modo-admin", esAdmin());
  document.querySelector("#menu-admin").innerHTML = esAdmin() ? '<button onclick="navegar(\'admin\')">Panel</button>' : "";
  actualizarPunto();
}

function abrirCuenta(modo) {
  document.querySelector("#cuenta-titulo").textContent = modo === "registro" ? "Crear cuenta" : "Iniciar sesión";
  document.querySelector("#form-login").classList.toggle("oculto", modo === "registro");
  document.querySelector("#form-registro").classList.toggle("oculto", modo !== "registro");
  document.querySelector("#cuenta-error").classList.add("oculto");
  document.querySelector("#ventana-cuenta").classList.remove("oculto");
}

function cerrarCuenta() {
  document.querySelector("#ventana-cuenta").classList.add("oculto");
}

function errorCuenta(texto) {
  const caja = document.querySelector("#cuenta-error");
  caja.textContent = texto;
  caja.classList.remove("oculto");
}

async function crearCuenta(event) {
  event.preventDefault();
  const nombre = document.querySelector("#registro-usuario").value.trim();
  const email = document.querySelector("#registro-email").value.trim().toLowerCase();
  const clave = document.querySelector("#registro-clave").value;

  if (!/^[A-Za-z0-9_.]{3,24}$/.test(nombre)) {
    errorCuenta("El nombre de usuario debe tener entre 3 y 24 caracteres: letras, números, _ o .");
    return;
  }
  if (clave.length < 8) {
    errorCuenta("La contraseña debe tener 8 caracteres o más.");
    return;
  }

  const registro = await enviar(CARPETA_API + "registro.php", { nombre: nombre, email: email, password: clave });
  if (!registro.ok) {
    errorCuenta(registro.datos.error);
    return;
  }
  document.querySelector("#form-registro").reset();
  await ingresar(nombre, clave); // después de crear la cuenta, inicia la sesión
}

async function iniciarSesion(event) {
  event.preventDefault();
  const dato = document.querySelector("#login-usuario").value.trim();
  const clave = document.querySelector("#login-clave").value;
  await ingresar(dato, clave);
}

async function ingresar(dato, clave) {
  const acceso = await enviar(CARPETA_API + "login.php", { usuario: dato, password: clave });
  if (!acceso.ok) {
    errorCuenta(acceso.datos.error);
    return;
  }
  const datos = await traerSesion();
  if (!datos) {
    errorCuenta(MENSAJE_SIN_CONEXION);
    return;
  }
  document.querySelector("#form-login").reset();
  await entrarCon(vincularConLocal(datos));
}

// El administrador entra directo a su panel; los demás van al inicio
async function entrarCon(usuario) {
  usuarioActual = usuario;
  await cargarDatosDeLaCuenta();
  cerrarCuenta();
  actualizarCuenta();
  navegar(esAdmin() ? "admin" : "inicio");
}

async function cerrarSesion() {
  if (!confirm("¿Estás seguro de que querés cerrar sesión?")) {
    return;
  }
  await enviar(CARPETA_API + "logout.php", {});
  usuarioActual = null;
  await cargarDatosDeLaCuenta();
  actualizarCuenta();
  navegar("inicio");
}

// ===== Navegación =====
const pantallasListas = ["inicio", "cartelera", "pelicula", "compra", "perfil", "favoritos", "mis-compras", "comunidad", "notificaciones", "admin"]; // se van sumando en las próximas etapas

function navegar(nombre) {
  if (!pantallasListas.includes(nombre)) {
    alert("Esa pantalla todavía no está pasada a la versión limpia.");
    return;
  }
  if (nombre === "admin" && !esAdmin()) {
    alert("Esta sección es solo para el administrador.");
    nombre = "inicio";
  }
  if (nombre === "inicio") {
    limpiarAvisosCancelacion();
  }
  document.querySelectorAll(".pantalla").forEach((p) => p.classList.add("oculto"));
  document.querySelector("#pantalla-" + nombre).classList.remove("oculto");
  document.querySelector("#menu").classList.remove("abierto");
  window.scrollTo(0, 0);

  if (nombre === "perfil") { mostrarPerfil(); }
  if (nombre === "favoritos") { mostrarFavoritos(); }
  if (nombre === "mis-compras") { mostrarMisCompras(); }
  if (nombre === "comunidad") { mostrarComunidad(); }
  if (nombre === "notificaciones") { mostrarNotificaciones(); }
  if (nombre === "admin") { mostrarAdmin(); }
}

function abrirMenu() {
  document.querySelector("#menu").classList.toggle("abierto");
}

// ===== Catálogo (películas, estrenos y combos) =====
// Pide un dato a la API con GET y devuelve { ok, datos }
async function traer(ruta) {
  try {
    const respuesta = await fetch(CARPETA_API + ruta);
    const texto = await respuesta.text();
    try {
      return { ok: respuesta.ok, datos: JSON.parse(texto) };
    } catch (error) {
      console.error("Respuesta de " + CARPETA_API + ruta + " (código " + respuesta.status + "):", texto);
      return { ok: false, datos: { error: "No se pudo leer " + CARPETA_API + ruta + " (código " + respuesta.status + "). Revisá la línea CARPETA_API del script." } };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, datos: { error: MENSAJE_SIN_CONEXION } };
  }
}

// Devuelve el texto de un elemento de la tarjeta, por ejemplo texto(tarjeta, ".director")
function texto(tarjeta, selector) {
  return tarjeta.querySelector(selector).textContent.trim();
}

// Lee las películas y los estrenos que están escritos en index.html
function leerCatalogo() {
  peliculas = [...document.querySelectorAll("#catalogo-peliculas article")].map((a) => ({
    id: Number(a.dataset.id),
    genero: a.dataset.genero,
    titulo: texto(a, "h3"),
    generoCompleto: texto(a, ".generos"),
    duracion: texto(a, ".duracion"),
    clasificacion: texto(a, ".clasificacion"),
    director: texto(a, ".director"),
    puntuacion: Number(texto(a, ".puntuacion")),
    formato: texto(a, ".formato"),
    descripcion: texto(a, ".descripcion"),
    imagen: a.querySelector("img").getAttribute("src")
  }));

  proximos = [...document.querySelectorAll("#catalogo-proximos article")].map((a) => ({
    titulo: texto(a, "h3"),
    genero: texto(a, ".generos"),
    fecha: texto(a, ".fecha"),
    imagen: a.querySelector("img").getAttribute("src")
  }));
}

async function cargarCombos() {
  const respuesta = await traer("combos.php");
  if (respuesta.ok) {
    combos = respuesta.datos;
  }
}

// ===== Tarjetas =====
function tarjetaPelicula(p) {
  return `
    <article class="pelicula">
      <div class="poster" onclick="verPelicula(${p.id})">
        <img src="${limpiar(p.imagen)}" alt="Póster de ${limpiar(p.titulo)}">
        <span class="puntaje">${p.puntuacion ? "★ " + p.puntuacion : "Nueva"}</span>
        <span class="formato">${p.formato}</span>
      </div>
      <div class="info">
        <div>
          <h3>${limpiar(p.titulo)}</h3>
          <p>${limpiar(p.generoCompleto)} • ${p.duracion}</p>
        </div>
        <button class="boton-chico" onclick="comprarEntradas(${p.id})">🎟 Entradas</button>
      </div>
    </article>`;
}

// ===== Inicio =====
async function mostrarInicio() {
  document.querySelector("#inicio-peliculas").innerHTML =
    peliculas.map(tarjetaPelicula).join("") || '<p class="vacio">No hay películas en cartelera.</p>';

  const resenas = await traer("resenas.php?recientes=3");
  document.querySelector("#inicio-resenas").innerHTML =
    (resenas.ok ? resenas.datos : []).map(tarjetaResenaDeApi).join("") || '<p class="vacio">Todavía no hay reseñas.</p>';
}

function tarjetaResenaDeApi(r) {
  return tarjetaResena({ usuario: "@" + r.usuario, cuando: haceCuanto(r.ts * 1000), pelicula: limpiar(r.pelicula), texto: limpiar(r.texto), estrellas: r.estrellas });
}

function tarjetaResena(r) {
  return `
    <article class="resena">
      <div class="resena-cabecera">
        <div class="inicial">${r.usuario.charAt(1).toUpperCase()}</div>
        <div><strong>${r.usuario}</strong><small>${r.cuando}</small></div>
        <span class="estrellas">${"★".repeat(r.estrellas || 5)}</span>
      </div>
      <p>"${r.texto}"</p>
      <p class="sobre">Sobre: <strong>${r.pelicula}</strong></p>
    </article>`;
}

// ===== Cartelera =====
function mostrarCartelera() {
  const texto = document.querySelector("#buscar-titulo").value.toLowerCase();
  const genero = document.querySelector("#filtro-genero").value;
  const formato = document.querySelector("#filtro-formato").value;
  const orden = document.querySelector("#orden").value;

  const lista = peliculas.filter((p) => {
    return p.titulo.toLowerCase().includes(texto)
      && (genero === "todos" || p.genero === genero)
      && (formato === "todos" || p.formato === formato);
  });

  if (orden === "puntuacion") {
    lista.sort((a, b) => b.puntuacion - a.puntuacion);
  } else if (orden === "titulo") {
    lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  document.querySelector("#cartelera-peliculas").innerHTML =
    lista.map(tarjetaPelicula).join("") || "<p>No hay películas con esos filtros.</p>";

  document.querySelector("#proximos").innerHTML = proximos.map((p) => `
    <article class="pelicula proxima">
      <div class="poster">
        <img src="${limpiar(p.imagen)}" alt="Póster de ${limpiar(p.titulo)}">
        <span class="formato">${limpiar(p.fecha)}</span>
      </div>
      <div class="info">
        <div><h3>${limpiar(p.titulo)}</h3><p>${limpiar(p.genero)}</p></div>
        <button class="boton-chico" disabled>Próximamente</button>
      </div>
    </article>`).join("");
}

// ===== Ficha de la película =====
let peliculaActual = null;
let funcionesActuales = []; // funciones de la película que se está viendo o comprando

function buscarPelicula(id) {
  return peliculas.find((p) => p.id === id);
}

async function cargarFunciones(peliculaId) {
  const respuesta = await traer("funciones.php?pelicula_id=" + peliculaId);
  funcionesActuales = respuesta.ok ? respuesta.datos : [];
}

// "2026-11-06" → "Hoy", "Mañana" o "vie 06/11"
function nombreDia(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dia = new Date(fecha + "T00:00");
  const diferencia = Math.round((dia - hoy) / 86400000);
  if (diferencia === 0) { return "Hoy"; }
  if (diferencia === 1) { return "Mañana"; }
  return dia.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

// Funciones de la película: un selector de día y, debajo, una tarjeta por sala con sus horarios
let diaElegido = "";

function mostrarFuncionesDelDia() {
  const contenedor = document.querySelector("#pelicula-funciones");
  const fechas = [...new Set(funcionesActuales.map((f) => f.fecha))];
  if (fechas.length === 0) {
    contenedor.innerHTML = '<p class="vacio">Esta película todavía no tiene funciones cargadas.</p>';
    return;
  }
  if (!fechas.includes(diaElegido)) {
    diaElegido = fechas[0];
  }

  const salas = {};
  funcionesActuales.filter((f) => f.fecha === diaElegido).forEach((f) => {
    salas[f.sala_numero] = salas[f.sala_numero] || [];
    salas[f.sala_numero].push(f);
  });

  const dias = fechas.map((fecha) => {
    return `<button class="dia ${fecha === diaElegido ? "activo" : ""}" onclick="elegirDia('${fecha}')">${nombreDia(fecha)}</button>`;
  }).join("");

  contenedor.innerHTML = '<div class="dias">' + dias + "</div>" + Object.keys(salas).map((numero) => {
    const lista = salas[numero];
    return `
      <div class="sala-tarjeta">
        <header><strong>${limpiar(lista[0].sala_nombre)}</strong><span class="etiqueta-formato">${lista[0].formato}</span></header>
        <div class="horas">
          ${lista.map((f) => `<button class="hora" onclick="empezarCompra(${f.id})">${f.hora} HS</button>`).join("")}
        </div>
      </div>`;
  }).join("");
}

function elegirDia(fecha) {
  diaElegido = fecha;
  mostrarFuncionesDelDia();
}

async function verPelicula(id) {
  peliculaActual = buscarPelicula(id);
  const p = peliculaActual;

  document.querySelector("#pelicula-hero").style.backgroundImage = "url(" + p.imagen + ")";
  document.querySelector("#pelicula-poster").src = p.imagen;
  document.querySelector("#pelicula-clasificacion").textContent = p.clasificacion;
  document.querySelector("#pelicula-genero").textContent = p.generoCompleto;
  document.querySelector("#pelicula-duracion").textContent = p.duracion;
  document.querySelector("#pelicula-titulo").textContent = p.titulo;
  document.querySelector("#pelicula-puntuacion").textContent = p.puntuacion ? "★ " + p.puntuacion.toFixed(1) : "Nueva";
  document.querySelector("#pelicula-director").textContent = p.director;
  document.querySelector("#pelicula-descripcion").textContent = p.descripcion;
  document.querySelector("#pelicula-funciones").innerHTML = '<p class="vacio">Cargando funciones…</p>';
  document.querySelector("#pelicula-resenas").innerHTML = '<p class="vacio">Cargando reseñas…</p>';
  actualizarBotonFavorito();
  navegar("pelicula");

  await cargarFunciones(id);
  diaElegido = "";
  mostrarFuncionesDelDia();

  const resenas = await traer("resenas.php?pelicula_id=" + id);
  document.querySelector("#pelicula-resenas").innerHTML =
    (resenas.ok ? resenas.datos : []).map(tarjetaResenaDeApi).join("") || "<p>Todavía no hay reseñas de esta película.</p>";
}

// ===== Compra =====
let compra = { funcion: null, asientos: [], combos: {} };
let ocupadosActuales = []; // asientos ya vendidos de la función elegida
let pasoActual = 1;

function dinero(n) {
  return "$" + n.toFixed(2) + " USD";
}

async function comprarEntradas(id) {
  peliculaActual = buscarPelicula(id);
  await cargarFunciones(id);
  if (funcionesActuales.length === 0) {
    alert("Esta película todavía no tiene funciones cargadas.");
    return;
  }
  empezarCompra(funcionesActuales[0].id);
}

function empezarCompra(funcionId) {
  const funcion = funcionesActuales.find((f) => f.id === funcionId);
  compra = { funcion: funcion, asientos: [], combos: {} };
  document.querySelector("#compra-titulo").textContent = peliculaActual.titulo;

  const fechas = [...new Set(funcionesActuales.map((f) => f.fecha))];
  document.querySelector("#compra-fecha").innerHTML = fechas.map((fecha) => {
    return `<option value="${fecha}" ${fecha === funcion.fecha ? "selected" : ""}>${nombreDia(fecha)} - ${fecha}</option>`;
  }).join("");
  llenarFunciones(funcion.id);
  document.querySelector("#compra-fecha").onchange = () => llenarFunciones();

  navegar("compra");
  pasoActual = 1;
  irAPaso(1);
}

// Llena el selector de horarios con las funciones del día elegido
function llenarFunciones(seleccionadaId) {
  const fecha = document.querySelector("#compra-fecha").value;
  document.querySelector("#compra-funcion").innerHTML = funcionesActuales
    .filter((f) => f.fecha === fecha)
    .map((f) => `<option value="${f.id}" ${f.id === seleccionadaId ? "selected" : ""}>${f.hora} HS - ${limpiar(f.sala_nombre)} - ${dinero(f.precio)}</option>`)
    .join("");
}

function leerFuncionElegida() {
  const id = Number(document.querySelector("#compra-funcion").value);
  if (id !== compra.funcion.id) {
    compra.funcion = funcionesActuales.find((f) => f.id === id);
    compra.asientos = [];
  }
}

async function cargarOcupados() {
  const respuesta = await traer("asientos.php?funcion_id=" + compra.funcion.id);
  ocupadosActuales = respuesta.ok ? respuesta.datos : [];
  compra.asientos = compra.asientos.filter((a) => !ocupadosActuales.includes(a));
}

async function irAPaso(numero) {
  if (pasoActual === 1 && numero !== 1) {
    leerFuncionElegida();
  }
  pasoActual = numero;

  document.querySelectorAll(".paso").forEach((p) => p.classList.add("oculto"));
  document.querySelector("#paso-" + numero).classList.remove("oculto");
  document.querySelectorAll("#pasos span").forEach((tab, i) => {
    tab.classList.toggle("activo", i + 1 === numero);
  });

  if (numero === 2) {
    document.querySelector("#precio-entrada").textContent = dinero(compra.funcion.precio);
    await cargarOcupados();
    mostrarAsientos();
  }
  if (numero === 3) {
    mostrarCombos();
  }
  if (numero === 4) {
    mostrarResumen();
  }
}

function mostrarAsientos() {
  let html = "";
  ["A", "B", "C", "D", "E"].forEach((fila) => {
    html += `<div class="fila-asientos"><b>${fila}</b>`;
    for (let n = 1; n <= 8; n++) {
      const id = fila + n;
      if (ocupadosActuales.includes(id)) {
        html += `<span class="asiento ocupado">${n}</span>`;
      } else if (compra.asientos.includes(id)) {
        html += `<button class="asiento elegido" onclick="elegirAsiento('${id}')">${n}</button>`;
      } else {
        html += `<button class="asiento libre" onclick="elegirAsiento('${id}')">${n}</button>`;
      }
    }
    html += "</div>";
  });
  document.querySelector("#asientos").innerHTML = html;

  document.querySelector("#asientos-elegidos").textContent =
    compra.asientos.length > 0 ? compra.asientos.join(", ") : "Ninguno seleccionado";
  document.querySelector("#boton-combos").disabled = compra.asientos.length === 0;
}

function elegirAsiento(id) {
  if (compra.asientos.includes(id)) {
    compra.asientos = compra.asientos.filter((a) => a !== id);
  } else {
    compra.asientos.push(id);
  }
  mostrarAsientos();
}

function mostrarCombos() {
  document.querySelector("#lista-combos").innerHTML = combos.map((c) => `
    <div class="combo">
      <img src="${limpiar(c.imagen)}" alt="${limpiar(c.nombre)}">
      <div><h3>${limpiar(c.nombre)}</h3><p>${limpiar(c.detalle)}</p><strong>${dinero(c.precio)}</strong></div>
      <div class="cantidad">
        <button onclick="cambiarCombo(${c.id}, -1)">-</button>
        <span>${compra.combos[c.id] || 0}</span>
        <button onclick="cambiarCombo(${c.id}, 1)">+</button>
      </div>
    </div>`).join("");
}

function cambiarCombo(id, cambio) {
  compra.combos[id] = Math.max(0, (compra.combos[id] || 0) + cambio);
  mostrarCombos();
}

// Solo para mostrar el resumen: el total que vale lo calcula el servidor al comprar
function calcularTotales() {
  const entradas = compra.asientos.length * compra.funcion.precio;
  let combosTotal = 0;
  combos.forEach((c) => { combosTotal += (compra.combos[c.id] || 0) * c.precio; });
  return { entradas: entradas, combos: combosTotal, total: entradas + combosTotal };
}

function mostrarResumen() {
  const t = calcularTotales();
  const f = compra.funcion;
  document.querySelector("#resumen").innerHTML = `
    <h3>Detalle del pedido</h3>
    <div class="linea"><span>Película:</span><span>${limpiar(peliculaActual.titulo)}</span></div>
    <div class="linea"><span>Función:</span><span>${nombreDia(f.fecha)} · ${f.hora} HS (${f.formato})</span></div>
    <div class="linea"><span>Asientos:</span><span>${compra.asientos.join(", ")}</span></div>
    <div class="linea"><span>Entradas:</span><span>${dinero(t.entradas)}</span></div>
    <div class="linea"><span>Combos:</span><span>${dinero(t.combos)}</span></div>
    <div class="linea total"><span>TOTAL A PAGAR:</span><span>${dinero(t.total)}</span></div>`;
}

// Las compras sin cuenta se recuerdan por su código, para poder verlas y cancelarlas después
function leerCodigos() {
  return JSON.parse(localStorage.getItem("cineMatchCodigos")) || [];
}

function guardarCodigoInvitado(codigo) {
  const lista = leerCodigos();
  lista.push(codigo);
  localStorage.setItem("cineMatchCodigos", JSON.stringify(lista));
}

async function pagar() {
  if (compra.asientos.length === 0) {
    alert("Elegí al menos un asiento antes de pagar.");
    return;
  }
  const combosElegidos = Object.keys(compra.combos)
    .filter((id) => compra.combos[id] > 0)
    .map((id) => id + ":" + compra.combos[id])
    .join(",");

  const resultado = await enviar(CARPETA_API + "comprar.php", {
    funcion_id: compra.funcion.id,
    asientos: compra.asientos.join(","),
    combos: combosElegidos
  });
  if (!resultado.ok) {
    alert(resultado.datos.error);
    if (resultado.estado === 409) {
      await irAPaso(2); // vuelve a pedir los asientos ocupados
    }
    return;
  }

  const codigo = resultado.datos.codigo;
  if (!usuarioActual) {
    guardarCodigoInvitado(codigo);
  }
  document.querySelector("#exito-detalle").innerHTML = `
    <div class="linea"><span>Código de reserva:</span><strong>#${codigo}</strong></div>
    <div class="linea"><span>Película:</span><strong>${limpiar(peliculaActual.titulo)}</strong></div>
    <div class="linea"><span>Asientos:</span><strong>${resultado.datos.asientos}</strong></div>
    <div class="linea"><span>Total pagado:</span><strong>${dinero(resultado.datos.total)}</strong></div>`;

  compra.asientos = [];
  compra.combos = {};
  pasoActual = 5;
  document.querySelectorAll(".paso").forEach((p) => p.classList.add("oculto"));
  document.querySelector("#paso-exito").classList.remove("oculto");
  cargarNotificaciones();
}

// ===== Favoritos =====
let favoritosIds = [];

async function cargarFavoritos() {
  if (!usuarioActual) {
    favoritosIds = [];
    return;
  }
  const respuesta = await traer("favoritos.php");
  favoritosIds = respuesta.ok ? respuesta.datos : [];
}

function leerFavoritos() {
  return favoritosIds;
}

function actualizarBotonFavorito() {
  const boton = document.querySelector("#boton-favorito");
  const esFavorita = peliculaActual !== null && leerFavoritos().includes(peliculaActual.id);
  boton.textContent = esFavorita ? "♥ En favoritos" : "♡ Guardar en favoritos";
  boton.classList.toggle("activo", esFavorita);
}

async function alternarFavorito() {
  if (!usuarioActual) {
    avisarSinCuenta("guardar películas en favoritos");
    return;
  }
  const resultado = await enviar(CARPETA_API + "favoritos.php", { pelicula_id: peliculaActual.id });
  if (!resultado.ok) {
    alert(resultado.datos.error);
    return;
  }
  await cargarFavoritos();
  actualizarBotonFavorito();
  alert(resultado.datos.favorita ? "¡Película guardada en tus favoritos!" : "La película se quitó de tus favoritos.");
}

async function quitarFavorito(id) {
  await enviar(CARPETA_API + "favoritos.php", { pelicula_id: id });
  await cargarFavoritos();
  mostrarFavoritos();
  mostrarPerfil();
}

function tarjetaFavorita(p) {
  return `
    <article class="favorita">
      <button class="ver" onclick="verPelicula(${p.id})" title="Ver película">
        <img src="${limpiar(p.imagen)}" alt="${limpiar(p.titulo)}">
        <strong>${limpiar(p.titulo)}</strong>
      </button>
      <button class="quitar" onclick="quitarFavorito(${p.id})">Quitar de favoritos</button>
    </article>`;
}

function listaDeFavoritas() {
  return leerFavoritos().map(buscarPelicula).filter((p) => p);
}

function mostrarFavoritos() {
  if (!usuarioActual) {
    document.querySelector("#favoritos-lista").innerHTML = panelInvitado("Iniciá sesión o creá una cuenta para guardar tus películas favoritas.");
    return;
  }
  document.querySelector("#favoritos-lista").innerHTML =
    listaDeFavoritas().map(tarjetaFavorita).join("") || '<p class="vacio">Todavía no agregaste películas a tus favoritos.</p>';
}

// ===== Reseñas propias =====
let estrellasElegidas = 0;

// TEMPORAL: la lista de Comunidad todavía cuenta reseñas desde acá; pasa a la base con "seguir"
function leerResenas() {
  return [];
}

function abrirResena() {
  if (!usuarioActual) {
    avisarSinCuenta("calificar películas");
    return;
  }
  estrellasElegidas = 0;
  document.querySelector("#resena-pelicula").textContent = peliculaActual.titulo;
  document.querySelector("#resena-texto").value = "";
  document.querySelector("#resena-aviso").textContent = "Elegí de 1 a 5 estrellas";
  document.querySelectorAll("#elegir-estrellas button").forEach((b) => b.classList.remove("elegida"));
  document.querySelector("#ventana-resena").classList.remove("oculto");
}

function cerrarResena() {
  document.querySelector("#ventana-resena").classList.add("oculto");
}

function elegirEstrellas(n) {
  estrellasElegidas = n;
  document.querySelectorAll("#elegir-estrellas button").forEach((b, i) => {
    b.classList.toggle("elegida", i < n);
  });
  document.querySelector("#resena-aviso").textContent = n + " de 5 estrellas";
}

async function publicarResena() {
  if (!usuarioActual) {
    avisarSinCuenta("calificar películas");
    return;
  }
  const texto = document.querySelector("#resena-texto").value.trim();
  if (estrellasElegidas === 0) {
    alert("Elegí una puntuación de 1 a 5 estrellas.");
    return;
  }
  if (texto === "") {
    alert("Escribí tu opinión antes de publicarla.");
    return;
  }
  const resultado = await enviar(CARPETA_API + "resenas.php", {
    pelicula_id: peliculaActual.id,
    estrellas: estrellasElegidas,
    texto: texto
  });
  if (!resultado.ok) {
    alert(resultado.datos.error);
    return;
  }
  cerrarResena();
  await verPelicula(peliculaActual.id);
  mostrarInicio();
  alert("¡Tu reseña se publicó y quedó guardada en tu perfil!");
}

// ===== Perfil =====
async function mostrarPerfil() {
  const u = usuarioActual;
  document.querySelector("#perfil-invitado").classList.toggle("oculto", u !== null);
  document.querySelector("#perfil-contenido").classList.toggle("oculto", u === null);
  if (!u) {
    document.querySelector("#perfil-invitado").innerHTML = panelInvitado("Iniciá sesión o creá una cuenta para ver y editar tu perfil.");
    return;
  }

  document.querySelector("#perfil-foto").src = fotoDe(u);
  document.querySelector("#perfil-nombre").textContent = u.nombreCompleto || u.nombre;
  document.querySelector("#perfil-arroba").textContent = "@" + u.nombre;
  document.querySelector("#perfil-bio").textContent = u.bio || "Todavía no escribiste una biografía.";
  document.querySelector("#perfil-seguidores").textContent = usuarios.filter((x) => x.siguiendo.includes(u.id)).length;
  document.querySelector("#perfil-siguiendo").textContent = u.siguiendo.length;
  document.querySelector("#perfil-favoritas").innerHTML =
    listaDeFavoritas().map(tarjetaFavorita).join("") || '<p class="vacio">Todavía no agregaste películas a tus favoritos.</p>';

  const respuesta = await traer("resenas.php?usuario_id=" + u.id);
  const propias = respuesta.ok ? respuesta.datos : [];
  document.querySelector("#perfil-nresenas").textContent = propias.length;
  document.querySelector("#perfil-resenas").innerHTML = propias.map((r) => {
    const fecha = new Date(r.ts * 1000).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
    return `
      <article class="mini-resena">
        <header><strong>${limpiar(r.pelicula)}</strong><span class="estrellas">${"★".repeat(r.estrellas)}${"☆".repeat(5 - r.estrellas)} (${r.estrellas}/5)</span></header>
        <p>${limpiar(r.texto)}</p>
        <small>Publicado el ${fecha}</small>
      </article>`;
  }).join("") || '<p class="vacio">Todavía no publicaste reseñas. ¡Calificá una película para que aparezca acá!</p>';
}

// ===== Editar perfil =====
function mostrarEditarPerfil() {
  const formulario = document.querySelector("#form-perfil");
  formulario.classList.toggle("oculto");
  fotoPendiente = null;
  document.querySelector("#ep-nombre").value = usuarioActual.nombre;
  document.querySelector("#ep-bio").value = usuarioActual.bio || "";
  document.querySelector("#ep-foto").value = "";
  document.querySelector("#ep-vista").src = fotoDe(usuarioActual);
}

// La foto se achica a 256x256 para que ocupe poco lugar al guardarla
function elegirFoto(input) {
  const archivo = input.files[0];
  if (!archivo) {
    return;
  }
  if (!archivo.type.startsWith("image/")) {
    alert("Elegí un archivo de imagen.");
    return;
  }
  const lector = new FileReader();
  lector.onload = () => {
    const imagen = new Image();
    imagen.onload = () => {
      const lado = Math.min(imagen.width, imagen.height);
      const lienzo = document.createElement("canvas");
      lienzo.width = 256;
      lienzo.height = 256;
      lienzo.getContext("2d").drawImage(imagen, (imagen.width - lado) / 2, (imagen.height - lado) / 2, lado, lado, 0, 0, 256, 256);
      fotoPendiente = lienzo.toDataURL("image/jpeg", 0.85);
      document.querySelector("#ep-vista").src = fotoPendiente;
    };
    imagen.src = lector.result;
  };
  lector.readAsDataURL(archivo);
}

function quitarFoto() {
  fotoPendiente = "";
  document.querySelector("#ep-foto").value = "";
  document.querySelector("#ep-vista").src = fotoDe({ nombre: document.querySelector("#ep-nombre").value || usuarioActual.nombre, foto: "" });
}

async function guardarPerfil(event) {
  event.preventDefault();
  const nombre = document.querySelector("#ep-nombre").value.trim();

  if (!/^[A-Za-z0-9_.]{3,24}$/.test(nombre)) {
    alert("El nombre de usuario debe tener entre 3 y 24 caracteres: letras, números, _ o .");
    return;
  }

  const campos = { nombre: nombre, bio: document.querySelector("#ep-bio").value.trim() };
  if (fotoPendiente !== null) {
    campos.foto = fotoPendiente; // "" = quitar la foto
  }

  const guardado = await enviar(CARPETA_API + "perfil.php", campos);
  if (!guardado.ok) {
    alert(guardado.datos.error);
    return;
  }

  usuarioActual = vincularConLocal(guardado.datos);
  fotoPendiente = null;
  document.querySelector("#form-perfil").classList.add("oculto");
  actualizarCuenta();
  mostrarPerfil();
  alert("Tu perfil se actualizó correctamente.");
}

// ===== Mis compras =====
// Los carteles de cancelación quedan guardados hasta que la persona vuelve al inicio
let avisosCancelacion = JSON.parse(sessionStorage.getItem("cineMatchAvisos")) || [];

function mostrarAvisosCancelacion() {
  document.querySelector("#avisos-cancelacion").innerHTML =
    avisosCancelacion.map((texto) => '<div class="aviso">✔ ' + texto + "</div>").join("");
}

function limpiarAvisosCancelacion() {
  avisosCancelacion = [];
  sessionStorage.removeItem("cineMatchAvisos");
  mostrarAvisosCancelacion();
}

async function mostrarMisCompras() {
  mostrarAvisosCancelacion();

  // Con cuenta: las compras de la cuenta. Sin cuenta: las que se hicieron desde este navegador.
  let ruta = "compras.php";
  if (!usuarioActual) {
    ruta += "?codigos=" + encodeURIComponent(leerCodigos().join(","));
  }
  const respuesta = await traer(ruta);
  const lista = respuesta.ok ? respuesta.datos : [];

  if (lista.length === 0) {
    document.querySelector("#compras-lista").innerHTML = '<div class="panel vacio"><strong>Todavía no tenés compras.</strong><br>Cuando compres una entrada, va a aparecer acá.</div>';
    return;
  }

  document.querySelector("#compras-lista").innerHTML = lista.map((c) => {
    const cancelada = c.estado === "cancelada";
    const ultimaColumna = cancelada
      ? "<span>Los asientos fueron liberados. Reembolso: " + (c.reembolso || "pendiente") + ".</span>"
      : `<button class="boton-cancelar" onclick="cancelarCompra('${c.codigo}')">Cancelar entrada</button>`;
    return `
      <article class="compra">
        <div class="compra-cabecera">
          <div><small>RESERVA #${c.codigo}</small><h3>${limpiar(c.pelicula)}</h3><p>${nombreDia(c.fecha)} · ${c.hora} HS · ${limpiar(c.sala_nombre)}</p></div>
          <span class="estado ${c.estado}">${cancelada ? "Cancelada" : "Confirmada"}</span>
        </div>
        <div class="compra-datos">
          <div><span>Asientos</span><strong>${c.asientos_texto}</strong></div>
          <div><span>Combos</span><strong>${limpiar(c.combos_texto || "Sin combos")}</strong></div>
          <div><span>Total pagado</span><strong>${dinero(c.total)}</strong></div>
          <div>${ultimaColumna}</div>
        </div>
      </article>`;
  }).join("");
}

async function cancelarCompra(codigo) {
  if (!confirm("¿Querés cancelar esta entrada? Los asientos van a volver a estar disponibles.")) {
    return;
  }
  const resultado = await enviar(CARPETA_API + "cancelar_compra.php", { codigo: codigo });
  if (!resultado.ok) {
    alert(resultado.datos.error);
    return;
  }
  avisosCancelacion.push("Los asientos " + resultado.datos.asientos + " de «" + limpiar(resultado.datos.pelicula) + "» fueron cancelados y quedaron disponibles.");
  sessionStorage.setItem("cineMatchAvisos", JSON.stringify(avisosCancelacion));
  cargarNotificaciones();
  mostrarMisCompras();
}

// ===== Comunidad =====
function mostrarComunidad() {
  const texto = document.querySelector("#buscar-usuario").value.toLowerCase().replace("@", "");
  const resenas = leerResenas();

  const lista = usuarios.filter((u) => {
    const otraPersona = !usuarioActual || u.id !== usuarioActual.id;
    const coincide = u.nombre.toLowerCase().includes(texto) || (u.nombreCompleto || "").toLowerCase().includes(texto);
    return u.rol === "usuario" && otraPersona && coincide;
  });

  document.querySelector("#comunidad-lista").innerHTML = lista.map((u) => {
    const sigo = usuarioActual !== null && usuarioActual.siguiendo.includes(u.id);
    const cantidad = (u.resenasBase || 0) + resenas.filter((r) => r.usuarioId === u.id).length;
    const titulo = u.nombreCompleto ? u.nombreCompleto : "@" + limpiar(u.nombre);
    const arroba = u.nombreCompleto ? '<span class="arroba">@' + limpiar(u.nombre) + "</span>" : "";
    return `
      <article class="usuario-tarjeta">
        <div>
          <img src="${fotoDe(u)}" alt="${limpiar(u.nombre)}">
          <div><strong>${titulo}</strong>${arroba}<small>${cantidad} reseñas</small></div>
        </div>
        <button class="boton-seguir ${sigo ? "siguiendo" : ""}" onclick="alternarSeguir(${u.id})">${sigo ? "Siguiendo" : "Seguir"}</button>
      </article>`;
  }).join("") || '<p class="vacio">No se encontraron usuarios.</p>';
}

function alternarSeguir(id) {
  if (!usuarioActual) {
    avisarSinCuenta("seguir a otros usuarios");
    return;
  }
  if (usuarioActual.siguiendo.includes(id)) {
    usuarioActual.siguiendo = usuarioActual.siguiendo.filter((x) => x !== id);
  } else {
    usuarioActual.siguiendo.push(id);
  }
  guardarUsuarios();
  mostrarComunidad();
}

// ===== Notificaciones =====
let notificacionesCache = [];

async function cargarNotificaciones() {
  notificacionesCache = [];
  if (usuarioActual) {
    const respuesta = await traer("notificaciones.php");
    notificacionesCache = respuesta.ok ? respuesta.datos : [];
  }
  actualizarPunto();
}

function haceCuanto(milisegundos) {
  const minutos = Math.floor((Date.now() - milisegundos) / 60000);
  if (minutos < 1) { return "Hace un momento"; }
  if (minutos < 60) { return "Hace " + minutos + " min"; }
  if (minutos < 1440) { return "Hace " + Math.floor(minutos / 60) + " h"; }
  return "Hace " + Math.floor(minutos / 1440) + " días";
}

function actualizarPunto() {
  const hayNuevas = notificacionesCache.some((n) => !n.leida);
  document.querySelector("#punto-notificaciones").classList.toggle("oculto", !hayNuevas);
}

async function mostrarNotificaciones() {
  if (!usuarioActual) {
    document.querySelector("#notificaciones-lista").innerHTML = panelInvitado("Iniciá sesión o creá una cuenta para ver tus notificaciones.");
    return;
  }
  await cargarNotificaciones();
  document.querySelector("#notificaciones-lista").innerHTML = notificacionesCache.map((n) => `
    <div class="notificacion ${n.leida ? "" : "nueva"}">
      <p><strong>${limpiar(n.titulo)}</strong> ${limpiar(n.texto)}</p>
      <small>${haceCuanto(n.ts * 1000)}</small>
    </div>`).join("") || '<p class="vacio">No tenés notificaciones.</p>';

  if (notificacionesCache.some((n) => !n.leida)) {
    await enviar(CARPETA_API + "notificaciones.php", { accion: "leer" });
    notificacionesCache.forEach((n) => { n.leida = true; });
    actualizarPunto();
  }
}

// ===== Administración =====
// Lo que se ve acá lo controla la base: aunque alguien llame a estos PHP a mano, solo responden al admin
async function mostrarAdmin() {
  if (!esAdmin()) { return; }
  const respuesta = await traer("admin_resumen.php");
  if (!respuesta.ok) {
    document.querySelector("#admin-metricas").innerHTML = '<p class="vacio">' + limpiar(respuesta.datos.error) + "</p>";
    return;
  }
  const d = respuesta.datos;

  document.querySelector("#admin-metricas").innerHTML = `
    <div class="metrica"><span>Ventas totales</span><strong>${dinero(d.ventas)}</strong></div>
    <div class="metrica"><span>Entradas vendidas</span><strong>${d.entradas}</strong></div>
    <div class="metrica"><span>Películas en cartelera</span><strong>${d.peliculas}</strong></div>
    <div class="metrica"><span>Reembolsos pendientes</span><strong>${d.pendientes}</strong></div>`;

  document.querySelector("#admin-peliculas").innerHTML = peliculas.map((p) => `
    <div class="admin-fila">
      <div><strong>${limpiar(p.titulo)}</strong><small>${limpiar(p.generoCompleto)} • ${p.duracion} • ${p.formato}</small></div>
    </div>`).join("") || '<p class="vacio">No hay películas en cartelera.</p>';

  document.querySelector("#admin-reembolsos").innerHTML = d.reembolsos.map((c) => {
    let acciones = `
      <div class="botones">
        <button class="boton chico" onclick="decidirReembolso('${c.codigo}', 'aprobado')">Aprobar</button>
        <button class="boton-borde chico" onclick="decidirReembolso('${c.codigo}', 'rechazado')">Rechazar</button>
      </div>`;
    if (c.reembolso !== "pendiente") {
      acciones = `<span class="${c.reembolso}">${c.reembolso === "aprobado" ? "Aprobado" : "Rechazado"}</span>`;
    }
    return `
      <div class="admin-fila">
        <div><strong>Reserva #${c.codigo}</strong><small>${limpiar(c.pelicula)} • ${dinero(c.total)} • ${c.usuario ? "@" + limpiar(c.usuario) : "sin cuenta"}</small></div>
        ${acciones}
      </div>`;
  }).join("") || '<p class="vacio">No hay solicitudes de reembolso.</p>';
}

async function decidirReembolso(codigo, decision) {
  if (!esAdmin()) { return; }
  const resultado = await enviar(CARPETA_API + "admin_reembolso.php", { codigo: codigo, decision: decision });
  if (!resultado.ok) {
    alert(resultado.datos.error);
    return;
  }
  await mostrarAdmin();
}

// ===== Arranque =====
actualizarCuenta();
cargarSesion();
leerCatalogo();
cargarCombos();
mostrarInicio();
mostrarCartelera();