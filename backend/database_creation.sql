-- ============================================================
-- Luv Kush Natural — Database Creation Script
-- Database: luvkush_natural
-- Compatible with MySQL 8.0+ & MariaDB 10.4+
--
-- This is the single source of truth for the database structure.
-- It creates the database and every table with no data — run it
-- once against an empty MySQL/MariaDB server to get a fresh,
-- ready-to-use schema. (Default order statuses are seeded
-- automatically by the backend on first boot — see server.ts.)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `luvkush_natural` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `luvkush_natural`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `blog_categories`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `newsletter_subscribers`;
DROP TABLE IF EXISTS `contact_queries`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `review_votes`;
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payment_transactions`;
DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `order_statuses`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `hair_solutions`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'customer',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `email_verification_token` VARCHAR(255) DEFAULT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `reset_password_token` VARCHAR(255) DEFAULT NULL,
  `reset_password_expires` TIMESTAMP NULL DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 2. REFRESH TOKENS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `refresh_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_refresh_tokens_user` (`user_id`),
  INDEX `idx_refresh_tokens_token` (`token`(255)),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 3. CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `banner_url` VARCHAR(500) DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `parent_id` INT UNSIGNED DEFAULT NULL,
  `display_order` INT UNSIGNED DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `status` VARCHAR(50) DEFAULT 'active',
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 4. PRODUCTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `how_to_use` TEXT DEFAULT NULL,
  `benefits` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `mrp` DECIMAL(10,2) NOT NULL,
  `cost_price` DECIMAL(10,2) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_bestseller` TINYINT(1) NOT NULL DEFAULT 0,
  `is_new` TINYINT(1) NOT NULL DEFAULT 0,
  `primary_image` VARCHAR(500) DEFAULT NULL,
  `images` TEXT DEFAULT NULL, -- JSON array of image URLs
  `tags` VARCHAR(500) DEFAULT NULL,
  `ingredients_list` TEXT DEFAULT NULL,
  `badges` VARCHAR(500) DEFAULT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `seo_keywords` VARCHAR(500) DEFAULT NULL,
  `weight` DECIMAL(10,2) DEFAULT NULL,
  `length_cm` DECIMAL(10,2) DEFAULT NULL,
  `width_cm` DECIMAL(10,2) DEFAULT NULL,
  `height_cm` DECIMAL(10,2) DEFAULT NULL,
  `dimensions` VARCHAR(100) DEFAULT NULL COMMENT 'LxWxH in mm',
  `reserved_quantity` INT UNSIGNED DEFAULT 0,
  `is_customisable` TINYINT(1) DEFAULT 0,
  `payment_mode` VARCHAR(50) NOT NULL DEFAULT 'full_cod',
  `advance_amount` DECIMAL(10,2) DEFAULT NULL,
  `created_by` INT UNSIGNED DEFAULT NULL,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `wishlist_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `sales_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `rating_avg` DECIMAL(3,2) DEFAULT 0.00,
  `rating_count` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_status` (`status`),
  INDEX `idx_products_category_id` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 5. PRODUCT VARIANTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `product_variants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `price_modifier` DECIMAL(10,2) DEFAULT 0.00,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 6. HAIR SOLUTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `hair_solutions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `base_price` DECIMAL(10,2) NOT NULL,
  `mrp` DECIMAL(10,2) DEFAULT NULL,
  `gender` VARCHAR(50) DEFAULT NULL,
  `size_info` VARCHAR(255) DEFAULT NULL,
  `colour_info` VARCHAR(255) DEFAULT NULL,
  `how_to_use` TEXT DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'wig',
  `status` VARCHAR(50) DEFAULT 'active',
  `product_id` INT UNSIGNED DEFAULT NULL,
  `payment_mode` VARCHAR(50) DEFAULT 'full_cod',
  `advance_amount` DECIMAL(10,2) DEFAULT NULL,
  `hair_type` VARCHAR(100) DEFAULT NULL,
  `cap_construction` VARCHAR(100) DEFAULT NULL,
  `hair_source` VARCHAR(100) DEFAULT NULL,
  `density` VARCHAR(100) DEFAULT NULL,
  `available_lengths` VARCHAR(255) DEFAULT NULL, -- JSON formatted string
  `available_colors` VARCHAR(255) DEFAULT NULL, -- JSON formatted string
  `maintenance_level` VARCHAR(100) DEFAULT NULL,
  `primary_image` VARCHAR(500) DEFAULT NULL,
  `images` TEXT DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hair_solutions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hair_solutions_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 7. CARTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `carts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `session_id` VARCHAR(255) DEFAULT NULL,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 8. CART ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `cart_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `variant_id` INT UNSIGNED DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `customisation_data` TEXT DEFAULT NULL, -- JSON configuration placeholder
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 9. COUPONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `discount_type` VARCHAR(50) NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) DEFAULT NULL,
  `max_discount_amount` DECIMAL(10,2) DEFAULT NULL,
  `usage_limit` INT DEFAULT NULL,
  `usage_count` INT NOT NULL DEFAULT 0,
  `usage_per_user` INT NOT NULL DEFAULT 1,
  `valid_from` TIMESTAMP NULL DEFAULT NULL,
  `valid_until` TIMESTAMP NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 10. ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `coupon_discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_address` TEXT NOT NULL, -- JSON string representation
  `billing_address` TEXT DEFAULT NULL, -- JSON string representation
  `special_instructions` TEXT DEFAULT NULL,
  `tracking_number` VARCHAR(100) DEFAULT NULL,
  `tracking_url` VARCHAR(500) DEFAULT NULL,
  `shiprocket_order_id` VARCHAR(255) DEFAULT NULL,
  `shiprocket_shipment_id` VARCHAR(255) DEFAULT NULL,
  `razorpay_order_id` VARCHAR(255) DEFAULT NULL,
  `razorpay_payment_id` VARCHAR(255) DEFAULT NULL,
  `razorpay_signature` VARCHAR(255) DEFAULT NULL,
  `pending_charge_amount` DECIMAL(10,2) DEFAULT NULL, -- server-computed amount for an in-flight Razorpay order, cleared on capture
  `advance_paid_amount` DECIMAL(10,2) DEFAULT NULL,
  `has_custom_product` TINYINT(1) DEFAULT 0,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_number` (`order_number`),
  INDEX `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 11. ORDER ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `variant_id` INT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `variant_name` VARCHAR(255) DEFAULT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `mrp` DECIMAL(10,2) DEFAULT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `primary_image` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 12. ORDER STATUSES (lookup list — the app seeds default rows into
--     this table automatically on first boot; see server.ts)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `order_statuses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `color` VARCHAR(50) DEFAULT '#B87333',
  `sort_order` INT UNSIGNED DEFAULT 0,
  `is_system` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 13. ORDER STATUS HISTORY
