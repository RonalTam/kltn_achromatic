-- Add OAuth provider fields to users table
-- Migration: add_oauth_provider_fields

-- 1. Create AuthProvider enum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK');

-- 2. Make password nullable (OAuth users don't have passwords)
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- 3. Add provider column with default LOCAL
ALTER TABLE "users" ADD COLUMN "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';

-- 4. Add googleId (nullable, unique)
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- 5. Add facebookId (nullable, unique)
ALTER TABLE "users" ADD COLUMN "facebookId" TEXT;
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"("facebookId");
