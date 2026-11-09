<?php
// funciones (día, hora, sala y precio) de los próximos días
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

$dias = 3;

$peliculaId = filter_var($_GET["pelicula_id"] ?? "", FILTER_VALIDATE_INT);

$sql = "SELECT f.id, f.pelicula_id, f.sala_numero, s.nombre AS sala_nombre, s.formato,
               f.fecha, TIME_FORMAT(f.hora, '%H:%i') AS hora, f.precio
          FROM funciones f
          JOIN salas s ON s.numero = f.sala_numero
         WHERE f.fecha >= CURDATE() AND f.fecha < CURDATE() + INTERVAL " . (int) $dias . " DAY";
$datos = [];

if ($peliculaId !== false) {
    $sql .= " AND f.pelicula_id = :pelicula_id";
    $datos["pelicula_id"] = $peliculaId;
}
$sql .= " ORDER BY f.fecha, f.hora";

try {
    $consulta = $conexion->prepare($sql);
    $consulta->execute($datos);
    $funciones = $consulta->fetchAll();

    foreach ($funciones as &$funcion) {
        $funcion["id"] = (int) $funcion["id"];
        $funcion["pelicula_id"] = (int) $funcion["pelicula_id"];
        $funcion["sala_numero"] = (int) $funcion["sala_numero"];
        $funcion["precio"] = (float) $funcion["precio"];
    }
    unset($funcion);

    responder(200, $funciones);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener las funciones."]);
}