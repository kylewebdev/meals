CREATE TYPE "public"."notification_type" AS ENUM('cooking_reminder', 'meal_plan_posted', 'new_recipe');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"link_url" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" varchar(50),
	"unit" varchar(50),
	"calories" integer,
	"protein_g" integer,
	"carbs_g" integer,
	"fat_g" integer,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"instructions" text,
	"servings" integer,
	"prep_time_minutes" integer,
	"cook_time_minutes" integer,
	"calories" integer,
	"protein_g" integer,
	"carbs_g" integer,
	"fat_g" integer,
	"tags" text[],
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rsvps" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "suggestions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "votes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "rsvps" CASCADE;--> statement-breakpoint
DROP TABLE "suggestions" CASCADE;--> statement-breakpoint
DROP TABLE "votes" CASCADE;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "households" ADD COLUMN "head_id" text;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "invited_by" text;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "recipe_id" text;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "is_modified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "modification_notes" text;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "modified_calories" integer;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "modified_protein_g" integer;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "modified_carbs_g" integer;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD COLUMN "modified_fat_g" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "allergies" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dietary_preferences" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dietary_notes" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipes_created_by_idx" ON "recipes" USING btree ("created_by");--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_head_id_user_id_fk" FOREIGN KEY ("head_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."suggestion_status";