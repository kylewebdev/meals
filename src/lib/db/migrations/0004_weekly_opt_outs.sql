ALTER TYPE "notification_type" ADD VALUE 'opt_out_reset';

CREATE TABLE "week_opt_outs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_id" text NOT NULL,
	"reset_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "week_opt_outs_user_week_uniq" UNIQUE("user_id","week_id")
);

CREATE INDEX "week_opt_outs_user_id_idx" ON "week_opt_outs" USING btree ("user_id");

ALTER TABLE "week_opt_outs" ADD CONSTRAINT "week_opt_outs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "week_opt_outs" ADD CONSTRAINT "week_opt_outs_week_id_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."weeks"("id") ON DELETE cascade ON UPDATE no action;
