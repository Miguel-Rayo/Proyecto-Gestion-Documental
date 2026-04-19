USE documentsmanage;

CREATE TABLE sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL
);

CREATE TABLE areas ( -- NUEVA
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL
);

CREATE TABLE sedes_areas ( -- NUEVA
    id_sede INT,
    id_area INT,
    PRIMARY KEY (id_sede, id_area),
    FOREIGN KEY (id_sede) REFERENCES sedes(id),
    FOREIGN KEY (id_area) REFERENCES areas(id)
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    rol ENUM('ADMIN_GENERAL','ADMIN_LOCAL','GESTIONADOR','RADICADOR') NOT NULL,
    sede_id INT NULL,
    area_id INT NULL, -- NUEVA
    debe_seleccionar_area BOOLEAN DEFAULT TRUE, -- NUEVA
    password_hash VARCHAR(255) NOT NULL,
    debe_cambiar_password BOOLEAN DEFAULT TRUE, 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sede_id) REFERENCES sedes(id),
    FOREIGN KEY (area_id) REFERENCES areas(id), -- NUEVA
    CONSTRAINT fk_usuario_sede_area
        FOREIGN KEY (sede_id, area_id)
        REFERENCES sedes_areas(id_sede, id_area) -- NUEVA
);

CREATE TABLE documentos ( -- NUEVA
	id INT AUTO_INCREMENT PRIMARY KEY,
    numero_radicado VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    archivo LONGBLOB NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_gestion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('RADICADO','TRASLADADO','ACEPTADO','FINALIZADO') NOT NULL DEFAULT 'RADICADO',
    usuario_radicador INT NULL,
    usuario_responsable INT NULL, -- EL GESTIONADOR QUE TERMINA POR ACEPTARLO
    FOREIGN KEY (usuario_radicador) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_responsable) REFERENCES usuarios(id)
);

CREATE TABLE documentos_comentarios ( -- NUEVA
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_id INT NOT NULL,
    usuario_emisor INT,
    usuario_receptor INT,
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documento_id) REFERENCES documentos(id),
    FOREIGN KEY (usuario_emisor) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_receptor) REFERENCES usuarios(id)
);

INSERT INTO areas (nombre) VALUES
('Dirección y Gerencia General'),
('Administración'),
('Recursos Humanos'),
('Finanzas'),
('Contabilidad'),
('Tesorería'),
('Compras y Abastecimiento'),
('Logística'),
('Producción / Operaciones'),
('Calidad'),
('Investigación y Desarrollo (I+D)'),
('Tecnología de la Información (TI)'),
('Seguridad Informática'),
('Marketing'),
('Comunicación Corporativa'),
('Relaciones Públicas'),
('Ventas'),
('Atención al Cliente / Servicio Postventa'),
('Legal / Jurídico'),
('Cumplimiento Normativo (Compliance)'),
('Seguridad y Salud en el Trabajo'),
('Medio Ambiente / Sostenibilidad'),
('Planeación Estratégica'),
('Innovación'),
('Gestión de Proyectos'),
('Gestión de Riesgos'),
('Auditoría Interna'),
('Almacén / Inventarios'),
('Mantenimiento'),
('Ingeniería'),
('Diseño'),
('Comercial Internacional / Comercio Exterior'),
('Gestión de Proveedores'),
('Gestión de Talento'),
('Formación y Capacitación'),
('Bienestar y Cultura Organizacional'),
('Correspondencia y Gestión Documental');

