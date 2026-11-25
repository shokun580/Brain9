-- CreateEnum
CREATE TYPE "UsageContext" AS ENUM ('HOME', 'CENTER');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA');

-- CreateEnum
CREATE TYPE "SnapshotPeriod" AS ENUM ('DAY', 'WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "RecommendationReason" AS ENUM ('START', 'LEVEL_UP', 'REPEAT', 'STEP_DOWN');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('ACTIVE', 'ACCEPTED', 'DISMISSED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('SELF', 'ADMIN', 'WALK_IN');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('TABLET', 'DESKTOP', 'LAPTOP', 'PHONE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('PENDING', 'ACTIVE', 'MAINTENANCE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TrainingMode" AS ENUM ('TRAINING', 'TEST');

-- CreateEnum
CREATE TYPE "TrainingSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('TOUCH', 'MOUSE', 'PEN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_DELETION', 'ANONYMIZED');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('PIN', 'PASSWORD');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "SessionEndReason" AS ENUM ('LOGOUT', 'IDLE_TIMEOUT', 'SLOT_ENDED', 'EXPIRED', 'REVOKED_BY_ADMIN', 'CREDENTIAL_CHANGED', 'CONSENT_WITHDRAWN');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('PRIVACY_NOTICE', 'TERMS_OF_USE');

-- CreateEnum
CREATE TYPE "ConsentPurpose" AS ENUM ('TERMS_OF_USE', 'PERSONAL_DATA', 'COGNITIVE_DATA');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('GRANTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICT_PROCESSING', 'OBJECTION');

-- CreateEnum
CREATE TYPE "DataRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "session_summaries" (
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "mode" "TrainingMode" NOT NULL,
    "difficulty_level" SMALLINT NOT NULL,
    "context" "UsageContext" NOT NULL,
    "center_id" UUID,
    "items_total" SMALLINT NOT NULL,
    "items_correct" SMALLINT NOT NULL,
    "accuracy_pct" DECIMAL(5,2) NOT NULL,
    "avg_response_time_ms" INTEGER,
    "median_response_time_ms" INTEGER,
    "total_attempts" INTEGER NOT NULL,
    "avg_attempts_per_item" DECIMAL(4,2) NOT NULL,
    "max_correct_sequence" SMALLINT,
    "completed_at" TIMESTAMPTZ(3) NOT NULL,
    "computed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_summaries_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "performance_level_criteria" (
    "id" UUID NOT NULL,
    "level" SMALLINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "difficulty_level" SMALLINT NOT NULL DEFAULT 0,
    "min_accuracy_pct" DECIMAL(5,2) NOT NULL,
    "max_avg_response_time_ms" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "performance_level_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_performance_levels" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "difficulty_level" SMALLINT NOT NULL,
    "level" SMALLINT NOT NULL,
    "criterion_id" UUID,
    "accuracy_pct" DECIMAL(5,2) NOT NULL,
    "avg_response_time_ms" INTEGER,
    "sessions_count" INTEGER NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "triggered_by_session_id" UUID,
    "computed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_performance_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_metric_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mode" "TrainingMode" NOT NULL,
    "difficulty_level" SMALLINT NOT NULL DEFAULT 0,
    "period_type" "SnapshotPeriod" NOT NULL,
    "period_start" DATE NOT NULL,
    "sessions_count" INTEGER NOT NULL,
    "accuracy_pct" DECIMAL(5,2) NOT NULL,
    "avg_response_time_ms" INTEGER,
    "avg_attempts_per_item" DECIMAL(4,2),
    "moving_avg_accuracy_pct" DECIMAL(5,2),
    "trend_slope" DECIMAL(8,4),
    "trend_direction" "TrendDirection" NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    "computed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "reason" "RecommendationReason" NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'ACTIVE',
    "based_on_level_id" UUID,
    "based_on_session_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(3),

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_templates" (
    "id" UUID NOT NULL,
    "center_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_minute" SMALLINT NOT NULL,
    "end_minute" SMALLINT NOT NULL,
    "capacity" SMALLINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "schedule_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_exceptions" (
    "id" UUID NOT NULL,
    "center_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_minute" SMALLINT,
    "end_minute" SMALLINT,
    "is_closed" BOOLEAN NOT NULL DEFAULT true,
    "capacity_override" SMALLINT,
    "reason" VARCHAR(300),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL,
    "center_id" UUID NOT NULL,
    "template_id" UUID,
    "date" DATE NOT NULL,
    "start_at" TIMESTAMPTZ(3) NOT NULL,
    "end_at" TIMESTAMPTZ(3) NOT NULL,
    "capacity" SMALLINT NOT NULL,
    "booked_count" SMALLINT NOT NULL DEFAULT 0,
    "status" "SlotStatus" NOT NULL DEFAULT 'OPEN',
    "closed_reason" VARCHAR(300),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "center_id" UUID NOT NULL,
    "slot_date" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "source" "BookingSource" NOT NULL DEFAULT 'SELF',
    "created_by_id" UUID NOT NULL,
    "checked_in_at" TIMESTAMPTZ(3),
    "checked_in_device_id" UUID,
    "cancelled_at" TIMESTAMPTZ(3),
    "cancelled_by_id" UUID,
    "cancel_reason" VARCHAR(300),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "district" VARCHAR(100),
    "province" VARCHAR(100),
    "phone" VARCHAR(20),
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Bangkok',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "center_devices" (
    "id" UUID NOT NULL,
    "center_id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "asset_tag" VARCHAR(100),
    "device_type" "DeviceType" NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "serial_number" VARCHAR(100),
    "os_name" VARCHAR(50),
    "os_version" VARCHAR(50),
    "browser_name" VARCHAR(50),
    "browser_version" VARCHAR(50),
    "screen_size_inch" DECIMAL(4,1),
    "screen_width_px" INTEGER,
    "screen_height_px" INTEGER,
    "max_touch_points" INTEGER,
    "purchase_year" INTEGER,
    "acquired_at" DATE,
    "status" "DeviceStatus" NOT NULL DEFAULT 'PENDING',
    "device_token_hash" CHAR(64),
    "registered_user_agent" VARCHAR(500),
    "registered_by_id" UUID NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ(3),
    "revoked_by_id" UUID,
    "revoked_at" TIMESTAMPTZ(3),
    "revoke_reason" VARCHAR(500),
    "last_seen_at" TIMESTAMPTZ(3),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "center_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "difficulty_level" SMALLINT NOT NULL DEFAULT 1,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "default_max_attempts" SMALLINT NOT NULL DEFAULT 3,
    "training_enabled" BOOLEAN NOT NULL DEFAULT true,
    "test_enabled" BOOLEAN NOT NULL DEFAULT true,
    "default_show_ms" INTEGER NOT NULL DEFAULT 800,
    "default_gap_ms" INTEGER NOT NULL DEFAULT 300,
    "published_at" TIMESTAMPTZ(3),
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "difficulty_level" SMALLINT NOT NULL DEFAULT 1,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" SMALLINT,
    "training_enabled" BOOLEAN,
    "test_enabled" BOOLEAN,
    "show_ms" INTEGER,
    "gap_ms" INTEGER,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patterns" (
    "id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "steps" JSONB NOT NULL,
    "sequence_length" SMALLINT NOT NULL,
    "has_simultaneous" BOOLEAN NOT NULL DEFAULT false,
    "show_ms" INTEGER,
    "gap_ms" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "mode" "TrainingMode" NOT NULL,
    "status" "TrainingSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "context" "UsageContext" NOT NULL DEFAULT 'HOME',
    "center_id" UUID,
    "device_id" UUID,
    "booking_id" UUID,
    "auth_session_id" UUID,
    "difficulty_level" SMALLINT NOT NULL,
    "max_attempts" SMALLINT NOT NULL,
    "show_ms" INTEGER NOT NULL,
    "gap_ms" INTEGER NOT NULL,
    "simultaneity_window_ms" INTEGER,
    "input_type" "InputType",
    "client_info" JSONB,
    "items_total" SMALLINT NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(3),

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_results" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pattern_id" UUID NOT NULL,
    "pattern_version" INTEGER NOT NULL,
    "item_order" SMALLINT NOT NULL,
    "expected_steps" JSONB NOT NULL,
    "sequence_length" SMALLINT NOT NULL,
    "has_simultaneous" BOOLEAN NOT NULL DEFAULT false,
    "is_correct" BOOLEAN NOT NULL,
    "attempts_used" SMALLINT NOT NULL,
    "correct_steps" SMALLINT NOT NULL,
    "total_steps" SMALLINT NOT NULL,
    "response_time_ms" INTEGER,
    "first_tap_latency_ms" INTEGER,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "item_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_attempts" (
    "id" UUID NOT NULL,
    "item_result_id" UUID NOT NULL,
    "attempt_no" SMALLINT NOT NULL,
    "taps" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "first_error_step" SMALLINT,
    "correct_steps" SMALLINT NOT NULL,
    "response_time_ms" INTEGER,
    "inter_tap_intervals_ms" INTEGER[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "credential_type" "CredentialType" NOT NULL DEFAULT 'PIN',
    "credential_hash" VARCHAR(255),
    "credential_updated_at" TIMESTAMPTZ(3),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),
    "last_login_at" TIMESTAMPTZ(3),
    "birth_date" DATE,
    "gender" "Gender",
    "home_center_id" UUID,
    "registered_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "anonymized_at" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "relationship" VARCHAR(100),
    "phone" VARCHAR(20) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "context" "UsageContext" NOT NULL DEFAULT 'HOME',
    "device_id" UUID,
    "booking_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ended_at" TIMESTAMPTZ(3),
    "end_reason" "SessionEndReason",

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_documents" (
    "id" UUID NOT NULL,
    "type" "PolicyType" NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "effective_at" TIMESTAMPTZ(3) NOT NULL,
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "policy_document_id" UUID NOT NULL,
    "purpose" "ConsentPurpose" NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" "UsageContext" NOT NULL DEFAULT 'HOME',
    "device_id" UUID,
    "recorded_by_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "note" VARCHAR(500),

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_subject_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "DataRequestType" NOT NULL,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'PENDING',
    "details" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(3) NOT NULL,
    "handled_by_id" UUID,
    "handled_at" TIMESTAMPTZ(3),
    "resolution_note" TEXT,

    CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(64),
    "target_user_id" UUID,
    "metadata" JSONB,
    "device_id" UUID,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_summaries_user_id_mode_completed_at_idx" ON "session_summaries"("user_id", "mode", "completed_at" DESC);

-- CreateIndex
CREATE INDEX "session_summaries_exercise_id_mode_idx" ON "session_summaries"("exercise_id", "mode");

-- CreateIndex
CREATE INDEX "session_summaries_center_id_completed_at_idx" ON "session_summaries"("center_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "performance_level_criteria_level_difficulty_level_effective_key" ON "performance_level_criteria"("level", "difficulty_level", "effective_from");

-- CreateIndex
CREATE INDEX "user_performance_levels_user_id_is_current_idx" ON "user_performance_levels"("user_id", "is_current");

-- CreateIndex
CREATE INDEX "user_performance_levels_user_id_difficulty_level_computed_a_idx" ON "user_performance_levels"("user_id", "difficulty_level", "computed_at" DESC);

-- CreateIndex
CREATE INDEX "user_metric_snapshots_user_id_period_type_period_start_idx" ON "user_metric_snapshots"("user_id", "period_type", "period_start" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_metric_snapshots_user_id_mode_difficulty_level_period__key" ON "user_metric_snapshots"("user_id", "mode", "difficulty_level", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "recommendations_user_id_status_created_at_idx" ON "recommendations"("user_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "schedule_templates_center_id_is_active_idx" ON "schedule_templates"("center_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_templates_center_id_day_of_week_start_minute_effec_key" ON "schedule_templates"("center_id", "day_of_week", "start_minute", "effective_from");

-- CreateIndex
CREATE INDEX "schedule_exceptions_center_id_date_idx" ON "schedule_exceptions"("center_id", "date");

-- CreateIndex
CREATE INDEX "time_slots_center_id_date_idx" ON "time_slots"("center_id", "date");

-- CreateIndex
CREATE INDEX "time_slots_start_at_idx" ON "time_slots"("start_at");

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_center_id_start_at_key" ON "time_slots"("center_id", "start_at");

-- CreateIndex
CREATE INDEX "bookings_slot_id_status_idx" ON "bookings"("slot_id", "status");

-- CreateIndex
CREATE INDEX "bookings_user_id_slot_date_idx" ON "bookings"("user_id", "slot_date");

-- CreateIndex
CREATE INDEX "bookings_center_id_slot_date_status_idx" ON "bookings"("center_id", "slot_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "centers_code_key" ON "centers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "center_devices_device_token_hash_key" ON "center_devices"("device_token_hash");

-- CreateIndex
CREATE INDEX "center_devices_center_id_status_idx" ON "center_devices"("center_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "center_devices_center_id_label_key" ON "center_devices"("center_id", "label");

-- CreateIndex
CREATE INDEX "courses_status_sort_order_idx" ON "courses"("status", "sort_order");

-- CreateIndex
CREATE INDEX "exercises_course_id_sort_order_idx" ON "exercises"("course_id", "sort_order");

-- CreateIndex
CREATE INDEX "exercises_status_difficulty_level_idx" ON "exercises"("status", "difficulty_level");

-- CreateIndex
CREATE INDEX "patterns_exercise_id_sort_order_idx" ON "patterns"("exercise_id", "sort_order");

-- CreateIndex
CREATE INDEX "training_sessions_user_id_started_at_idx" ON "training_sessions"("user_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "training_sessions_exercise_id_mode_status_idx" ON "training_sessions"("exercise_id", "mode", "status");

-- CreateIndex
CREATE INDEX "training_sessions_center_id_started_at_idx" ON "training_sessions"("center_id", "started_at");

-- CreateIndex
CREATE INDEX "item_results_user_id_completed_at_idx" ON "item_results"("user_id", "completed_at" DESC);

-- CreateIndex
CREATE INDEX "item_results_pattern_id_idx" ON "item_results"("pattern_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_results_session_id_pattern_id_key" ON "item_results"("session_id", "pattern_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_attempts_item_result_id_attempt_no_key" ON "item_attempts"("item_result_id", "attempt_no");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "users_home_center_id_idx" ON "users"("home_center_id");

-- CreateIndex
CREATE INDEX "users_last_name_first_name_idx" ON "users"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "emergency_contacts_user_id_idx" ON "emergency_contacts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_ended_at_idx" ON "auth_sessions"("user_id", "ended_at");

-- CreateIndex
CREATE INDEX "auth_sessions_device_id_ended_at_idx" ON "auth_sessions"("device_id", "ended_at");

-- CreateIndex
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "policy_documents_type_effective_at_idx" ON "policy_documents"("type", "effective_at");

-- CreateIndex
CREATE UNIQUE INDEX "policy_documents_type_version_key" ON "policy_documents"("type", "version");

-- CreateIndex
CREATE INDEX "user_consents_user_id_purpose_occurred_at_idx" ON "user_consents"("user_id", "purpose", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "user_consents_policy_document_id_idx" ON "user_consents"("policy_document_id");

-- CreateIndex
CREATE INDEX "data_subject_requests_status_due_at_idx" ON "data_subject_requests"("status", "due_at");

-- CreateIndex
CREATE INDEX "data_subject_requests_user_id_requested_at_idx" ON "data_subject_requests"("user_id", "requested_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_target_user_id_created_at_idx" ON "audit_logs"("target_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_summaries" ADD CONSTRAINT "session_summaries_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_performance_levels" ADD CONSTRAINT "user_performance_levels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_performance_levels" ADD CONSTRAINT "user_performance_levels_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "performance_level_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_performance_levels" ADD CONSTRAINT "user_performance_levels_triggered_by_session_id_fkey" FOREIGN KEY ("triggered_by_session_id") REFERENCES "session_summaries"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_metric_snapshots" ADD CONSTRAINT "user_metric_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_based_on_level_id_fkey" FOREIGN KEY ("based_on_level_id") REFERENCES "user_performance_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_based_on_session_id_fkey" FOREIGN KEY ("based_on_session_id") REFERENCES "session_summaries"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "schedule_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_checked_in_device_id_fkey" FOREIGN KEY ("checked_in_device_id") REFERENCES "center_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_devices" ADD CONSTRAINT "center_devices_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_devices" ADD CONSTRAINT "center_devices_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_devices" ADD CONSTRAINT "center_devices_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_devices" ADD CONSTRAINT "center_devices_revoked_by_id_fkey" FOREIGN KEY ("revoked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "center_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_auth_session_id_fkey" FOREIGN KEY ("auth_session_id") REFERENCES "auth_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_results" ADD CONSTRAINT "item_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_results" ADD CONSTRAINT "item_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_results" ADD CONSTRAINT "item_results_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "patterns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_attempts" ADD CONSTRAINT "item_attempts_item_result_id_fkey" FOREIGN KEY ("item_result_id") REFERENCES "item_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_home_center_id_fkey" FOREIGN KEY ("home_center_id") REFERENCES "centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_registered_by_id_fkey" FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "center_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_documents" ADD CONSTRAINT "policy_documents_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_policy_document_id_fkey" FOREIGN KEY ("policy_document_id") REFERENCES "policy_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "center_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_subject_requests" ADD CONSTRAINT "data_subject_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_subject_requests" ADD CONSTRAINT "data_subject_requests_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "center_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================================
-- Hand-written constraints (cannot be expressed in the Prisma schema).
-- Prisma Migrate ignores CHECK constraints and partial indexes when diffing, so these
-- stay in place. If you rename a column used below, update the constraint in the same
-- migration.
-- =====================================================================================

-- ---- identity ----
ALTER TABLE "users"
  ADD CONSTRAINT "users_phone_format_check" CHECK ("phone" IS NULL OR "phone" ~ '^[0-9]{9,15}$'),
  ADD CONSTRAINT "users_failed_login_count_check" CHECK ("failed_login_count" >= 0);

-- ---- centers ----
ALTER TABLE "center_devices"
  ADD CONSTRAINT "center_devices_purchase_year_check" CHECK ("purchase_year" IS NULL OR "purchase_year" BETWEEN 2000 AND 2100),
  ADD CONSTRAINT "center_devices_max_touch_points_check" CHECK ("max_touch_points" IS NULL OR "max_touch_points" >= 0),
  ADD CONSTRAINT "center_devices_approval_check" CHECK ("status" <> 'ACTIVE' OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL));

-- ---- booking ----
ALTER TABLE "schedule_templates"
  ADD CONSTRAINT "schedule_templates_day_of_week_check" CHECK ("day_of_week" BETWEEN 0 AND 6),
  ADD CONSTRAINT "schedule_templates_minutes_check" CHECK ("start_minute" >= 0 AND "end_minute" <= 1440 AND "start_minute" < "end_minute"),
  ADD CONSTRAINT "schedule_templates_capacity_check" CHECK ("capacity" > 0),
  ADD CONSTRAINT "schedule_templates_effective_check" CHECK ("effective_to" IS NULL OR "effective_to" >= "effective_from");

ALTER TABLE "schedule_exceptions"
  ADD CONSTRAINT "schedule_exceptions_minutes_check" CHECK (
    ("start_minute" IS NULL AND "end_minute" IS NULL)
    OR ("start_minute" >= 0 AND "end_minute" <= 1440 AND "start_minute" < "end_minute")
  ),
  ADD CONSTRAINT "schedule_exceptions_capacity_check" CHECK ("capacity_override" IS NULL OR "capacity_override" >= 0);

ALTER TABLE "time_slots"
  ADD CONSTRAINT "time_slots_range_check" CHECK ("end_at" > "start_at"),
  -- Last line of defence against overbooking: the row update fails instead of exceeding capacity.
  ADD CONSTRAINT "time_slots_booked_count_check" CHECK ("booked_count" >= 0 AND "booked_count" <= "capacity");

-- A user can hold only one ACTIVE booking for a given slot …
CREATE UNIQUE INDEX "bookings_active_slot_user_key"
  ON "bookings" ("slot_id", "user_id")
  WHERE "status" IN ('BOOKED', 'CHECKED_IN', 'COMPLETED');

-- … and only one ACTIVE booking per calendar day ("one slot per day" rule).
CREATE UNIQUE INDEX "bookings_active_user_day_key"
  ON "bookings" ("user_id", "slot_date")
  WHERE "status" IN ('BOOKED', 'CHECKED_IN', 'COMPLETED');

-- ---- content ----
ALTER TABLE "courses"
  ADD CONSTRAINT "courses_difficulty_level_check" CHECK ("difficulty_level" BETWEEN 1 AND 5),
  ADD CONSTRAINT "courses_default_max_attempts_check" CHECK ("default_max_attempts" >= 1),
  ADD CONSTRAINT "courses_timing_check" CHECK ("default_show_ms" > 0 AND "default_gap_ms" >= 0);

ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_difficulty_level_check" CHECK ("difficulty_level" BETWEEN 1 AND 5),
  ADD CONSTRAINT "exercises_max_attempts_check" CHECK ("max_attempts" IS NULL OR "max_attempts" >= 1),
  ADD CONSTRAINT "exercises_timing_check" CHECK (("show_ms" IS NULL OR "show_ms" > 0) AND ("gap_ms" IS NULL OR "gap_ms" >= 0));

ALTER TABLE "patterns"
  -- A pattern must contain at least two steps (content validation rule).
  ADD CONSTRAINT "patterns_sequence_length_check" CHECK ("sequence_length" >= 2),
  ADD CONSTRAINT "patterns_version_check" CHECK ("version" >= 1),
  ADD CONSTRAINT "patterns_timing_check" CHECK (("show_ms" IS NULL OR "show_ms" > 0) AND ("gap_ms" IS NULL OR "gap_ms" >= 0));

-- ---- engine ----
ALTER TABLE "training_sessions"
  ADD CONSTRAINT "training_sessions_difficulty_level_check" CHECK ("difficulty_level" BETWEEN 1 AND 5),
  ADD CONSTRAINT "training_sessions_max_attempts_check" CHECK ("max_attempts" >= 1),
  ADD CONSTRAINT "training_sessions_center_context_check" CHECK ("context" <> 'CENTER' OR "center_id" IS NOT NULL),
  ADD CONSTRAINT "training_sessions_finished_check" CHECK ("finished_at" IS NULL OR "finished_at" >= "started_at");

ALTER TABLE "item_results"
  ADD CONSTRAINT "item_results_attempts_used_check" CHECK ("attempts_used" >= 1),
  ADD CONSTRAINT "item_results_steps_check" CHECK ("correct_steps" >= 0 AND "correct_steps" <= "total_steps"),
  ADD CONSTRAINT "item_results_response_time_check" CHECK ("response_time_ms" IS NULL OR "response_time_ms" >= 0);

ALTER TABLE "item_attempts"
  ADD CONSTRAINT "item_attempts_attempt_no_check" CHECK ("attempt_no" >= 1),
  ADD CONSTRAINT "item_attempts_response_time_check" CHECK ("response_time_ms" IS NULL OR "response_time_ms" >= 0);

-- ---- analytics ----
ALTER TABLE "session_summaries"
  ADD CONSTRAINT "session_summaries_accuracy_check" CHECK ("accuracy_pct" BETWEEN 0 AND 100),
  ADD CONSTRAINT "session_summaries_items_check" CHECK ("items_correct" >= 0 AND "items_correct" <= "items_total");

ALTER TABLE "performance_level_criteria"
  ADD CONSTRAINT "performance_level_criteria_level_check" CHECK ("level" BETWEEN 1 AND 4),
  ADD CONSTRAINT "performance_level_criteria_difficulty_check" CHECK ("difficulty_level" BETWEEN 0 AND 5),
  ADD CONSTRAINT "performance_level_criteria_accuracy_check" CHECK ("min_accuracy_pct" BETWEEN 0 AND 100);

ALTER TABLE "user_performance_levels"
  ADD CONSTRAINT "user_performance_levels_level_check" CHECK ("level" BETWEEN 1 AND 4),
  ADD CONSTRAINT "user_performance_levels_difficulty_check" CHECK ("difficulty_level" BETWEEN 1 AND 5),
  ADD CONSTRAINT "user_performance_levels_accuracy_check" CHECK ("accuracy_pct" BETWEEN 0 AND 100);

-- Exactly one current level per user per difficulty.
CREATE UNIQUE INDEX "user_performance_levels_current_key"
  ON "user_performance_levels" ("user_id", "difficulty_level")
  WHERE "is_current";

ALTER TABLE "user_metric_snapshots"
  ADD CONSTRAINT "user_metric_snapshots_accuracy_check" CHECK ("accuracy_pct" BETWEEN 0 AND 100),
  ADD CONSTRAINT "user_metric_snapshots_difficulty_check" CHECK ("difficulty_level" BETWEEN 0 AND 5);
