CREATE TABLE IF NOT EXISTS payment_transactions (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id           INT UNSIGNED NOT NULL,
  gateway            VARCHAR(50) NOT NULL,
  gateway_order_id   VARCHAR(255) DEFAULT NULL,
  gateway_payment_id VARCHAR(255) DEFAULT NULL,
  amount             DECIMAL(10,2) NOT NULL,
  status             VARCHAR(50) NOT NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
