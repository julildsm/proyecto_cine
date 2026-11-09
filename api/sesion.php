<?php
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

session_start();

if (!isset($_SESSION["usuario_id"])) {
    responder(401, ["error" => "No iniciaste sesión."]);
}

try {
    $consulta = $conexion->prepare(
        "SELECT id, nombre, nombre_completo, rol, bio, foto FROM usuarios WHERE id = :id"
    );
    $consulta->execute(["id" => $_SESSION["usuario_id"]]);
    $usuario = $consulta->fetch();
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo consultar la sesión."]);
}

if (!$usuario) { // la cuenta fue eliminada
    $_SESSION = [];
    session_destroy();
    responder(401, ["error" => "No iniciaste sesión."]);
}

$usuario["id"] = (int) $usuario["id"];
responder(200, $usuario);
