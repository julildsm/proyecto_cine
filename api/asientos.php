<?php
//  asientos ocupados de una función

require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

$funcionId = filter_var($_GET["funcion_id"] ?? "", FILTER_VALIDATE_INT);
if ($funcionId === false) {
    responder(400, ["error" => "Falta el número de función."]);
}

try {
    $consulta = $conexion->prepare(
        "SELECT asiento FROM compra_asientos WHERE funcion_id = :funcion_id ORDER BY asiento"
    );
    $consulta->execute(["funcion_id" => $funcionId]);
    responder(200, $consulta->fetchAll(PDO::FETCH_COLUMN));
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener los asientos."]);
}
