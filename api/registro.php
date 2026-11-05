<?php
// api/registro.php — crea un usuario nuevo (INSERT). Siempre con rol "usuario".
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

exigirPost();

$nombre = trim($_POST["nombre"] ?? "");
$email = strtolower(trim($_POST["email"] ?? ""));
$password = $_POST["password"] ?? "";

if (!preg_match('/^[A-Za-z0-9_.]{3,24}$/', $nombre)) {
    responder(400, ["error" => "El nombre de usuario debe tener entre 3 y 24 caracteres: letras, números, _ o ."]);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
    responder(400, ["error" => "Ingresá un email válido."]);
}
if (strlen($password) < 8) {
    responder(400, ["error" => "La contraseña debe tener 8 caracteres o más."]);
}

try {
    $consulta = $conexion->prepare(
        "INSERT INTO usuarios (nombre, email, password_hash)
         VALUES (:nombre, :email, :hash)"
    );
    $consulta->execute([
        "nombre" => $nombre,
        "email" => $email,
        "hash" => password_hash($password, PASSWORD_DEFAULT),
    ]);
    $nuevoId = (int) $conexion->lastInsertId();

    // Notificación de bienvenida
    $aviso = $conexion->prepare(
        "INSERT INTO notificaciones (usuario_id, titulo, texto)
         VALUES (:id, :titulo, :texto)"
    );
    $aviso->execute([
        "id" => $nuevoId,
        "titulo" => "¡Bienvenido a Cine Match!",
        "texto" => "Tu cuenta fue creada con éxito.",
    ]);

    responder(201, ["mensaje" => "Usuario creado. Ya podés iniciar sesión."]);
} catch (PDOException $e) {
    if ((int) $e->errorInfo[1] === 1062) { // 1062 = valor repetido en un campo UNIQUE
        if (stripos($e->getMessage(), "uq_usuarios_nombre") !== false) {
            responder(409, ["error" => "Ese nombre de usuario ya está en uso."]);
        }
        responder(409, ["error" => "Ese email ya está registrado."]);
    }
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo crear el usuario."]);
}
