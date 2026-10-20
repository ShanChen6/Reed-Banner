CREATE TABLE "daily_entries" (
	"day" text NOT NULL,
	"owner_id" text NOT NULL,
	"match_id" text NOT NULL,
	"started_at" bigint NOT NULL,
	"finished_at" bigint,
	"score" integer,
	"won" boolean,
	"turns" integer,
	"permille" integer,
	CONSTRAINT "daily_entries_day_owner_id_pk" PRIMARY KEY("day","owner_id")
);
--> statement-breakpoint
CREATE INDEX "daily_entries_rank_idx" ON "daily_entries" USING btree ("day","score");