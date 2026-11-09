<?php

header("Content-Type: application/json; charset=utf-8");

function responder($codigo, $datos) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function exigirPost() {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        responder(405, ["error" => "Método no permitido"]);
    }
}
