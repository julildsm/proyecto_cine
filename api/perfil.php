<?php
// api/perfil.php — edita el perfil de quien tiene la sesión iniciada (UPDATE)
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/requiere_login.php";
require_once __DIR__ . "/conexion.php";

exigirPost();

$nombre = trim($_POST["nombre"] ?? "");
$bio = trim($_POST["bio"] ?? "");

if (!preg_match('/^[A-Za-z0-9_.]{3,24}$/', $nombre)) {
    responder(400, ["error" => "El nombre de usuario debe tener entre 3 y 24 caracteres: letras, números, _ o ."]);
}
if (mb_strlen($bio) > 200) {
    responder(400, ["error" => "La biografía puede tener hasta 200 caracteres."]);
}

$campos = ["nombre = :nombre", "bio = :bio"];
$datos = ["nombre" => $nombre, "bio" => $bio, "id" => $_SESSION["usuario_id"]];

// La foto solo se cambia si el formulario la envía ("" = quitar la foto)
if (isset($_POST["foto"])) {
    $foto = $_POST["foto"];
    if ($foto !== "" && (strpos($foto, "data:image/") !== 0 || strlen($foto) > 600000)) {
        responder(400, ["error" => "La foto no es válida o es demasiado grande."]);
    }
    $campos[] = "foto = :foto";
    $datos["foto"] = $foto === "" ? null : $foto;
}

try {
    $consulta = $conexion->prepare("UPDATE usuarios SET " . implode(", ", $campos) . " WHERE id = :id");
    $consulta->execute($datos);
    $_SESSION["usuario_nombre"] = $nombre;

    $lectura = $conexion->prepare(
        "SELECT id, nombre, nombre_completo, rol, bio, foto FROM usuarios WHERE id = :id"
    );
    $lectura->execute(["id" => $_SESSION["usuario_id"]]);
    $usuario = $lectura->fetch();
    $usuario["id"] = (int) $usuario["id"];
    responder(200, $usuario);
} catch (PDOException $e) {
    if ((int) $e->errorInfo[1] === 1062) { // nombre de usuario repetido
        responder(409, ["error" => "Ese nombre de usuario ya está en uso."]);
    }
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo guardar el perfil."]);
}