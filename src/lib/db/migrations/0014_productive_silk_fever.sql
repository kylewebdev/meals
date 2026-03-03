CREATE TABLE "extra_people" (
	"id" text PRIMARY KEY NOT NULL,
	"household_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"portions" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "extra_people" ADD CONSTRAINT "extra_people_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "extra_people_household_id_idx" ON "extra_people" USING btree ("household_id");--> statement-breakpoint
ALTER TABLE "households" DROP COLUMN "extra_portions";