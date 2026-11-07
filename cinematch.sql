-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-11-2026 a las 00:29:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cinematch`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combos`
--

CREATE TABLE `combos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `detalle` varchar(200) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `combos`
--

INSERT INTO `combos` (`id`, `nombre`, `detalle`, `precio`, `imagen`) VALUES
(1, 'Combo Popcorn Dúo', '1 pochoclo gigante + 2 bebidas medianas', 14.50, 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300'),
(2, 'Combo Individual Pro', '1 pochoclo mediano + 1 bebida grande + golosina', 9.50, 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300'),
(3, 'Combo Nachos Especial', '1 porción de nachos con queso + 1 bebida grande', 11.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `funcion_id` int(11) NOT NULL,
  `asientos_texto` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(40) NOT NULL DEFAULT 'Tarjeta (simulado)',
  `estado` enum('confirmada','cancelada') NOT NULL DEFAULT 'confirmada',
  `reembolso` enum('pendiente','aprobado','rechazado') DEFAULT NULL,
  `creada_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `codigo`, `usuario_id`, `funcion_id`, `asientos_texto`, `total`, `metodo_pago`, `estado`, `reembolso`, `creada_en`) VALUES
(1, 'CM-E2B7CD6D', 6, 66, 'C4', 22.50, 'Tarjeta (simulado)', 'cancelada', 'aprobado', '2026-11-06 01:52:00'),
(2, 'CM-4C6CC9EF', 6, 103, 'C4', 26.50, 'Tarjeta (simulado)', 'confirmada', NULL, '2026-11-07 17:42:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra_asientos`
--

CREATE TABLE `compra_asientos` (
  `compra_id` int(11) NOT NULL,
  `funcion_id` int(11) NOT NULL,
  `asiento` varchar(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compra_asientos`
--

INSERT INTO `compra_asientos` (`compra_id`, `funcion_id`, `asiento`) VALUES
(2, 103, 'C4');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra_combos`
--

CREATE TABLE `compra_combos` (
  `compra_id` int(11) NOT NULL,
  `combo_id` int(11) NOT NULL,
  `cantidad` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compra_combos`
--

INSERT INTO `compra_combos` (`compra_id`, `combo_id`, `cantidad`) VALUES
(1, 1, 1),
(2, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `usuario_id` int(11) NOT NULL,
  `pelicula_id` int(11) NOT NULL,
  `agregado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `favoritos`
--

INSERT INTO `favoritos` (`usuario_id`, `pelicula_id`, `agregado_en`) VALUES
(6, 1, '2026-11-06 01:52:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `funciones`
--

CREATE TABLE `funciones` (
  `id` int(11) NOT NULL,
  `pelicula_id` int(11) NOT NULL,
  `sala_numero` tinyint(3) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `funciones`
--

INSERT INTO `funciones` (`id`, `pelicula_id`, `sala_numero`, `fecha`, `hora`, `precio`) VALUES
(1, 1, 1, '2026-11-04', '20:00:00', 12.00),
(2, 1, 1, '2026-11-04', '16:30:00', 12.00),
(3, 1, 3, '2026-11-04', '21:45:00', 10.00),
(4, 1, 3, '2026-11-04', '18:15:00', 10.00),
(5, 1, 4, '2026-11-04', '19:30:00', 8.00),
(6, 1, 4, '2026-11-04', '15:00:00', 8.00),
(7, 2, 1, '2026-11-04', '20:00:00', 12.00),
(8, 2, 1, '2026-11-04', '16:30:00', 12.00),
(9, 2, 3, '2026-11-04', '21:45:00', 10.00),
(10, 2, 3, '2026-11-04', '18:15:00', 10.00),
(11, 2, 4, '2026-11-04', '19:30:00', 8.00),
(12, 2, 4, '2026-11-04', '15:00:00', 8.00),
(13, 3, 1, '2026-11-04', '20:00:00', 12.00),
(14, 3, 1, '2026-11-04', '16:30:00', 12.00),
(15, 3, 3, '2026-11-04', '21:45:00', 10.00),
(16, 3, 3, '2026-11-04', '18:15:00', 10.00),
(17, 3, 4, '2026-11-04', '19:30:00', 8.00),
(18, 3, 4, '2026-11-04', '15:00:00', 8.00),
(19, 4, 1, '2026-11-04', '20:00:00', 12.00),
(20, 4, 1, '2026-11-04', '16:30:00', 12.00),
(21, 4, 3, '2026-11-04', '21:45:00', 10.00),
(22, 4, 3, '2026-11-04', '18:15:00', 10.00),
(23, 4, 4, '2026-11-04', '19:30:00', 8.00),
(24, 4, 4, '2026-11-04', '15:00:00', 8.00),
(25, 5, 1, '2026-11-04', '20:00:00', 12.00),
(26, 5, 1, '2026-11-04', '16:30:00', 12.00),
(27, 5, 3, '2026-11-04', '21:45:00', 10.00),
(28, 5, 3, '2026-11-04', '18:15:00', 10.00),
(29, 5, 4, '2026-11-04', '19:30:00', 8.00),
(30, 5, 4, '2026-11-04', '15:00:00', 8.00),
(31, 1, 1, '2026-11-05', '20:00:00', 12.00),
(32, 1, 1, '2026-11-05', '16:30:00', 12.00),
(33, 1, 3, '2026-11-05', '21:45:00', 10.00),
(34, 1, 3, '2026-11-05', '18:15:00', 10.00),
(35, 1, 4, '2026-11-05', '19:30:00', 8.00),
(36, 1, 4, '2026-11-05', '15:00:00', 8.00),
(37, 2, 1, '2026-11-05', '20:00:00', 12.00),
(38, 2, 1, '2026-11-05', '16:30:00', 12.00),
(39, 2, 3, '2026-11-05', '21:45:00', 10.00),
(40, 2, 3, '2026-11-05', '18:15:00', 10.00),
(41, 2, 4, '2026-11-05', '19:30:00', 8.00),
(42, 2, 4, '2026-11-05', '15:00:00', 8.00),
(43, 3, 1, '2026-11-05', '20:00:00', 12.00),
(44, 3, 1, '2026-11-05', '16:30:00', 12.00),
(45, 3, 3, '2026-11-05', '21:45:00', 10.00),
(46, 3, 3, '2026-11-05', '18:15:00', 10.00),
(47, 3, 4, '2026-11-05', '19:30:00', 8.00),
(48, 3, 4, '2026-11-05', '15:00:00', 8.00),
(49, 4, 1, '2026-11-05', '20:00:00', 12.00),
(50, 4, 1, '2026-11-05', '16:30:00', 12.00),
(51, 4, 3, '2026-11-05', '21:45:00', 10.00),
(52, 4, 3, '2026-11-05', '18:15:00', 10.00),
(53, 4, 4, '2026-11-05', '19:30:00', 8.00),
(54, 4, 4, '2026-11-05', '15:00:00', 8.00),
(55, 5, 1, '2026-11-05', '20:00:00', 12.00),
(56, 5, 1, '2026-11-05', '16:30:00', 12.00),
(57, 5, 3, '2026-11-05', '21:45:00', 10.00),
(58, 5, 3, '2026-11-05', '18:15:00', 10.00),
(59, 5, 4, '2026-11-05', '19:30:00', 8.00),
(60, 5, 4, '2026-11-05', '15:00:00', 8.00),
(61, 1, 1, '2026-11-06', '20:00:00', 12.00),
(62, 1, 1, '2026-11-06', '16:30:00', 12.00),
(63, 1, 3, '2026-11-06', '21:45:00', 10.00),
(64, 1, 3, '2026-11-06', '18:15:00', 10.00),
(65, 1, 4, '2026-11-06', '19:30:00', 8.00),
(66, 1, 4, '2026-11-06', '15:00:00', 8.00),
(67, 2, 1, '2026-11-06', '20:00:00', 12.00),
(68, 2, 1, '2026-11-06', '16:30:00', 12.00),
(69, 2, 3, '2026-11-06', '21:45:00', 10.00),
(70, 2, 3, '2026-11-06', '18:15:00', 10.00),
(71, 2, 4, '2026-11-06', '19:30:00', 8.00),
(72, 2, 4, '2026-11-06', '15:00:00', 8.00),
(73, 3, 1, '2026-11-06', '20:00:00', 12.00),
(74, 3, 1, '2026-11-06', '16:30:00', 12.00),
(75, 3, 3, '2026-11-06', '21:45:00', 10.00),
(76, 3, 3, '2026-11-06', '18:15:00', 10.00),
(77, 3, 4, '2026-11-06', '19:30:00', 8.00),
(78, 3, 4, '2026-11-06', '15:00:00', 8.00),
(79, 4, 1, '2026-11-06', '20:00:00', 12.00),
(80, 4, 1, '2026-11-06', '16:30:00', 12.00),
(81, 4, 3, '2026-11-06', '21:45:00', 10.00),
(82, 4, 3, '2026-11-06', '18:15:00', 10.00),
(83, 4, 4, '2026-11-06', '19:30:00', 8.00),
(84, 4, 4, '2026-11-06', '15:00:00', 8.00),
(85, 5, 1, '2026-11-06', '20:00:00', 12.00),
(86, 5, 1, '2026-11-06', '16:30:00', 12.00),
(87, 5, 3, '2026-11-06', '21:45:00', 10.00),
(88, 5, 3, '2026-11-06', '18:15:00', 10.00),
(89, 5, 4, '2026-11-06', '19:30:00', 8.00),
(90, 5, 4, '2026-11-06', '15:00:00', 8.00),
(91, 1, 1, '2026-11-07', '20:00:00', 12.00),
(92, 1, 1, '2026-11-07', '16:30:00', 12.00),
(93, 1, 3, '2026-11-07', '21:45:00', 10.00),
(94, 1, 3, '2026-11-07', '18:15:00', 10.00),
(95, 1, 4, '2026-11-07', '19:30:00', 8.00),
(96, 1, 4, '2026-11-07', '15:00:00', 8.00),
(97, 2, 1, '2026-11-07', '20:00:00', 12.00),
(98, 2, 1, '2026-11-07', '16:30:00', 12.00),
(99, 2, 3, '2026-11-07', '21:45:00', 10.00),
(100, 2, 3, '2026-11-07', '18:15:00', 10.00),
(101, 2, 4, '2026-11-07', '19:30:00', 8.00),
(102, 2, 4, '2026-11-07', '15:00:00', 8.00),
(103, 3, 1, '2026-11-07', '20:00:00', 12.00),
(104, 3, 1, '2026-11-07', '16:30:00', 12.00),
(105, 3, 3, '2026-11-07', '21:45:00', 10.00),
(106, 3, 3, '2026-11-07', '18:15:00', 10.00),
(107, 3, 4, '2026-11-07', '19:30:00', 8.00),
(108, 3, 4, '2026-11-07', '15:00:00', 8.00),
(109, 4, 1, '2026-11-07', '20:00:00', 12.00),
(110, 4, 1, '2026-11-07', '16:30:00', 12.00),
(111, 4, 3, '2026-11-07', '21:45:00', 10.00),
(112, 4, 3, '2026-11-07', '18:15:00', 10.00),
(113, 4, 4, '2026-11-07', '19:30:00', 8.00),
(114, 4, 4, '2026-11-07', '15:00:00', 8.00),
(115, 5, 1, '2026-11-07', '20:00:00', 12.00),
(116, 5, 1, '2026-11-07', '16:30:00', 12.00),
(117, 5, 3, '2026-11-07', '21:45:00', 10.00),
(118, 5, 3, '2026-11-07', '18:15:00', 10.00),
(119, 5, 4, '2026-11-07', '19:30:00', 8.00),
(120, 5, 4, '2026-11-07', '15:00:00', 8.00),
(121, 1, 1, '2026-11-08', '20:00:00', 12.00),
(122, 1, 1, '2026-11-08', '16:30:00', 12.00),
(123, 1, 3, '2026-11-08', '21:45:00', 10.00),
(124, 1, 3, '2026-11-08', '18:15:00', 10.00),
(125, 1, 4, '2026-11-08', '19:30:00', 8.00),
(126, 1, 4, '2026-11-08', '15:00:00', 8.00),
(127, 2, 1, '2026-11-08', '20:00:00', 12.00),
(128, 2, 1, '2026-11-08', '16:30:00', 12.00),
(129, 2, 3, '2026-11-08', '21:45:00', 10.00),
(130, 2, 3, '2026-11-08', '18:15:00', 10.00),
(131, 2, 4, '2026-11-08', '19:30:00', 8.00),
(132, 2, 4, '2026-11-08', '15:00:00', 8.00),
(133, 3, 1, '2026-11-08', '20:00:00', 12.00),
(134, 3, 1, '2026-11-08', '16:30:00', 12.00),
(135, 3, 3, '2026-11-08', '21:45:00', 10.00),
(136, 3, 3, '2026-11-08', '18:15:00', 10.00),
(137, 3, 4, '2026-11-08', '19:30:00', 8.00),
(138, 3, 4, '2026-11-08', '15:00:00', 8.00),
(139, 4, 1, '2026-11-08', '20:00:00', 12.00),
(140, 4, 1, '2026-11-08', '16:30:00', 12.00),
(141, 4, 3, '2026-11-08', '21:45:00', 10.00),
(142, 4, 3, '2026-11-08', '18:15:00', 10.00),
(143, 4, 4, '2026-11-08', '19:30:00', 8.00),
(144, 4, 4, '2026-11-08', '15:00:00', 8.00),
(145, 5, 1, '2026-11-08', '20:00:00', 12.00),
(146, 5, 1, '2026-11-08', '16:30:00', 12.00),
(147, 5, 3, '2026-11-08', '21:45:00', 10.00),
(148, 5, 3, '2026-11-08', '18:15:00', 10.00),
(149, 5, 4, '2026-11-08', '19:30:00', 8.00),
(150, 5, 4, '2026-11-08', '15:00:00', 8.00),
(151, 1, 1, '2026-11-09', '20:00:00', 12.00),
(152, 1, 1, '2026-11-09', '16:30:00', 12.00),
(153, 1, 3, '2026-11-09', '21:45:00', 10.00),
(154, 1, 3, '2026-11-09', '18:15:00', 10.00),
(155, 1, 4, '2026-11-09', '19:30:00', 8.00),
(156, 1, 4, '2026-11-09', '15:00:00', 8.00),
(157, 2, 1, '2026-11-09', '20:00:00', 12.00),
(158, 2, 1, '2026-11-09', '16:30:00', 12.00),
(159, 2, 3, '2026-11-09', '21:45:00', 10.00),
(160, 2, 3, '2026-11-09', '18:15:00', 10.00),
(161, 2, 4, '2026-11-09', '19:30:00', 8.00),
(162, 2, 4, '2026-11-09', '15:00:00', 8.00),
(163, 3, 1, '2026-11-09', '20:00:00', 12.00),
(164, 3, 1, '2026-11-09', '16:30:00', 12.00),
(165, 3, 3, '2026-11-09', '21:45:00', 10.00),
(166, 3, 3, '2026-11-09', '18:15:00', 10.00),
(167, 3, 4, '2026-11-09', '19:30:00', 8.00),
(168, 3, 4, '2026-11-09', '15:00:00', 8.00),
(169, 4, 1, '2026-11-09', '20:00:00', 12.00),
(170, 4, 1, '2026-11-09', '16:30:00', 12.00),
(171, 4, 3, '2026-11-09', '21:45:00', 10.00),
(172, 4, 3, '2026-11-09', '18:15:00', 10.00),
(173, 4, 4, '2026-11-09', '19:30:00', 8.00),
(174, 4, 4, '2026-11-09', '15:00:00', 8.00),
(175, 5, 1, '2026-11-09', '20:00:00', 12.00),
(176, 5, 1, '2026-11-09', '16:30:00', 12.00),
(177, 5, 3, '2026-11-09', '21:45:00', 10.00),
(178, 5, 3, '2026-11-09', '18:15:00', 10.00),
(179, 5, 4, '2026-11-09', '19:30:00', 8.00),
(180, 5, 4, '2026-11-09', '15:00:00', 8.00),
(181, 1, 1, '2026-11-10', '20:00:00', 12.00),
(182, 1, 1, '2026-11-10', '16:30:00', 12.00),
(183, 1, 3, '2026-11-10', '21:45:00', 10.00),
(184, 1, 3, '2026-11-10', '18:15:00', 10.00),
(185, 1, 4, '2026-11-10', '19:30:00', 8.00),
(186, 1, 4, '2026-11-10', '15:00:00', 8.00),
(187, 2, 1, '2026-11-10', '20:00:00', 12.00),
(188, 2, 1, '2026-11-10', '16:30:00', 12.00),
(189, 2, 3, '2026-11-10', '21:45:00', 10.00),
(190, 2, 3, '2026-11-10', '18:15:00', 10.00),
(191, 2, 4, '2026-11-10', '19:30:00', 8.00),
(192, 2, 4, '2026-11-10', '15:00:00', 8.00),
(193, 3, 1, '2026-11-10', '20:00:00', 12.00),
(194, 3, 1, '2026-11-10', '16:30:00', 12.00),
(195, 3, 3, '2026-11-10', '21:45:00', 10.00),
(196, 3, 3, '2026-11-10', '18:15:00', 10.00),
(197, 3, 4, '2026-11-10', '19:30:00', 8.00),
(198, 3, 4, '2026-11-10', '15:00:00', 8.00),
(199, 4, 1, '2026-11-10', '20:00:00', 12.00),
(200, 4, 1, '2026-11-10', '16:30:00', 12.00),
(201, 4, 3, '2026-11-10', '21:45:00', 10.00),
(202, 4, 3, '2026-11-10', '18:15:00', 10.00),
(203, 4, 4, '2026-11-10', '19:30:00', 8.00),
(204, 4, 4, '2026-11-10', '15:00:00', 8.00),
(205, 5, 1, '2026-11-10', '20:00:00', 12.00),
(206, 5, 1, '2026-11-10', '16:30:00', 12.00),
(207, 5, 3, '2026-11-10', '21:45:00', 10.00),
(208, 5, 3, '2026-11-10', '18:15:00', 10.00),
(209, 5, 4, '2026-11-10', '19:30:00', 8.00),
(210, 5, 4, '2026-11-10', '15:00:00', 8.00),
(211, 6, 1, '2026-11-07', '20:00:00', 12.00),
(212, 6, 1, '2026-11-07', '16:30:00', 12.00),
(213, 6, 3, '2026-11-07', '21:45:00', 10.00),
(214, 6, 3, '2026-11-07', '18:15:00', 10.00),
(215, 6, 4, '2026-11-07', '19:30:00', 8.00),
(216, 6, 4, '2026-11-07', '15:00:00', 8.00),
(217, 6, 1, '2026-11-08', '20:00:00', 12.00),
(218, 6, 1, '2026-11-08', '16:30:00', 12.00),
(219, 6, 3, '2026-11-08', '21:45:00', 10.00),
(220, 6, 3, '2026-11-08', '18:15:00', 10.00),
(221, 6, 4, '2026-11-08', '19:30:00', 8.00),
(222, 6, 4, '2026-11-08', '15:00:00', 8.00),
(223, 6, 1, '2026-11-09', '20:00:00', 12.00),
(224, 6, 1, '2026-11-09', '16:30:00', 12.00),
(225, 6, 3, '2026-11-09', '21:45:00', 10.00),
(226, 6, 3, '2026-11-09', '18:15:00', 10.00),
(227, 6, 4, '2026-11-09', '19:30:00', 8.00),
(228, 6, 4, '2026-11-09', '15:00:00', 8.00),
(229, 6, 1, '2026-11-10', '20:00:00', 12.00),
(230, 6, 1, '2026-11-10', '16:30:00', 12.00),
(231, 6, 3, '2026-11-10', '21:45:00', 10.00),
(232, 6, 3, '2026-11-10', '18:15:00', 10.00),
(233, 6, 4, '2026-11-10', '19:30:00', 8.00),
(234, 6, 4, '2026-11-10', '15:00:00', 8.00),
(235, 6, 1, '2026-11-11', '20:00:00', 12.00),
(236, 6, 1, '2026-11-11', '16:30:00', 12.00),
(237, 6, 3, '2026-11-11', '21:45:00', 10.00),
(238, 6, 3, '2026-11-11', '18:15:00', 10.00),
(239, 6, 4, '2026-11-11', '19:30:00', 8.00),
(240, 6, 4, '2026-11-11', '15:00:00', 8.00),
(241, 6, 1, '2026-11-12', '20:00:00', 12.00),
(242, 6, 1, '2026-11-12', '16:30:00', 12.00),
(243, 6, 3, '2026-11-12', '21:45:00', 10.00),
(244, 6, 3, '2026-11-12', '18:15:00', 10.00),
(245, 6, 4, '2026-11-12', '19:30:00', 8.00),
(246, 6, 4, '2026-11-12', '15:00:00', 8.00),
(247, 6, 1, '2026-11-13', '20:00:00', 12.00),
(248, 6, 1, '2026-11-13', '16:30:00', 12.00),
(249, 6, 3, '2026-11-13', '21:45:00', 10.00),
(250, 6, 3, '2026-11-13', '18:15:00', 10.00),
(251, 6, 4, '2026-11-13', '19:30:00', 8.00),
(252, 6, 4, '2026-11-13', '15:00:00', 8.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `texto` varchar(255) NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `creada_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `usuario_id`, `titulo`, `texto`, `leida`, `creada_en`) VALUES
(1, 5, '¡Bienvenido a Cine Match!', 'Tu cuenta fue creada con éxito.', 0, '2026-11-05 01:19:19'),
(2, 6, '¡Bienvenido a Cine Match!', 'Tu cuenta fue creada con éxito.', 1, '2026-11-05 01:31:11'),
(3, 6, 'Reserva confirmada:', 'Tu compra para Dune: Part Two (asientos C4) fue procesada con éxito.', 1, '2026-11-06 01:52:00'),
(4, 6, 'Reserva confirmada:', 'Tu compra para Backrooms: Sin Salida (asientos C4) fue procesada con éxito.', 0, '2026-11-07 17:42:16'),
(5, 6, 'Entrada cancelada:', 'Cancelaste tu entrada para Dune: Part Two. Los asientos quedaron disponibles y el reembolso está pendiente.', 0, '2026-11-07 17:42:51'),
(6, 6, 'Reembolso aprobado:', 'Tu reembolso de $22.50 por Dune: Part Two fue aprobado.', 0, '2026-11-07 17:43:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `peliculas`
--

CREATE TABLE `peliculas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `genero` enum('Sci-Fi','Drama','Accion','Comedia') NOT NULL,
  `genero_completo` varchar(80) NOT NULL,
  `duracion_min` smallint(5) UNSIGNED NOT NULL,
  `clasificacion` enum('ATP','PG-13','R') NOT NULL,
  `director` varchar(100) NOT NULL,
  `puntuacion` decimal(2,1) NOT NULL DEFAULT 0.0,
  `formato` enum('2D','3D','4D','IMAX') NOT NULL,
  `imagen` varchar(500) NOT NULL,
  `descripcion` text NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `peliculas`
--

INSERT INTO `peliculas` (`id`, `titulo`, `genero`, `genero_completo`, `duracion_min`, `clasificacion`, `director`, `puntuacion`, `formato`, `imagen`, `descripcion`, `activa`) VALUES
(1, 'Dune: Part Two', 'Sci-Fi', 'Ciencia Ficción / Aventura', 165, 'PG-13', 'Denis Villeneuve', 4.8, 'IMAX', '../img/duna.jpg', 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.', 1),
(2, 'La Odisea', 'Drama', 'Drama / Historia', 180, 'R', 'Christopher Nolan', 4.5, '2D', '../img/odisea.jpg', 'La Odisea es una película épica de acción británica-estadounidense, escrita, dirigida y producida por Christopher Nolan. Está basada en el poema griego homónimo de Homero y protagonizada por Matt Damon en el papel de Odiseo, el rey griego de Ítaca', 1),
(3, 'Backrooms: Sin Salida', 'Comedia', 'Terror', 141, 'R', 'Kane Parsons', 4.2, '2D', '../img/backroom.jpg', 'Una puerta extraña aparece en el sótano de una tienda de muebles y da paso a habitaciones infinitas donde el tiempo se dobla y lo más aterrador es sentir algo acechando. Backrooms nace del folclore de internet.', 1),
(4, 'Obsession', 'Drama', 'Terror', 105, 'PG-13', 'Curry Barker\r\n', 4.6, '2D', '../img/obsession.jpg', 'Tras romper el misterioso Sauce de los Deseos para conquistar el corazón de la chica que le gusta, un romántico empedernido consigue exactamente lo que pidió, pero pronto descubre que algunos deseos tienen un precio oscuro y siniestro.', 1),
(5, 'Hail Mary', 'Accion', 'Acción / Thriller', 109, 'R', 'Phil Lord, Christopher Miller', 4.0, '3D', '../img/hailmary.jpg', 'El profesor Ryland Grace despierta en una nave espacial sin recordar quién es. Al recuperar la memoria, descubre que debe resolver el misterio de una sustancia que causa la extinción del Sol. Recurre a su formación científica e ingenio, aunque posiblemente no esté solo.', 1),
(6, 'Sinners', 'Sci-Fi', 'Ciencia Ficción', 152, 'ATP', 'juli ledesma', 0.0, '2D', '../img/pecadores.jpg', 'vampiros fin', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proximos_estrenos`
--

CREATE TABLE `proximos_estrenos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `genero` varchar(80) NOT NULL,
  `fecha_texto` varchar(40) NOT NULL,
  `imagen` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proximos_estrenos`
--

INSERT INTO `proximos_estrenos` (`id`, `titulo`, `genero`, `fecha_texto`, `imagen`) VALUES
(1, 'Avengers: Doomsday', 'Ciencia ficción/Acción', 'Próximo mes', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400'),
(2, 'Los juegos del hambre: amanecer en la cosecha', 'Acción / Aventura', 'En 2 semanas', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas`
--

CREATE TABLE `resenas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `pelicula_id` int(11) NOT NULL,
  `estrellas` tinyint(3) UNSIGNED NOT NULL,
  `texto` text NOT NULL,
  `creada_en` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Volcado de datos para la tabla `resenas`
--

INSERT INTO `resenas` (`id`, `usuario_id`, `pelicula_id`, `estrellas`, `texto`, `creada_en`) VALUES
(1, 2, 1, 5, 'Una experiencia audiovisual imponente en la sala IMAX. La banda sonora de Hans Zimmer retumba en todo el pecho. Obra maestra del cine de ciencia ficción moderno.', '2026-11-04 20:22:23'),
(2, 3, 3, 5, 'Me encantó. El ritmo definitivamente fue un poquito lento y en algunos momentos yo quería que pasara algo, lo que fuera, para que se apurara y ocurriera. Pero en general, de verdad, de verdad me gustó mucho más de lo que pensé que me iba a gustar.', '2026-11-03 22:22:23'),
(3, 4, 4, 5, 'El diseño de sonido de esta película es probablemente de lo mejor del año. Perturbadora y brillante.', '2026-11-01 22:22:23'),
(4, 6, 2, 3, 'CINE', '2026-11-06 01:51:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salas`
--

CREATE TABLE `salas` (
  `numero` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `formato` enum('2D','3D','4D','IMAX') NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `salas`
--

INSERT INTO `salas` (`numero`, `nombre`, `formato`, `precio`) VALUES
(1, 'Sala 1 - IMAX Láser', 'IMAX', 12.00),
(3, 'Sala 3 - 3D Atmos', '3D', 10.00),
(4, 'Sala 4 - 2D Tradicional', '2D', 8.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguidores`
--

CREATE TABLE `seguidores` (
  `seguidor_id` int(11) NOT NULL,
  `seguido_id` int(11) NOT NULL,
  `desde` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(24) NOT NULL,
  `nombre_completo` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('usuario','admin') NOT NULL DEFAULT 'usuario',
  `bio` varchar(200) NOT NULL DEFAULT '',
  `foto` mediumtext DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `nombre_completo`, `email`, `password_hash`, `rol`, `bio`, `foto`, `creado_en`) VALUES
(1, 'admin', NULL, 'admin@cinematch.com', '$2y$10$w4pYrFarInvdK9952UlpWOsfSiPrHWpCEFPA1nz0u9LIWiOBF.ZMa', 'admin', 'Administración de Cine Match.', NULL, '2026-11-04 22:22:22'),
(2, 'cinefilo_99', 'Sofía Rodríguez', 'cinefilo@cinematch.com', '$2y$10$Xc17tJ6gp..aEvCOlGIK6OUUt61Ae3wCLTX8AfZ6a4AyN/jlqZzz2', 'usuario', 'Apasionada de la ciencia ficción, el cine de autor y las experiencias en pantalla gigante. Miembro activo de Cine Match.', NULL, '2026-11-04 22:22:22'),
(3, 'marcos_cines', 'Marcos Cine', 'marcos@cinematch.com', '$2y$10$Xc17tJ6gp..aEvCOlGIK6OUUt61Ae3wCLTX8AfZ6a4AyN/jlqZzz2', 'usuario', '', NULL, '2026-11-04 22:22:22'),
(4, 'valeria_film', 'Valeria Gómez', 'valeria@cinematch.com', '$2y$10$Xc17tJ6gp..aEvCOlGIK6OUUt61Ae3wCLTX8AfZ6a4AyN/jlqZzz2', 'usuario', '', NULL, '2026-11-04 22:22:22'),
(5, 'luana', NULL, 'hola5@gmail.com', '$2y$10$I90/TtvqewfjdGpKsVp0EuHCHwzRZVbJs/W4Ve7Y9D1jaVaLrL2lq', 'usuario', '', NULL, '2026-11-05 01:19:19'),
(6, 'julipro', NULL, 'hola@gmail.com', '$2y$10$fA3q4ANVWTXJYI9QswWmbu72uOv1G3.ygUEwxzWh1xe0O9EMeNAmK', 'usuario', 'esto es cine muchachos', 'data:image/jpeg;base64,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', '2026-11-05 01:31:11');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `combos`
--
ALTER TABLE `combos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_compras_codigo` (`codigo`),
  ADD KEY `fk_compras_usuario` (`usuario_id`),
  ADD KEY `fk_compras_funcion` (`funcion_id`);

--
-- Indices de la tabla `compra_asientos`
--
ALTER TABLE `compra_asientos`
  ADD PRIMARY KEY (`funcion_id`,`asiento`),
  ADD KEY `fk_ca_compra` (`compra_id`);

--
-- Indices de la tabla `compra_combos`
--
ALTER TABLE `compra_combos`
  ADD PRIMARY KEY (`compra_id`,`combo_id`),
  ADD KEY `fk_cc_combo` (`combo_id`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`usuario_id`,`pelicula_id`),
  ADD KEY `fk_fav_pelicula` (`pelicula_id`);

--
-- Indices de la tabla `funciones`
--
ALTER TABLE `funciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_funcion` (`pelicula_id`,`sala_numero`,`fecha`,`hora`),
  ADD KEY `fk_funciones_sala` (`sala_numero`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_usuario` (`usuario_id`);

--
-- Indices de la tabla `peliculas`
--
ALTER TABLE `peliculas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proximos_estrenos`
--
ALTER TABLE `proximos_estrenos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_resena` (`usuario_id`,`pelicula_id`),
  ADD KEY `fk_resenas_pelicula` (`pelicula_id`);

--
-- Indices de la tabla `salas`
--
ALTER TABLE `salas`
  ADD PRIMARY KEY (`numero`);

--
-- Indices de la tabla `seguidores`
--
ALTER TABLE `seguidores`
  ADD PRIMARY KEY (`seguidor_id`,`seguido_id`),
  ADD KEY `fk_seg_seguido` (`seguido_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuarios_nombre` (`nombre`),
  ADD UNIQUE KEY `uq_usuarios_email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `combos`
--
ALTER TABLE `combos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `funciones`
--
ALTER TABLE `funciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=274;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `peliculas`
--
ALTER TABLE `peliculas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `proximos_estrenos`
--
ALTER TABLE `proximos_estrenos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `fk_compras_funcion` FOREIGN KEY (`funcion_id`) REFERENCES `funciones` (`id`),
  ADD CONSTRAINT `fk_compras_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `compra_asientos`
--
ALTER TABLE `compra_asientos`
  ADD CONSTRAINT `fk_ca_compra` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ca_funcion` FOREIGN KEY (`funcion_id`) REFERENCES `funciones` (`id`);

--
-- Filtros para la tabla `compra_combos`
--
ALTER TABLE `compra_combos`
  ADD CONSTRAINT `fk_cc_combo` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`),
  ADD CONSTRAINT `fk_cc_compra` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `fk_fav_pelicula` FOREIGN KEY (`pelicula_id`) REFERENCES `peliculas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `funciones`
--
ALTER TABLE `funciones`
  ADD CONSTRAINT `fk_funciones_pelicula` FOREIGN KEY (`pelicula_id`) REFERENCES `peliculas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_funciones_sala` FOREIGN KEY (`sala_numero`) REFERENCES `salas` (`numero`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD CONSTRAINT `fk_resenas_pelicula` FOREIGN KEY (`pelicula_id`) REFERENCES `peliculas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_resenas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `seguidores`
--
ALTER TABLE `seguidores`
  ADD CONSTRAINT `fk_seg_seguido` FOREIGN KEY (`seguido_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_seg_seguidor` FOREIGN KEY (`seguidor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
