CREATE TABLE "arena_players" (
	"owner_id" text PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"defense" jsonb,
	"offers" jsonb NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"defense_wins" integer DEFAULT 0 NOT NULL,
	"defense_losses" integer DEFAULT 0 NOT NULL,
	"day" text DEFAULT '' NOT NULL,
	"attacks" integer DEFAULT 0 NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "arena_players_rating_idx" ON "arena_players" USING btree ("rating");