-- refresh_tokens.token in particular is looked up on every token refresh.
ALTER TABLE refresh_tokens ADD INDEX IF NOT EXISTS idx_refresh_tokens_token (token(255));
ALTER TABLE reviews ADD INDEX IF NOT EXISTS idx_reviews_status (status);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_products_category_id (category_id);
ALTER TABLE blog_posts ADD INDEX IF NOT EXISTS idx_blog_posts_status (status);
