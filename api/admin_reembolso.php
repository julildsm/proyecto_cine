<?php
// aprobar o rechazar el reembolso de una compra cancelada. Solo administrador.
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/requiere_admin.php";
require_once __DIR__ . "/conexion.php";

exigirPost();

$codigo = trim($_POST["codigo"] ?? "");
$decision = $_POST["decision"] ?? "";
if ($codigo === "" || !in_array($decision, ["aprobado", "rechazado"], true)) {
    responder(400, ["error" => "Datos no válidos."]);
}

try {
    $consulta = $conexion->prepare(
        "SELECT c.id, c.usuario_id, c.total, p.titulo
           FROM compras c
           JOIN funciones f ON f.id = c.funcion_id
           JOIN peliculas p ON p.id = f.pelicula_id
          WHERE c.codigo = :codigo AND c.estado = 'cancelada'"
    );
    $consulta->execute(["codigo" => $codigo]);
    $compra = $consulta->fetch();
    if (!$compra) {
        responder(404, ["error" => "No hay una compra cancelada con ese código."]);
    }

    $conexion->prepare("UPDATE compras SET reembolso = :decision WHERE id = :id")
             ->execute(["decision" => $decision, "id" => $compra["id"]]);

    if ($compra["usuario_id"] !== null) {
        $conexion->prepare("INSERT INTO notificaciones (usuario_id, titulo, texto) VALUES (:usuario, :titulo, :texto)")
                 ->execute([
                     "usuario" => $compra["usuario_id"],
                     "titulo" => $decision === "aprobado" ? "Reembolso aprobado:" : "Reembolso rechazado:",
                     "texto" => "Tu reembolso de $" . number_format((float) $compra["total"], 2) . " por " . $compra["titulo"] . " fue " . $decision . ".",
                 ]);
    }
    responder(200, ["mensaje" => "Reembolso " . $decision . "."]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo actualizar el reembolso."]);
}
