-- Custom SQL migration file, put your code below! --
CREATE TYPE "recipe_status" AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE "recipes" ADD COLUMN "status" "recipe_status" DEFAULT 'pending' NOT NULL;
UPDATE "recipes" SET "status" = 'approved';
CREATE INDEX "recipes_status_idx" ON "recipes" USING btree ("status");
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'recipe_reviewed';
