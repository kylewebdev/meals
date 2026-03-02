CREATE TABLE "grocery_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"contribution_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grocery_lists_contribution_id_unique" UNIQUE("contribution_id")
);
--> statement-breakpoint
CREATE TABLE "grocery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"ingredient_name" varchar(255) NOT NULL,
	"quantity" varchar(50),
	"unit" varchar(50),
	"checked" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grocery_lists" ADD CONSTRAINT "grocery_lists_contribution_id_contributions_id_fk" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "grocery_items" ADD CONSTRAINT "grocery_items_list_id_grocery_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."grocery_lists"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "grocery_lists_contribution_id_idx" ON "grocery_lists" USING btree ("contribution_id");
--> statement-breakpoint
CREATE INDEX "grocery_items_list_id_idx" ON "grocery_items" USING btree ("list_id");
