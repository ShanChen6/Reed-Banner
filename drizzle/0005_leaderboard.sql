CREATE TABLE "leaderboard_scores" (
	"board" text NOT NULL,
	"owner_id" text NOT NULL,
	"score" integer NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "leaderboard_scores_board_owner_id_pk" PRIMARY KEY("board","owner_id")
);
--> statement-breakpoint
CREATE INDEX "leaderboard_rank_idx" ON "leaderboard_scores" USING btree ("board","score");