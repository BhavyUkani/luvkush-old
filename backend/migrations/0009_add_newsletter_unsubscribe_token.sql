ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64) NULL DEFAULT NULL AFTER email;

UPDATE newsletter_subscribers SET unsubscribe_token = SHA2(CONCAT(email, RAND()), 256) WHERE unsubscribe_token IS NULL;
