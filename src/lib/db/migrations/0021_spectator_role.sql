ALTER TYPE "public"."user_role" ADD VALUE 'spectator';--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "household_id" DROP NOT NULL;
