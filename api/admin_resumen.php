<?php
// api/admin_resumen.php — números del panel de administración. Solo administrador.
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/requiere_admin.php";
require_once __DIR__ . "/conexion.php";

try {
    $ventas = (float) $conexion->query("SELECT COALESCE(SUM(total), 0) FROM compras WHERE estado = 'confirmada'")->fetchColumn();
    $entradas = (int) $conexion->query("SELECT COUNT(*) FROM compra_asientos")->fetchColumn();
    $peliculas = (int) $conexion->query("SELECT COUNT(*) FROM peliculas WHERE activa = 1")->fetchColumn();

    $reembolsos = $conexion->query(
        "SELECT c.codigo, p.titulo AS pelicula, c.total, c.reembolso, u.nombre AS usuario
           FROM compras c
           JOIN funciones f ON f.id = c.funcion_id
           JOIN peliculas p ON p.id = f.pelicula_id
           LEFT JOIN usuarios u ON u.id = c.usuario_id
          WHERE c.estado = 'cancelada'
          ORDER BY c.id DESC"
    )->fetchAll();

    $pendientes = 0;
    foreach ($reembolsos as &$reembolso) {
        $reembolso["total"] = (float) $reembolso["total"];
        if ($reembolso["reembolso"] === "pendiente") {
            $pendientes++;
        }
    }
    unset($reembolso);

    responder(200, [
        "ventas" => $ventas,
        "entradas" => $entradas,
        "peliculas" => $peliculas,
        "pendientes" => $pendientes,
        "reembolsos" => $reembolsos,
    ]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo obtener el resumen."]);
}
