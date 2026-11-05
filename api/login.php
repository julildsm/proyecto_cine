<?php
// api/login.php — verifica usuario (o email) y contraseña (SELECT) e inicia la sesión
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

session_start();
exigirPost();

$dato = trim($_POST["usuario"] ?? "");
$password = $_POST["password"] ?? "";

if ($dato === "" || $password === "") {
    responder(400, ["error" => "Completá usuario y contraseña."]);
}

try {
    $consulta = $conexion->prepare(
        "SELECT id, nombre, rol, password_hash FROM usuarios
         WHERE email = :email OR nombre = :nombre
         LIMIT 1"
    );
    $consulta->execute(["email" => $dato, "nombre" => $dato]);
    $usuario = $consulta->fetch();
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo iniciar sesión."]);
}

if (!$usuario || !password_verify($password, $usuario["password_hash"])) {
    responder(401, ["error" => "El usuario o la contraseña no son correctos."]);
}

session_regenerate_id(true);
$_SESSION["usuario_id"] = (int) $usuario["id"];
$_SESSION["usuario_nombre"] = $usuario["nombre"];
$_SESSION["usuario_rol"] = $usuario["rol"];

responder(200, [
    "id" => (int) $usuario["id"],
    "nombre" => $usuario["nombre"],
    "rol" => $usuario["rol"],
]);
