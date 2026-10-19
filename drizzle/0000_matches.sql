CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"seq" integer NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "matches_owner_idx" ON "matches" USING btree ("owner_id");