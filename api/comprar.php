<?php
// api/comprar.php — registra una compra (INSERT en compras, compra_asientos y compra_combos)
// Puede comprar cualquier persona. Si tiene sesión, la compra queda a su nombre.
// El total se calcula ACÁ con los precios de la base, no con lo que diga el navegador.
require_once __DIR__ . "/respuesta.php";
require_once __DIR__ . "/conexion.php";

session_start();
exigirPost();

// Corta con un error y deshace lo que se haya guardado a medias
function fallar($conexion, $codigo, $mensaje) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    responder($codigo, ["error" => $mensaje]);
}

$funcionId = filter_var($_POST["funcion_id"] ?? "", FILTER_VALIDATE_INT);
$asientos = array_values(array_unique(array_filter(array_map("trim", explode(",", $_POST["asientos"] ?? "")))));
$combosTexto = trim($_POST["combos"] ?? ""); // formato "1:2,3:1" (id:cantidad)

if ($funcionId === false || count($asientos) < 1 || count($asientos) > 10) {
    responder(400, ["error" => "Elegí una función y entre 1 y 10 asientos."]);
}
foreach ($asientos as $asiento) {
    if (!preg_match('/^[A-E][1-8]$/', $asiento)) {
        responder(400, ["error" => "Hay un asiento que no existe."]);
    }
}
sort($asientos, SORT_NATURAL);

$combos = [];
if ($combosTexto !== "") {
    foreach (explode(",", $combosTexto) as $par) {
        $partes = explode(":", $par);
        $comboId = filter_var($partes[0] ?? "", FILTER_VALIDATE_INT);
        $cantidad = filter_var($partes[1] ?? "", FILTER_VALIDATE_INT);
        if ($comboId === false || $cantidad === false || $cantidad < 1 || $cantidad > 20) {
            responder(400, ["error" => "Los combos elegidos no son válidos."]);
        }
        $combos[$comboId] = $cantidad;
    }
}

try {
    $conexion->beginTransaction();

    $consulta = $conexion->prepare(
        "SELECT f.id, f.precio, p.titulo
           FROM funciones f
           JOIN peliculas p ON p.id = f.pelicula_id
          WHERE f.id = :id AND f.fecha >= CURDATE() AND p.activa = 1"
    );
    $consulta->execute(["id" => $funcionId]);
    $funcion = $consulta->fetch();
    if (!$funcion) {
        fallar($conexion, 404, "Esa función ya no está disponible.");
    }

    $total = $funcion["precio"] * count($asientos);
    $precioCombo = $conexion->prepare("SELECT precio FROM combos WHERE id = :id");
    foreach ($combos as $comboId => $cantidad) {
        $precioCombo->execute(["id" => $comboId]);
        $combo = $precioCombo->fetch();
        if (!$combo) {
            fallar($conexion, 400, "Uno de los combos ya no existe.");
        }
        $total += $combo["precio"] * $cantidad;
    }
    $total = round($total, 2);

    $codigo = "CM-" . strtoupper(bin2hex(random_bytes(4)));
    $usuarioId = $_SESSION["usuario_id"] ?? null;

    $consulta = $conexion->prepare(
        "INSERT INTO compras (codigo, usuario_id, funcion_id, asientos_texto, total)
         VALUES (:codigo, :usuario, :funcion, :asientos, :total)"
    );
    $consulta->execute([
        "codigo" => $codigo,
        "usuario" => $usuarioId,
        "funcion" => $funcionId,
        "asientos" => implode(", ", $asientos),
        "total" => $total,
    ]);
    $compraId = (int) $conexion->lastInsertId();

    // La clave primaria (funcion_id, asiento) falla si alguien ya compró ese asiento
    $ocupar = $conexion->prepare(
        "INSERT INTO compra_asientos (compra_id, funcion_id, asiento) VALUES (:compra, :funcion, :asiento)"
    );
    foreach ($asientos as $asiento) {
        $ocupar->execute(["compra" => $compraId, "funcion" => $funcionId, "asiento" => $asiento]);
    }

    $guardarCombo = $conexion->prepare(
        "INSERT INTO compra_combos (compra_id, combo_id, cantidad) VALUES (:compra, :combo, :cantidad)"
    );
    foreach ($combos as $comboId => $cantidad) {
        $guardarCombo->execute(["compra" => $compraId, "combo" => $comboId, "cantidad" => $cantidad]);
    }

    if ($usuarioId !== null) {
        $aviso = $conexion->prepare(
            "INSERT INTO notificaciones (usuario_id, titulo, texto) VALUES (:usuario, :titulo, :texto)"
        );
        $aviso->execute([
            "usuario" => $usuarioId,
            "titulo" => "Reserva confirmada:",
            "texto" => "Tu compra para " . $funcion["titulo"] . " (asientos " . implode(", ", $asientos) . ") fue procesada con éxito.",
        ]);
    }

    $conexion->commit();
    responder(201, ["codigo" => $codigo, "total" => $total, "asientos" => implode(", ", $asientos)]);
} catch (PDOException $e) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    if ((int) $e->errorInfo[1] === 1062) { // valor repetido: el asiento ya estaba ocupado
        responder(409, ["error" => "Alguno de los asientos ya fue comprado. Elegí otros."]);
    }
    error_log($e->getMessage());
    responder(500, ["error" => "No se pudo registrar la compra."]);
}
