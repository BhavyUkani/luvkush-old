-- Checkout has always sent shipping_method; order.service.ts silently
-- discarded it until LK-M24 was fixed.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20) NOT NULL DEFAULT 'standard' AFTER payment_method;
