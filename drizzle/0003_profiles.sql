CREATE TABLE "profiles" (
	"owner_id" text PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "rewarded_at" bigint;--> statement-breakpoint
CREATE INDEX "matches_updated_idx" ON "matches" USING btree ("updated_at");