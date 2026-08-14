-- user.service.ts reads/writes this column; without it every profile
-- request fails with ER_BAD_FIELD_ERROR.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) NULL DEFAULT NULL AFTER phone;
