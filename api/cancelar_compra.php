<?php
// cancela una compra y libera sus asientos 
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

session_start();
exigirPost();

$codigo = trim($_POST["codigo"] ?? "");
if ($codigo === "") {
    responder(400, ["error" => "Falta el código de la compra."]);
}

function fallar($conexion, $estado, $mensaje) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    responder($estado, ["error" => $mensaje]);
}

try {
    $conexion->beginTransaction();

    $consulta = $conexion->prepare(
        "SELECT c.id, c.usuario_id, c.estado, c.asientos_texto, p.titulo
           FROM compras c
           JOIN funciones f ON f.id = c.funcion_id
           JOIN peliculas p ON p.id = f.pelicula_id
          WHERE c.codigo = :codigo
            FOR UPDATE"
    );
    $consulta->execute(["codigo" => $codigo]);
    $compra = $consulta->fetch();

    if (!$compra) {
        fallar($conexion, 404, "No encontramos esa compra.");
    }
    $dueno = $compra["usuario_id"];
    $yo = $_SESSION["usuario_id"] ?? null;
    if ($dueno !== null && ($yo === null || (int) $dueno !== (int) $yo)) {
        fallar($conexion, 403, "Solo podés cancelar tus propias entradas.");
    }
    if ($compra["estado"] !== "confirmada") {
        fallar($conexion, 409, "Esa compra ya estaba cancelada.");
    }

    $conexion->prepare("UPDATE compras SET estado = 'cancelada', reembolso = 'pendiente' WHERE id = :id")
             ->execute(["id" => $compra["id"]]);
    $conexion->prepare("DELETE FROM compra_asientos WHERE compra_id = :id")
             ->execute(["id" => $compra["id"]]);

    if ($dueno !== null) {
        $conexion->prepare("INSERT INTO notificaciones (usuario_id, titulo, texto) VALUES (:usuario, :titulo, :texto)")
                 ->execute([
                     "usuario" => $dueno,
                     "titulo" => "Entrada cancelada:",
                     "texto" => "Cancelaste tu entrada para " . $compra["titulo"] . ". Los asientos quedaron disponibles y el reembolso está pendiente.",
                 ]);
    }

    $conexion->commit();
    responder(200, ["asientos" => $compra["asientos_texto"], "pelicula" => $compra["titulo"]]);
} catch (PDOException $e) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo cancelar la compra."]);
}
