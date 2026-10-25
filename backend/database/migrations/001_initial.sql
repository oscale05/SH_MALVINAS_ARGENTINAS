CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('operador','observador') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE uploads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    uploaded_by BIGINT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE origenes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE ejes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE secretarias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE subsecretarias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    secretaria_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    FOREIGN KEY (secretaria_id) REFERENCES secretarias(id)
);

CREATE TABLE direcciones_generales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subsecretaria_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id)
);

CREATE TABLE direcciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    direccion_general_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    FOREIGN KEY (direccion_general_id) REFERENCES direcciones_generales(id)
);

CREATE TABLE ingresos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    upload_id BIGINT UNSIGNED NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    imputacion VARCHAR(255) NOT NULL,
    presupuesto DECIMAL(18,2) NOT NULL DEFAULT 0,
    recaudado_fecha_1 DECIMAL(18,2) NOT NULL DEFAULT 0,
    recaudado_fecha_2 DECIMAL(18,2) NOT NULL DEFAULT 0,
    total DECIMAL(18,2) NOT NULL DEFAULT 0,
    porcentaje_rc DECIMAL(8,2) NULL,
    origen_id BIGINT UNSIGNED NULL,
    eje_id BIGINT UNSIGNED NULL,
    secretaria_id BIGINT UNSIGNED NULL,
    subsecretaria_id BIGINT UNSIGNED NULL,
    direccion_general_id BIGINT UNSIGNED NULL,
    direccion_id BIGINT UNSIGNED NULL,
    FOREIGN KEY (upload_id) REFERENCES uploads(id),
    FOREIGN KEY (origen_id) REFERENCES origenes(id),
    FOREIGN KEY (eje_id) REFERENCES ejes(id),
    FOREIGN KEY (secretaria_id) REFERENCES secretarias(id),
    FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id),
    FOREIGN KEY (direccion_general_id) REFERENCES direcciones_generales(id),
    FOREIGN KEY (direccion_id) REFERENCES direcciones(id)
);

CREATE TABLE concurrentes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

INSERT INTO users (username, password_hash, role) VALUES ('operador', '$2y$12$z.NEHC0GxW7b5A86wO4o7OwQeACLfqlFJ.xKP6Y7QuZ1GAAvbaD1K', 'operador');
