-- Blog Platform | Final Exam schema (MariaDB / MySQL)
-- Import with phpMyAdmin (XAMPP) -> Import, or:  mysql -u root < database/schema.sql

CREATE DATABASE IF NOT EXISTS blog_platform
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog_platform;

-- Drop in dependency order so the script can be re-run from scratch
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id          INT          NOT NULL AUTO_INCREMENT,
  role        VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  encoder_id  VARCHAR(50)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_role (role)
) ENGINE=InnoDB;

-- roles.id and users.role_id are both signed INT so the foreign key is compatible
CREATE TABLE users (
  id            INT          NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255) NOT NULL,
  username      VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id       INT          NOT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id          INT      NOT NULL AUTO_INCREMENT,
  user_id     INT      NOT NULL,
  token_hash  CHAR(64) NOT NULL,            -- SHA-256 hex of the refresh JWT (the raw token is never stored)
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  KEY idx_refresh_user (user_id),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE posts (
  id          INT          NOT NULL AUTO_INCREMENT,
  author_id   INT          NOT NULL,
  title       VARCHAR(255) NOT NULL,
  content     TEXT         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_author (author_id),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- The three fixed roles
INSERT INTO roles (role, encoder_id) VALUES ('reader', 'system'), ('author', 'system'), ('admin', 'system');
