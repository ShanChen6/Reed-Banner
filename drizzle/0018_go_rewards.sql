ALTER TABLE "go_matches" ADD COLUMN "ai" jsonb;--> statement-breakpoint
ALTER TABLE "go_matches" ADD COLUMN "reward" integer;--> statement-breakpoint
ALTER TABLE "go_matches" ADD COLUMN "reward_day" text;--> statement-breakpoint
CREATE INDEX "go_matches_reward_idx" ON "go_matches" USING btree ("owner_id","reward_day");