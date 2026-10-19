ALTER TABLE "identities" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "failed_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "locked_until" bigint;