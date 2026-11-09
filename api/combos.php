<?php
// combos del candy bar (SELECT)
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

try {
    $consulta = $conexion->query("SELECT id, nombre, detalle, precio, imagen FROM combos ORDER BY id");
    $combos = $consulta->fetchAll();

    foreach ($combos as &$combo) {
        $combo["id"] = (int) $combo["id"];
        $combo["precio"] = (float) $combo["precio"];
    }
    unset($combo);

    responder(200, $combos);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener los combos."]);
}
