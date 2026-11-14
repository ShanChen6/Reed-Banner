CREATE TABLE "pvp_daily" (
	"owner_id" text NOT NULL,
	"day" text NOT NULL,
	"gold" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pvp_daily_owner_id_day_pk" PRIMARY KEY("owner_id","day")
);
--> statement-breakpoint
CREATE TABLE "pvp_pairs" (
	"day" text NOT NULL,
	"owner_id" text NOT NULL,
	"opponent_id" text NOT NULL,
	"matches" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pvp_pairs_day_owner_id_opponent_id_pk" PRIMARY KEY("day","owner_id","opponent_id")
);
--> statement-breakpoint
ALTER TABLE "pvp_ratings" ADD COLUMN "break_week" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pvp_ratings" ADD COLUMN "break_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pvp_ratings" ADD COLUMN "ban_until" bigint DEFAULT 0 NOT NULL;