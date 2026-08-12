-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: luvkush_natural
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `luvkush_natural`
--

/*!40000 DROP DATABASE IF EXISTS `luvkush_natural`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `luvkush_natural` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `luvkush_natural`;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int unsigned DEFAULT NULL,
  `old_values` text COLLATE utf8mb4_unicode_ci,
  `new_values` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_activity_logs_user` (`user_id`),
  CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `module`, `reference_type`, `reference_id`, `old_values`, `new_values`, `created_at`) VALUES (1,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 02:51:23'),(2,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 02:51:51'),(3,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 13:11:46'),(4,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:18:23'),(5,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:19:46'),(6,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:20:20'),(7,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:30:11'),(8,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:30:54'),(9,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:37:42'),(10,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:39:43'),(11,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:40:57'),(12,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 14:44:53'),(13,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:00:32'),(14,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:07:26'),(15,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:18:49'),(16,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:19:59'),(17,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:23:30'),(18,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:23:59'),(19,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 15:46:03'),(20,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 16:44:04'),(21,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 16:46:44'),(22,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 16:50:22'),(23,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 16:53:51'),(24,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 16:55:49'),(25,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 16:58:39'),(26,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:00:28'),(27,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:06:34'),(28,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:08:07'),(29,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:08:31'),(30,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:09:14'),(31,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:13:10'),(32,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:13:23'),(33,4,'product_updated','products','product',25,NULL,'{\"name\":\"Herbal Glow Cream\",\"status\":\"active\"}','2026-08-10 17:14:18'),(34,1,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@luvkushnatural.com\",\"role\":\"super_admin\"}','2026-08-10 17:14:25'),(35,4,'product_updated','products','product',25,NULL,'{\"name\":\"Herbal Glow Cream\",\"status\":\"active\"}','2026-08-10 17:14:37'),(36,1,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@luvkushnatural.com\",\"role\":\"super_admin\"}','2026-08-10 17:18:02'),(37,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:18:18'),(38,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:23:18'),(39,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:33:11'),(40,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:34:21'),(41,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-10 17:51:58'),(42,4,'admin_login','auth',NULL,NULL,NULL,'{\"email\":\"admin@localhost.com\",\"role\":\"admin\"}','2026-08-11 02:42:43');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Home',
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'India',
  `is_default` tinyint(1) DEFAULT '0',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` (`id`, `user_id`, `label`, `recipient_name`, `phone`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `country`, `is_default`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES (1,4,'Home','Kishan','7874569558','Rajkot','Rajkot','Rajkot','Gujarat','360004','India',1,NULL,NULL,'2026-08-10 14:23:52','2026-08-10 14:23:52'),(2,4,'Work','Khunt','7854856988','Rajkot','Rajkot','Rajkot','Gujarat','360005','India',0,NULL,NULL,'2026-08-10 14:24:37','2026-08-10 14:24:37');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int unsigned DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `reading_time_mins` int DEFAULT '5',
  `view_count` int unsigned NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_blog_posts_author` (`author_id`),
  CONSTRAINT `fk_blog_posts_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cart_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `variant_id` int unsigned DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `customisation_data` text COLLATE utf8mb4_unicode_ci,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cart_items_cart` (`cart_id`),
  KEY `fk_cart_items_product` (`product_id`),
  KEY `fk_cart_items_variant` (`variant_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `variant_id`, `quantity`, `unit_price`, `customisation_data`, `added_at`, `updated_at`) VALUES (1,1,13,NULL,3,549.00,NULL,'2026-08-10 02:52:06','2026-08-10 03:06:59'),(5,1,1,NULL,1,449.00,NULL,'2026-08-10 15:11:22','2026-08-10 15:11:22'),(6,1,9,NULL,1,399.00,NULL,'2026-08-10 17:08:43','2026-08-10 17:08:43');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` (`id`, `user_id`, `session_id`, `coupon_code`, `notes`, `created_at`, `updated_at`) VALUES (1,4,NULL,NULL,NULL,'2026-08-10 02:52:01','2026-08-10 02:52:01'),(2,3,NULL,NULL,NULL,'2026-08-10 17:18:48','2026-08-10 17:18:48');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` int unsigned DEFAULT NULL,
  `display_order` int unsigned DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `banner_url`, `icon`, `parent_id`, `display_order`, `is_featured`, `is_active`, `status`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES (15,'Men\'s Wigs','men-wigs','Premium quality wigs designed for men.',NULL,NULL,NULL,NULL,1,0,1,'active',NULL,NULL,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(16,'Ladies\' Wigs','ladies-wigs','Beautiful and natural looking wigs for women.',NULL,NULL,NULL,NULL,2,0,1,'active',NULL,NULL,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(17,'Hair Patches','hair-patches','Premium hair patches and toupees.',NULL,NULL,NULL,NULL,3,0,1,'active',NULL,NULL,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(18,'Hair Oil','hair-oil','Ancient herbs. Modern science. Real results.','/assets/images/ayurvedic_hair_oil.png',NULL,NULL,NULL,1,1,1,'active','Roots Grounded in Ayurveda','Ancient herbs. Modern science. Real results.','2026-08-03 13:33:33','2026-08-03 13:33:33'),(19,'Shampoo','shampoo','No sulphates. No parabens. Just Ayurveda.','/assets/images/ayurvedic_shampoo.png',NULL,NULL,NULL,2,1,1,'active','Clean Starts with Honest Ingredients','No sulphates. No parabens. Just Ayurveda.','2026-08-03 13:33:33','2026-08-03 13:33:33'),(20,'Hair Mask','hair-mask','Give your hair the treatment it deserves.','/assets/images/botanical-flatlay.jpg',NULL,NULL,NULL,3,1,1,'active','Your Weekly Hair Ritual','Give your hair the treatment it deserves.','2026-08-03 13:33:33','2026-08-03 13:33:33'),(21,'Soap','soap','Five thousand years of Ayurvedic skincare.','/assets/images/herbal-soap.jpg',NULL,NULL,NULL,4,1,1,'active','Bathe in Tradition','Five thousand years of Ayurvedic skincare.','2026-08-03 13:33:33','2026-08-03 13:33:33'),(22,'Face Care','face-care','Backed by Ayurveda. Proven by results.','/assets/images/face-serum.webp',NULL,NULL,NULL,5,1,1,'active','Glow from the Inside Out','Backed by Ayurveda. Proven by results.','2026-08-03 13:33:33','2026-08-03 13:33:33');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_queries`
--

DROP TABLE IF EXISTS `contact_queries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_queries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `query_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'website',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_queries`
--

LOCK TABLES `contact_queries` WRITE;
/*!40000 ALTER TABLE `contact_queries` DISABLE KEYS */;
INSERT INTO `contact_queries` (`id`, `name`, `email`, `phone`, `subject`, `message`, `query_type`, `status`, `source`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES (1,'Playwright QA','qa-test@example.com',NULL,NULL,'This is an automated verification message from the redesigned contact page.','general','open','website',NULL,NULL,'2026-08-10 02:31:09','2026-08-10 02:31:09'),(2,'Playwright QA 2','qa-test2@example.com',NULL,NULL,'Second verification pass.','general','open','website',NULL,NULL,'2026-08-10 02:32:14','2026-08-10 02:32:14');
/*!40000 ALTER TABLE `contact_queries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `usage_count` int NOT NULL DEFAULT '0',
  `usage_per_user` int NOT NULL DEFAULT '1',
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hair_solutions`
--

DROP TABLE IF EXISTS `hair_solutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hair_solutions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `base_price` decimal(10,2) NOT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `gender` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `colour_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `how_to_use` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'wig',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `product_id` int unsigned DEFAULT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'full_cod',
  `advance_amount` decimal(10,2) DEFAULT NULL,
  `hair_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cap_construction` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hair_source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `density` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available_lengths` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available_colors` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maintenance_level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` text COLLATE utf8mb4_unicode_ci,
  `is_featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_hair_solutions_product` (`product_id`),
  KEY `fk_hair_solutions_category` (`category_id`),
  CONSTRAINT `fk_hair_solutions_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hair_solutions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hair_solutions`
--

LOCK TABLES `hair_solutions` WRITE;
/*!40000 ALTER TABLE `hair_solutions` DISABLE KEYS */;
INSERT INTO `hair_solutions` (`id`, `category_id`, `name`, `slug`, `description`, `short_description`, `base_price`, `mrp`, `gender`, `size_info`, `colour_info`, `how_to_use`, `type`, `status`, `product_id`, `payment_mode`, `advance_amount`, `hair_type`, `cap_construction`, `hair_source`, `density`, `available_lengths`, `available_colors`, `maintenance_level`, `primary_image`, `images`, `is_featured`, `created_at`, `updated_at`) VALUES (1,15,'Signature Lace Front Wig — Men','signature-lace-front-wig-men','Swiss HD lace front with a bleached-knot hairline that disappears against the scalp. 100% Indian Remy hair, ethically sourced.','Swiss HD lace front with a bleached-knot hairline that disappears against the scalp. 100% Indian Remy hair, ethically sourced.',18999.00,24999.00,'male','Custom fitted','Natural Black / Dark Brown',NULL,'wig','active',NULL,'full_cod',NULL,'100% Human Remy Hair','Full Lace / Mono Top','Indian Temple Hair','130% Natural',NULL,NULL,'Low','/assets/images/premium_hair_wig.png','[\"/assets/images/premium_hair_wig.png\"]',1,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(2,15,'Everyday Comfort Wig — Men','everyday-comfort-wig-men','Breathable mono-top cap built for daily wear, with a soft density that reads naturally in any light.','Breathable mono-top cap built for daily wear, with a soft density that reads naturally in any light.',12999.00,16999.00,'male','Standard + adjustable','Natural Black',NULL,'wig','active',NULL,'full_cod',NULL,'100% Human Remy Hair','Full Lace / Mono Top','Indian Temple Hair','130% Natural',NULL,NULL,'Low','/assets/images/premium_hair_wig.png','[\"/assets/images/premium_hair_wig.png\"]',1,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(3,16,'Full Lace Human Hair Wig — Women','full-lace-human-hair-wig-women','Full Swiss lace, so you can part it anywhere. Virgin Indian hair with cuticles intact and aligned.','Full Swiss lace, so you can part it anywhere. Virgin Indian hair with cuticles intact and aligned.',26999.00,34999.00,'female','Custom fitted','Natural Black / Brown / Ombre',NULL,'wig','active',NULL,'full_cod',NULL,'100% Human Remy Hair','Full Lace / Mono Top','Indian Temple Hair','130% Natural',NULL,NULL,'Low','/assets/images/premium_hair_wig.png','[\"/assets/images/premium_hair_wig.png\"]',1,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(4,16,'Silk Straight Lace Wig — Women','silk-straight-lace-wig-women','Silk-base top that mimics a real scalp, finished with a hand-tied hairline for a flawless parting.','Silk-base top that mimics a real scalp, finished with a hand-tied hairline for a flawless parting.',21999.00,28999.00,'female','Custom fitted','Natural Black / Dark Brown',NULL,'wig','active',NULL,'full_cod',NULL,'100% Human Remy Hair','Full Lace / Mono Top','Indian Temple Hair','130% Natural',NULL,NULL,'Low','/assets/images/premium_hair_wig.png','[\"/assets/images/premium_hair_wig.png\"]',1,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(5,17,'Micro Thin Skin Hair Patch 0.03mm','micro-thin-skin-hair-patch-003mm','Ultra-thin poly base that melts into the scalp. Waterproof, breathable and invisible from every angle.','Ultra-thin poly base that melts into the scalp. Waterproof, breathable and invisible from every angle.',9999.00,13999.00,'unisex','8\" x 10\" (customisable)','Natural Black',NULL,'patch','active',NULL,'full_cod',NULL,'100% Human Remy Hair','Thin Skin Poly','Indian Temple Hair','130% Natural',NULL,NULL,'Low','/assets/images/hair_patch.png','[\"/assets/images/hair_patch.png\"]',1,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(6,17,'Mono Lace Durable Hair Patch','mono-lace-durable-hair-patch','Reinforced mono-lace base engineered for longevity without sacrificing a natural front hairline.','Reinforced mono-lace base engineered for longevity without sacrificing a natural front hairline.',11999.00,15999.00,'unisex','8\" x 10\" (customisable)','Natural Black / Dark Brown',NULL,'patch','active',NULL,'full_cod',NULL,'100% Human Remy Hair','Thin Skin Poly','Indian Temple Hair','130% Natural',NULL,NULL,'Low','/assets/images/hair_patch.png','[\"/assets/images/hair_patch.png\"]',1,'2026-08-03 13:33:33','2026-08-03 13:33:33');
/*!40000 ALTER TABLE `hair_solutions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'website',
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `variant_id` int unsigned DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int unsigned NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `primary_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  KEY `fk_order_items_variant` (`variant_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `product_name`, `variant_name`, `quantity`, `unit_price`, `mrp`, `total_amount`, `primary_image`, `created_at`) VALUES (1,1,13,NULL,'Amla Repair Hair Mask',NULL,1,549.00,699.00,549.00,'/assets/images/botanical-flatlay.jpg','2026-08-10 17:21:32');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `changed_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_status_history_order` (`order_id`),
  KEY `fk_order_status_history_user` (`changed_by`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_status_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_statuses`
--

DROP TABLE IF EXISTS `order_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_statuses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '#B87333',
  `sort_order` int unsigned DEFAULT '0',
  `is_system` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_statuses`
--

LOCK TABLES `order_statuses` WRITE;
/*!40000 ALTER TABLE `order_statuses` DISABLE KEYS */;
INSERT INTO `order_statuses` (`id`, `name`, `slug`, `color`, `sort_order`, `is_system`, `created_at`, `updated_at`) VALUES (1,'Order Placed','pending','#B87333',1,1,'2026-08-03 13:33:28','2026-08-10 17:56:58'),(2,'Confirmed','confirmed','#3182CE',2,1,'2026-08-03 13:33:28','2026-08-10 17:56:58'),(3,'Processing','processing','#805AD5',3,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(4,'Quality Check','quality_check','#319795',4,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(5,'Shipped','shipped','#D69E2E',5,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(6,'Out For Delivery','out_for_delivery','#4A5568',6,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(7,'Delivered','delivered','#38A169',7,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(8,'Cancelled','cancelled','#E53E3E',8,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(9,'Refund Requested','refund_requested','#DD6B20',9,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(10,'Refunded','refunded','#718096',10,1,'2026-08-03 13:33:28','2026-08-03 13:33:28'),(11,'Returned','returned','#E53E3E',11,1,'2026-08-03 13:33:28','2026-08-03 13:33:28');
/*!40000 ALTER TABLE `order_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipping_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coupon_discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_address` text COLLATE utf8mb4_unicode_ci,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `tracking_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shiprocket_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shiprocket_shipment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `advance_paid_amount` decimal(10,2) DEFAULT NULL,
  `has_custom_product` tinyint(1) DEFAULT '0',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_orders_number` (`order_number`),
  KEY `idx_orders_status` (`status`),
  KEY `fk_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id`, `user_id`, `order_number`, `status`, `payment_status`, `payment_method`, `subtotal`, `discount_amount`, `shipping_amount`, `tax_amount`, `total_amount`, `coupon_code`, `coupon_discount`, `shipping_address`, `billing_address`, `special_instructions`, `tracking_number`, `tracking_url`, `shiprocket_order_id`, `shiprocket_shipment_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `advance_paid_amount`, `has_custom_product`, `paid_at`, `created_at`, `updated_at`) VALUES (1,3,'LKN260810DA1CM','pending','pending','cod',549.00,0.00,99.00,99.00,747.00,NULL,0.00,'{\"full_name\":\"Kishan Khunt\",\"phone\":\"7874580988\",\"address_line1\":\"Rajkot\",\"address_line2\":\"Rajkot\",\"city\":\"Rajkot\",\"state\":\"Gujarat\",\"pincode\":\"360004\"}',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-10 17:21:32','2026-08-10 17:21:32');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `gateway` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payment_transactions_order` (`order_id`),
  CONSTRAINT `fk_payment_transactions_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_modifier` decimal(10,2) DEFAULT '0.00',
  `stock_quantity` int NOT NULL DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `how_to_use` text COLLATE utf8mb4_unicode_ci,
  `benefits` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `mrp` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_bestseller` tinyint(1) NOT NULL DEFAULT '0',
  `is_new` tinyint(1) NOT NULL DEFAULT '0',
  `primary_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` text COLLATE utf8mb4_unicode_ci,
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ingredients_list` text COLLATE utf8mb4_unicode_ci,
  `badges` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `length_cm` decimal(10,2) DEFAULT NULL,
  `width_cm` decimal(10,2) DEFAULT NULL,
  `height_cm` decimal(10,2) DEFAULT NULL,
  `dimensions` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LxWxH in mm',
  `reserved_quantity` int unsigned DEFAULT '0',
  `is_customisable` tinyint(1) DEFAULT '0',
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'full_cod',
  `advance_amount` decimal(10,2) DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `view_count` int unsigned NOT NULL DEFAULT '0',
  `wishlist_count` int unsigned NOT NULL DEFAULT '0',
  `sales_count` int unsigned NOT NULL DEFAULT '0',
  `rating_avg` decimal(3,2) DEFAULT '0.00',
  `rating_count` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_products_status` (`status`),
  KEY `fk_products_category` (`category_id`),
  KEY `fk_products_creator` (`created_by`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `sku`, `subtitle`, `description`, `short_description`, `how_to_use`, `benefits`, `price`, `mrp`, `cost_price`, `stock_quantity`, `status`, `is_featured`, `is_bestseller`, `is_new`, `primary_image`, `images`, `tags`, `ingredients_list`, `badges`, `seo_title`, `seo_description`, `seo_keywords`, `weight`, `length_cm`, `width_cm`, `height_cm`, `dimensions`, `reserved_quantity`, `is_customisable`, `payment_mode`, `advance_amount`, `created_by`, `view_count`, `wishlist_count`, `sales_count`, `rating_avg`, `rating_count`, `created_at`, `updated_at`) VALUES (1,18,'Bhringraj Hair Growth Oil','bhringraj-hair-growth-oil','LKN-HO-001','Ancient Ayurvedic Formula for Visible Hair Growth','Bhringraj — known as the \"King of Hair\" in Ayurveda — has been used for centuries to reverse hair thinning and stimulate scalp circulation. Luv Kush Natural\'s Bhringraj Hair Growth Oil is crafted through a slow-heat infusion process where fresh bhringraj leaves are simmered in organic sesame oil for over 48 hours, extracting the maximum potency of the herb.\n\nThe oil is further enriched with amla, brahmi, and neem to create a complete scalp treatment that addresses hair fall at its root cause — weak follicles and poor scalp circulation. Regular massage with this oil strengthens the hair shaft, reduces split ends, and leaves hair visibly thicker and fuller over time.\n\nFree from mineral oil, parabens, SLS, artificial fragrance, and silicones. Suitable for all hair types including coloured and chemically treated hair.','Rooted in Charaka Samhita tradition, our Bhringraj Hair Growth Oil combines cold-pressed bhringraj with sesame base to nourish roots, reduce hair fall, and promote thicker hair growth within 8–12 weeks of regular use.','1. Warm a small amount of oil between your palms.\n2. Part your hair into sections and apply directly to the scalp.\n3. Massage gently using circular motions for 5–10 minutes.\n4. Leave on for a minimum of 1 hour, or overnight for best results.\n5. Wash off with a mild sulphate-free shampoo.\n6. Use 2–3 times per week for optimal results.','Stimulates hair follicles and promotes new hair growth\nReduces hair fall by up to 70% with consistent use\nDeeply nourishes the scalp, eliminating dryness and flakiness\nStrengthens the hair shaft from root to tip\nImproves blood circulation to the scalp\nAdds natural shine and softness to dull, damaged hair\nDelays premature greying with regular use',449.00,599.00,189.00,150,'active',0,1,0,'/assets/images/ayurvedic_hair_oil.png','[\"/assets/images/ayurvedic_hair_oil.png\"]','hair growth, bhringraj, ayurvedic oil, hair fall control','Organic Sesame Oil (Sesamum indicum), Bhringraj Leaf Extract (Eclipta alba), Amla Extract (Phyllanthus emblica), Brahmi Extract (Bacopa monnieri), Neem Leaf Extract (Azadirachta indica), Hibiscus Flower Extract (Hibiscus rosa-sinensis), Curry Leaf Extract (Murraya koenigii), Natural Vitamin E (Tocopherol)','Bestseller','Bhringraj Hair Growth Oil — Ayurvedic Hair Fall Control | Luv Kush Natural','Shop Bhringraj Hair Growth Oil by Luv Kush Natural. Cold-pressed, 48-hour herbal infusion with amla & brahmi. Reduces hair fall, promotes growth. Free from mineral oil & parabens.','bhringraj hair oil, ayurvedic hair growth oil, hair fall control oil, bhringraj oil india, herbal hair oil, natural hair growth treatment',230.00,15.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,401,0,600,4.33,3,'2026-08-03 13:33:33','2026-08-10 03:06:11'),(2,18,'Amla Strengthening Oil','amla-strengthening-oil','LKN-HO-002','Vitamin C Rich Oil for Strong, Shiny Hair','Amla (Indian Gooseberry) is nature\'s most concentrated source of Vitamin C — up to 20 times richer than oranges — and has been the cornerstone of Ayurvedic hair care for over 3,000 years. Luv Kush Natural\'s Amla Strengthening Oil is made by slow-infusing sun-dried amla in virgin coconut oil, preserving the full spectrum of tannins, gallic acid, and antioxidants that make amla irreplaceable for hair health.\n\nThis oil is particularly effective for hair that has been weakened by heat styling, chemical treatments, hard water, or nutritional deficiencies. It fortifies the hair cuticle, prevents protein loss, and provides a natural lustre that no silicone-based serum can replicate.','Sun-dried Indian gooseberries cold-pressed into pure coconut oil to deliver concentrated Vitamin C directly to your scalp. Amla Strengthening Oil rebuilds keratin bonds, prevents breakage, and restores lost shine to brittle, overprocessed hair.','1. Take 2–3 ml oil in your palm and warm it slightly.\n2. Apply to the scalp and along the length of hair.\n3. Massage for 5 minutes with fingertips.\n4. Leave for at least 45 minutes before washing.\n5. Use 2–3 times weekly.','Rebuilds hair strength with natural Vitamin C and tannins\nPrevents protein loss and reduces breakage\nRestores shine to dull, overprocessed hair\nControls premature greying\nSoothes an irritated, itchy scalp\nImproves elasticity, reducing split ends',369.00,499.00,155.00,120,'active',0,0,1,'/assets/images/ayurvedic_hair_oil.png','[\"/assets/images/ayurvedic_hair_oil.png\"]','amla oil, vitamin c, hair strength, shine, ayurvedic','Virgin Coconut Oil (Cocos nucifera), Amla Extract (Phyllanthus emblica), Sesame Oil (Sesamum indicum), Fenugreek Seed Extract (Trigonella foenum-graecum), Black Sesame Seed Oil, Vitamin E (Tocopherol)','New','Amla Strengthening Oil — Natural Vitamin C Hair Oil | Luv Kush Natural','Luv Kush Natural Amla Strengthening Oil — sun-dried amla in virgin coconut oil. Rebuilds hair strength, prevents breakage, restores shine. 100% natural, no mineral oil.','amla hair oil, indian gooseberry oil, vitamin c hair oil, hair strengthening oil, amla coconut oil, anti breakage hair oil',230.00,15.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,491,0,157,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(3,18,'Hibiscus Nourishing Hair Oil','hibiscus-nourishing-hair-oil','LKN-HO-003','Flower-Infused Oil for Soft, Manageable Hair','In South Indian Ayurvedic tradition, hibiscus flowers and leaves have been used to make hair thicker, prevent premature greying, and add a natural conditioning effect that rivals commercial leave-in conditioners. Luv Kush Natural\'s Hibiscus Nourishing Hair Oil captures this tradition in a modern, lightweight formula that absorbs quickly without leaving a heavy residue.\n\nThe oil is enriched with castor oil for thickness and fenugreek for scalp health, creating a complete hair nourishment solution. Ideal for fine, wavy, or curly hair that needs deep moisture without being weighed down.','A luxuriously light, non-greasy hair oil infused with fresh hibiscus flowers and leaves. Rich in natural mucilage and amino acids, this oil conditions each strand from within, leaving hair exceptionally soft, tangle-free, and full of body.','1. Apply a few drops along the length of the hair and to the scalp.\n2. Massage gently for 3–5 minutes.\n3. Leave on for 1–2 hours or overnight.\n4. Wash with a gentle shampoo.\n5. Can also be used as a leave-in serum on damp hair (1–2 drops).','Adds exceptional softness and manageability\nReduces frizz and controls flyaways naturally\nPromotes hair thickness with natural mucilage\nPrevents premature greying\nConditions dry, brittle ends\nSuitable for fine hair — lightweight formula',499.00,649.00,210.00,100,'active',0,0,0,'/assets/images/ayurvedic_hair_oil.png','[\"/assets/images/ayurvedic_hair_oil.png\"]','hibiscus oil, hair nourishment, soft hair, natural conditioning','Sesame Oil (Sesamum indicum), Hibiscus Flower Extract (Hibiscus rosa-sinensis), Castor Oil (Ricinus communis), Fenugreek Seed Extract (Trigonella foenum-graecum), Aloe Vera Juice (Aloe barbadensis), Vitamin E (Tocopherol)',NULL,'Hibiscus Hair Oil — Flower-Infused Nourishing Oil for Soft Hair | Luv Kush Natural','Luv Kush Natural Hibiscus Nourishing Hair Oil — light, non-greasy formula with fresh hibiscus. Controls frizz, softens hair, prevents greying. Ideal for fine & curly hair.','hibiscus hair oil, flower hair oil, soft hair oil, anti frizz oil, natural hair conditioner oil, hibiscus for hair growth',230.00,15.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,582,0,194,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(4,18,'Onion Black Seed Hair Oil','onion-black-seed-hair-oil','LKN-HO-004','Clinically Proven Blend for Intense Hair Regrowth','Onion juice is one of the most clinically validated natural ingredients for hair regrowth, with published studies showing a significant reduction in hair fall and increase in hair density when applied topically. Kalonji (Nigella sativa) oil adds anti-inflammatory and antioxidant properties that protect the scalp from DHT — the primary driver of androgenetic hair loss.\n\nLuv Kush Natural\'s Onion Black Seed Hair Oil is carefully formulated to deliver maximum sulphur content without the harsh onion odour. We use a specialised cold-extraction process and blend the onion concentrate with rosemary essential oil (clinically shown to be as effective as minoxidil in peer-reviewed research) to create an odour-neutralised, highly effective hair regrowth treatment.','Our most targeted hair regrowth formula — combining sulphur-rich onion extract with kalonji (black seed) oil and rosemary. Clinically studied ingredients that activate dormant follicles and significantly reduce hair shedding within 4–6 weeks.','1. Apply directly to thinning areas and the entire scalp.\n2. Massage for 10 minutes using fingertip pressure.\n3. Leave on for at least 2 hours; overnight application recommended.\n4. Wash thoroughly with shampoo (may need 2 washes to remove).\n5. Use daily or every alternate day for best results.\n6. Visible results in 4–8 weeks of consistent use.','Activates dormant hair follicles for visible regrowth\nReduces hair fall caused by DHT sensitivity\nHigh sulphur content strengthens keratin bonds\nRosemary oil improves scalp circulation\nAnti-inflammatory — soothes scalp conditions\nNo harsh onion odour — neutralised formula',599.00,799.00,252.00,80,'active',0,1,0,'/assets/images/ayurvedic_hair_oil.png','[\"/assets/images/ayurvedic_hair_oil.png\"]','onion oil, kalonji, black seed, hair regrowth, hair fall','Castor Oil (Ricinus communis), Onion Extract (Allium cepa), Black Seed Oil/Kalonji (Nigella sativa), Rosemary Essential Oil (Rosmarinus officinalis), Bhringraj Extract (Eclipta alba), Vitamin E (Tocopherol), Sweet Almond Oil (Prunus dulcis)','Bestseller','Onion Black Seed Hair Oil — Regrowth Treatment Oil | Luv Kush Natural','Luv Kush Natural Onion Black Seed Hair Oil with sulphur-rich onion extract, kalonji & rosemary. Reduces hair fall, activates follicles. Odour-neutralised. 4–8 week results.','onion hair oil, kalonji hair oil, black seed hair oil, onion oil for hair regrowth, hair fall treatment oil, rosemary hair oil india',230.00,15.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,673,0,530,5.00,3,'2026-08-03 13:33:33','2026-08-03 13:33:34'),(5,18,'Kesh Raksha Ayurvedic Oil','kesh-raksha-ayurvedic-oil','LKN-HO-005','21-Herb Ayurvedic Blend for Complete Hair Protection','The name Kesh Raksha means \"protector of hair\" in Sanskrit. This is our most complex and premium hair oil formulation, developed after extensive research into classical Ayurvedic texts and consultation with practicing Ayurvedic physicians.\n\nThe oil is prepared using the traditional Taila Paka method — a slow, controlled heating process in which 21 carefully sourced herbs are simmered in a base of organic sesame and coconut oil over 72 hours. This traditional process ensures maximum herb extraction and creates the characteristic golden-amber colour and mild earthy fragrance of a genuine Ayurvedic taila.\n\nThis oil addresses all aspects of hair health simultaneously — it stimulates growth, prevents fall, nourishes the scalp, delays greying, and forms a protective shield against environmental damage. It is particularly suited for those experiencing multiple hair concerns or those seeking a single comprehensive hair treatment.','Kesh Raksha is our flagship Ayurvedic formulation — a 21-herb blend inspired by classical Ashtanga Hridayam texts. Slow-cooked for 72 hours in a copper vessel, this golden oil protects against all categories of hair damage: fall, breakage, greying, and scalp disorders.','1. Take 4–5 ml of oil and warm between palms.\n2. Divide hair into 4 sections and apply oil to each section\'s scalp.\n3. Massage with firm, circular movements for 10–15 minutes.\n4. Wrap hair in a warm towel for 20 minutes to allow deep penetration.\n5. Leave on for 2 hours or overnight.\n6. Wash off with a gentle shampoo.\n7. Recommended 3 times per week for at least 12 weeks.','21-herb classical Ayurvedic formulation for complete hair health\nPrevents hair fall, breakage, and premature greying simultaneously\nDeeply penetrates the scalp to nourish at the follicular level\nProvides long-lasting moisture to dry, frizzy hair\nRelieves scalp tension, stress-related hair loss\nProtects hair from pollution, hard water, and UV damage\nSuitable for all hair types and ages',699.00,899.00,294.00,60,'active',1,0,0,'/assets/images/ayurvedic_hair_oil.png','[\"/assets/images/ayurvedic_hair_oil.png\"]','21 herbs, complete hair care, ayurvedic, premium hair oil','Organic Sesame Oil (Sesamum indicum), Virgin Coconut Oil (Cocos nucifera), Bhringraj (Eclipta alba), Amla (Phyllanthus emblica), Brahmi (Bacopa monnieri), Ashwagandha (Withania somnifera), Shatavari (Asparagus racemosus), Neem (Azadirachta indica), Hibiscus (Hibiscus rosa-sinensis), Methi (Trigonella foenum-graecum), Curry Leaf (Murraya koenigii), Kapoor Kachri (Hedychium spicatum), Mulethi (Glycyrrhiza glabra), Guduchi (Tinospora cordifolia), Jatamansi (Nardostachys jatamansi), Shankhpushpi (Convolvulus pluricaulis), Triphala Complex, Sesame Seeds (Sesamum indicum), Black Sesame, Manjistha (Rubia cordifolia), Vitamin E (Tocopherol)',NULL,'Kesh Raksha 21-Herb Ayurvedic Hair Oil — Complete Hair Protection | Luv Kush Natural','Kesh Raksha by Luv Kush Natural — 21-herb Ayurvedic hair oil made by traditional Taila Paka method. Fights fall, breakage & greying. Premium 72-hour slow-cooked formulation.','ayurvedic hair oil 21 herbs, kesh raksha oil, premium ayurvedic hair oil, traditional hair oil india, hair protection oil, best ayurvedic oil for hair',280.00,18.00,5.50,5.50,NULL,0,0,'hybrid',NULL,NULL,764,0,268,5.00,3,'2026-08-03 13:33:33','2026-08-03 13:33:34'),(6,19,'Herbal Anti Hair Fall Shampoo','herbal-anti-hair-fall-shampoo','LKN-SH-001','Sulphate-Free Shampoo That Visibly Reduces Hair Fall','Most commercial anti-hair fall shampoos use harsh sulphates that damage the scalp barrier and paradoxically worsen hair fall over time. Luv Kush Natural\'s Herbal Anti Hair Fall Shampoo uses a mild amino acid–based cleansing system that thoroughly removes product buildup, sebum, and environmental pollutants while preserving the scalp\'s natural moisture and microbiome.\n\nThe active herbal complex includes bhringraj extract for follicle stimulation, amla for keratinisation, and saw palmetto berry for DHT blocking — providing a genuine therapeutic benefit rather than just cosmetic cleaning. The shampoo lathers gently, rinses clean, and leaves hair with a healthy, bouncy texture without weighing it down.','A gentle, sulphate-free shampoo that cleanses the scalp without stripping natural oils. Fortified with bhringraj, amla, and biotin-boosting herbs, it visibly reduces hair fall from the first wash and strengthens hair with each use.','1. Wet hair thoroughly with lukewarm water.\n2. Squeeze a coin-sized amount into your palm.\n3. Emulsify with water and apply to scalp.\n4. Massage gently for 2–3 minutes, focusing on the scalp.\n5. Rinse thoroughly. Repeat if needed.\n6. Follow with a conditioner or hair mask for best results.\n7. Use 2–3 times per week.','Reduces hair fall visible from the first wash\nSulphate-free, paraben-free, colour-safe formula\nBhringraj and amla stimulate follicles with every wash\nMild pH maintains scalp\'s natural acid balance\nStrengthens hair shaft, reduces breakage during washing\nNo residue — hair feels genuinely clean, not stripped',399.00,549.00,168.00,120,'active',0,1,0,'/assets/images/ayurvedic_shampoo.png','[\"/assets/images/ayurvedic_shampoo.png\"]','anti hair fall, sulphate free, herbal shampoo, hair loss','Aqua, Sodium Cocoyl Glutamate, Cocamidopropyl Betaine, Glycerin, Bhringraj Extract (Eclipta alba), Amla Extract (Phyllanthus emblica), Saw Palmetto Berry Extract (Serenoa repens), Neem Leaf Extract (Azadirachta indica), Hibiscus Flower Extract, Panthenol (Pro-Vitamin B5), Biotin, Guar Hydroxypropyltrimonium Chloride, Citric Acid, Phenoxyethanol, Ethylhexylglycerin','Bestseller','Anti Hair Fall Shampoo — Herbal, Sulphate-Free | Luv Kush Natural','Luv Kush Natural Herbal Anti Hair Fall Shampoo — sulphate-free, bhringraj & amla formula. Reduces hair fall from first wash. Safe for coloured hair. 200ml.','anti hair fall shampoo, sulphate free shampoo india, herbal shampoo for hair loss, bhringraj shampoo, ayurvedic shampoo, best shampoo for hair fall',260.00,18.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,855,0,460,4.33,3,'2026-08-03 13:33:33','2026-08-03 13:33:34'),(7,19,'Bhringraj Protein Shampoo','bhringraj-protein-shampoo','LKN-SH-002','Keratin-Boosting Shampoo for Damaged Hair','When hair is repeatedly subjected to heat styling, chemical treatments, or even hard water minerals, the protein structure of the hair shaft — primarily keratin — breaks down, leaving hair porous, weak, and prone to frizz and snapping. Luv Kush Natural\'s Bhringraj Protein Shampoo directly addresses this damage by combining the follicle-stimulating power of bhringraj with a concentrated blend of hydrolysed proteins that fill in the gaps in the damaged cuticle.\n\nUnlike protein treatments that require a separate step, this shampoo delivers a clinically meaningful dose of protein with every wash, gradually building hair back up over 4–6 weeks of regular use. The formula is free from silicones, which means no false smoothness — only genuine structural improvement.','Bhringraj combined with hydrolysed wheat protein and keratin amino acids to rebuild heat-damaged and chemically treated hair. Each wash deposits protein into the hair shaft, gradually restoring strength and elasticity to hair that has become porous and fragile.','1. Apply to wet hair and massage into scalp for 2 minutes.\n2. Work through the length of hair with fingertips.\n3. Leave on for 2 minutes before rinsing.\n4. Rinse thoroughly with cool water to seal the cuticle.\n5. Use 2–3 times per week. Pair with Amla Repair Hair Mask weekly.','Repairs damaged, over-processed hair structurally\nDeposits protein into porous hair shaft with each wash\nSignificantly reduces breakage and split ends\nRestores elasticity to brittle, snapping hair\nBhringraj stimulates growth alongside repair\nSilicone-free — genuine results, not masking',499.00,649.00,210.00,90,'active',0,0,0,'/assets/images/ayurvedic_shampoo.png','[\"/assets/images/ayurvedic_shampoo.png\"]','protein shampoo, bhringraj, damaged hair, keratin, repair','Aqua, Sodium Cocoyl Glutamate, Cocamidopropyl Betaine, Glycerin, Bhringraj Extract (Eclipta alba), Hydrolysed Wheat Protein, Hydrolysed Keratin, Amla Extract (Phyllanthus emblica), Argan Oil (Argania spinosa), Panthenol (Pro-Vitamin B5), Guar Hydroxypropyltrimonium Chloride, Citric Acid, Phenoxyethanol',NULL,'Bhringraj Protein Shampoo — Keratin Repair for Damaged Hair | Luv Kush Natural','Bhringraj Protein Shampoo by Luv Kush Natural. Hydrolysed wheat protein + keratin + bhringraj. Repairs heat-damaged hair with every wash. Silicone-free, sulphate-free.','protein shampoo india, bhringraj protein shampoo, keratin shampoo, damaged hair repair shampoo, protein treatment shampoo, hydrolysed keratin shampoo',260.00,18.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,946,0,182,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(8,19,'Amla Shine Shampoo','amla-shine-shampoo','LKN-SH-003','Natural Gloss-Boosting Shampoo for All Hair Types','Dull hair is typically the result of a rough, raised hair cuticle that scatters light instead of reflecting it. Amla\'s naturally high tannin content acts as a gentle cuticle-smoothing agent, laying the scales flat and allowing each strand to reflect light evenly — the mechanism behind its legendary shine-boosting reputation.\n\nLuv Kush Natural\'s Amla Shine Shampoo is lightweight and gentle enough for daily use, making it ideal for those who prefer frequent washing. It cleanses thoroughly without over-stripping, and the Vitamin C complex provides antioxidant protection against the daily environmental stressors that cause hair to look lacklustre.','Harness the Vitamin C and tannin power of amla to reveal hair that genuinely gleams. This everyday shampoo is gentle enough for daily use, providing light cleansing and an immediate glossy finish without silicones or coating agents.','1. Wet hair and apply shampoo.\n2. Lather gently and massage into scalp for 1–2 minutes.\n3. Rinse with cool water for maximum shine.\n4. Can be used daily.','Delivers immediate, visible shine after every wash\nTannins smooth the hair cuticle naturally — no silicones\nVitamin C complex provides antioxidant protection\nGentle enough for daily use\nAdds body and bounce to flat, limp hair\nPrevents dullness caused by hard water minerals',369.00,499.00,155.00,130,'active',0,0,1,'/assets/images/ayurvedic_shampoo.png','[\"/assets/images/ayurvedic_shampoo.png\"]','amla shampoo, shine, gloss, all hair types, vitamin c','Aqua, Sodium Cocoyl Glutamate, Cocamidopropyl Betaine, Glycerin, Amla Extract (Phyllanthus emblica), Amla Powder (Phyllanthus emblica), Hibiscus Extract, Lemon Extract (Citrus limon), Panthenol, Citric Acid, Phenoxyethanol, Ethylhexylglycerin','New','Amla Shine Shampoo — Natural Gloss Without Silicones | Luv Kush Natural','Luv Kush Natural Amla Shine Shampoo — tannin-rich amla smooths the cuticle for instant, lasting shine. Gentle for daily use. No silicones, no sulphates. All hair types.','amla shampoo for shine, best shampoo for shiny hair, vitamin c shampoo, natural shine shampoo india, amla shampoo india, daily use herbal shampoo',260.00,18.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,1037,0,219,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(9,19,'Neem Anti Dandruff Shampoo','neem-anti-dandruff-shampoo','LKN-SH-004','Clinically Effective Dandruff Control with Neem & Tea Tree','Dandruff is primarily caused by the overgrowth of the Malassezia fungus on the scalp. Neem (Azadirachta indica) contains nimbidin and nimbin — powerful antifungal compounds that inhibit fungal growth without disrupting the scalp\'s healthy microbiome. Combined with tea tree essential oil and natural salicylic acid from willow bark extract, this shampoo provides a triple-action anti-dandruff mechanism that is both effective and gentle.\n\nUnlike zinc pyrithione-based anti-dandruff shampoos that can cause scalp dryness and increased dandruff upon discontinuation, this herbal formula addresses the root cause and can be used long-term without dependency.','A powerful yet gentle dandruff control shampoo using neem\'s natural antifungal properties alongside tea tree and salicylic acid from willow bark. Clears dandruff visibly within 2–3 washes while soothing the scalp\'s itch and redness without drying it out.','1. Apply to wet hair, focusing on the scalp.\n2. Massage for 3 minutes, ensuring contact with the scalp.\n3. Leave on for 2 minutes before rinsing.\n4. Use 3 times per week until dandruff clears, then maintain with 1–2 times per week.','Eliminates dandruff and prevents recurrence\nAntifungal neem extract targets Malassezia at the source\nRelieves scalp itch, redness, and irritation\nNatural salicylic acid gently exfoliates dead skin cells\nSafe for sensitive, reactive scalps\nNo drug ingredients — suitable for long-term use',399.00,549.00,168.00,110,'active',0,0,0,'/assets/images/ayurvedic_shampoo.png','[\"/assets/images/ayurvedic_shampoo.png\"]','anti dandruff, neem, tea tree, scalp care, itchy scalp','Aqua, Sodium Cocoyl Glutamate, Cocamidopropyl Betaine, Glycerin, Neem Leaf Extract (Azadirachta indica), Tea Tree Essential Oil (Melaleuca alternifolia), Willow Bark Extract (Salix alba), Salicylic Acid, Zinc Piroctone Olamine, Climbazole (0.5%), Panthenol, Citric Acid, Phenoxyethanol',NULL,'Neem Anti Dandruff Shampoo — Herbal Scalp Treatment | Luv Kush Natural','Luv Kush Natural Neem Anti Dandruff Shampoo with tea tree & willow bark. Clears dandruff in 2–3 washes, soothes itchy scalp. Gentle enough for long-term use. No harsh chemicals.','neem anti dandruff shampoo, herbal dandruff shampoo, tea tree scalp shampoo, anti dandruff shampoo india, itchy scalp shampoo, natural dandruff treatment',260.00,18.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,1130,0,256,0.00,0,'2026-08-03 13:33:33','2026-08-10 16:36:43'),(10,19,'Hibiscus Repair Shampoo','hibiscus-repair-shampoo','LKN-SH-005','Amino-Acid Rich Shampoo for Dry, Brittle Hair','Hibiscus contains a rare combination of amino acids that are structurally similar to those in human hair, making it uniquely biocompatible as a hair repair ingredient. The mucilage in hibiscus also acts as a natural conditioning agent that fills in cracks in the hair cuticle, reducing moisture loss and smoothing the surface.\n\nLuv Kush Natural\'s Hibiscus Repair Shampoo has a richer, creamier texture than our other shampoos — appropriate for hair that is significantly dehydrated or porous. The formula uses a gentle cleansing system that removes without stripping, and the hibiscus-shea butter complex provides immediate conditioning that is particularly noticeable in the detangling step.','Hibiscus petals and leaves are nature\'s most complete amino acid source for hair. This rich, cream-textured shampoo delivers intense moisture and structural repair to dry, brittle hair, leaving it soft, supple, and significantly more manageable after the first wash.','1. Wet hair and apply a generous amount to scalp and lengths.\n2. Massage into scalp for 2 minutes, then work through lengths.\n3. Leave on for 3 minutes.\n4. Rinse with lukewarm water.\n5. Follow with a conditioner on the lengths for maximum benefit.\n6. Use 2–3 times per week.','Intensely moisturises dry, dehydrated hair\nHibiscus amino acids fill structural damage in the hair shaft\nReduces detangling time significantly\nPrevents breakage during the washing process\nRich cream texture for coarse, thick, or curly hair\nAdds softness and movement to heavy, lifeless hair',449.00,599.00,189.00,85,'active',0,0,0,'/assets/images/ayurvedic_shampoo.png','[\"/assets/images/ayurvedic_shampoo.png\"]','hibiscus, repair shampoo, dry hair, brittle hair, amino acids','Aqua, Sodium Cocoyl Glutamate, Cocamidopropyl Betaine, Glycerin, Hibiscus Flower & Leaf Extract (Hibiscus rosa-sinensis), Shea Butter (Butyrospermum parkii), Hydrolysed Soy Protein, Bhringraj Extract (Eclipta alba), Amla Extract (Phyllanthus emblica), Panthenol, Guar Hydroxypropyltrimonium Chloride, Citric Acid, Phenoxyethanol',NULL,'Hibiscus Repair Shampoo — Moisture & Repair for Dry Hair | Luv Kush Natural','Luv Kush Natural Hibiscus Repair Shampoo — amino acid-rich, cream-textured formula for dry & brittle hair. Reduces breakage, adds moisture & softness. Sulphate-free.','hibiscus shampoo, dry hair shampoo, repair shampoo india, moisturising shampoo, shampoo for brittle hair, hibiscus hair care',260.00,18.00,5.00,5.00,NULL,0,0,'hybrid',NULL,NULL,1219,0,133,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(11,20,'Bhringraj Hair Spa Mask','bhringraj-hair-spa-mask','LKN-HM-001','Salon-Grade Deep Treatment at Home','Luv Kush Natural\'s Bhringraj Hair Spa Mask is formulated to replicate the effect of a professional hair spa treatment. The combination of bhringraj\'s growth-stimulating properties with the intense moisturisation of shea butter and argan oil creates a dual-action treatment — therapeutic at the scalp and deeply conditioning along the length.\n\nThe mask\'s thick, buttery texture melts on contact with warmth and penetrates both the hair shaft and follicle. Unlike light rinse-off conditioners, this mask needs to sit on the hair for at least 20 minutes to fully deliver its benefits. It contains no heavy silicones, which means the softness you feel after rinsing is genuine structural hydration, not a temporary coating.','A professional-grade hair spa treatment in a jar. Bhringraj, argan oil, and shea butter work together in a thick, rich mask that provides 72-hour hydration, reduces frizz, and leaves hair with a salon-quality finish from the comfort of your home.','1. Apply to clean, damp hair from roots to tips.\n2. Gently massage into the scalp for 3–5 minutes.\n3. Comb through with a wide-tooth comb to distribute evenly.\n4. Cover with a shower cap. Leave on for 20–30 minutes.\n5. For deeper penetration, wrap in a warm towel over the shower cap.\n6. Rinse thoroughly with lukewarm water.\n7. Use once or twice per week.','72-hour hydration and frizz control\nBhringraj stimulates scalp health during treatment\nArgan oil penetrates and repairs the hair cortex\nShea butter seals the cuticle for long-lasting smoothness\nReduces hair fall associated with dryness and breakage\nReplaces the need for expensive salon spa treatments',599.00,799.00,252.00,80,'active',1,0,0,'/assets/images/botanical-flatlay.jpg','[\"/assets/images/botanical-flatlay.jpg\"]','hair mask, spa treatment, deep conditioning, bhringraj','Aqua, Shea Butter (Butyrospermum parkii), Argan Oil (Argania spinosa), Bhringraj Extract (Eclipta alba), Amla Extract (Phyllanthus emblica), Cetyl Alcohol, Behentrimonium Methosulfate, Glycerin, Hydrolysed Wheat Protein, Panthenol (Pro-Vitamin B5), Neem Extract (Azadirachta indica), Vitamin E (Tocopherol), Phenoxyethanol',NULL,'Bhringraj Hair Spa Mask — Deep Conditioning Treatment | Luv Kush Natural','Luv Kush Natural Bhringraj Hair Spa Mask with argan oil & shea butter. Salon-grade 72-hour hydration. Reduces frizz, restores softness. Use once weekly. 200g jar.','bhringraj hair mask, hair spa mask at home, deep conditioning mask, argan hair mask india, hair spa treatment, best hair mask india',250.00,7.00,7.00,7.00,NULL,0,0,'hybrid',NULL,NULL,411,0,170,5.00,3,'2026-08-03 13:33:33','2026-08-10 02:52:25'),(12,20,'Keratin Herbal Hair Mask','keratin-herbal-hair-mask','LKN-HM-002','Protein-Infused Treatment for Smooth, Frizz-Free Hair','Traditional keratin treatments contain formaldehyde, a known carcinogen that provides temporary smoothness at the cost of long-term hair and health damage. Luv Kush Natural\'s Keratin Herbal Hair Mask achieves the same structural smoothing result through a combination of naturally-derived hydrolysed keratin, quinoa protein, and a blend of botanical conditioning agents.\n\nThe mask is enriched with brahmi and ashwagandha — adaptogenic herbs that, when applied topically, help reduce oxidative stress in the scalp and strengthen the hair fibre. The result is hair that is genuinely smoother, more manageable, and more resilient — with no harsh chemicals and no professional appointment required.','A weekly keratin protein mask that smooths frizz and rebuilds the hair\'s structural integrity — without formaldehyde. Hydrolysed keratin and quinoa protein bond into the hair matrix, delivering 4–5 days of smoothness and significantly reduced styling time.','1. After shampooing, towel-dry hair gently.\n2. Apply mask generously from mid-length to tips. Apply less to roots.\n3. Comb through with a fine-tooth comb.\n4. Leave on for 20–30 minutes.\n5. Rinse thoroughly. Do not re-shampoo after.\n6. Style as usual. Use once per week.','Reduces frizz for 4–5 days per application\nHydrolysed keratin fills damage in the hair cortex\nShortens blow-dry and styling time significantly\nFormaldehyde-free — safe for regular use\nBrahmi and ashwagandha strengthen hair from within\nAdds mirror-like smoothness to textured, coarse hair',699.00,899.00,294.00,70,'active',0,0,0,'/assets/images/botanical-flatlay.jpg','[\"/assets/images/botanical-flatlay.jpg\"]','keratin mask, protein treatment, frizz control, smooth hair, herbal','Aqua, Cetyl Alcohol, Behentrimonium Methosulfate, Hydrolysed Keratin, Hydrolysed Quinoa Protein, Argan Oil (Argania spinosa), Brahmi Extract (Bacopa monnieri), Ashwagandha Extract (Withania somnifera), Bhringraj Extract (Eclipta alba), Glycerin, Panthenol, Vitamin E (Tocopherol), Citric Acid, Phenoxyethanol',NULL,'Keratin Herbal Hair Mask — Frizz Control Without Formaldehyde | Luv Kush Natural','Luv Kush Natural Keratin Herbal Hair Mask — formaldehyde-free smoothing treatment. Hydrolysed keratin + quinoa protein + brahmi. 4–5 days of smooth, frizz-free hair.','keratin hair mask, frizz control mask, protein hair mask, formaldehyde free keratin, smoothing hair mask india, best keratin treatment at home',250.00,7.00,7.00,7.00,NULL,0,0,'hybrid',NULL,NULL,501,0,207,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(13,20,'Amla Repair Hair Mask','amla-repair-hair-mask','LKN-HM-003','Antioxidant-Rich Mask for Strength & Shine','This mask is formulated around the principle that strong hair is shiny hair. When the hair\'s lipid barrier is intact and the cuticle is smooth, it reflects light perfectly — creating natural shine that no product can mimic. Amla\'s high Vitamin C and gallic acid content work as natural antioxidants that protect this lipid barrier from oxidative damage, while coconut oil and castor oil work together to physically restore the barrier in hair that has already been damaged.\n\nThe Amla Repair Hair Mask is particularly effective for hair that appears dull, feels rough to the touch, or has lost its natural lustre due to chemical processing, hard water, or environmental stress.','Concentrated amla with coconut and castor oil in a rich, cream mask that rebuilds strength, adds incredible shine, and combats premature greying. The Vitamin C complex neutralises free radicals that cause hair ageing, while the fatty acid blend restores lost lipids to damaged hair.','1. Apply to clean, damp hair from scalp to tips.\n2. Comb through and leave on for 15–20 minutes.\n3. Rinse with cool water to enhance shine.\n4. Use once or twice per week.','Rebuilds the hair\'s natural lipid layer\nDelivers intense shine naturally — without silicones\nVitamin C neutralises free radicals that cause hair ageing\nPrevents and reduces premature greying\nRestores elasticity and prevents snapping\nSuitable for coloured hair — enhances colour vibrancy',549.00,699.00,231.00,89,'active',0,0,1,'/assets/images/botanical-flatlay.jpg','[\"/assets/images/botanical-flatlay.jpg\"]','amla mask, repair, antioxidant, shine mask, hair strength','Aqua, Virgin Coconut Oil (Cocos nucifera), Castor Oil (Ricinus communis), Amla Extract (Phyllanthus emblica), Amla Powder (Phyllanthus emblica), Cetyl Alcohol, Behentrimonium Methosulfate, Glycerin, Hydrolysed Soy Protein, Panthenol, Vitamin E (Tocopherol), Phenoxyethanol','New','Amla Repair Hair Mask — Strength & Shine Mask | Luv Kush Natural','Luv Kush Natural Amla Repair Hair Mask — Vitamin C & coconut oil mask that rebuilds strength, delivers intense shine, and combats greying. Silicone-free. For all hair types.','amla hair mask, vitamin c hair mask, shiny hair mask, repair hair mask india, amla hair treatment, best hair mask for shine',250.00,7.00,7.00,7.00,NULL,0,0,'hybrid',NULL,NULL,609,0,245,0.00,0,'2026-08-03 13:33:33','2026-08-10 17:21:32'),(14,20,'Hibiscus Moisture Mask','hibiscus-moisture-mask','LKN-HM-004','Ultra-Hydrating Mask for Dry & Curly Hair','Curly and coily hair textures are naturally more prone to dryness because the scalp\'s sebum cannot travel down the curved shaft as easily as with straight hair. Luv Kush Natural\'s Hibiscus Moisture Mask addresses this with a high-water-binding formula that floods each strand with moisture that stays — not just temporary surface coating.\n\nThe hibiscus mucilage acts as a natural humectant, drawing moisture from the air and locking it into the hair shaft. Mango seed butter seals the cuticle to prevent moisture from escaping, and aloe vera provides penetrating hydration that goes deeper than surface conditioning. The result is curl definition, softness, and bounce that lasts for several days.','A flower-powered moisture mask designed for the most dehydrated hair textures. Hibiscus natural mucilage combined with mango butter and aloe vera creates a deeply hydrating mask that restores bounce, defines curls, and eliminates the crunch and dryness that plagues naturally textured hair.','1. Apply to freshly washed, damp hair.\n2. Rake or scrunch through curls to distribute evenly.\n3. Leave on for 20–30 minutes under a shower cap.\n4. Rinse with cool water. Do not dry with a terrycloth towel — use a microfibre towel or cotton T-shirt.\n5. Let curls air-dry or use a diffuser.\n6. Use once or twice per week.','Deep hydration that lasts 3–4 days\nDefines and enhances natural curl pattern\nEliminates frizz and dryness in textured hair\nNatural humectants draw moisture into the hair\nMango butter seals the cuticle and prevents moisture loss\nCan be used as a wash-and-go styling aid for curly hair',579.00,749.00,243.00,75,'active',0,0,0,'/assets/images/botanical-flatlay.jpg','[\"/assets/images/botanical-flatlay.jpg\"]','hibiscus mask, moisture mask, dry hair, curly hair, hydration','Aqua, Aloe Vera Juice (Aloe barbadensis), Mango Seed Butter (Mangifera indica), Hibiscus Flower Extract (Hibiscus rosa-sinensis), Cetyl Alcohol, Behentrimonium Methosulfate, Glycerin, Hydrolysed Oat Protein, Panthenol, Argan Oil (Argania spinosa), Vitamin E (Tocopherol), Citric Acid, Phenoxyethanol',NULL,'Hibiscus Moisture Mask — Deep Hydration for Curly & Dry Hair | Luv Kush Natural','Luv Kush Natural Hibiscus Moisture Mask — hibiscus mucilage, mango butter & aloe vera. Ultra-hydrating for curly & dry hair. Defines curls, eliminates frizz. 200g.','hibiscus moisture mask, curly hair mask india, deep hydration mask, moisture mask for dry hair, curl defining mask, best mask for curly hair india',250.00,7.00,7.00,7.00,NULL,0,0,'hybrid',NULL,NULL,683,0,121,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(15,20,'Deep Root Strength Mask','deep-root-strength-mask','LKN-HM-005','Scalp-First Mask for Severe Hair Fall & Thinning','The Deep Root Strength Mask takes a fundamentally different approach to the standard hair mask — instead of focusing primarily on the hair shaft, it is formulated to treat the scalp as the organ it is, delivering active therapeutic ingredients where hair growth actually begins: the dermal papilla at the base of the follicle.\n\nThe combination of bhringraj, onion extract (sulphur-rich), rosemary essential oil, and ashwagandha provides multi-mechanism stimulation: increased scalp circulation, reduced scalp inflammation, DHT inhibition, and adaptogenic stress reduction. This is particularly relevant given that stress-related hair loss (telogen effluvium) is extremely common and responds well to topical adaptogenic herbs.','Our most intensive scalp treatment in mask form. A powerful blend of bhringraj, onion extract, rosemary, and ashwagandha targets the scalp first — stimulating blood flow, nourishing follicles, and creating the ideal conditions for sustained hair growth. For anyone experiencing significant thinning or escalating hair fall.','1. Apply to dry or slightly damp scalp first, parting hair in sections.\n2. Massage firmly into the scalp for 5–10 minutes.\n3. Then apply remaining mask through the length of hair.\n4. Cover with a shower cap. Leave on for 30 minutes.\n5. Rinse thoroughly with lukewarm water, then shampoo once.\n6. Use once per week as an intensive treatment.','Directly targets the scalp to stimulate dormant follicles\nMulti-mechanism approach: growth + anti-inflammatory + DHT blocking\nReduces stress-related hair loss with adaptogenic ashwagandha\nSignificant results in 6–8 weeks of weekly use\nProvides a cooling, soothing sensation that relieves scalp tension\nWorks synergistically with the Bhringraj Hair Growth Oil',799.00,999.00,336.00,55,'active',1,0,0,'/assets/images/botanical-flatlay.jpg','[\"/assets/images/botanical-flatlay.jpg\"]','scalp mask, hair fall, thinning hair, root strength, bhringraj, onion','Aqua, Cetyl Alcohol, Behentrimonium Methosulfate, Bhringraj Extract (Eclipta alba), Onion Extract (Allium cepa), Rosemary Essential Oil (Rosmarinus officinalis), Ashwagandha Extract (Withania somnifera), Castor Oil (Ricinus communis), Amla Extract (Phyllanthus emblica), Peppermint Essential Oil (Mentha piperita), Glycerin, Niacinamide, Caffeine, Panthenol, Phenoxyethanol',NULL,'Deep Root Strength Mask — Intensive Scalp Treatment for Hair Fall | Luv Kush Natural','Luv Kush Natural Deep Root Strength Mask — bhringraj, onion & ashwagandha scalp treatment. Stimulates follicles, reduces thinning. Weekly use for 6–8 week results.','scalp mask for hair fall, deep root hair mask, hair thinning mask, bhringraj onion mask, intensive hair fall treatment, scalp treatment mask india',250.00,7.00,7.00,7.00,NULL,0,0,'hybrid',NULL,NULL,774,0,158,4.33,3,'2026-08-03 13:33:33','2026-08-03 13:33:34'),(16,21,'Kesar Panchamrit Soap','kesar-panchamrit-soap','LKN-SP-001','Saffron & Milk Luxury Soap for Radiant Skin','Panchamrit — five sacred ingredients used in Hindu religious rituals — are also, remarkably, among the most nourishing substances for human skin. Luv Kush Natural\'s Kesar Panchamrit Soap brings this sacred tradition into a premium daily bathing bar, combining raw milk (lactic acid, natural exfoliation), honey (humectant), ghee (occlusive moisturiser), curd (probiotics), and mishri (mild exfoliant) with authentic Kashmiri kesar (saffron) threads.\n\nThe soap is crafted using a cold-process saponification method that preserves the glycerin naturally produced during soap-making — a luxury that is stripped from most commercial soaps. The result is a genuinely moisturising bar that leaves skin feeling soft and hydrated, not tight and dry, after every wash.','A handcrafted, cold-process soap made with real kesar (saffron), raw milk, and sandalwood. The five sacred ingredients of Panchamrit — milk, honey, ghee, curd, and sugar — combine with 23-karat saffron strands for a bathing ritual that brightens, softens, and deeply nourishes the skin.',NULL,'Brightens skin tone with natural saffron and lactic acid\nCold-process preserves natural glycerin for genuine moisturisation\nHoney provides all-day hydration\nLactic acid from milk gently exfoliates dead skin cells\nGhee prevents skin from drying after bathing\nSuitable for all skin types including sensitive skin',189.00,249.00,79.00,200,'active',0,1,0,'/assets/images/herbal-soap.jpg','[\"/assets/images/herbal-soap.jpg\"]','kesar soap, saffron soap, milk soap, glow soap, luxury soap','Saponified Coconut Oil, Saponified Olive Oil, Saponified Castor Oil, Raw Milk (Lac), Raw Honey (Mel), Ghee (Clarified Butter), Curd (Yogurt), Mishri (Raw Cane Sugar), Kesar (Crocus sativus), Sandalwood Powder (Santalum album), Vitamin E (Tocopherol)','Bestseller','Kesar Panchamrit Soap — Saffron & Milk Luxury Soap | Luv Kush Natural','Luv Kush Natural Kesar Panchamrit Soap — handcrafted cold-process bar with real Kashmiri kesar, raw milk & honey. Brightens, nourishes & moisturises skin. 100g.','kesar soap, saffron soap india, panchamrit soap, milk soap, luxury ayurvedic soap, brightening soap india, handmade soap',130.00,9.00,5.50,2.50,NULL,0,0,'full_cod',NULL,NULL,865,0,390,5.00,3,'2026-08-03 13:33:33','2026-08-03 13:33:34'),(17,21,'Neem Tulsi Soap','neem-tulsi-soap','LKN-SP-002','Antibacterial Daily Soap for Problem Skin','Neem and tulsi are arguably the two most powerful antibacterial plants in the Ayurvedic pharmacopoeia. Neem\'s nimbidin compound specifically targets the Propionibacterium acnes bacteria responsible for body and face acne, while tulsi\'s eugenol provides broad-spectrum antimicrobial activity and a natural pleasant fragrance.\n\nThis soap is cold-process made to preserve all active compounds intact. It is particularly effective as a body soap for those who exercise regularly, live in humid climates, or struggle with persistent body acne, folliculitis, or excessive sweating.','A purifying daily soap combining neem\'s natural antibacterial properties with the adaptogenic benefits of tulsi (holy basil). Controls bacteria that cause acne, reduces body odour, and regulates excess sebum — making it ideal for oily, acne-prone, or sweat-exposed skin.',NULL,'Controls bacteria responsible for acne and body odour\nReduces sebum production for oily skin types\nGentle natural exfoliation keeps pores clear\nTulsi provides cooling, refreshing sensation\nFree from triclosan and synthetic antibacterials\nSafe for daily use on face and body',109.00,149.00,46.00,300,'active',0,0,0,'/assets/images/herbal-soap.jpg','[\"/assets/images/herbal-soap.jpg\"]','neem soap, tulsi soap, antibacterial, acne, oily skin','Saponified Coconut Oil, Saponified Olive Oil, Saponified Castor Oil, Neem Leaf Extract (Azadirachta indica), Tulsi Extract (Ocimum sanctum), Neem Seed Oil, Activated Charcoal, Glycerin, Tea Tree Essential Oil (Melaleuca alternifolia), Vitamin E (Tocopherol)',NULL,'Neem Tulsi Soap — Natural Antibacterial Soap for Acne & Oily Skin | Luv Kush Natural','Luv Kush Natural Neem Tulsi Soap — cold-process antibacterial bar with neem & tulsi. Controls acne, body odour & oiliness. Free from triclosan. Safe for daily use.','neem tulsi soap, antibacterial soap india, soap for acne, neem soap for skin, ayurvedic soap for oily skin, natural antibacterial soap',110.00,9.00,5.50,2.50,NULL,0,0,'full_cod',NULL,NULL,956,0,232,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(18,21,'Sandalwood Herbal Soap','sandalwood-herbal-soap','LKN-SP-003','Calming Luxury Soap for Even-Toned, Glowing Skin','Mysore sandalwood — sourced from Karnataka — has been used in Indian skincare for over 4,000 years for its remarkable ability to calm irritated skin, fade hyperpigmentation, and leave a warm, distinctive fragrance that lingers on the skin. Luv Kush Natural\'s Sandalwood Herbal Soap uses authentic Mysore sandalwood powder (not synthetic fragrance) in a premium coconut-olive oil base.\n\nThe addition of rose water and saffron enhances the brightening effect, while the cold-process method ensures that every beneficial compound in the sandalwood is preserved. This soap is suitable for all skin types but is particularly luxurious as an evening bathing bar for those looking to unwind and care for their skin simultaneously.','Authentic Mysore sandalwood powder combined with rose water and saffron in a cold-process bar. Sandalwood\'s alpha-santalol calms skin redness, fades blemishes, and creates a natural, lasting fragrance that makes this the finest-smelling soap in our collection.',NULL,'Fades blemishes and dark spots over time\nAlpha-santalol calms redness and irritation\nNatural sandalwood fragrance — no synthetic perfume\nBrightens skin tone with regular use\nDeeply moisturising — no post-bath tightness\nSuitable for sensitive and mature skin',149.00,199.00,63.00,180,'active',0,0,0,'/assets/images/herbal-soap.jpg','[\"/assets/images/herbal-soap.jpg\"]','sandalwood soap, chandan soap, skin glow, even tone','Saponified Coconut Oil, Saponified Olive Oil, Saponified Castor Oil, Sandalwood Powder (Santalum album), Rose Water (Rosa damascena), Kesar (Crocus sativus), Glycerin, Saffron Essential Oil, Vitamin E (Tocopherol)',NULL,'Sandalwood Herbal Soap — Mysore Chandan Soap for Glowing Skin | Luv Kush Natural','Luv Kush Natural Sandalwood Herbal Soap with authentic Mysore chandan, rose water & saffron. Fades blemishes, brightens skin tone, natural fragrance. Cold-process bar.','sandalwood soap india, chandan soap, mysore sandalwood soap, soap for glowing skin, natural fragrance soap, sandalwood for skin brightening',110.00,9.00,5.50,2.50,NULL,0,0,'full_cod',NULL,NULL,1047,0,269,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(19,21,'Activated Charcoal Soap','activated-charcoal-soap','LKN-SP-004','Deep Pore Cleansing Bar for Congested Skin','Activated charcoal works through adsorption — a process where toxins, dirt, and excess sebum bind to the charcoal\'s enormous surface area and are lifted cleanly from the pores. Combined with kaolin clay (a gentle natural pore-tightening mineral) and tea tree oil, this soap delivers a thorough deep-cleanse that is particularly effective on congested T-zones, blackheads, and post-exercise skin.\n\nUnlike harsh chemical peel products, this soap works gently and can be used 2–3 times per week without over-stripping the skin. The glycerin naturally produced in the cold-process keeps the skin barrier intact throughout the cleansing process.','Cosmetic-grade activated charcoal with kaolin clay and tea tree oil to perform a weekly deep-pore detox. Draws out impurities, sebum, and environmental pollutants from congested pores, visibly minimising blackheads and leaving skin feeling genuinely clean and refreshed.',NULL,'Draws impurities and sebum out of congested pores\nReduces the appearance of blackheads and enlarged pores\nKaolin clay mattifies the skin without over-drying\nTea tree oil prevents bacterial proliferation in cleared pores\nWeekly detox bar — suitable for combination and oily skin\nRemoves pollution and PM2.5 particles from skin surface',129.00,179.00,54.00,160,'active',0,0,1,'/assets/images/herbal-soap.jpg','[\"/assets/images/herbal-soap.jpg\"]','charcoal soap, pore cleansing, detox soap, blackheads, oily skin','Saponified Coconut Oil, Saponified Castor Oil, Kaolin Clay, Activated Charcoal (Bamboo-derived), Tea Tree Essential Oil (Melaleuca alternifolia), Neem Extract (Azadirachta indica), Glycerin, Vitamin E (Tocopherol)','New','Activated Charcoal Soap — Deep Pore Cleansing Bar | Luv Kush Natural','Luv Kush Natural Activated Charcoal Soap with kaolin clay & tea tree. Removes blackheads, unclogs pores, mattifies skin. Cold-process, natural glycerin. 100g bar.','activated charcoal soap, pore cleansing soap, charcoal face soap india, blackhead removal soap, deep cleansing soap, charcoal kaolin soap',110.00,9.00,5.50,2.50,NULL,0,0,'full_cod',NULL,NULL,1138,0,146,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(20,21,'Rose Aloe Vera Soap','rose-aloe-vera-soap','LKN-SP-005','Gentle Moisturising Soap for Sensitive & Dry Skin','Sensitive skin requires cleansers that remove impurities without disturbing the delicate balance of the skin\'s acid mantle and microbiome. Rose water provides gentle astringency and has been used as a skin toner in India for centuries, while aloe vera (95% water + polysaccharides) provides soothing hydration that counteracts any potential dryness from the cleansing process.\n\nThe soap is scented purely with natural rose absolute — no synthetic fragrance — making it suitable even for those who react to artificial perfumes. It is deliberately formulated with a minimal ingredients list to reduce allergen exposure.','Our most gentle daily soap — crafted for sensitive, reactive, or dry skin types. Rose water, pure aloe vera, and shea butter in a soft lather that cleanses without disrupting the skin\'s moisture barrier. Suitable for children and adults with eczema-prone or sensitive skin.',NULL,'Specifically formulated for sensitive and reactive skin\nRose absolute provides natural fragrance — no synthetics\nAloe vera soothes and prevents post-wash tightness\nShea butter leaves skin soft and nourished\nSuitable for children and eczema-prone skin\nHypoallergenic minimal formula',109.00,149.00,46.00,250,'active',0,0,0,'/assets/images/herbal-soap.jpg','[\"/assets/images/herbal-soap.jpg\"]','rose soap, aloe vera soap, sensitive skin, dry skin, gentle soap','Saponified Coconut Oil, Saponified Olive Oil, Saponified Shea Butter, Rose Water (Rosa damascena), Aloe Vera Juice (Aloe barbadensis), Shea Butter (Butyrospermum parkii), Rose Absolute (Rosa damascena), Glycerin, Vitamin E (Tocopherol)',NULL,'Rose Aloe Vera Soap — Gentle Moisturising Soap for Sensitive Skin | Luv Kush Natural','Luv Kush Natural Rose Aloe Vera Soap — natural rose absolute, aloe vera & shea butter. Ultra-gentle daily bar for sensitive, dry, eczema-prone skin. Suitable for children.','rose soap india, aloe vera soap, sensitive skin soap, gentle soap for dry skin, natural rose soap, hypoallergenic soap india',110.00,9.00,5.50,2.50,NULL,0,0,'full_cod',NULL,NULL,1229,0,183,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(21,22,'Kumkumadi Face Serum','kumkumadi-face-serum','LKN-FC-001','24K Saffron Brightening Serum — Ayurveda\'s Finest','Kumkumadi Tailam is described in the Ashtanga Hridayam text (approximately 7th century CE) as the ultimate formulation for skin brightness and complexion enhancement. It contains kesar (saffron) as its primary active ingredient — rich in safranal, crocin, and picrocrocin, which are potent antioxidants and natural skin brighteners proven to inhibit tyrosinase (the enzyme that creates hyperpigmentation).\n\nLuv Kush Natural\'s Kumkumadi Face Serum retains the classical formula\'s core ingredients while presenting them in a modern, lightweight oil serum format that absorbs quickly and layers beautifully under moisturiser or sunscreen. We use real Kashmiri kesar — sourced from Pampore, J&K — combined with sandalwood oil, manjistha, and Indian lotus extract.','A modern interpretation of the classical Kumkumadi Tailam — one of Ayurveda\'s most celebrated skin formulations. Real Kashmiri kesar, sandalwood, and manjistha in a lightweight, fast-absorbing oil serum that brightens, evens skin tone, and visibly diminishes dark spots in 4–6 weeks.','1. Cleanse and tone your face.\n2. Apply 2–3 drops of serum to your fingertips.\n3. Warm between fingertips and press gently into the skin.\n4. Apply in upward motions across the face and neck.\n5. Follow with moisturiser.\n6. Use morning and/or evening. If using in the morning, always follow with SPF 30+.','Brightens dull, uneven skin tone within 2–4 weeks\nFades dark spots, post-acne marks, and sun damage\nKesar inhibits tyrosinase to reduce melanin production\nSandalwood oil calms redness and visible pores\nAntioxidant protection against UV and pollution damage\nSuitable for all skin types including oily skin — lightweight formula',1199.00,1499.00,504.00,50,'active',0,1,0,'/assets/images/face-serum.webp','[\"/assets/images/face-serum.webp\"]','kumkumadi, face serum, saffron serum, brightening, ayurvedic serum','Sesame Oil (Sesamum indicum), Kesar/Saffron Extract (Crocus sativus), Sandalwood Oil (Santalum album), Manjistha Extract (Rubia cordifolia), Indian Lotus Extract (Nelumbo nucifera), Licorice Root Extract (Glycyrrhiza glabra), Turmeric Extract (Curcuma longa), Rose Hip Seed Oil (Rosa canina), Vitamin C (Ascorbyl Glucoside), Vitamin E (Tocopherol)','Bestseller','Kumkumadi Face Serum — Saffron Brightening Ayurvedic Serum | Luv Kush Natural','Luv Kush Natural Kumkumadi Face Serum with real Kashmiri kesar, sandalwood & manjistha. Brightens skin, fades dark spots & hyperpigmentation. Classical Ayurvedic formula.','kumkumadi serum, saffron face serum, brightening serum india, ayurvedic face serum, kumkumadi oil, dark spot serum india, kesar face serum',50.00,12.00,3.00,3.00,NULL,0,0,'hybrid',NULL,NULL,420,0,320,4.33,3,'2026-08-03 13:33:33','2026-08-03 13:33:34'),(22,22,'Aloe Vera Gel','aloe-vera-gel','LKN-FC-002','Pure 99% Aloe Vera Gel — Multi-Use Skin & Hair Soother','Most commercially available aloe vera gels contain only 5–15% actual aloe vera — the rest is water, carbomer thickeners, and artificial colouring to create the famous green tint. Luv Kush Natural\'s Aloe Vera Gel contains 99% cold-pressed aloe vera juice, with only a small amount of natural preservative (phenoxyethanol) and xanthan gum for texture stability.\n\nThe result is a gel with the full spectrum of aloe\'s active compounds: acemannan (immune-modulating polysaccharide), aloin (anti-inflammatory), and over 75 naturally occurring nutrients including vitamins B1, B2, B6, C, and E.','99% pure aloe vera gel with nothing to dilute its effectiveness. Instantly cools sunburn, calms redness, soothes razor burn, tames frizzy hair, and acts as a lightweight daily moisturiser. One product, a hundred uses.',NULL,'Instantly soothes sunburn, windburn, and heat rash\nLightweight daily moisturiser for oily and combination skin\nCalms acne-related redness and inflammation\nMulti-use: skin, after-shave, hair styling, scalp soother\n99% aloe — no artificial colour or fragrance\nCan be used as an overnight sleep mask for the face',249.00,349.00,105.00,200,'active',0,0,0,'/assets/images/face-serum.webp','[\"/assets/images/face-serum.webp\"]','aloe vera gel, sunburn, moisturiser, after sun, hair gel, multi-use','Aloe Vera Juice (Aloe barbadensis) 99%, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin',NULL,'Pure Aloe Vera Gel — 99% Aloe, Multi-Use Skin & Hair | Luv Kush Natural','Luv Kush Natural 99% Pure Aloe Vera Gel — no artificial colour or fragrance. Soothes sunburn, calms acne, hydrates skin, tames frizzy hair. 200ml. Multi-purpose.','pure aloe vera gel india, aloe vera gel for face, aloe vera gel for sunburn, 99 percent aloe vera gel, multi use aloe gel, best aloe vera gel india',220.00,10.00,7.00,7.00,NULL,0,0,'full_cod',NULL,NULL,511,0,257,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(23,22,'Sandalwood Face Pack','sandalwood-face-pack','LKN-FC-003','Weekly Brightening Mask for All Skin Types','In traditional Indian households, the weekly face pack is a skincare ritual as old as civilisation itself. Luv Kush Natural\'s Sandalwood Face Pack modernises this ritual without compromising the efficacy of its classical ingredients. Multani mitti (fuller\'s earth) provides gentle absorptive cleansing, sandalwood calms and brightens, turmeric adds its well-documented anti-inflammatory benefit, and saffron delivers concentrated antioxidant brightening.\n\nThe dry powder format ensures maximum potency — no water means no preservatives, no dilution of actives, and a longer shelf life. Mix with rose water or plain water just before application for a fresh, activated mask every time.','A traditional face pack combining Mysore sandalwood, Multani mitti, and turmeric — three pillars of Indian skincare — with rose water and saffron. Draws out impurities, brightens skin tone, and leaves a radiant glow that lasts for days after every use.','1. Mix 1 teaspoon of face pack powder with enough rose water to form a smooth paste.\n2. Apply evenly to cleansed face and neck, avoiding the eye area.\n3. Leave on for 15–20 minutes until dry.\n4. Rinse off with cool water using gentle circular motions.\n5. Follow with a moisturiser.\n6. Use once or twice per week.','Brightens and evens skin tone in one application\nMultani mitti absorbs sebum and clears congested pores\nSandalwood reduces redness and soothes post-sun irritation\nTurmeric\'s curcumin reduces inflammation and pigmentation\nSaffron boosts radiance and natural glow\nSuitable for all skin types; particularly effective for oily/combination',369.00,499.00,155.00,90,'active',0,0,0,'/assets/images/face-serum.webp','[\"/assets/images/face-serum.webp\"]','face pack, sandalwood, multani mitti, brightening, weekly mask','Sandalwood Powder (Santalum album), Multani Mitti (Fuller\'s Earth/Calcium Bentonite), Turmeric Powder (Curcuma longa), Kesar/Saffron (Crocus sativus), Rose Petal Powder (Rosa damascena), Manjistha Powder (Rubia cordifolia), Lodhra Powder (Symplocos racemosa), Neem Leaf Powder (Azadirachta indica)',NULL,'Sandalwood Face Pack — Traditional Brightening Mask | Luv Kush Natural','Luv Kush Natural Sandalwood Face Pack — Mysore chandan, multani mitti, turmeric & saffron. Traditional Ayurvedic mask for instant glow, pore cleansing & even skin tone.','sandalwood face pack, chandan face pack, multani mitti face pack, ayurvedic face pack, brightening face mask, turmeric face pack india',120.00,8.00,8.00,5.00,NULL,0,0,'full_cod',NULL,NULL,602,0,134,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(24,22,'Neem Acne Control Gel','neem-acne-control-gel','LKN-FC-004','Targeted Spot Treatment & Daily Acne Prevention Gel','The most common mistake in acne treatment is over-drying the skin, which paradoxically triggers more sebum production and worsens breakouts. Luv Kush Natural\'s Neem Acne Control Gel is specifically formulated to be antibacterial and anti-inflammatory while maintaining the skin\'s moisture balance through the addition of aloe vera and niacinamide.\n\nNiacinamide (Vitamin B3) is a clinically validated ingredient for reducing sebum production, minimising pore size, and fading post-acne marks — making it a natural complement to the anti-bacterial action of neem and tea tree. The gel is lightweight, non-comedogenic, and leaves no visible residue, making it suitable for use under makeup.','A concentrated, fast-absorbing gel that works both as a spot treatment for active breakouts and as a daily preventive moisturiser for acne-prone skin. Neem, tea tree, and salicylic acid from willow bark form a clinically effective anti-acne trio, while aloe vera ensures the skin stays hydrated throughout treatment.',NULL,'Reduces active breakouts within 48–72 hours\nNeem and tea tree kill acne-causing bacteria\nNiacinamide regulates sebum and reduces pore size\nSalicylic acid (natural) exfoliates inside the pore\nAloe vera soothes redness and inflammation\nNon-comedogenic — safe for oily, acne-prone skin\nFades post-acne dark marks with regular use',299.00,399.00,126.00,110,'active',0,0,0,'/assets/images/face-serum.webp','[\"/assets/images/face-serum.webp\"]','acne gel, neem, spot treatment, pimples, acne control, oily skin','Aloe Vera Juice (Aloe barbadensis), Neem Leaf Extract (Azadirachta indica), Tea Tree Essential Oil (Melaleuca alternifolia), Niacinamide (Vitamin B3), Willow Bark Extract (Salix alba), Zinc PCA, Glycerin, Panthenol, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin',NULL,'Neem Acne Control Gel — Natural Spot Treatment for Pimples | Luv Kush Natural','Luv Kush Natural Neem Acne Control Gel — neem, tea tree & niacinamide for fast acne clearing. Spot treatment & daily moisturiser. Non-comedogenic. For oily & acne-prone skin.','neem acne gel, spot treatment for pimples, acne control gel india, niacinamide acne gel, natural acne treatment, tea tree spot treatment india',80.00,10.00,4.00,4.00,NULL,0,0,'full_cod',NULL,NULL,693,0,171,0.00,0,'2026-08-03 13:33:33','2026-08-03 13:33:33'),(25,22,'Herbal Glow Cream','herbal-glow-cream','LKN-FC-005','Daily Herbal Moisturiser for Natural Radiance','Formulated specifically for the skin concerns most prevalent in Indian and South Asian skin types — hyperpigmentation, uneven tone, post-inflammatory marks, and the dullness that comes from pollution exposure — Luv Kush Natural\'s Herbal Glow Cream is a comprehensive daily moisturiser that does the work of several products in one.\r\n\r\nThe saffron and licorice root combination provides clinically supported brightening through two complementary mechanisms: saffron\'s crocin inhibits melanin synthesis, while licorice\'s glabridin disperses existing melanin clusters. Vitamin C then stabilises the brightening effect and provides antioxidant protection against daily UV and pollution damage.\r\n\r\nThe cream has a medium-rich texture appropriate for Indian climates — not too heavy for monsoon humidity, not too light for dry winter months — and is fragrance-free to minimise irritation risk.','A rich daily moisturising cream combining saffron, licorice, and vitamin C to deliver a natural, buildable glow without shimmer or glitter. Formulated for Indian skin tones — addresses dullness, uneven texture, and hyperpigmentation while providing lasting 12-hour hydration.','1. Apply to freshly cleansed face and neck.\r\n2. Use morning and evening.\r\n3. In the morning, follow with SPF 30+ for maximum brightening results (UV protection prevents new pigmentation formation).\r\n4. Apply outward and upward strokes to cheeks, forehead, chin, and neck.','Delivers a genuine, lasting glow — no shimmer\r\nDual-mechanism brightening: saffron + licorice root\r\nVitamin C stabilises brightening and provides antioxidant protection\r\n12-hour hydration without a greasy finish\r\nFragrance-free — suitable for sensitive skin\r\nFades post-acne marks and sun spots over time',449.00,599.00,189.00,80,'active',1,0,1,'/assets/images/face-serum.webp','[\"/assets/images/face-serum.webp\"]','glow cream, herbal moisturiser, daily cream, skin radiance, ayurvedic cream','Aqua, Glycerin, Cetearyl Alcohol, Cetearyl Glucoside, Kesar Extract (Crocus sativus), Licorice Root Extract (Glycyrrhiza glabra), Vitamin C (Sodium Ascorbyl Phosphate), Niacinamide, Hyaluronic Acid (Sodium Hyaluronate), Shea Butter (Butyrospermum parkii), Argan Oil (Argania spinosa), Turmeric Extract (Curcuma longa), Panthenol, Phenoxyethanol, Ethylhexylglycerin, Citric Acid','New','Herbal Glow Cream — Ayurvedic Daily Moisturiser for Radiant Skin | Luv Kush Natural','Luv Kush Natural Herbal Glow Cream — saffron, licorice & Vitamin C for natural brightening. 12-hour hydration, fragrance-free. Fades dark spots for Indian skin tones.','herbal glow cream, ayurvedic moisturiser, brightening cream india, saffron face cream, licorice skin cream, daily glow cream, moisturiser for indian skin',80.00,6.00,6.00,4.00,NULL,0,0,'hybrid',NULL,NULL,790,1,208,4.33,3,'2026-08-03 13:33:33','2026-08-10 17:14:42');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES (1,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjMzMDI4MywiZXhwIjoxNzg4OTIyMjgzfQ.zDnRha3BNfgUCU275sxEMxP6pTOpeBO0Y4ehu6rg90s','2026-08-17 08:21:23','2026-08-10 02:51:23'),(2,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjMzMDMxMSwiZXhwIjoxNzg4OTIyMzExfQ.j2bmiHwUlQ8nHZwFzFVr4-EeQAnk9FE7yP8uE2gClrE','2026-08-17 08:21:52','2026-08-10 02:51:51'),(3,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM2NzUwNiwiZXhwIjoxNzg4OTU5NTA2fQ.TpnT-QAm88fM04Tr005oKJUJX5IaNsniPetlRdHQO3o','2026-08-17 18:41:46','2026-08-10 13:11:46'),(4,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MTUwMywiZXhwIjoxNzg4OTYzNTAzfQ.L-TGfLtNls880WrDrAoiSKRDt2SRQU3TebZ52-yVmzA','2026-08-17 19:48:24','2026-08-10 14:18:23'),(5,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MTU4NiwiZXhwIjoxNzg4OTYzNTg2fQ.YigJ8zbrn9MdSS8ubZJkl4fi1lf6Atwh9LVZNN_HwNg','2026-08-17 19:49:46','2026-08-10 14:19:46'),(6,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MTYyMCwiZXhwIjoxNzg4OTYzNjIwfQ.c2kErE5ReJ-fB_ZwLaxlYq8zsWuLTdHtoKQgWNVtK6E','2026-08-17 19:50:21','2026-08-10 14:20:20'),(7,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MjIxMSwiZXhwIjoxNzg4OTY0MjExfQ.7ooJ0Y8Y0nJu0Wrdoro8gKgx4yn-66lFliVqOTWJ_hI','2026-08-17 20:00:11','2026-08-10 14:30:11'),(8,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MjI1NCwiZXhwIjoxNzg4OTY0MjU0fQ.kwYUQRxzxJQoLv8BNCvZAAukwSP6bpzbRxpodgBAa_Q','2026-08-17 20:00:54','2026-08-10 14:30:54'),(9,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MjY2MiwiZXhwIjoxNzg4OTY0NjYyfQ.7ag3jeN4Ct3DCBp-QrcDgqpsJ-YOUzTDh5llBRrAPxI','2026-08-17 20:07:42','2026-08-10 14:37:42'),(10,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3Mjc4MywiZXhwIjoxNzg4OTY0NzgzfQ.99qUMI0QFBYwBWh1LX9nhBWS0XqXpo8xrxlM1coNqf8','2026-08-17 20:09:44','2026-08-10 14:39:43'),(11,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3Mjg1NywiZXhwIjoxNzg4OTY0ODU3fQ.hsEx-RYD21a9QLggAL-NxZacFh4O2nNXo_F3VVeWSWE','2026-08-17 20:10:57','2026-08-10 14:40:57'),(12,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3MzA5MywiZXhwIjoxNzg4OTY1MDkzfQ.0aFF9b1vDCkk-Rw26R7bVHvexGue6FEXWtrey8aY0Ws','2026-08-17 20:14:53','2026-08-10 14:44:53'),(13,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3NDAzMiwiZXhwIjoxNzg4OTY2MDMyfQ.3EjVop0QUlLFCNScj_-QtK-7-M2rD1CzbdeIxG6b-g8','2026-08-17 20:30:33','2026-08-10 15:00:32'),(14,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3NDQ0NiwiZXhwIjoxNzg4OTY2NDQ2fQ.X-Y6NkxMj8Arx90qpIaLgUm0AR38AC-8_M17MXiXCDA','2026-08-17 20:37:26','2026-08-10 15:07:26'),(15,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3NTEyOSwiZXhwIjoxNzg4OTY3MTI5fQ.Hcex_qEqJ8QnHY1fc_vFu7hV28p9w1HkzwdAINiBPoc','2026-08-17 20:48:49','2026-08-10 15:18:49'),(16,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3NTE5OSwiZXhwIjoxNzg4OTY3MTk5fQ.39u9pds_ytrCPQ8jcwFds5nRXPkuuaf2zZKZhTZfJ1U','2026-08-17 20:49:59','2026-08-10 15:19:59'),(17,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3NTQxMCwiZXhwIjoxNzg4OTY3NDEwfQ.Q6me-jmkwnomcqj1nNItE3pGcbQeRCna61Ff8w5U-j0','2026-08-17 20:53:30','2026-08-10 15:23:30'),(18,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3NTQzOSwiZXhwIjoxNzg4OTY3NDM5fQ.N5OUIIZem-fAm2HJgxbDkpyJ6K2m-QJNoqAD_XWFGbo','2026-08-17 20:53:59','2026-08-10 15:23:59'),(19,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM3Njc2MywiZXhwIjoxNzg4OTY4NzYzfQ.dFDK4lf2YnNISab3iSzqWKPmFeMhbzg_UIqBaRJLcEc','2026-08-17 21:16:03','2026-08-10 15:46:03'),(20,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MDI0NCwiZXhwIjoxNzg4OTcyMjQ0fQ.jBHYLjbE8bPtUsTSo0eS5blmavm7o6bBdgnfgtLbjPg','2026-08-17 22:14:05','2026-08-10 16:44:04'),(21,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MDQwNCwiZXhwIjoxNzg4OTcyNDA0fQ.8_4DQ5IorjYTGFeS89ZZpCFgR8_zLsf5hpTPVk4aPV4','2026-08-17 22:16:44','2026-08-10 16:46:44'),(22,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MDYyMiwiZXhwIjoxNzg4OTcyNjIyfQ.u7-yCBzs7GC2yhnh5NyuQLqv06JLm8CH7k3x0OOUakQ','2026-08-17 22:20:23','2026-08-10 16:50:21'),(23,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MDgzMSwiZXhwIjoxNzg4OTcyODMxfQ.PPp1ml2_TSnK-RlJmWUqBzG7NP83NuQDw20_zCUTGIo','2026-08-17 22:23:51','2026-08-10 16:53:51'),(24,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MDk0OSwiZXhwIjoxNzg4OTcyOTQ5fQ.lUllPc5kSvcQNJtjQSTiESURs1cW2sGvq8qbtLnNm0M','2026-08-17 22:25:50','2026-08-10 16:55:49'),(25,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTExOSwiZXhwIjoxNzg4OTczMTE5fQ.kBd7Cv0Ym_U7TLrAQUqpQ8yyHFrTY-tkCAPHqO1P3sM','2026-08-17 22:28:40','2026-08-10 16:58:39'),(26,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTIyOCwiZXhwIjoxNzg4OTczMjI4fQ.Wrdi6IxsEkcy7j0chuGS03o68d5Roh_P3Q1GbqSzP7o','2026-08-17 22:30:28','2026-08-10 17:00:28'),(27,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTU5NCwiZXhwIjoxNzg4OTczNTk0fQ.CYJ4galq-Ajot4lMR2aVfvtNBWH-vX9Grn7D6c7r7fE','2026-08-17 22:36:34','2026-08-10 17:06:34'),(28,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTY4NywiZXhwIjoxNzg4OTczNjg3fQ.uFRiV6pE_2HCuXU1aE5p1Eii7SlFC2v8GhveR9-LcME','2026-08-17 22:38:07','2026-08-10 17:08:07'),(29,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTcxMSwiZXhwIjoxNzg4OTczNzExfQ.3ngmYP7sL43W63mAa8WHwnQ-Rvg2nQK71A-dx6Bn4a8','2026-08-17 22:38:31','2026-08-10 17:08:31'),(30,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTc1NCwiZXhwIjoxNzg4OTczNzU0fQ.J2zaIxexk6mfATRc-wkAlB_e-4A4jjz2-OQ008JfpHc','2026-08-17 22:39:14','2026-08-10 17:09:14'),(31,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MTk5MCwiZXhwIjoxNzg4OTczOTkwfQ.S9MyRKB2zoejIYOPaI4MWRTo0Up59CipvYrN76YfqeE','2026-08-17 22:43:10','2026-08-10 17:13:10'),(32,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MjAwMywiZXhwIjoxNzg4OTc0MDAzfQ.iTWv2v3cCyy5Exx5esh6TQj_A_T38hicrhuYrdgr4rU','2026-08-17 22:43:24','2026-08-10 17:13:23'),(33,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AbHV2a3VzaG5hdHVyYWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzg2MzgyMDY1LCJleHAiOjE3ODg5NzQwNjV9.kS_xhZXqUloAuIikdwiH_Eo8ityNwd5AV6b71gmRQxc','2026-08-17 22:44:25','2026-08-10 17:14:25'),(34,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AbHV2a3VzaG5hdHVyYWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzg2MzgyMjgyLCJleHAiOjE3ODg5NzQyODJ9.9q501HkO-AX-cbhXoYht4PkPZJILYMA-NhcVTQboIfI','2026-08-17 22:48:02','2026-08-10 17:18:02'),(35,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MjI5OCwiZXhwIjoxNzg4OTc0Mjk4fQ.WcosHADqgjXlduwlUkfOkaiW8g5kzZQ5a1ouh4eluPU','2026-08-17 22:48:19','2026-08-10 17:18:18'),(36,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiY3VzdG9tZXJAdGVzdC5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3ODYzODIzMTMsImV4cCI6MTc4ODk3NDMxM30.sLgwMOa41VyKC_pH2R59RnWV_MnRe-CZ67M-e6JXoek','2026-08-17 22:48:34','2026-08-10 17:18:33'),(37,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiY3VzdG9tZXJAdGVzdC5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3ODYzODIzNDQsImV4cCI6MTc4ODk3NDM0NH0._uPTM2-lhUg0SQRs9MubhDCfqv4IAecTBpu1C4hGU-0','2026-08-17 22:49:04','2026-08-10 17:19:04'),(38,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiY3VzdG9tZXJAdGVzdC5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3ODYzODIzNzIsImV4cCI6MTc4ODk3NDM3Mn0.pQ_5JPKK9ZGWrMmAWX4wjjsYSBLCtGuupHXFuNGRuyU','2026-08-17 22:49:33','2026-08-10 17:19:32'),(39,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiY3VzdG9tZXJAdGVzdC5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3ODYzODI0NjEsImV4cCI6MTc4ODk3NDQ2MX0.MuIA36mJ0Hd7XIE96No-MAHKAXBOVKV3X9w3yRdgU3w','2026-08-17 22:51:01','2026-08-10 17:21:01'),(40,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MjU5OCwiZXhwIjoxNzg4OTc0NTk4fQ.gvQt2BuiMLr8Pf5de3K3ZZfyr_Ss_wNXmfMl6MtXIig','2026-08-17 22:53:19','2026-08-10 17:23:18'),(41,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MzE5MSwiZXhwIjoxNzg4OTc1MTkxfQ.zwpdZ9YrtfrilTLgsGTYUl5NY143p1CSOBLFZ23tsno','2026-08-17 23:03:11','2026-08-10 17:33:11'),(42,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4MzI2MSwiZXhwIjoxNzg4OTc1MjYxfQ.57Dr1jX3IkaRndD3tBG05FZIj5qEBTlwroINgcoppnk','2026-08-17 23:04:21','2026-08-10 17:34:21'),(43,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjM4NDMxOCwiZXhwIjoxNzg4OTc2MzE4fQ.FxZcQEhp754f7BwMXM9TnJvgUuzY8Af1IrRzxKnBeRU','2026-08-17 23:21:58','2026-08-10 17:51:58'),(44,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AbG9jYWxob3N0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NjQxNjE2MywiZXhwIjoxNzg5MDA4MTYzfQ.-NFV55MlIDtEdMqrugijFfjZkFXV3poZGO0BfpJJIMQ','2026-08-18 08:12:44','2026-08-11 02:42:43');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `rating` tinyint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT '0',
  `helpful_votes` int unsigned DEFAULT '0',
  `helpful_count` int unsigned DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reviews_product` (`product_id`),
  KEY `fk_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `body`, `is_verified_purchase`, `helpful_votes`, `helpful_count`, `status`, `created_at`, `updated_at`) VALUES (1,1,3,5,'Absolutely worth it','Three months in and my hair fall has genuinely reduced. The oil is not sticky at all, which was my biggest worry with herbal oils.',1,12,12,'approved','2026-07-31 13:33:33','2026-08-03 13:33:33'),(2,1,3,4,'Great, but takes patience','Do not expect miracles in two weeks. Around week six I started seeing less hair on my pillow. Sticking with it.',1,9,9,'approved','2026-07-23 13:33:33','2026-08-03 13:33:33'),(3,1,3,4,'Good quality product','Packaging is premium and the product feels genuine. Delivery was quick too.',1,6,6,'approved','2026-07-15 13:33:33','2026-08-03 13:33:33'),(4,4,3,5,'Smells incredible','The herbal smell is earthy and clean, not overpowering like other ayurvedic oils I have used. My whole family uses it now.',1,12,12,'approved','2026-07-19 13:33:33','2026-08-03 13:33:33'),(5,4,3,5,'Repurchasing for the third time','This has become a permanent part of my weekly routine. Nothing else has worked this consistently for me.',1,9,9,'approved','2026-07-11 13:33:33','2026-08-03 13:33:33'),(6,4,3,5,'Noticeable difference','I was sceptical but my hairdresser actually asked what I had changed. Baby hairs coming in around the temples.',1,6,6,'approved','2026-07-03 13:33:33','2026-08-03 13:33:33'),(7,6,3,5,'Absolutely worth it','Three months in and my hair fall has genuinely reduced. The oil is not sticky at all, which was my biggest worry with herbal oils.',1,12,12,'approved','2026-07-07 13:33:33','2026-08-03 13:33:33'),(8,6,3,4,'Great, but takes patience','Do not expect miracles in two weeks. Around week six I started seeing less hair on my pillow. Sticking with it.',1,9,9,'approved','2026-06-29 13:33:33','2026-08-03 13:33:33'),(9,6,3,4,'Good quality product','Packaging is premium and the product feels genuine. Delivery was quick too.',1,6,6,'approved','2026-06-21 13:33:33','2026-08-03 13:33:33'),(10,16,3,5,'Smells incredible','The herbal smell is earthy and clean, not overpowering like other ayurvedic oils I have used. My whole family uses it now.',1,12,12,'approved','2026-06-25 13:33:33','2026-08-03 13:33:33'),(11,16,3,5,'Repurchasing for the third time','This has become a permanent part of my weekly routine. Nothing else has worked this consistently for me.',1,9,9,'approved','2026-06-17 13:33:33','2026-08-03 13:33:33'),(12,16,3,5,'Noticeable difference','I was sceptical but my hairdresser actually asked what I had changed. Baby hairs coming in around the temples.',1,6,6,'approved','2026-06-09 13:33:33','2026-08-03 13:33:33'),(13,21,3,5,'Absolutely worth it','Three months in and my hair fall has genuinely reduced. The oil is not sticky at all, which was my biggest worry with herbal oils.',1,12,12,'approved','2026-06-13 13:33:33','2026-08-03 13:33:33'),(14,21,3,4,'Great, but takes patience','Do not expect miracles in two weeks. Around week six I started seeing less hair on my pillow. Sticking with it.',1,9,9,'approved','2026-06-05 13:33:33','2026-08-03 13:33:33'),(15,21,3,4,'Good quality product','Packaging is premium and the product feels genuine. Delivery was quick too.',1,6,6,'approved','2026-05-28 13:33:33','2026-08-03 13:33:33'),(16,5,3,5,'Smells incredible','The herbal smell is earthy and clean, not overpowering like other ayurvedic oils I have used. My whole family uses it now.',1,12,12,'approved','2026-06-01 13:33:33','2026-08-03 13:33:33'),(17,5,3,5,'Repurchasing for the third time','This has become a permanent part of my weekly routine. Nothing else has worked this consistently for me.',1,9,9,'approved','2026-05-24 13:33:34','2026-08-03 13:33:34'),(18,5,3,5,'Noticeable difference','I was sceptical but my hairdresser actually asked what I had changed. Baby hairs coming in around the temples.',1,6,6,'approved','2026-05-16 13:33:34','2026-08-03 13:33:34'),(19,25,3,5,'Absolutely worth it','Three months in and my hair fall has genuinely reduced. The oil is not sticky at all, which was my biggest worry with herbal oils.',1,12,12,'approved','2026-05-20 13:33:34','2026-08-03 13:33:34'),(20,25,3,4,'Great, but takes patience','Do not expect miracles in two weeks. Around week six I started seeing less hair on my pillow. Sticking with it.',1,9,9,'approved','2026-05-12 13:33:34','2026-08-03 13:33:34'),(21,25,3,4,'Good quality product','Packaging is premium and the product feels genuine. Delivery was quick too.',1,6,6,'approved','2026-05-04 13:33:34','2026-08-03 13:33:34'),(22,11,3,5,'Smells incredible','The herbal smell is earthy and clean, not overpowering like other ayurvedic oils I have used. My whole family uses it now.',1,12,12,'approved','2026-05-08 13:33:34','2026-08-03 13:33:34'),(23,11,3,5,'Repurchasing for the third time','This has become a permanent part of my weekly routine. Nothing else has worked this consistently for me.',1,9,9,'approved','2026-04-30 13:33:34','2026-08-03 13:33:34'),(24,11,3,5,'Noticeable difference','I was sceptical but my hairdresser actually asked what I had changed. Baby hairs coming in around the temples.',1,6,6,'approved','2026-04-22 13:33:34','2026-08-03 13:33:34'),(25,15,3,5,'Absolutely worth it','Three months in and my hair fall has genuinely reduced. The oil is not sticky at all, which was my biggest worry with herbal oils.',1,12,12,'approved','2026-04-26 13:33:34','2026-08-03 13:33:34'),(26,15,3,4,'Great, but takes patience','Do not expect miracles in two weeks. Around week six I started seeing less hair on my pillow. Sticking with it.',1,9,9,'approved','2026-04-18 13:33:34','2026-08-03 13:33:34'),(27,15,3,4,'Good quality product','Packaging is premium and the product feels genuine. Delivery was quick too.',1,6,6,'approved','2026-04-10 13:33:34','2026-08-03 13:33:34');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `email_verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `reset_password_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expires` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `status`, `email_verification_token`, `email_verified_at`, `reset_password_token`, `reset_password_expires`, `last_login_at`, `created_at`, `updated_at`) VALUES (1,'Admin','User','admin@luvkushnatural.com','$2a$12$6gcZHu.KVP16iWiunqF98.1xdYuukDsmp5Z1U7.P2yfYX.eBFgn4a',NULL,'super_admin','active',NULL,NULL,NULL,NULL,'2026-08-10 17:18:02','2026-08-03 13:33:28','2026-08-10 17:18:02'),(3,'Test','Customer','customer@test.com','$2a$12$MzanTHiEKriPNkxaf9SuAuegr3kzStxZ5/PKSrj2gVSvYJ7OWjRM6',NULL,'customer','active',NULL,NULL,NULL,NULL,'2026-08-10 17:21:01','2026-08-03 13:33:28','2026-08-10 17:21:01'),(4,'Admin','User','admin@localhost.com','$2a$12$xXeobFvMd5YrfO2eyV3FXuoqxsM9eCiN58fRmXIYxBeiAak3S5igu',NULL,'admin','active',NULL,NULL,NULL,NULL,'2026-08-11 02:42:43','2026-08-10 02:51:09','2026-08-11 02:42:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `product_id` int unsigned NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_product` (`user_id`,`product_id`),
  KEY `fk_wishlists_product` (`product_id`),
  CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `added_at`) VALUES (1,4,25,'2026-08-10 02:55:45');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'luvkush_natural'
--

--
-- Dumping routines for database 'luvkush_natural'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11  2:46:55
