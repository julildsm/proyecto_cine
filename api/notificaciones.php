<?php
// api/notificaciones.php — notificaciones de la persona con sesión
//   GET  → lista (las más nuevas primero)
//   POST accion=leer → las marca todas como leídas
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/requiere_login.php";
require_once __DIR__ . "/conexion.php";

$usuarioId = $_SESSION["usuario_id"];

try {
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $conexion->prepare("UPDATE notificaciones SET leida = 1 WHERE usuario_id = :usuario")
                 ->execute(["usuario" => $usuarioId]);
        responder(200, ["mensaje" => "Notificaciones leídas."]);
    }

    $consulta = $conexion->prepare(
        "SELECT id, titulo, texto, leida, UNIX_TIMESTAMP(creada_en) AS ts
           FROM notificaciones WHERE usuario_id = :usuario ORDER BY id DESC LIMIT 50"
    );
    $consulta->execute(["usuario" => $usuarioId]);
    $lista = $consulta->fetchAll();

    foreach ($lista as &$notificacion) {
        $notificacion["id"] = (int) $notificacion["id"];
        $notificacion["leida"] = (int) $notificacion["leida"] === 1;
        $notificacion["ts"] = (int) $notificacion["ts"];
    }
    unset($notificacion);

    responder(200, $lista);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener las notificaciones."]);
}
