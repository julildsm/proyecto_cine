<?php
// api/favoritos.php — películas favoritas de la persona con sesión
//   GET  → lista de ids de películas favoritas
//   POST pelicula_id → si ya era favorita la quita, si no la agrega
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/requiere_login.php";
require_once __DIR__ . "/conexion.php";

$usuarioId = $_SESSION["usuario_id"];

try {
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $peliculaId = filter_var($_POST["pelicula_id"] ?? "", FILTER_VALIDATE_INT);
        if ($peliculaId === false) {
            responder(400, ["error" => "Falta la película."]);
        }

        $quitar = $conexion->prepare("DELETE FROM favoritos WHERE usuario_id = :usuario AND pelicula_id = :pelicula");
        $quitar->execute(["usuario" => $usuarioId, "pelicula" => $peliculaId]);
        if ($quitar->rowCount() > 0) {
            responder(200, ["favorita" => false]);
        }

        $agregar = $conexion->prepare("INSERT INTO favoritos (usuario_id, pelicula_id) VALUES (:usuario, :pelicula)");
        $agregar->execute(["usuario" => $usuarioId, "pelicula" => $peliculaId]);
        responder(200, ["favorita" => true]);
    }

    $consulta = $conexion->prepare("SELECT pelicula_id FROM favoritos WHERE usuario_id = :usuario ORDER BY agregado_en DESC");
    $consulta->execute(["usuario" => $usuarioId]);
    responder(200, array_map("intval", $consulta->fetchAll(PDO::FETCH_COLUMN)));
} catch (PDOException $e) {
    if ((int) $e->errorInfo[1] === 1452) { // la película no existe
        responder(400, ["error" => "Esa película no existe."]);
    }
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron actualizar los favoritos."]);
}
