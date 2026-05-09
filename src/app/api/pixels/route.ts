import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/src/db";
import { settings } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    // Читаем файл в буфер
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя, чтобы избежать проблем с кэшем браузера
    const fileName = `target_${Date.now()}.png`;
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, fileName);

    // Проверяем, существует ли папка public (на всякий случай)
    try {
      await mkdir(publicDir, { recursive: true });
    } catch (e) {}

    // Записываем файл на диск
    await writeFile(filePath, buffer);

    const publicPath = `/${fileName}`;

    // Обновляем путь к картинке в таблице настроек (строка с ID 1)
    await db.update(settings)
      .set({ targetImage: publicPath })
      .where(eq(settings.id, 1));

    return NextResponse.json({ 
      success: true, 
      path: publicPath 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Ошибка при сохранении файла" }, { status: 500 });
  }
}