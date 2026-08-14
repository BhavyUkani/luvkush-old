-- Set server-side (never by the client) whenever a Razorpay order is
-- created, so payment verification always knows the exact amount that was
-- actually charged instead of trusting client input.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pending_charge_amount DECIMAL(10,2) NULL DEFAULT NULL AFTER razorpay_signature;
