
CREATE DATABASE IF NOT EXISTS cinematch
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinematch;


CREATE TABLE IF NOT EXISTS usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(24)  NOT NULL,
  nombre_completo VARCHAR(100) NULL,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  rol             ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
  bio             VARCHAR(200) NOT NULL DEFAULT '',
  foto            MEDIUMTEXT   NULL,
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_nombre UNIQUE (nombre),
  CONSTRAINT uq_usuarios_email  UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS salas (
  numero  TINYINT UNSIGNED PRIMARY KEY,
  nombre  VARCHAR(60) NOT NULL,
  formato ENUM('2D','3D','4D','IMAX') NOT NULL,
  precio  DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS peliculas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  titulo          VARCHAR(150) NOT NULL,
  genero          ENUM('Sci-Fi','Drama','Accion','Comedia') NOT NULL,
  genero_completo VARCHAR(80)  NOT NULL,
  duracion_min    SMALLINT UNSIGNED NOT NULL,
  clasificacion   ENUM('ATP','PG-13','R') NOT NULL,
  director        VARCHAR(100) NOT NULL,
  puntuacion      DECIMAL(2,1) NOT NULL DEFAULT 0,
  formato         ENUM('2D','3D','4D','IMAX') NOT NULL,
  imagen          VARCHAR(500) NOT NULL,
  descripcion     TEXT NOT NULL,
  activa          TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS proximos_estrenos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(150) NOT NULL,
  genero      VARCHAR(80)  NOT NULL,
  fecha_texto VARCHAR(40)  NOT NULL,
  imagen      VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS funciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pelicula_id INT NOT NULL,
  sala_numero TINYINT UNSIGNED NOT NULL,
  fecha       DATE NOT NULL,
  hora        TIME NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  CONSTRAINT uq_funcion UNIQUE (pelicula_id, sala_numero, fecha, hora),
  CONSTRAINT fk_funciones_pelicula FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
  CONSTRAINT fk_funciones_sala     FOREIGN KEY (sala_numero) REFERENCES salas(numero)
);

