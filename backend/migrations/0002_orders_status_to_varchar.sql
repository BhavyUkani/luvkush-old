-- database_creation.sql has always defined orders.status as VARCHAR(50);
-- this only matters for databases created from an older schema where it
-- was still an ENUM. Safe to run unconditionally — reapplying the same
-- VARCHAR(50) definition to an already-VARCHAR column is a no-op.
ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';
