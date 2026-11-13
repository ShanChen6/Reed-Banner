CREATE TABLE "pvp_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"format" text NOT NULL,
	"state" jsonb NOT NULL,
	"seq" integer NOT NULL,
	"status" text NOT NULL,
	"owners" jsonb NOT NULL,
	"results" jsonb,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	"settled_at" bigint
);
--> statement-breakpoint
CREATE TABLE "pvp_queue" (
	"owner_id" text PRIMARY KEY NOT NULL,
	"format" text NOT NULL,
	"rating" integer NOT NULL,
	"enqueued_at" bigint NOT NULL,
	"last_seen" bigint NOT NULL,
	"match_id" text
);
--> statement-breakpoint
CREATE TABLE "pvp_ratings" (
	"owner_id" text NOT NULL,
	"format" text NOT NULL,
	"rating" integer NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"forgive_day" text DEFAULT '' NOT NULL,
	"forgive_used" integer DEFAULT 0 NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "pvp_ratings_owner_id_format_pk" PRIMARY KEY("owner_id","format")
);
--> statement-breakpoint
CREATE INDEX "pvp_matches_status_idx" ON "pvp_matches" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "pvp_queue_wait_idx" ON "pvp_queue" USING btree ("format","match_id","enqueued_at");--> statement-breakpoint
CREATE INDEX "pvp_ratings_rank_idx" ON "pvp_ratings" USING btree ("format","rating");