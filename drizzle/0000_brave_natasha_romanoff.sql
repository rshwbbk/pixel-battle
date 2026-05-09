CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"userId" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pixels" (
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"color" varchar(7) NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "pixels_x_y_user_id_pk" PRIMARY KEY("x","y","user_id")
);
--> statement-breakpoint
CREATE TABLE "round_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_data" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"targetImage" text DEFAULT 'target',
	"target_map" jsonb DEFAULT '{}'::jsonb,
	"availableColors" jsonb DEFAULT '["#000000","#FFFFFF","#FF0000","#ff7a7aef","#707070d8","#a5a5a5","#00b928","#ff8800","#ffe600","#ffe260"]'::jsonb,
	"gameState" text DEFAULT 'waiting',
	"minPlayers" integer DEFAULT 2
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"login" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"isBanned" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
ALTER TABLE "pixels" ADD CONSTRAINT "pixels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;