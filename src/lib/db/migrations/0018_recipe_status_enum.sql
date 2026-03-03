-- Add new recipe_status enum values (must run outside transaction)
ALTER TYPE "recipe_status" ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE "recipe_status" ADD VALUE IF NOT EXISTS 'pending_review';

-- Add new notification_type enum value
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'recipe_commented';
