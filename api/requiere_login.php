<?php
// api/requiere_login.php — se incluye al principio de cada endpoint protegido
// (antes hay que incluir respuesta.php)

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION["usuario_id"])) {
    responder(401, ["error" => "Tenés que iniciar sesión."]);
}
