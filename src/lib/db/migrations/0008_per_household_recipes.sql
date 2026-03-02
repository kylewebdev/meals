DROP INDEX IF EXISTS "swap_days_recipe_id_idx";
ALTER TABLE "swap_days" DROP CONSTRAINT IF EXISTS "swap_days_recipe_id_recipes_id_fk";
ALTER TABLE "swap_days" DROP COLUMN IF EXISTS "recipe_id";
