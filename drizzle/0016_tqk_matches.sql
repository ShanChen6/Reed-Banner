CREATE TABLE "tqk_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"code" text,
	"red" text,
	"blue" text,
	"red_name" text NOT NULL,
	"blue_name" text NOT NULL,
	"status" text NOT NULL,
	"state" jsonb NOT NULL,
	"seq" integer NOT NULL,
	"reward" integer,
	"reward_day" text,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tqk_matches_code_idx" ON "tqk_matches" USING btree ("code","status");--> statement-breakpoint
CREATE INDEX "tqk_matches_reward_idx" ON "tqk_matches" USING btree ("owner_id","reward_day");