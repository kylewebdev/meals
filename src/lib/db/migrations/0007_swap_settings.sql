-- Phase 3.5: Auto-schedule with recipe rotation
-- Incremental changes on top of 0006_recipe_status

-- New enum for household order mode
CREATE TYPE "public"."household_order_mode" AS ENUM('fixed', 'random');--> statement-breakpoint

-- Singleton settings table for auto-schedule configuration
CREATE TABLE "swap_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"start_date" timestamp NOT NULL,
	"swap_mode" "swap_mode" DEFAULT 'single' NOT NULL,
	"recipe_order" text[] DEFAULT '{}'::text[] NOT NULL,
	"household_order" text[] DEFAULT '{}'::text[] NOT NULL,
	"household_order_mode" "household_order_mode" DEFAULT 'fixed' NOT NULL,
	"default_location" text,
	"default_time" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Add recipe_id column to swap_days for recipe rotation assignment
ALTER TABLE "swap_days" ADD COLUMN "recipe_id" text;--> statement-breakpoint

-- Foreign key for swap_days.recipe_id
ALTER TABLE "swap_days" ADD CONSTRAINT "swap_days_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Index on swap_days.recipe_id for join performance
CREATE INDEX "swap_days_recipe_id_idx" ON "swap_days" USING btree ("recipe_id");
