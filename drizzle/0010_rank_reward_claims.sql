CREATE TABLE "rank_reward_claims" (
	"mode" text NOT NULL,
	"period" text NOT NULL,
	"owner_id" text NOT NULL,
	"rank" integer NOT NULL,
	"gold" integer NOT NULL,
	"claimed_at" bigint NOT NULL,
	CONSTRAINT "rank_reward_claims_mode_period_owner_id_pk" PRIMARY KEY("mode","period","owner_id")
);
--> statement-breakpoint
CREATE INDEX "rank_reward_claims_owner_idx" ON "rank_reward_claims" USING btree ("owner_id","mode");