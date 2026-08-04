-- Apply remaining OAuth columns (enum already created)
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "facebookId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_facebookId_key" ON "users"("facebookId");
