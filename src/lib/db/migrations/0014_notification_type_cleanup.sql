-- Remove any notifications using stale enum values before recreating the type
DELETE FROM "notifications" WHERE "type" IN ('cooking_reminder', 'meal_plan_posted', 'contribution_reminder', 'contribution_posted');--> statement-breakpoint
ALTER TYPE "notification_type" RENAME TO "notification_type_old";--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('new_recipe', 'opt_out_reset', 'recipe_reviewed', 'member_joined');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "notification_type" USING "type"::text::"notification_type";--> statement-breakpoint
DROP TYPE "notification_type_old";
