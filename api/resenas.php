<?php
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    require_once __DIR__ . "/requiere_login.php";

    $peliculaId = filter_var($_POST["pelicula_id"] ?? "", FILTER_VALIDATE_INT);
    $estrellas = filter_var($_POST["estrellas"] ?? "", FILTER_VALIDATE_INT);
    $texto = trim($_POST["texto"] ?? "");

    if ($peliculaId === false || $estrellas === false || $estrellas < 1 || $estrellas > 5) {
        responder(400, ["error" => "Elegí una película y una puntuación de 1 a 5 estrellas."]);
    }
    if ($texto === "" || mb_strlen($texto) > 1000) {
        responder(400, ["error" => "Escribí tu opinión (hasta 1000 caracteres)."]);
    }

    try {
        $consulta = $conexion->prepare(
            "INSERT INTO resenas (usuario_id, pelicula_id, estrellas, texto)
             VALUES (:usuario, :pelicula, :estrellas, :texto)
             ON DUPLICATE KEY UPDATE estrellas = VALUES(estrellas), texto = VALUES(texto), creada_en = CURRENT_TIMESTAMP"
        );
        $consulta->execute([
            "usuario" => $_SESSION["usuario_id"],
            "pelicula" => $peliculaId,
            "estrellas" => $estrellas,
            "texto" => $texto,
        ]);
        responder(200, ["mensaje" => "Reseña guardada."]);
    } catch (PDOException $e) {
        if ((int) $e->errorInfo[1] === 1452) { // la película no existe
            responder(400, ["error" => "Esa película no existe."]);
        }
        error_log($e->getMessage());
        responder(500, ["error" => "No se pudo guardar la reseña."]);
    }
}

$sql = "SELECT r.id, r.usuario_id, u.nombre AS usuario, r.pelicula_id, p.titulo AS pelicula,
               r.estrellas, r.texto, UNIX_TIMESTAMP(r.creada_en) AS ts
          FROM resenas r
          JOIN usuarios u ON u.id = r.usuario_id
          JOIN peliculas p ON p.id = r.pelicula_id";
$datos = [];

$peliculaId = filter_var($_GET["pelicula_id"] ?? "", FILTER_VALIDATE_INT);
$usuarioId = filter_var($_GET["usuario_id"] ?? "", FILTER_VALIDATE_INT);
if ($peliculaId !== false) {
    $sql .= " WHERE r.pelicula_id = :pelicula_id";
    $datos["pelicula_id"] = $peliculaId;
} elseif ($usuarioId !== false) {
    $sql .= " WHERE r.usuario_id = :usuario_id";
    $datos["usuario_id"] = $usuarioId;
}
$sql .= " ORDER BY r.creada_en DESC";

$limite = filter_var($_GET["recientes"] ?? "", FILTER_VALIDATE_INT);
if ($limite !== false && $limite > 0) {
    $sql .= " LIMIT " . min($limite, 20);
}

try {
    $consulta = $conexion->prepare($sql);
    $consulta->execute($datos);
    $resenas = $consulta->fetchAll();

    foreach ($resenas as &$resena) {
        $resena["id"] = (int) $resena["id"];
        $resena["usuario_id"] = (int) $resena["usuario_id"];
        $resena["pelicula_id"] = (int) $resena["pelicula_id"];
        $resena["estrellas"] = (int) $resena["estrellas"];
        $resena["ts"] = (int) $resena["ts"];
    }
    unset($resena);

    responder(200, $resenas);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener las reseñas."]);
}
