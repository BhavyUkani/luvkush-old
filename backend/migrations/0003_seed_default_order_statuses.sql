-- IGNORE: on a database that already has these rows from the old imperative
-- seed-if-empty logic, this must not fail with a duplicate-key error on the
-- UNIQUE slug column — it should just leave those rows alone.
INSERT IGNORE INTO order_statuses (name, slug, color, sort_order, is_system) VALUES
  ('Order Placed', 'pending', '#B87333', 1, true),
  ('Confirmed', 'confirmed', '#3182CE', 2, true),
  ('Processing', 'processing', '#805AD5', 3, true),
  ('Quality Check', 'quality_check', '#319795', 4, true),
  ('Shipped', 'shipped', '#D69E2E', 5, true),
  ('Out For Delivery', 'out_for_delivery', '#4A5568', 6, true),
  ('Delivered', 'delivered', '#38A169', 7, true),
  ('Cancelled', 'cancelled', '#E53E3E', 8, true),
  ('Refund Requested', 'refund_requested', '#DD6B20', 9, true),
  ('Refunded', 'refunded', '#718096', 10, true),
  ('Returned', 'returned', '#E53E3E', 11, true);
