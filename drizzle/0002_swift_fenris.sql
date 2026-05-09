CREATE TABLE "target_pixels" (
	"id" serial PRIMARY KEY NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"color" varchar(7) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "target_image" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "target_map" jsonb;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "game_state" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "canvas_size" integer DEFAULT 32;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "palette" jsonb;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "min_players" integer DEFAULT 2;--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "targetImage";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "targetMap";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "availableColors";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "gameState";--> statement-breakpoint
ALTER TABLE "settings" DROP COLUMN "minPlayers";