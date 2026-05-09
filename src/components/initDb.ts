import { db } from "../db";
import { sql } from "drizzle-orm";

async function init() {
  try {
    //console.log(" создана таблица настр");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        target_image TEXT,
        target_map JSONB
      );
    `);
    //console.log("таблица созд");
    await db.execute(sql`
      INSERT INTO settings (id, target_image, target_map)
      VALUES (1, '1', '{}')
      ON CONFLICT (id) DO NOTHING;
    `);
    //console.log("нач данные добавлены");
  } catch (e) {
    console.error("Ошибка:", e);
  }
  process.exit(0);
}
init();