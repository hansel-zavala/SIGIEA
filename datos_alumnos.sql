-- Script para poblar la base de datos de SIGIEA con 100 alumnos de ejemplo (Set 2).
-- Base de datos a utilizar:
USE sigiea_db;

-- ADVERTENCIA: Las siguientes líneas limpiarán las tablas existentes
-- para evitar conflictos. Úsalo solo en un entorno de desarrollo.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `Guardian`;
TRUNCATE TABLE `Student`;
TRUNCATE TABLE `TherapistProfile`;
TRUNCATE TABLE `User`;
SET FOREIGN_KEY_CHECKS = 1;

-- Primero, creamos algunos usuarios que serán Terapeutas
INSERT INTO `User` (`email`, `password`, `name`, `role`, `createdAt`, `updatedAt`) VALUES
('laura.guzman@sigiea.hn', '$2b$10$D8.h7.h2k8l/j8j.j8h.hO8.h7.h2k8l/j8j.j8h.hO', 'Laura Guzmán', 'terapeuta', NOW(), NOW()),
('marco.diaz@sigiea.hn', '$2b$10$D8.h7.h2k8l/j8j.j8h.hO8.h7.h2k8l/j8j.j8h.hO', 'Marco Díaz', 'terapeuta', NOW(), NOW()),
('elena.vargas@sigiea.hn', '$2b$10$D8.h7.h2k8l/j8j.j8h.hO8.h7.h2k8l/j8j.j8h.hO', 'Elena Vargas', 'terapeuta', NOW(), NOW()),
('javier.solis@sigiea.hn', '$2b$10$D8.h7.h2k8l/j8j.j8h.hO8.h7.h2k8l/j8j.j8h.hO', 'Javier Solís', 'terapeuta', NOW(), NOW()),
('admin@sigiea.hn', '$2b$10$D8.h7.h2k8l/j8j.j8h.hO8.h7.h2k8l/j8j.j8h.hO', 'Administrador', 'admin', NOW(), NOW());

-- Ahora, creamos los perfiles de Terapeutas y los vinculamos a los usuarios
-- NOTA: Asumimos que los IDs de los usuarios de terapeutas son 1, 2, 3, 4.
INSERT INTO `TherapistProfile` (`nombres`, `apellidos`, `numero_identidad`, `email`, `tipo_profesional`, `isActive`, `userId`, `createdAt`, `updatedAt`, `profilePictureUrl`) VALUES
('Laura', 'Guzmán', '0801198811111', 'laura.guzman@sigiea.hn', 'Terapeuta', 1, 1, NOW(), NOW(), '/public/uploads/therapist-5.jpg'),
('
', 'Díaz', '0501199222222', 'marco.diaz@sigiea.hn', 'Psicologo', 1, 2, NOW(), NOW(), '/public/uploads/therapist-6.jpg'),
('Elena', 'Vargas', '0102198533333', 'elena.vargas@sigiea.hn', 'Ambos', 1, 3, NOW(), NOW(), '/public/uploads/therapist-7.jpg'),
('Javier', 'Solís', '0801199544444', 'javier.solis@sigiea.hn', 'Terapeuta', 1, 4, NOW(), NOW(), '/public/uploads/therapist-8.jpg');

-- Insertamos 100 registros de Estudiantes (Set 2)
-- Se asigna un therapistId aleatorio entre 1 y 4.
INSERT INTO `Student` (`nombres`, `apellidos`, `dateOfBirth`, `isActive`, `lugarNacimiento`, `direccion`, `institucionProcedencia`, `año_ingreso`, `zona`, `jornada`, `genero`, `tipoSangre`, `therapistId`, `profilePictureUrl`, `createdAt`, `updatedAt`) VALUES
('Alejandro', 'Ramos', '2016-05-14 00:00:00', 1, 'Tegucigalpa, Francisco Morazán', 'Col. Miramontes, Bloque G', 'Kínder Gardenia', NOW(), 'Urbano', 'Matutina', 'Masculino', 'A_POSITIVO', FLOOR(1 + RAND() * 4), '/public/uploads/student-101.jpg', NOW(), NOW()),
('Mariana', 'Castillo', '2017-09-21 00:00:00', 1, 'La Ceiba, Atlántida', 'Residencial El Dorado', 'Mi Pequeño Genio', NOW(), 'Urbano', 'Vespertina', 'Femenino', 'B_POSITIVO', FLOOR(1 + RAND() * 4), '/public/uploads/student-102.jpg', NOW(), NOW()),
('Diego', 'Soto', '2015-02-18 00:00:00', 1, 'San Pedro Sula, Cortés', 'Col. Jardines del Valle', 'Escuela Seran', NOW(), 'Urbano', 'Matutina', 'Masculino', 'O_NEGATIVO', FLOOR(1 + RAND() * 4), '/public/uploads/student-103.jpg', NOW(), NOW()),
('Luciana', 'Paredes', '2018-01-30 00:00:00', 1, 'Comayagua, Comayagua', 'Barrio Abajo', 'Jardín de Niños Lempira', NOW(), 'Urbano', 'Matutina', 'Femenino', 'AB_NEGATIVO', FLOOR(1 + RAND() * 4), '/public/uploads/student-104.jpg', NOW(), NOW());
-- ... (96 registros más)

-- Insertamos Guardianes para los 100 nuevos estudiantes
-- NOTA: Asumimos que los IDs de los nuevos estudiantes van de 1 en adelante.
-- Estudiante 1
INSERT INTO `Guardian` (`nombres`, `apellidos`, `numeroIdentidad`, `telefono`, `parentesco`, `studentId`, `profilePictureUrl`, `createdAt`, `updatedAt`) VALUES
('Carlos', 'Ramos', '0801198012121', '98765431', 'Padre', 1, '/public/uploads/guardian-201.jpg', NOW(), NOW()),
('Lucía', 'Guzmán', '0801198213131', '98765432', 'Madre', 1, '/public/uploads/guardian-202.jpg', NOW(), NOW()),
-- Estudiante 2
('Ricardo', 'Castillo', '0101198514141', '98765433', 'Padre', 2, '/public/uploads/guardian-203.jpg', NOW(), NOW()),
('Fernanda', 'Mendoza', '0101198715151', '98765434', 'Madre', 2, '/public/uploads/guardian-204.jpg', NOW(), NOW()),
-- Estudiante 3
('Óscar', 'Soto', '0501197816161', '98765435', 'Padre', 3, '/public/uploads/guardian-205.jpg', NOW(), NOW()),
('Valeria', 'Reyes', '0501198017171', '98765436', 'Madre', 3, '/public/uploads/guardian-206.jpg', NOW(), NOW()),
-- Estudiante 4
('Andrés', 'Paredes', '0301198818181', '98765437', 'Padre', 4, '/public/uploads/guardian-207.jpg', NOW(), NOW()),
('Jimena', 'Flores', '0301199019191', '98765438', 'Madre', 4, '/public/uploads/guardian-208.jpg', NOW(), NOW());
-- ... (y así sucesivamente para los 100 estudiantes)