CREATE TABLE "formation_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"period" text NOT NULL,
	"owner_id" text NOT NULL,
	"state" jsonb NOT NULL,
	"seq" integer NOT NULL,
	"status" text NOT NULL,
	"score" integer,
	"turns" integer,
	"started_at" bigint NOT NULL,
	"finished_at" bigint,
	"claimed_at" bigint,
	"reward_gold" integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX "formation_entries_attempt_idx" ON "formation_entries" USING btree ("period","level","owner_id");--> statement-breakpoint
CREATE INDEX "formation_entries_rank_idx" ON "formation_entries" USING btree ("level","period","status","score");--> statement-breakpoint
CREATE INDEX "formation_entries_owner_idx" ON "formation_entries" USING btree ("owner_id","level");