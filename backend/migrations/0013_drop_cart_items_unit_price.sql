-- cart_items.unit_price was write-only: addItem() stored it but getCart()
-- always joined the live product/variant price instead of reading it back
-- (the correct behaviour — a cart should reflect current pricing). Nothing
-- in the codebase ever reads this column.
ALTER TABLE cart_items DROP COLUMN IF EXISTS unit_price;
