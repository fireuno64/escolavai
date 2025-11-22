-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: escolavai_db
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cpf_cnpj` varchar(18) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contrato`
--

DROP TABLE IF EXISTS `contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato` (
  `id` int NOT NULL AUTO_INCREMENT,
  `crianca_id` int NOT NULL,
  `responsavel_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `valor_anual` decimal(10,2) NOT NULL,
  `valor_mensal` decimal(10,2) NOT NULL,
  `status` enum('ATIVO','VENCIDO','CANCELADO','ARQUIVADO') COLLATE utf8mb4_unicode_ci DEFAULT 'ATIVO',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_cancelamento` date DEFAULT NULL,
  `motivo_cancelamento` text COLLATE utf8mb4_unicode_ci,
  `contrato_anterior_id` int DEFAULT NULL,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `responsavel_id` (`responsavel_id`),
  KEY `admin_id` (`admin_id`),
  KEY `contrato_anterior_id` (`contrato_anterior_id`),
  KEY `idx_crianca` (`crianca_id`),
  KEY `idx_status` (`status`),
  KEY `idx_datas` (`data_inicio`,`data_fim`),
  CONSTRAINT `contrato_ibfk_1` FOREIGN KEY (`crianca_id`) REFERENCES `crianca` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_ibfk_2` FOREIGN KEY (`responsavel_id`) REFERENCES `responsavel` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`),
  CONSTRAINT `contrato_ibfk_4` FOREIGN KEY (`contrato_anterior_id`) REFERENCES `contrato` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crianca`
--

DROP TABLE IF EXISTS `crianca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crianca` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `escola` varchar(255) DEFAULT NULL,
  `escola_id` int DEFAULT NULL,
  `horario` varchar(50) DEFAULT NULL,
  `horario_entrada` time DEFAULT NULL,
  `horario_saida` time DEFAULT NULL,
  `tipo_transporte` enum('ida_volta','so_ida','so_volta') DEFAULT 'ida_volta',
  `responsavel_id` int NOT NULL,
  `valor_contrato_anual` decimal(10,2) DEFAULT '0.00',
  `data_inicio_contrato` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `responsavel_id` (`responsavel_id`),
  KEY `fk_crianca_escola` (`escola_id`),
  CONSTRAINT `crianca_ibfk_1` FOREIGN KEY (`responsavel_id`) REFERENCES `responsavel` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_crianca_escola` FOREIGN KEY (`escola_id`) REFERENCES `escola` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `escola`
--

DROP TABLE IF EXISTS `escola`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escola` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `contato` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `admin_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `escola_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagamento`
--

DROP TABLE IF EXISTS `pagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `responsavelId` int NOT NULL,
  `criancaId` int DEFAULT NULL,
  `contrato_id` int DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `dataPagamento` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'Pendente',
  `admin_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `responsavelId` (`responsavelId`),
  KEY `admin_id` (`admin_id`),
  KEY `fk_pagamento_crianca` (`criancaId`),
  KEY `fk_pagamento_contrato` (`contrato_id`),
  CONSTRAINT `fk_pagamento_contrato` FOREIGN KEY (`contrato_id`) REFERENCES `contrato` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pagamento_crianca` FOREIGN KEY (`criancaId`) REFERENCES `crianca` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pagamento_ibfk_1` FOREIGN KEY (`responsavelId`) REFERENCES `responsavel` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pagamento_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `responsavel`
--

DROP TABLE IF EXISTS `responsavel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsavel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `enderecoId` int DEFAULT NULL,
  `senha` varchar(255) DEFAULT '123456',
  `valor_contrato` decimal(10,2) DEFAULT NULL,
  `data_inicio_contrato` date DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `adminId` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cpf_unique` (`cpf`),
  KEY `admin_id` (`admin_id`),
  KEY `fk_responsavel_admin` (`adminId`),
  CONSTRAINT `fk_responsavel_admin` FOREIGN KEY (`adminId`) REFERENCES `admin` (`id`),
  CONSTRAINT `responsavel_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-22 19:44:48
