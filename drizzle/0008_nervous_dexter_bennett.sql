CREATE TABLE "destiny_leaderboard_scores" (
	"cycle_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"cleared_floor" integer NOT NULL,
	"total_turns" integer NOT NULL,
	"completed_at" bigint NOT NULL,
	"event_id" text NOT NULL,
	CONSTRAINT "destiny_leaderboard_scores_cycle_id_owner_id_pk" PRIMARY KEY("cycle_id","owner_id"),
	CONSTRAINT "destiny_leaderboard_scores_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE INDEX "destiny_leaderboard_rank_idx" ON "destiny_leaderboard_scores" USING btree ("cycle_id","cleared_floor","total_turns","completed_at","owner_id");