CREATE TABLE "trade_legs" (
	"id" text PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"owner_id" text NOT NULL,
	"edge" text NOT NULL,
	"leg" jsonb NOT NULL,
	"depart_at" bigint NOT NULL,
	"arrive_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_markets" (
	"season" text NOT NULL,
	"key" text NOT NULL,
	"stock" integer NOT NULL,
	"slot" integer NOT NULL,
	"slot_stock" integer NOT NULL,
	"prev_slot_stock" integer NOT NULL,
	"version" integer NOT NULL,
	CONSTRAINT "trade_markets_season_key_pk" PRIMARY KEY("season","key")
);
--> statement-breakpoint
CREATE TABLE "trade_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"from_owner" text NOT NULL,
	"to_owner" text NOT NULL,
	"from_leg" text NOT NULL,
	"to_leg" text NOT NULL,
	"give" jsonb NOT NULL,
	"want" jsonb NOT NULL,
	"status" text NOT NULL,
	"created_at" bigint NOT NULL,
	"resolved_at" bigint
);
--> statement-breakpoint
CREATE TABLE "trade_players" (
	"season" text NOT NULL,
	"owner_id" text NOT NULL,
	"state" jsonb NOT NULL,
	"version" integer NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "trade_players_season_owner_id_pk" PRIMARY KEY("season","owner_id")
);
--> statement-breakpoint
CREATE INDEX "trade_legs_edge_idx" ON "trade_legs" USING btree ("season","edge","depart_at");--> statement-breakpoint
CREATE INDEX "trade_offers_from_idx" ON "trade_offers" USING btree ("season","from_owner","status");--> statement-breakpoint
CREATE INDEX "trade_offers_to_idx" ON "trade_offers" USING btree ("season","to_owner","status");