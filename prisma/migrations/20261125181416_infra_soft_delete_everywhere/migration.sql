-- DropForeignKey
ALTER TABLE "auth_sessions" DROP CONSTRAINT "auth_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "emergency_contacts" DROP CONSTRAINT "emergency_contacts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "item_attempts" DROP CONSTRAINT "item_attempts_item_result_id_fkey";

-- DropForeignKey
ALTER TABLE "item_results" DROP CONSTRAINT "item_results_session_id_fkey";

-- DropForeignKey
ALTER TABLE "session_summaries" DROP CONSTRAINT "session_summaries_session_id_fkey";

-- DropIndex
DROP INDEX "center_devices_center_id_label_key";

-- DropIndex
DROP INDEX "centers_code_key";

-- DropIndex
DROP INDEX "performance_level_criteria_level_difficulty_level_effective_key";

-- DropIndex
DROP INDEX "schedule_templates_center_id_day_of_week_start_minute_effec_key";

-- DropIndex
DROP INDEX "time_slots_center_id_start_at_key";

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "auth_sessions" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "center_devices" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "centers" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "data_subject_requests" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "emergency_contacts" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "performance_level_criteria" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "policy_documents" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "recommendations" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "schedule_exceptions" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "schedule_templates" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "session_summaries" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "time_slots" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "training_sessions" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "user_metric_snapshots" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "user_performance_levels" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_results" ADD CONSTRAINT "item_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attempts" ADD CONSTRAINT "item_attempts_item_result_id_fkey" FOREIGN KEY ("item_result_id") REFERENCES "item_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================================================
-- Hand-written part (cannot be expressed in the Prisma schema).
--
-- Soft delete everywhere (AGENTS.md §5, docs/decisions.md 2026-11-26): rows are never
-- physically deleted, they get "deleted_at". A unique rule whose value must be reusable
-- after a soft delete becomes a PARTIAL unique index over the rows that are not deleted
-- ("live" rows). The plain unique indexes they replace are dropped above by Prisma.
-- Prisma Migrate ignores partial indexes when diffing, so these stay in place.
-- If you rename a column used below, update the index in the same migration.
-- =====================================================================================

-- ---- identity ----
-- A removed account must not block a new sign-up with the same phone number.
-- (An anonymised account already has "phone" = NULL, which never collides.)
CREATE UNIQUE INDEX "users_phone_live_key"
  ON "users" ("phone")
  WHERE "deleted_at" IS NULL;

-- ---- centers ----
-- The code of a removed center and the label of a removed device can be used again.
CREATE UNIQUE INDEX "centers_code_live_key"
  ON "centers" ("code")
  WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "center_devices_center_id_label_live_key"
  ON "center_devices" ("center_id", "label")
  WHERE "deleted_at" IS NULL;

-- ---- booking ----
-- Removing a template (or a generated slot) and creating the same opening hours again
-- must work.
CREATE UNIQUE INDEX "schedule_templates_center_day_start_effective_live_key"
  ON "schedule_templates" ("center_id", "day_of_week", "start_minute", "effective_from")
  WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "time_slots_center_id_start_at_live_key"
  ON "time_slots" ("center_id", "start_at")
  WHERE "deleted_at" IS NULL;

-- The two double-booking rules from the init migration, unchanged except that a
-- soft-deleted booking no longer counts as ACTIVE.
DROP INDEX "bookings_active_slot_user_key";
CREATE UNIQUE INDEX "bookings_active_slot_user_key"
  ON "bookings" ("slot_id", "user_id")
  WHERE "status" IN ('BOOKED', 'CHECKED_IN', 'COMPLETED') AND "deleted_at" IS NULL;

DROP INDEX "bookings_active_user_day_key";
CREATE UNIQUE INDEX "bookings_active_user_day_key"
  ON "bookings" ("user_id", "slot_date")
  WHERE "status" IN ('BOOKED', 'CHECKED_IN', 'COMPLETED') AND "deleted_at" IS NULL;

-- ---- analytics ----
-- A removed criterion must not block a corrected one for the same level and start date.
CREATE UNIQUE INDEX "performance_level_criteria_level_difficulty_effective_live_key"
  ON "performance_level_criteria" ("level", "difficulty_level", "effective_from")
  WHERE "deleted_at" IS NULL;

-- Exactly one current level per user per difficulty (init migration), unchanged except
-- that a soft-deleted row no longer counts as current.
DROP INDEX "user_performance_levels_current_key";
CREATE UNIQUE INDEX "user_performance_levels_current_key"
  ON "user_performance_levels" ("user_id", "difficulty_level")
  WHERE "is_current" AND "deleted_at" IS NULL;

-- Deliberately left as plain (non-partial) unique indexes, so a soft-deleted row keeps
-- its value:
--   auth_sessions.token_hash, center_devices.device_token_hash  secrets, never reused
--   policy_documents (type, version)       a version label never names two texts
--   user_metric_snapshots natural key      one row per period for ever; recompute revives it
--   item_results, item_attempts            append-only ledgers, no "deleted_at"
