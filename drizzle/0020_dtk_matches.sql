CREATE TABLE "dtk_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"code" text NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"seats" jsonb NOT NULL,
	"state" jsonb,
	"seq" integer NOT NULL,
	"turn_started_at" bigint NOT NULL,
	"idle" jsonb NOT NULL,
	"rewards" jsonb,
	"reward_day" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dtk_rewards" (
	"match_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"day" text NOT NULL,
	"gold" integer NOT NULL,
	CONSTRAINT "dtk_rewards_match_id_owner_id_pk" PRIMARY KEY("match_id","owner_id")
);
--> statement-breakpoint
CREATE INDEX "dtk_matches_code_idx" ON "dtk_matches" USING btree ("code","status");--> statement-breakpoint
CREATE INDEX "dtk_rewards_owner_idx" ON "dtk_rewards" USING btree ("owner_id","day");