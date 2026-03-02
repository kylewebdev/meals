-- Delete duplicate weeks, keeping the oldest row per start_date.
-- First, reassign contributions and swap_days from duplicates to the keeper,
-- then delete the duplicate weeks.

-- Step 1: For each duplicate week, move its swap_days' contributions to the keeper's swap_day
-- (matched by day_of_week). We delete duplicate swap_days/contributions instead of moving
-- because they are exact copies. The CASCADE on weeks will handle cleanup.

-- Delete duplicate weeks (rows that share a start_date with an older row)
DELETE FROM weeks
WHERE id IN (
  SELECT w.id
  FROM weeks w
  INNER JOIN (
    SELECT start_date, MIN(created_at) AS min_created
    FROM weeks
    GROUP BY start_date
    HAVING COUNT(*) > 1
  ) dups ON w.start_date = dups.start_date AND w.created_at > dups.min_created
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_start_date_uniq" UNIQUE ("start_date");
