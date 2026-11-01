CREATE TABLE "season_scores" (
	"mode" text NOT NULL,
	"season" text NOT NULL,
	"owner_id" text NOT NULL,
	"score" integer NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "season_scores_mode_season_owner_id_pk" PRIMARY KEY("mode","season","owner_id")
);
--> statement-breakpoint
CREATE INDEX "season_scores_rank_idx" ON "season_scores" USING btree ("mode","season","score");