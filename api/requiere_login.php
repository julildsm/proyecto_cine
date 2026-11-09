<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION["usuario_id"])) {
    responder(401, ["error" => "Tenés que iniciar sesión."]);
}
