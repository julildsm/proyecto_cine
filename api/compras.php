<?php
//  mis compras 
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

session_start();

if (isset($_SESSION["usuario_id"])) {
    $donde = "c.usuario_id = ?";
    $datos = [$_SESSION["usuario_id"]];
} else {
    $codigos = array_values(array_filter(array_map("trim", explode(",", $_GET["codigos"] ?? ""))));
    if (count($codigos) === 0) {
        responder(200, []);
    }
    $donde = "c.usuario_id IS NULL AND c.codigo IN (" . implode(",", array_fill(0, count($codigos), "?")) . ")";
    $datos = $codigos;
}

try {
    $consulta = $conexion->prepare(
        "SELECT c.id, c.codigo, c.asientos_texto, c.total, c.estado, c.reembolso,
                UNIX_TIMESTAMP(c.creada_en) AS ts,
                p.titulo AS pelicula, f.fecha, TIME_FORMAT(f.hora, '%H:%i') AS hora, s.nombre AS sala_nombre,
                (SELECT GROUP_CONCAT(CONCAT(cb.nombre, ' x', cc.cantidad) SEPARATOR ', ')
                   FROM compra_combos cc JOIN combos cb ON cb.id = cc.combo_id
                  WHERE cc.compra_id = c.id) AS combos_texto
           FROM compras c
           JOIN funciones f ON f.id = c.funcion_id
           JOIN peliculas p ON p.id = f.pelicula_id
           JOIN salas s ON s.numero = f.sala_numero
          WHERE $donde
          ORDER BY c.id DESC"
    );
    $consulta->execute($datos);
    $compras = $consulta->fetchAll();

    foreach ($compras as &$compra) {
        $compra["id"] = (int) $compra["id"];
        $compra["total"] = (float) $compra["total"];
        $compra["ts"] = (int) $compra["ts"];
    }
    unset($compra);

    responder(200, $compras);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener las compras."]);
}
