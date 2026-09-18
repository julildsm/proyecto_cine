 const peliculas = [
  {
    titulo: "Duna: Parte Dos",
    puntuacion: "Puntuación: 4.8 / 5",
    imagen: "img/duna.jpg"
  },
  {
    titulo: "La Odisea",
    puntuacion: "Puntuación: 4.9 / 5",
    imagen: "img/odisea.jpg"
  },
  {
    titulo: "backrooms",
    puntuacion: "Puntuación: 4.5 / 5",
    imagen:"img/backroom.jpg"
  },
  {
    titulo: "El planeta de los simios",
    puntuacion: "Puntuación: 4.3 / 5",
    imagen: "img/planeta de los simios.jpg"
  }
];

const contenedor = document.querySelector("#peliculas");

let peliculaElegida = "";
let horarioElegido = "";

peliculas.forEach((pelicula) => {
  contenedor.innerHTML += `
    <article class="pelicula">
      <img src="${pelicula.imagen}" alt="Poster de ${pelicula.titulo}">
      <div class="pelicula-info">
        <h3>${pelicula.titulo}</h3>
        <p>${pelicula.puntuacion}</p>
        <button class="boton" onclick="verPelicula('${pelicula.titulo}')">
          Ver funciones
        </button>
      </div>
    </article>
  `;
});

function verPelicula(titulo) {
  peliculaElegida = titulo;
  horarioElegido = "";

  document.querySelector("#tituloPelicula").textContent = titulo;
  document.querySelector("#mensajeHorario").textContent = "";
  document.querySelector("#botonComprar").classList.add("oculto");
  document.querySelector("#ventanaFunciones").classList.remove("oculto");

  document.querySelectorAll(".horario").forEach((boton) => {
    boton.classList.remove("seleccionado");
  });
}

function cerrarFunciones() {
  document.querySelector("#ventanaFunciones").classList.add("oculto");
}

function seleccionarHorario(horario) {
  horarioElegido = horario;

  document.querySelectorAll(".horario").forEach((boton) => {
    boton.classList.remove("seleccionado");

    if (boton.textContent === horario) {
      boton.classList.add("seleccionado");
    }
  });

  document.querySelector("#mensajeHorario").textContent =
    "Elegiste la función de las " + horario + ".";

  document.querySelector("#botonComprar").classList.remove("oculto");
}

function comprarEntrada() {
  alert(
    "Compra iniciada para " +
    peliculaElegida +
    ", función de las " +
    horarioElegido +
    "."
  );

  cerrarFunciones();
}
function abrirInicioSesion() {
  document.querySelector("#ventanaSesion").classList.remove("oculto");
  mostrarLogin();
}

function cerrarInicioSesion() {
  document.querySelector("#ventanaSesion").classList.add("oculto");
}

function mostrarRegistro() {
  document.querySelector("#formularioLogin").classList.add("oculto");
  document.querySelector("#formularioRegistro").classList.remove("oculto");
}

function mostrarLogin() {
  document.querySelector("#formularioRegistro").classList.add("oculto");
  document.querySelector("#formularioLogin").classList.remove("oculto");
}

function registrarUsuario(event) {
  event.preventDefault();

  const nombre = document.querySelector("#nombreRegistro").value;
  const email = document.querySelector("#emailRegistro").value;
  const clave = document.querySelector("#claveRegistro").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const existeUsuario = usuarios.find((usuario) => usuario.email === email);

  if (existeUsuario) {
    alert("Ya existe una cuenta registrada con ese correo.");
    return;
  }

  usuarios.push({
    nombre: nombre,
    email: email,
    clave: clave
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("La cuenta fue creada correctamente.");

  document.querySelector("#emailLogin").value = email;
  document.querySelector("#claveLogin").value = "";
  document.querySelector("#formularioRegistro form").reset();

  mostrarLogin();
}

function iniciarSesion(event) {
 function iniciarSesion(event) {
  event.preventDefault();

  const email = document.querySelector("#emailLogin").value;
  const clave = document.querySelector("#claveLogin").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuarioEncontrado = usuarios.find((usuario) => {
    return usuario.email === email && usuario.clave === clave;
  });

  if (!usuarioEncontrado) {
    alert("El correo o la contraseña no son correctos.");
    return;
  }

  localStorage.setItem(
    "usuarioActual",
    JSON.stringify(usuarioEncontrado)
  );

  document.querySelector("#botonSesion").textContent =
    "Mi cuenta: " + usuarioEncontrado.nombre;

  mostrarPerfil();

  alert("Iniciaste sesión correctamente.");

  document.querySelector("#formularioLogin form").reset();
  cerrarInicioSesion();
}
}
function mostrarPerfil() {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
  const contenidoPerfil = document.querySelector("#contenidoPerfil");

  if (!usuarioActual) {
    contenidoPerfil.innerHTML = `
      <div class="tarjeta-perfil">
        <h3>Necesitás iniciar sesión</h3>
        <p>Ingresá con tu cuenta para ver tus compras, favoritos y reseñas.</p>
      </div>
    `;
    return;
  }

  contenidoPerfil.innerHTML = `
    <div class="perfil-encabezado">
      <div>
        <p class="etiqueta">USUARIO</p>
        <h3>${usuarioActual.nombre}</h3>
        <p>${usuarioActual.email}</p>
      </div>

      <button class="boton" onclick="cerrarSesion()">
        Cerrar sesión
      </button>
    </div>

    <div class="perfil-seccion">
      <h3>Mis compras y reservas</h3>
      <div class="tarjeta-perfil">
        <p>Todavía no tenés compras registradas.</p>
      </div>
    </div>

    <div class="perfil-seccion">
      <h3>Películas favoritas</h3>
      <div class="tarjeta-perfil">
        <p>Todavía no agregaste películas a favoritos.</p>
      </div>
    </div>

    <div class="perfil-seccion">
      <h3>Mis reseñas y puntuaciones</h3>
      <div class="tarjeta-perfil">
        <p>Todavía no publicaste reseñas.</p>
      </div>
    </div>
  `;
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActual");

  document.querySelector("#botonSesion").textContent = "Iniciar sesión";

  mostrarPerfil();
}

mostrarPerfil();