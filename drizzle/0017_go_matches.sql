CREATE TABLE "go_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"code" text NOT NULL,
	"black" text NOT NULL,
	"white" text,
	"black_name" text NOT NULL,
	"white_name" text NOT NULL,
	"status" text NOT NULL,
	"state" jsonb NOT NULL,
	"seq" integer NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "go_matches_code_idx" ON "go_matches" USING btree ("code","status");