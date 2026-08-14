CREATE TABLE IF NOT EXISTS review_votes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id  INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY idx_review_votes_unique (review_id, user_id),
  CONSTRAINT fk_review_votes_review FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE,
  CONSTRAINT fk_review_votes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