CREATE TABLE IF NOT EXISTS combos (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(80)  NOT NULL,
  detalle VARCHAR(200) NOT NULL,
  precio  DECIMAL(10,2) NOT NULL,
  imagen  VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS compras (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  codigo         VARCHAR(20) NOT NULL,
  usuario_id     INT NULL,
  funcion_id     INT NOT NULL,
  asientos_texto VARCHAR(255) NOT NULL,
  total          DECIMAL(10,2) NOT NULL,
  metodo_pago    VARCHAR(40) NOT NULL DEFAULT 'Tarjeta (simulado)',
  estado         ENUM('confirmada','cancelada') NOT NULL DEFAULT 'confirmada',
  reembolso      ENUM('pendiente','aprobado','rechazado') NULL,
  creada_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_compras_codigo UNIQUE (codigo),
  CONSTRAINT fk_compras_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_compras_funcion FOREIGN KEY (funcion_id) REFERENCES funciones(id)
);


CREATE TABLE IF NOT EXISTS compra_asientos (
  compra_id  INT NOT NULL,
  funcion_id INT NOT NULL,
  asiento    VARCHAR(4) NOT NULL,
  PRIMARY KEY (funcion_id, asiento),
  CONSTRAINT fk_ca_compra  FOREIGN KEY (compra_id)  REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT fk_ca_funcion FOREIGN KEY (funcion_id) REFERENCES funciones(id)
);

CREATE TABLE IF NOT EXISTS compra_combos (
  compra_id INT NOT NULL,
  combo_id  INT NOT NULL,
  cantidad  TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (compra_id, combo_id),
  CONSTRAINT fk_cc_compra FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT fk_cc_combo  FOREIGN KEY (combo_id)  REFERENCES combos(id)
);

CREATE TABLE IF NOT EXISTS resenas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  pelicula_id INT NOT NULL,
  estrellas   TINYINT UNSIGNED NOT NULL,
  texto       TEXT NOT NULL,
  creada_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_resena UNIQUE (usuario_id, pelicula_id),
  CONSTRAINT ck_estrellas CHECK (estrellas BETWEEN 1 AND 5),
  CONSTRAINT fk_resenas_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  CONSTRAINT fk_resenas_pelicula FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id  INT NOT NULL,
  pelicula_id INT NOT NULL,
  agregado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, pelicula_id),
  CONSTRAINT fk_fav_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  CONSTRAINT fk_fav_pelicula FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seguidores (
  seguidor_id INT NOT NULL,
  seguido_id  INT NOT NULL,
  desde       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (seguidor_id, seguido_id),
  CONSTRAINT ck_no_seguirse_a_si_mismo CHECK (seguidor_id <> seguido_id),
  CONSTRAINT fk_seg_seguidor FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_seg_seguido  FOREIGN KEY (seguido_id)  REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo     VARCHAR(100) NOT NULL,
  texto      VARCHAR(255) NOT NULL,
  leida      TINYINT(1) NOT NULL DEFAULT 0,
  creada_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT IGNORE INTO usuarios (id, nombre, nombre_completo, email, password_hash, rol, bio, foto) VALUES
  (1, 'admin', NULL, 'admin@cinematch.com', '$2y$10$w4pYrFarInvdK9952UlpWOsfSiPrHWpCEFPA1nz0u9LIWiOBF.ZMa', 'admin', 'Administración de Cine Match.', NULL),
  (2, 'cinefilo_99', 'Sofía Rodríguez', 'cinefilo@cinematch.com', '$2y$10$Xc17tJ6gp..aEvCOlGIK6OUUt61Ae3wCLTX8AfZ6a4AyN/jlqZzz2', 'usuario', 'Apasionada de la ciencia ficción, el cine de autor y las experiencias en pantalla gigante. Miembro activo de Cine Match.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'),
  (3, 'marcos_cines', 'Marcos Cine', 'marcos@cinematch.com', '$2y$10$Xc17tJ6gp..aEvCOlGIK6OUUt61Ae3wCLTX8AfZ6a4AyN/jlqZzz2', 'usuario', '', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'),
  (4, 'valeria_film', 'Valeria Gómez', 'valeria@cinematch.com', '$2y$10$Xc17tJ6gp..aEvCOlGIK6OUUt61Ae3wCLTX8AfZ6a4AyN/jlqZzz2', 'usuario', '', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100');

INSERT IGNORE INTO salas (numero, nombre, formato, precio) VALUES
  (1, 'Sala 1 - IMAX Láser', 'IMAX', 12.00),
  (3, 'Sala 3 - 3D Atmos', '3D', 10.00),
  (4, 'Sala 4 - 2D Tradicional', '2D', 8.00);

INSERT IGNORE INTO peliculas (id, titulo, genero, genero_completo, duracion_min, clasificacion, director, puntuacion, formato, imagen, descripcion) VALUES
  (1, 'Dune: Part Two', 'Sci-Fi', 'Ciencia Ficción / Aventura', 165, 'PG-13', 'Denis Villeneuve', 4.8, 'IMAX', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400', 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.'),
  (2, 'Oppenheimer', 'Drama', 'Drama / Historia', 180, 'R', 'Christopher Nolan', 4.5, '2D', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400', 'La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la primera bomba atómica.'),
  (3, 'Poor Things', 'Comedia', 'Fantasía / Comedia', 141, 'R', 'Yorgos Lanthimos', 4.2, '2D', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400', 'Bella Baxter explora el mundo y descubre nuevas ideas sobre la libertad, la identidad y su propia vida.'),
  (4, 'The Zone of Interest', 'Drama', 'Drama / Bélico', 105, 'PG-13', 'Jonathan Glazer', 4.6, '2D', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400', 'La vida cotidiana de una familia que vive junto al campo de concentración de Auschwitz.'),
  (5, 'Civil War', 'Accion', 'Acción / Thriller', 109, 'R', 'Alex Garland', 4, '3D', 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=400', 'En un futuro cercano, un grupo de periodistas viaja por un país dividido por una guerra civil.');

INSERT IGNORE INTO combos (id, nombre, detalle, precio, imagen) VALUES
  (1, 'Combo Popcorn Dúo', '1 pochoclo gigante + 2 bebidas medianas', 14.5, 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300'),
  (2, 'Combo Individual Pro', '1 pochoclo mediano + 1 bebida grande + golosina', 9.5, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300'),
  (3, 'Combo Nachos Especial', '1 porción de nachos con queso + 1 bebida grande', 11, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300');

INSERT INTO proximos_estrenos (titulo, genero, fecha_texto, imagen)
SELECT * FROM (
  SELECT 'Joker: Folie à Deux' AS titulo, 'Thriller / Musical' AS genero, 'Próximo mes' AS fecha_texto, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400' AS imagen
  UNION ALL
  SELECT 'Furiosa: Mad Max', 'Acción / Aventura', 'En 2 semanas', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400'
) AS nuevos
WHERE NOT EXISTS (SELECT 1 FROM proximos_estrenos);

INSERT IGNORE INTO funciones (pelicula_id, sala_numero, fecha, hora, precio)
SELECT p.id, s.numero, CURDATE() + INTERVAL d.n DAY, h.hora, s.precio
FROM peliculas p
CROSS JOIN salas s
CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) d
JOIN (
  SELECT 1 AS sala, '16:30:00' AS hora UNION SELECT 1, '20:00:00'
  UNION SELECT 3, '18:15:00' UNION SELECT 3, '21:45:00'
  UNION SELECT 4, '15:00:00' UNION SELECT 4, '19:30:00'
) h ON h.sala = s.numero;

INSERT IGNORE INTO resenas (usuario_id, pelicula_id, estrellas, texto, creada_en) VALUES
  (2, 1, 5, 'Una experiencia audiovisual imponente en la sala IMAX. La banda sonora de Hans Zimmer retumba en todo el pecho. Obra maestra del cine de ciencia ficción moderno.', NOW() - INTERVAL 2 HOUR),
  (3, 3, 5, 'Increíbles actuaciones de Emma Stone y Willem Dafoe. La dirección de arte y el diseño de vestuario son fuera de serie.', NOW() - INTERVAL 1 DAY),
  (4, 4, 5, 'El diseño de sonido de esta película es probablemente de lo mejor del año. Perturbadora y brillante.', NOW() - INTERVAL 3 DAY);
