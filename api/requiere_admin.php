<?php
// api/requiere_admin.php — se incluye en los endpoints que solo puede usar el administrador
// El rol sale de la base de datos al iniciar sesión: el navegador no puede cambiarlo.

require_once __DIR__ . "/requiere_login.php";

if (($_SESSION["usuario_rol"] ?? "") !== "admin") {
    responder(403, ["error" => "Esta acción es solo para el administrador."]);
}
