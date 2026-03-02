CREATE TYPE "public"."recipe_rating_value" AS ENUM('love', 'fine', 'dislike');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipe_ratings" (
  "id" text PRIMARY KEY NOT NULL,
  "recipe_id" text NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
  "household_id" text NOT NULL REFERENCES "households"("id") ON DELETE CASCADE,
  "rating" "recipe_rating_value" NOT NULL,
  "comment" text,
  "rated_by" text NOT NULL REFERENCES "user"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "recipe_ratings_recipe_household_uniq" UNIQUE("recipe_id", "household_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_ratings_recipe_id_idx" ON "recipe_ratings" USING btree ("recipe_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_ratings_household_id_idx" ON "recipe_ratings" USING btree ("household_id");
