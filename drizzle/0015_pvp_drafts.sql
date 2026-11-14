CREATE TABLE "pvp_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"state" jsonb NOT NULL,
	"seq" integer NOT NULL,
	"status" text NOT NULL,
	"owners" jsonb NOT NULL,
	"match_id" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "pvp_drafts_status_idx" ON "pvp_drafts" USING btree ("status","updated_at");