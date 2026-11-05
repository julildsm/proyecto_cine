// ===== Datos =====
const peliculasIniciales = [
  { id: 1, clasificacion: "PG-13", director: "Denis Villeneuve", titulo: "Dune: Part Two", genero: "Sci-Fi", generoCompleto: "Ciencia Ficción / Aventura", duracion: "2h 45m", puntuacion: 4.8, formato: "IMAX", imagen: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400", descripcion: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia." },
  { id: 2, clasificacion: "R", director: "Christopher Nolan", titulo: "Oppenheimer", genero: "Drama", generoCompleto: "Drama / Historia", duracion: "3h 00m", puntuacion: 4.5, formato: "2D", imagen: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400", descripcion: "La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la primera bomba atómica." },
  { id: 3, clasificacion: "R", director: "Yorgos Lanthimos", titulo: "Poor Things", genero: "Comedia", generoCompleto: "Fantasía / Comedia", duracion: "2h 21m", puntuacion: 4.2, formato: "2D", imagen: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400", descripcion: "Bella Baxter explora el mundo y descubre nuevas ideas sobre la libertad, la identidad y su propia vida." },
  { id: 4, clasificacion: "PG-13", director: "Jonathan Glazer", titulo: "The Zone of Interest", genero: "Drama", generoCompleto: "Drama / Bélico", duracion: "1h 45m", puntuacion: 4.6, formato: "2D", imagen: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400", descripcion: "La vida cotidiana de una familia que vive junto al campo de concentración de Auschwitz." },
  { id: 5, clasificacion: "R", director: "Alex Garland", titulo: "Civil War", genero: "Accion", generoCompleto: "Acción / Thriller", duracion: "1h 49m", puntuacion: 4.0, formato: "3D", imagen: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=400", descripcion: "En un futuro cercano, un grupo de periodistas viaja por un país dividido por una guerra civil." }
];

let peliculas = JSON.parse(localStorage.getItem("cineMatchPeliculas")) || peliculasIniciales;

const proximos = [
  { titulo: "Joker: Folie à Deux", genero: "Thriller / Musical", fecha: "Próximo mes", imagen: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400" },
  { titulo: "Furiosa: Mad Max", genero: "Acción / Aventura", fecha: "En 2 semanas", imagen: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400" }
];

const resenasRecientes = [
  { usuario: "@cinefilo_99", cuando: "Hace 2 horas", pelicula: "Dune: Part Two", texto: "Una experiencia audiovisual imponente en la sala IMAX. La banda sonora de Hans Zimmer retumba en todo el pecho. Obra maestra del cine de ciencia ficción moderno." },
  { usuario: "@marcos_cines", cuando: "Ayer", pelicula: "Poor Things", texto: "Increíbles actuaciones de Emma Stone y Willem Dafoe. La dirección de arte y el diseño de vestuario son fuera de serie." },
  { usuario: "@valeria_film", cuando: "Hace 3 días", pelicula: "The Zone of Interest", texto: "El diseño de sonido de esta película es probablemente de lo mejor del año. Perturbadora y brillante." },
  { usuario: "@cinefilo_99", cuando: "Hace 1 semana", pelicula: "Dune: Part Two", texto: "Sublime. La escala de las escenas en el desierto y la banda sonora hacen que valga cada segundo en sala IMAX." }
];

// Evita que un texto escrito por una persona se interprete como HTML
function limpiar(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const CARPETA_API = "../api/";

const MENSAJE_SIN_CONEXION = "No se pudo conectar con el servidor. Abrí la página desde http://localhost/cinematch/ con Apache y MySQL encendidos.";

const usuariosIniciales = [
  { id: 1, nombre: "admin", rol: "admin", bio: "Administración de Cine Match.", foto: "", siguiendo: [], favoritos: [] },
  { id: 3, nombre: "marcos_cines", nombreCompleto: "Marcos Cine", rol: "usuario", bio: "", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100", resenasBase: 34, siguiendo: [], favoritos: [] },
  { id: 4, nombre: "valeria_film", nombreCompleto: "Valeria Gómez", rol: "usuario", bio: "", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100", resenasBase: 52, siguiendo: [], favoritos: [] }
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
      return { ok: respuesta.ok, datos: JSON.parse(texto) };
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
  actualizarCuenta();
  if (location.protocol === "file:") {
    alert("Abriste la página con doble clic. Para que use la base de datos, abrila desde http://localhost/cinematch/");
  }
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
  entrarCon(vincularConLocal(datos));
}

// El administrador entra directo a su panel; los demás van al inicio
function entrarCon(usuario) {
  usuarioActual = usuario;
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

// ===== Tarjetas =====
function tarjetaPelicula(p) {
  return `
    <article class="pelicula">
      <div class="poster" onclick="verPelicula(${p.id})">
        <img src="${p.imagen}" alt="Póster de ${p.titulo}">
        <span class="puntaje">${p.puntuacion ? "★ " + p.puntuacion : "Nueva"}</span>
        <span class="formato">${p.formato}</span>
      </div>
      <div class="info">
        <div>
          <h3>${p.titulo}</h3>
          <p>${p.generoCompleto} • ${p.duracion}</p>
        </div>
        <button class="boton-chico" onclick="comprarEntradas(${p.id})">🎟 Entradas</button>
      </div>
    </article>`;
}

// ===== Inicio =====
function mostrarInicio() {
  document.querySelector("#inicio-peliculas").innerHTML = peliculas.map(tarjetaPelicula).join("");

  document.querySelector("#inicio-resenas").innerHTML = resenasRecientes.slice(0, 3).map(tarjetaResena).join("");
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
        <img src="${p.imagen}" alt="Póster de ${p.titulo}">
        <span class="formato">${p.fecha}</span>
      </div>
      <div class="info">
        <div><h3>${p.titulo}</h3><p>${p.genero}</p></div>
        <button class="boton-chico" disabled>Próximamente</button>
      </div>
    </article>`).join("");
}

mostrarInicio();
mostrarCartelera();

// ===== Ficha de la película =====
const salas = [
  { numero: 1, nombre: "Sala 1 - IMAX Láser", formato: "IMAX", precio: 12, horas: ["16:30", "20:00"] },
  { numero: 3, nombre: "Sala 3 - 3D Atmos", formato: "3D", precio: 10, horas: ["18:15", "21:45"] },
  { numero: 4, nombre: "Sala 4 - 2D Tradicional", formato: "2D", precio: 8, horas: ["15:00", "19:30"] }
];

let peliculaActual = peliculas[0];

function buscarPelicula(id) {
  return peliculas.find((p) => p.id === id);
}

function verPelicula(id) {
  peliculaActual = buscarPelicula(id);
  const p = peliculaActual;

  document.querySelector("#pelicula-hero").style.backgroundImage = "url(" + p.imagen.replace("w=400", "w=1600") + ")";
  document.querySelector("#pelicula-poster").src = p.imagen.replace("w=400", "w=600");
  document.querySelector("#pelicula-clasificacion").textContent = p.clasificacion;
  document.querySelector("#pelicula-genero").textContent = p.generoCompleto;
  document.querySelector("#pelicula-duracion").textContent = p.duracion;
  document.querySelector("#pelicula-titulo").textContent = p.titulo;
  document.querySelector("#pelicula-puntuacion").textContent = p.puntuacion ? "★ " + p.puntuacion.toFixed(1) : "Nueva";
  document.querySelector("#pelicula-director").textContent = p.director;
  document.querySelector("#pelicula-descripcion").textContent = p.descripcion;

  document.querySelector("#pelicula-funciones").innerHTML = salas.map((sala) => `
    <div class="sala-tarjeta">
      <header><strong>${sala.nombre}</strong><span class="etiqueta-formato">${sala.formato}</span></header>
      <div class="horas">
        ${sala.horas.map((h) => `<button class="hora" onclick="empezarCompra(${sala.numero}, '${h}')">${h} HS</button>`).join("")}
      </div>
    </div>`).join("");

  const propias = leerResenas().filter((r) => r.peliculaId === p.id).map((r) => ({ usuario: "@" + nombreDe(r.usuarioId), cuando: "Recién", pelicula: r.pelicula, texto: limpiar(r.texto), estrellas: r.estrellas }));
  const resenas = propias.concat(resenasRecientes.filter((r) => r.pelicula === p.titulo));
  document.querySelector("#pelicula-resenas").innerHTML =
    resenas.map(tarjetaResena).join("") || "<p>Todavía no hay reseñas de esta película.</p>";

  actualizarBotonFavorito();
  navegar("pelicula");
}

// ===== Compra =====
const fechas = ["Hoy - Miércoles 21 de Octubre", "Mañana - Jueves 22 de Octubre", "Viernes 23 de Octubre"];

const combos = [
  { id: 1, nombre: "Combo Popcorn Dúo", detalle: "1 pochoclo gigante + 2 bebidas medianas", precio: 14.5, imagen: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300" },
  { id: 2, nombre: "Combo Individual Pro", detalle: "1 pochoclo mediano + 1 bebida grande + golosina", precio: 9.5, imagen: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300" },
  { id: 3, nombre: "Combo Nachos Especial", detalle: "1 porción de nachos con queso + 1 bebida grande", precio: 11, imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300" }
];

const asientosOcupadosDeEjemplo = ["A1", "C3", "C4"];

let compra = { fecha: fechas[0], sala: 1, hora: "20:00", asientos: [], combos: {} };
let pasoActual = 1;

function dinero(n) {
  return "$" + n.toFixed(2) + " USD";
}

function leerCompras() {
  return JSON.parse(localStorage.getItem("cineMatchCompras")) || [];
}

function salaActual() {
  return salas.find((s) => s.numero === compra.sala);
}

function claveFuncion() {
  return peliculaActual.id + "|" + compra.fecha + "|" + compra.sala + "|" + compra.hora;
}

function asientosOcupados() {
  const comprados = leerCompras()
    .filter((c) => c.estado === "confirmada" && c.claveFuncion === claveFuncion())
    .flatMap((c) => c.asientos);
  return asientosOcupadosDeEjemplo.concat(comprados);
}

function comprarEntradas(id) {
  peliculaActual = buscarPelicula(id);
  empezarCompra(1, "20:00");
}

function empezarCompra(numeroSala, hora) {
  compra = { fecha: fechas[0], sala: numeroSala, hora: hora, asientos: [], combos: {} };
  document.querySelector("#compra-titulo").textContent = peliculaActual.titulo;

  document.querySelector("#compra-fecha").innerHTML = fechas.map((f) => "<option>" + f + "</option>").join("");

  let opciones = "";
  salas.forEach((sala) => {
    sala.horas.forEach((h) => {
      const seleccionada = sala.numero === numeroSala && h === hora ? "selected" : "";
      opciones += `<option value="${sala.numero}|${h}" ${seleccionada}>${h} HS - ${sala.nombre} - ${dinero(sala.precio)}</option>`;
    });
  });
  document.querySelector("#compra-funcion").innerHTML = opciones;

  navegar("compra");
  irAPaso(1);
}

function leerFuncionElegida() {
  const partes = document.querySelector("#compra-funcion").value.split("|");
  const fecha = document.querySelector("#compra-fecha").value;
  const cambio = fecha !== compra.fecha || Number(partes[0]) !== compra.sala || partes[1] !== compra.hora;
  compra.fecha = fecha;
  compra.sala = Number(partes[0]);
  compra.hora = partes[1];
  if (cambio) {
    compra.asientos = [];
  }
}

function irAPaso(numero) {
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
    document.querySelector("#precio-entrada").textContent = dinero(salaActual().precio);
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
  const ocupados = asientosOcupados();
  let html = "";

  ["A", "B", "C", "D", "E"].forEach((fila) => {
    html += `<div class="fila-asientos"><b>${fila}</b>`;
    for (let n = 1; n <= 8; n++) {
      const id = fila + n;
      if (ocupados.includes(id)) {
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
      <img src="${c.imagen}" alt="${c.nombre}">
      <div><h3>${c.nombre}</h3><p>${c.detalle}</p><strong>${dinero(c.precio)}</strong></div>
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

function calcularTotales() {
  const entradas = compra.asientos.length * salaActual().precio;
  let combosTotal = 0;
  combos.forEach((c) => { combosTotal += (compra.combos[c.id] || 0) * c.precio; });
  return { entradas: entradas, combos: combosTotal, total: entradas + combosTotal };
}

function mostrarResumen() {
  const t = calcularTotales();
  const sala = salaActual();
  document.querySelector("#resumen").innerHTML = `
    <h3>Detalle del pedido</h3>
    <div class="linea"><span>Película:</span><span>${peliculaActual.titulo}</span></div>
    <div class="linea"><span>Función:</span><span>${compra.fecha} · ${compra.hora} HS (${sala.formato})</span></div>
    <div class="linea"><span>Asientos:</span><span>${compra.asientos.join(", ")}</span></div>
    <div class="linea"><span>Entradas:</span><span>${dinero(t.entradas)}</span></div>
    <div class="linea"><span>Combos:</span><span>${dinero(t.combos)}</span></div>
    <div class="linea total"><span>TOTAL A PAGAR:</span><span>${dinero(t.total)}</span></div>`;
}

function pagar() {
  if (compra.asientos.length === 0) {
    alert("Elegí al menos un asiento antes de pagar.");
    return;
  }
  const yaTomados = asientosOcupados();
  if (compra.asientos.some((a) => yaTomados.includes(a))) {
    alert("Uno de los asientos ya fue comprado. Elegí otros.");
    irAPaso(2);
    return;
  }

  const sala = salaActual();
  const codigo = "CM-" + String(Date.now()).slice(-6);
  const lista = leerCompras();
  lista.push({
    id: "compra-" + Date.now(),
    usuarioId: idDueno(),
    codigo: codigo,
    peliculaId: peliculaActual.id,
    pelicula: peliculaActual.titulo,
    fecha: compra.fecha,
    hora: compra.hora,
    sala: sala.nombre,
    formato: sala.formato,
    asientos: compra.asientos,
    combos: compra.combos,
    total: calcularTotales().total,
    estado: "confirmada",
    claveFuncion: claveFuncion(),
    creada: Date.now()
  });
  localStorage.setItem("cineMatchCompras", JSON.stringify(lista));

  agregarNotificacion("Reserva confirmada:", "Tu compra para " + peliculaActual.titulo + " ha sido procesada con éxito.");

  document.querySelector("#exito-detalle").innerHTML = `
    <div class="linea"><span>Código de reserva:</span><strong>#${codigo}</strong></div>
    <div class="linea"><span>Película:</span><strong>${peliculaActual.titulo}</strong></div>
    <div class="linea"><span>Asientos:</span><strong>${compra.asientos.join(", ")}</strong></div>`;

  compra.asientos = [];
  compra.combos = {};
  pasoActual = 5;
  document.querySelectorAll(".paso").forEach((p) => p.classList.add("oculto"));
  document.querySelector("#paso-exito").classList.remove("oculto");
}

// ===== Favoritos =====
function leerFavoritos() {
  return usuarioActual ? usuarioActual.favoritos : [];
}

function guardarFavoritos(lista) {
  if (usuarioActual) {
    usuarioActual.favoritos = lista;
    guardarUsuarios();
  }
}

function actualizarBotonFavorito() {
  const boton = document.querySelector("#boton-favorito");
  const esFavorita = leerFavoritos().includes(peliculaActual.id);
  boton.textContent = esFavorita ? "♥ En favoritos" : "♡ Guardar en favoritos";
  boton.classList.toggle("activo", esFavorita);
}

function alternarFavorito() {
  if (!usuarioActual) {
    avisarSinCuenta("guardar películas en favoritos");
    return;
  }
  let favoritos = leerFavoritos();
  if (favoritos.includes(peliculaActual.id)) {
    favoritos = favoritos.filter((id) => id !== peliculaActual.id);
    alert("La película se quitó de tus favoritos.");
  } else {
    favoritos.unshift(peliculaActual.id);
    alert("¡Película guardada en tus favoritos!");
  }
  guardarFavoritos(favoritos);
  actualizarBotonFavorito();
}

function quitarFavorito(id) {
  guardarFavoritos(leerFavoritos().filter((f) => f !== id));
  mostrarFavoritos();
  mostrarPerfil();
}

function tarjetaFavorita(p) {
  return `
    <article class="favorita">
      <button class="ver" onclick="verPelicula(${p.id})" title="Ver película">
        <img src="${p.imagen}" alt="${p.titulo}">
        <strong>${p.titulo}</strong>
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

function leerResenas() {
  return JSON.parse(localStorage.getItem("cineMatchResenas")) || [];
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

function publicarResena() {
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
  const lista = leerResenas();
  lista.unshift({ usuarioId: usuarioActual.id, peliculaId: peliculaActual.id, pelicula: peliculaActual.titulo, estrellas: estrellasElegidas, texto: texto, creada: Date.now() });
  localStorage.setItem("cineMatchResenas", JSON.stringify(lista));
  cerrarResena();
  verPelicula(peliculaActual.id);
  alert("¡Tu reseña se publicó y quedó guardada en tu perfil!");
}

// ===== Perfil =====
function mostrarPerfil() {
  const u = usuarioActual;
  document.querySelector("#perfil-invitado").classList.toggle("oculto", u !== null);
  document.querySelector("#perfil-contenido").classList.toggle("oculto", u === null);
  if (!u) {
    document.querySelector("#perfil-invitado").innerHTML = panelInvitado("Iniciá sesión o creá una cuenta para ver y editar tu perfil.");
    return;
  }

  const propias = leerResenas().filter((r) => r.usuarioId === u.id);
  document.querySelector("#perfil-foto").src = fotoDe(u);
  document.querySelector("#perfil-nombre").textContent = u.nombreCompleto || u.nombre;
  document.querySelector("#perfil-arroba").textContent = "@" + u.nombre;
  document.querySelector("#perfil-bio").textContent = u.bio || "Todavía no escribiste una biografía.";
  document.querySelector("#perfil-seguidores").textContent = usuarios.filter((x) => x.siguiendo.includes(u.id)).length;
  document.querySelector("#perfil-siguiendo").textContent = u.siguiendo.length;
  document.querySelector("#perfil-nresenas").textContent = (u.resenasBase || 0) + propias.length;

  document.querySelector("#perfil-resenas").innerHTML = propias.map((r) => {
    const fecha = new Date(r.creada).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
    return `
      <article class="mini-resena">
        <header><strong>${limpiar(r.pelicula)}</strong><span class="estrellas">${"★".repeat(r.estrellas)}${"☆".repeat(5 - r.estrellas)} (${r.estrellas}/5)</span></header>
        <p>${limpiar(r.texto)}</p>
        <small>Publicado el ${fecha}</small>
      </article>`;
  }).join("") || '<p class="vacio">Todavía no publicaste reseñas. ¡Calificá una película para que aparezca acá!</p>';

  document.querySelector("#perfil-favoritas").innerHTML =
    listaDeFavoritas().map(tarjetaFavorita).join("") || '<p class="vacio">Todavía no agregaste películas a tus favoritos.</p>';
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

function mostrarMisCompras() {
  mostrarAvisosCancelacion();

  const lista = leerCompras()
    .filter((c) => (c.usuarioId || 0) === idDueno())
    .sort((a, b) => b.creada - a.creada);
  if (lista.length === 0) {
    document.querySelector("#compras-lista").innerHTML = '<div class="panel vacio"><strong>Todavía no tenés compras.</strong><br>Cuando compres una entrada, va a aparecer acá.</div>';
    return;
  }

  document.querySelector("#compras-lista").innerHTML = lista.map((c) => {
    const cancelada = c.estado === "cancelada";
    const nombresCombos = combos
      .filter((combo) => c.combos[combo.id] > 0)
      .map((combo) => combo.nombre + " x" + c.combos[combo.id])
      .join(", ") || "Sin combos";
    const ultimaColumna = cancelada
      ? '<span>Los asientos fueron liberados.</span>'
      : `<button class="boton-cancelar" onclick="cancelarCompra('${c.id}')">Cancelar entrada</button>`;
    return `
      <article class="compra">
        <div class="compra-cabecera">
          <div><small>RESERVA #${c.codigo}</small><h3>${limpiar(c.pelicula)}</h3><p>${c.fecha} · ${c.hora} HS · ${c.sala}</p></div>
          <span class="estado ${c.estado}">${cancelada ? "Cancelada" : "Confirmada"}</span>
        </div>
        <div class="compra-datos">
          <div><span>Asientos</span><strong>${c.asientos.join(", ")}</strong></div>
          <div><span>Combos</span><strong>${nombresCombos}</strong></div>
          <div><span>Total pagado</span><strong>${dinero(c.total)}</strong></div>
          <div>${ultimaColumna}</div>
        </div>
      </article>`;
  }).join("");
}

function cancelarCompra(id) {
  const lista = leerCompras();
  const compraACancelar = lista.find((c) => c.id === id);
  if (!compraACancelar || compraACancelar.estado !== "confirmada") {
    return;
  }
  if ((compraACancelar.usuarioId || 0) !== idDueno()) {
    alert("Solo podés cancelar tus propias entradas.");
    return;
  }
  if (!confirm("¿Querés cancelar esta entrada? Los asientos van a volver a estar disponibles.")) {
    return;
  }
  compraACancelar.estado = "cancelada";
  localStorage.setItem("cineMatchCompras", JSON.stringify(lista));
  agregarNotificacion("Entrada cancelada:", "Cancelaste tu entrada para " + compraACancelar.pelicula + ". Los asientos quedaron disponibles.");

  avisosCancelacion.push("Los asientos " + compraACancelar.asientos.join(", ") + " de «" + limpiar(compraACancelar.pelicula) + "» fueron cancelados y quedaron disponibles.");
  sessionStorage.setItem("cineMatchAvisos", JSON.stringify(avisosCancelacion));
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
    agregarNotificacion("@" + usuarioActual.nombre, "comenzó a seguirte.", id);
  }
  guardarUsuarios();
  mostrarComunidad();
}

// ===== Notificaciones =====
// Cada notificación guarda a qué usuario pertenece
function leerTodasLasNotificaciones() {
  return JSON.parse(localStorage.getItem("cineMatchNotificaciones")) || [];
}

function leerNotificaciones() {
  if (!usuarioActual) {
    return [];
  }
  return leerTodasLasNotificaciones().filter((n) => n.usuarioId === usuarioActual.id);
}

function guardarNotificaciones(propias) {
  const ajenas = leerTodasLasNotificaciones().filter((n) => !usuarioActual || n.usuarioId !== usuarioActual.id);
  localStorage.setItem("cineMatchNotificaciones", JSON.stringify(propias.concat(ajenas)));
  actualizarPunto();
}

function agregarNotificacion(titulo, texto, paraUsuarioId) {
  const destino = paraUsuarioId === undefined ? idDueno() : paraUsuarioId;
  if (!destino) {
    return; // las compras sin cuenta no generan notificaciones
  }
  const todas = leerTodasLasNotificaciones();
  todas.unshift({ usuarioId: destino, titulo: titulo, texto: texto, creada: Date.now(), leida: false });
  localStorage.setItem("cineMatchNotificaciones", JSON.stringify(todas));
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
  const hayNuevas = leerNotificaciones().some((n) => !n.leida);
  document.querySelector("#punto-notificaciones").classList.toggle("oculto", !hayNuevas);
}

function mostrarNotificaciones() {
  if (!usuarioActual) {
    document.querySelector("#notificaciones-lista").innerHTML = panelInvitado("Iniciá sesión o creá una cuenta para ver tus notificaciones.");
    return;
  }
  const lista = leerNotificaciones();
  document.querySelector("#notificaciones-lista").innerHTML = lista.map((n) => `
    <div class="notificacion ${n.leida ? "" : "nueva"}">
      <p><strong>${limpiar(n.titulo)}</strong> ${limpiar(n.texto)}</p>
      <small>${haceCuanto(n.creada)}</small>
    </div>`).join("") || '<p class="vacio">No tenés notificaciones.</p>';

  lista.forEach((n) => { n.leida = true; });
  guardarNotificaciones(lista);
}

// ===== Administración =====
const nombresGenero = { "Sci-Fi": "Ciencia Ficción", "Drama": "Drama", "Accion": "Acción", "Comedia": "Comedia" };

function guardarPeliculas() {
  localStorage.setItem("cineMatchPeliculas", JSON.stringify(peliculas));
  mostrarInicio();
  mostrarCartelera();
  mostrarAdmin();
}

function mostrarFormularioPelicula() {
  if (!esAdmin()) { return; }
  document.querySelector("#form-pelicula").classList.toggle("oculto");
}

function agregarPelicula(event) {
  event.preventDefault();
  if (!esAdmin()) { return; }
  const imagen = document.querySelector("#ap-imagen").value.trim();
  if (!imagen.startsWith("https://")) {
    alert("La imagen tiene que ser una dirección web que empiece con https://");
    return;
  }
  const genero = document.querySelector("#ap-genero").value;
  peliculas.push({
    id: Date.now(),
    clasificacion: document.querySelector("#ap-clasificacion").value,
    director: limpiar(document.querySelector("#ap-director").value.trim()),
    titulo: limpiar(document.querySelector("#ap-titulo").value.trim()),
    genero: genero,
    generoCompleto: nombresGenero[genero],
    duracion: limpiar(document.querySelector("#ap-duracion").value.trim()),
    puntuacion: 0,
    formato: document.querySelector("#ap-formato").value,
    imagen: limpiar(imagen),
    descripcion: limpiar(document.querySelector("#ap-descripcion").value.trim())
  });
  document.querySelector("#form-pelicula").reset();
  document.querySelector("#form-pelicula").classList.add("oculto");
  guardarPeliculas();
  alert("La película se agregó a la cartelera.");
}

function eliminarPelicula(id) {
  if (!esAdmin()) { return; }
  if (!confirm("¿Querés sacar esta película de la cartelera?")) {
    return;
  }
  peliculas = peliculas.filter((p) => p.id !== id);
  guardarPeliculas();
}

function decidirReembolso(id, decision) {
  if (!esAdmin()) { return; }
  const lista = leerCompras();
  lista.find((c) => c.id === id).reembolso = decision;
  localStorage.setItem("cineMatchCompras", JSON.stringify(lista));
  mostrarAdmin();
}

function mostrarAdmin() {
  if (!esAdmin()) { return; }
  const compras = leerCompras();
  const confirmadas = compras.filter((c) => c.estado === "confirmada");
  const canceladas = compras.filter((c) => c.estado === "cancelada");
  let ventas = 0;
  let entradas = 0;
  confirmadas.forEach((c) => { ventas += c.total; entradas += c.asientos.length; });
  const pendientes = canceladas.filter((c) => !c.reembolso).length;

  document.querySelector("#admin-metricas").innerHTML = `
    <div class="metrica"><span>Ventas totales</span><strong>${dinero(ventas)}</strong></div>
    <div class="metrica"><span>Entradas vendidas</span><strong>${entradas}</strong></div>
    <div class="metrica"><span>Películas en cartelera</span><strong>${peliculas.length}</strong></div>
    <div class="metrica"><span>Reembolsos pendientes</span><strong>${pendientes}</strong></div>`;

  document.querySelector("#admin-peliculas").innerHTML = peliculas.map((p) => `
    <div class="admin-fila">
      <div><strong>${p.titulo}</strong><small>${p.generoCompleto} • ${p.duracion} • ${p.formato}</small></div>
      <button class="boton-cancelar chico" onclick="eliminarPelicula(${p.id})">Quitar</button>
    </div>`).join("") || '<p class="vacio">No hay películas en cartelera.</p>';

  document.querySelector("#admin-reembolsos").innerHTML = canceladas.map((c) => {
    let acciones = `
      <div class="botones">
        <button class="boton chico" onclick="decidirReembolso('${c.id}', 'aprobado')">Aprobar</button>
        <button class="boton-borde chico" onclick="decidirReembolso('${c.id}', 'rechazado')">Rechazar</button>
      </div>`;
    if (c.reembolso) {
      acciones = `<span class="${c.reembolso}">${c.reembolso === "aprobado" ? "Aprobado" : "Rechazado"}</span>`;
    }
    return `
      <div class="admin-fila">
        <div><strong>Reserva #${c.codigo}</strong><small>${c.pelicula} • ${dinero(c.total)} • ${c.usuarioId ? "@" + nombreDe(c.usuarioId) : "sin cuenta"}</small></div>
        ${acciones}
      </div>`;
  }).join("") || '<p class="vacio">No hay solicitudes de reembolso.</p>';
}

actualizarCuenta();
cargarSesion();