-- ────────────────────────────────────────────────────────────
CREATE TABLE `order_status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `status` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` TEXT NULL,
  `changed_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_status_history_order` (`order_id`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_status_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 14. PAYMENT TRANSACTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `payment_transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `gateway` VARCHAR(50) NOT NULL,
  `gateway_order_id` VARCHAR(255) DEFAULT NULL,
  `gateway_payment_id` VARCHAR(255) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL, -- success | refunded | failed
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payment_transactions_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 15. REVIEWS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `rating` TINYINT NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `is_verified_purchase` TINYINT(1) DEFAULT 0,
  `helpful_votes` INT UNSIGNED DEFAULT 0,
  `helpful_count` INT UNSIGNED DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_reviews_status` (`status`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 16. REVIEW VOTES (dedupes "helpful" votes per user)
-- ────────────────────────────────────────────────────────────
CREATE TABLE `review_votes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `review_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_review_votes_unique` (`review_id`, `user_id`),
  CONSTRAINT `fk_review_votes_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 17. WISHLISTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `wishlists` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_user_product` (`user_id`, `product_id`),
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 18. ADDRESSES
-- ────────────────────────────────────────────────────────────
CREATE TABLE `addresses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(100) DEFAULT 'Home',
  `recipient_name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(20) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `is_default` TINYINT(1) DEFAULT 0,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 19. CONTACT QUERIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE `contact_queries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `query_type` VARCHAR(50) DEFAULT 'general',
  `status` VARCHAR(50) DEFAULT 'open',
  `source` VARCHAR(50) DEFAULT 'website',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 20. NEWSLETTER SUBSCRIBERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `newsletter_subscribers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `unsubscribe_token` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `source` VARCHAR(50) DEFAULT 'website',
  `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 21. BLOG POSTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `blog_posts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` TEXT DEFAULT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `tags` VARCHAR(500) DEFAULT NULL,
  `author_id` INT UNSIGNED DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
  `reading_time_mins` INT DEFAULT 5,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_blog_posts_status` (`status`),
  CONSTRAINT `fk_blog_posts_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 22. BLOG CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE `blog_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 23. ACTIVITY LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE `activity_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) DEFAULT NULL,
  `reference_type` VARCHAR(100) DEFAULT NULL,
  `reference_id` INT UNSIGNED DEFAULT NULL,
  `old_values` TEXT DEFAULT NULL,
  `new_values` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
