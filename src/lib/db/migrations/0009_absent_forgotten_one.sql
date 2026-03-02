ALTER TABLE "recipes" DROP COLUMN "calories";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "protein_g";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "carbs_g";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "fat_g";--> statement-breakpoint
ALTER TABLE "swap_days" DROP CONSTRAINT IF EXISTS "swap_days_recipe_id_recipes_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "swap_days_recipe_id_idx";--> statement-breakpoint
ALTER TABLE "swap_days" DROP COLUMN IF EXISTS "recipe_id";--> statement-breakpoint
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_start_date_unique" UNIQUE("start_date");
