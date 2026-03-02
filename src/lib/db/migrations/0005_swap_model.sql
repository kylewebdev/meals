-- Migration: swap model
-- Replaces the rotation/meal-plan model with a swap/contribution model

-- New enums
CREATE TYPE "swap_mode" AS ENUM ('single', 'dual');

-- Add new notification type values
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'contribution_reminder';
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'contribution_posted';

-- New tables
CREATE TABLE "swap_days" (
  "id" text PRIMARY KEY NOT NULL,
  "week_id" text NOT NULL REFERENCES "weeks"("id") ON DELETE CASCADE,
  "day_of_week" integer NOT NULL,
  "label" varchar(50) NOT NULL,
  "covers_from" integer NOT NULL,
  "covers_to" integer NOT NULL,
  "location" text,
  "time" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "swap_days_week_day_uniq" UNIQUE("week_id", "day_of_week")
);

CREATE INDEX "swap_days_week_id_idx" ON "swap_days" USING btree ("week_id");

CREATE TABLE "contributions" (
  "id" text PRIMARY KEY NOT NULL,
  "week_id" text NOT NULL REFERENCES "weeks"("id") ON DELETE CASCADE,
  "household_id" text NOT NULL REFERENCES "households"("id"),
  "swap_day_id" text NOT NULL REFERENCES "swap_days"("id") ON DELETE CASCADE,
  "recipe_id" text REFERENCES "recipes"("id"),
  "dish_name" varchar(255),
  "notes" text,
  "servings" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "contributions_week_household_swap_uniq" UNIQUE("week_id", "household_id", "swap_day_id")
);

CREATE INDEX "contributions_week_id_idx" ON "contributions" USING btree ("week_id");
CREATE INDEX "contributions_household_id_idx" ON "contributions" USING btree ("household_id");

-- Modify weeks: add swap_mode, drop old columns
ALTER TABLE "weeks" ADD COLUMN "swap_mode" "swap_mode" DEFAULT 'single' NOT NULL;
ALTER TABLE "weeks" DROP COLUMN IF EXISTS "household_id";
ALTER TABLE "weeks" DROP COLUMN IF EXISTS "pickup_location";
ALTER TABLE "weeks" DROP COLUMN IF EXISTS "pickup_times";
ALTER TABLE "weeks" DROP COLUMN IF EXISTS "pickup_notes";

-- Modify households: drop rotation_position
ALTER TABLE "households" DROP COLUMN IF EXISTS "rotation_position";

-- Drop old tables
DROP TABLE IF EXISTS "meal_plan_entries";

-- Drop old enum (safe because no columns reference it after dropping meal_plan_entries)
DROP TYPE IF EXISTS "meal_type";

-- Drop old index (if it exists from weeks.household_id)
DROP INDEX IF EXISTS "weeks_household_id_idx";
