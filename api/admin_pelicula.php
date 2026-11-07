<?php
// api/admin_pelicula.php — agregar o quitar una película de la cartelera. Solo administrador.
//   POST accion=agregar + datos de la película
//   POST accion=quitar  + id
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/requiere_admin.php";
require_once __DIR__ . "/conexion.php";

exigirPost();
$accion = $_POST["accion"] ?? "";

try {
    if ($accion === "quitar") {
        $id = filter_var($_POST["id"] ?? "", FILTER_VALIDATE_INT);
        if ($id === false) {
            responder(400, ["error" => "Falta la película."]);
        }
        // No se borra: se oculta, para no perder el historial de compras y reseñas
        $conexion->prepare("UPDATE peliculas SET activa = 0 WHERE id = :id")->execute(["id" => $id]);
        responder(200, ["mensaje" => "La película salió de la cartelera."]);
    }

    if ($accion !== "agregar") {
        responder(400, ["error" => "Acción no válida."]);
    }

    $generos = ["Sci-Fi" => "Ciencia Ficción", "Drama" => "Drama", "Accion" => "Acción", "Comedia" => "Comedia"];
    $titulo = trim($_POST["titulo"] ?? "");
    $genero = $_POST["genero"] ?? "";
    $formato = $_POST["formato"] ?? "";
    $clasificacion = $_POST["clasificacion"] ?? "";
    $director = trim($_POST["director"] ?? "");
    $imagen = trim($_POST["imagen"] ?? "");
    $descripcion = trim($_POST["descripcion"] ?? "");
    $duracion = trim($_POST["duracion"] ?? "");

    // La duración se acepta como "2h 10m", "2h" o solo minutos ("130")
    $minutos = 0;
    if (preg_match('/^(\d{1,2})\s*h(?:\s*(\d{1,2})\s*m?)?$/i', $duracion, $m)) {
        $minutos = (int) $m[1] * 60 + (int) ($m[2] ?? 0);
    } elseif (preg_match('/^\d{2,3}$/', $duracion)) {
        $minutos = (int) $duracion;
    }

    if ($titulo === "" || mb_strlen($titulo) > 150 || $director === "" || mb_strlen($director) > 100 || $descripcion === "") {
        responder(400, ["error" => "Completá título, director y descripción."]);
    }
    if (!isset($generos[$genero]) || !in_array($formato, ["2D", "3D", "4D", "IMAX"], true) || !in_array($clasificacion, ["ATP", "PG-13", "R"], true)) {
        responder(400, ["error" => "Género, formato o clasificación no válidos."]);
    }
    if ($minutos < 30 || $minutos > 400) {
        responder(400, ["error" => "La duración tiene que ser como 2h 10m."]);
    }
    // La imagen puede ser un archivo de la carpeta img (ej: ../img/matrix.jpg) o una dirección web con https://
    $esArchivoLocal = preg_match('#^\.\./img/[\w\-. ]+\.(jpe?g|png|webp|gif|avif)$#i', $imagen) === 1;
    if ((!$esArchivoLocal && strpos($imagen, "https://") !== 0) || strlen($imagen) > 500) {
        responder(400, ["error" => "La imagen tiene que ser un archivo de la carpeta img (ej: matrix.jpg) o una dirección web con https://"]);
    }

    $consulta = $conexion->prepare(
        "INSERT INTO peliculas (titulo, genero, genero_completo, duracion_min, clasificacion, director, formato, imagen, descripcion)
         VALUES (:titulo, :genero, :completo, :minutos, :clasificacion, :director, :formato, :imagen, :descripcion)"
    );
    $consulta->execute([
        "titulo" => $titulo, "genero" => $genero, "completo" => $generos[$genero], "minutos" => $minutos,
        "clasificacion" => $clasificacion, "director" => $director, "formato" => $formato,
        "imagen" => $imagen, "descripcion" => $descripcion,
    ]);
    $id = (int) $conexion->lastInsertId();

    // Funciones de los próximos 7 días en las 3 salas, como las películas de ejemplo
    $conexion->prepare(
        "INSERT IGNORE INTO funciones (pelicula_id, sala_numero, fecha, hora, precio)
         SELECT :id, s.numero, CURDATE() + INTERVAL d.n DAY, h.hora, s.precio
           FROM salas s
          CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) d
           JOIN (SELECT 1 AS sala, '16:30:00' AS hora UNION SELECT 1, '20:00:00'
                 UNION SELECT 3, '18:15:00' UNION SELECT 3, '21:45:00'
                 UNION SELECT 4, '15:00:00' UNION SELECT 4, '19:30:00') h ON h.sala = s.numero"
    )->execute(["id" => $id]);

    responder(201, ["id" => $id, "mensaje" => "La película se agregó a la cartelera."]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo guardar la película."]);
}