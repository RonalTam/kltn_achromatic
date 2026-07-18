-- Replace the order-scoped uniqueness rule with the service contract:
-- one review per customer for each product, regardless of purchase order.
CREATE UNIQUE INDEX "reviews_productId_userId_key"
ON "reviews"("productId", "userId");

DROP INDEX IF EXISTS "reviews_productId_userId_orderId_key";
