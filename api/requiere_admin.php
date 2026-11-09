<?php

require_once __DIR__ . "/requiere_login.php";

if (($_SESSION["usuario_rol"] ?? "") !== "admin") {
    responder(403, ["error" => "Esta acción es solo para el administrador."]);
}
