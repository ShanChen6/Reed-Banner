CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"created_at" bigint NOT NULL,
	"last_login_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"provider" text NOT NULL,
	"subject" text NOT NULL,
	"account_id" text NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "identities_provider_subject_pk" PRIMARY KEY("provider","subject")
);
--> statement-breakpoint
ALTER TABLE "identities" ADD CONSTRAINT "identities_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "identities_account_idx" ON "identities" USING btree ("account_id");