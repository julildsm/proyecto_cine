<?php
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

try {
    $consulta = $conexion->query(
        "SELECT p.id, p.titulo, p.genero, p.genero_completo, p.duracion_min,
                p.clasificacion, p.director, p.puntuacion, p.formato, p.imagen, p.descripcion,
                (SELECT GROUP_CONCAT(DISTINCT s.formato ORDER BY s.formato)
                   FROM funciones f
                   JOIN salas s ON s.numero = f.sala_numero
                  WHERE f.pelicula_id = p.id) AS formatos
           FROM peliculas p
          WHERE p.activa = 1
          ORDER BY p.id"
    );
    $peliculas = $consulta->fetchAll();

    foreach ($peliculas as &$pelicula) {
        $pelicula["id"] = (int) $pelicula["id"];
        $pelicula["duracion_min"] = (int) $pelicula["duracion_min"];
        $pelicula["puntuacion"] = (float) $pelicula["puntuacion"];
        $pelicula["formatos"] = $pelicula["formatos"] ? explode(",", $pelicula["formatos"]) : [];
    }
    unset($pelicula);

    responder(200, $peliculas);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudieron obtener las películas."]);
}
