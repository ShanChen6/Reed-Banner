CREATE TABLE "pvp_room_members" (
	"owner_id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_rooms" (
	"code" text PRIMARY KEY NOT NULL,
	"host" text NOT NULL,
	"status" text NOT NULL,
	"slots" jsonb NOT NULL,
	"fill_ai" boolean DEFAULT false NOT NULL,
	"match_id" text,
	"seq" integer NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX "pvp_rooms_updated_idx" ON "pvp_rooms" USING btree ("status","updated_at");