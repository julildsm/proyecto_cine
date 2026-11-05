<?php
// api/proximos.php — próximos estrenos (SELECT)
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

try {
    $consulta = $conexion->query(
        "SELECT id, titulo, genero, fecha_texto, imagen FROM proximos_estrenos ORDER BY id"
    );
    responder(200, $consulta->fetchAll());
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener los próximos estrenos."]);
}