INSERT INTO sedes (nombre, direccion, codigo_postal, ciudad, departamento) VALUES
('Sede Bogotá Centro', 'Carrera 7 # 32-16', '110311', 'Bogotá', 'Cundinamarca'),
('Sede Medellín El Poblado', 'Calle 10 # 43D-25', '050021', 'Medellín', 'Antioquia'),
('Sede Cali Norte', 'Avenida 6N # 23-45', '760001', 'Cali', 'Valle del Cauca'),
('Sede Barranquilla Centro', 'Carrera 54 # 72-110', '080001', 'Barranquilla', 'Atlántico'),
('Sede Cartagena Bocagrande', 'Avenida San Martín # 6-52', '130001', 'Cartagena', 'Bolívar'),
('Sede Bucaramanga Cabecera', 'Calle 48 # 31-15', '680001', 'Bucaramanga', 'Santander'),
('Sede Manizales Centro', 'Carrera 23 # 26-30', '170001', 'Manizales', 'Caldas'),
('Sede Pereira Circunvalar', 'Avenida Circunvalar # 12-40', '660001', 'Pereira', 'Risaralda'),
('Sede Santa Marta Rodadero', 'Carrera 2 # 15-30', '470001', 'Santa Marta', 'Magdalena'),
('Sede Cúcuta Centro', 'Avenida 5 # 10-22', '540001', 'Cúcuta', 'Norte de Santander'),
('Sede Ibagué Ambala', 'Carrera 3 # 20-55', '730001', 'Ibagué', 'Tolima'),
('Sede Villavicencio Llano', 'Calle 35 # 29-14', '500001', 'Villavicencio', 'Meta'),
('Sede Armenia El Bosque', 'Carrera 14 # 18-60', '630001', 'Armenia', 'Quindío'),
('Sede Montería Centro', 'Calle 29 # 8-40', '230001', 'Montería', 'Córdoba'),
('Sede Valledupar Centro', 'Carrera 9 # 16-35', '200001', 'Valledupar', 'Cesar'),
('Sede Pasto Centro', 'Calle 19 # 25-72', '520001', 'Pasto', 'Nariño'),
('Sede Neiva La Plata', 'Carrera 5 # 11-43', '410001', 'Neiva', 'Huila'),
('Sede Popayán Centro Histórico', 'Calle 5 # 7-65', '190001', 'Popayán', 'Cauca'),
('Sede Tunja Plaza Central', 'Carrera 11 # 20-30', '150001', 'Tunja', 'Boyacá'),
('Sede Sincelejo Norte', 'Carrera 21 # 25-18', '700001', 'Sincelejo', 'Sucre');

INSERT INTO sedes_areas (id_sede, id_area) VALUES
-- Sede 1
(1, 1), (1, 2), (1, 3), (1, 37),
-- Sede 2
(2, 1), (2, 4), (2, 37), (2, 2),
-- Sede 3
(3, 2), (3, 5), (3, 6), (3, 37), (3, 1),
-- Sede 4
(4, 1), (4, 7), (4, 37), (4, 2),
-- Sede 5
(5, 3), (5, 8), (5, 13), (5, 25), (5, 37), (5, 1), (5, 2),
-- Sede 6
(6, 2), (6, 9), (6, 37), (6, 1),
-- Sede 7
(7, 1), (7, 10), (7, 11), (7, 37), (7, 2),
-- Sede 8
(8, 4), (8, 12), (8, 37), (8, 1), (8, 2),
-- Sede 9
(9, 5), (9, 13), (9, 37), (9, 1), (9, 2),
-- Sede 10
(10, 6), (10, 14), (10, 37), (10, 1), (10, 2),
-- Sede 11
(11, 7), (11, 15), (11, 19), (11, 27), (11, 37), (11, 1), (11, 2),
-- Sede 12
(12, 8), (12, 16), (12, 20), (12, 37), (12, 1), (12, 2),
-- Sede 13
(13, 9), (13, 17), (13, 37), (13, 1), (13, 2),
-- Sede 14
(14, 10), (14, 18), (14, 37), (14, 1), (14, 2),
-- Sede 15
(15, 11), (15, 19), (15, 37), (15, 1), (15, 2),
-- Sede 16
(16, 12), (16, 20), (16, 37), (16, 1), (16, 2),
-- Sede 17
(17, 13), (17, 1), (17, 2), (17, 37),
-- Sede 18
(18, 14), (18, 3), (18, 37), (18, 1), (18, 2),
-- Sede 19
(19, 15), (19, 4), (19, 30), (19, 37), (19, 1), (19, 2),
-- Sede 20
(20, 16), (20, 5), (20, 6), (20, 37), (20, 1), (20, 2);