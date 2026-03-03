-- Migrate existing data to new statuses
UPDATE "recipes" SET "status" = 'submitted' WHERE "status" = 'pending';
UPDATE "recipes" SET "status" = 'submitted' WHERE "status" = 'rejected';

-- Add admin feedback columns to recipes
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "admin_feedback" text;
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "admin_feedback_at" timestamp;

-- Create recipe_comments table
CREATE TABLE IF NOT EXISTS "recipe_comments" (
  "id" text PRIMARY KEY NOT NULL,
  "recipe_id" text NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "recipe_comments_recipe_id_idx" ON "recipe_comments" ("recipe_id");
CREATE INDEX IF NOT EXISTS "recipe_comments_user_id_idx" ON "recipe_comments" ("user_id");
