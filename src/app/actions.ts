'use server'

import { db } from "../db";
import { pixels, users, logs, settings, targetPixels } from "../db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

async function ensureSettingsRow() {
    try {
        const existing = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
        if (existing.length === 0) {
            await db.insert(settings).values({
                id: 1,
                targetImage: "1",
                canvasSize: 32,
                palette: ["#000000", "#FFFFFF"],
            });
        }
    } catch (e) {
        console.error("Ошибка инициализации settings:", e);
    }
}

export async function updateActiveTask(imageKey: string, targetMap: Record<string, string>) {
    try {
        await ensureSettingsRow();
        await db.delete(targetPixels);
        const pixelEntries = Object.entries(targetMap).map(([coords, color]) => {
            const [x, y] = coords.split("-").map(Number);
            return { x, y, color };
        });
        if (pixelEntries.length > 0) {
            await db.insert(targetPixels).values(pixelEntries);
        }
        await db.update(settings)
            .set({
                targetImage: imageKey,
                targetMap: targetMap
            })
            .where(eq(settings.id, 1));
        return { success: true };
    } catch (e) {
        console.error("Ошибка updateActiveTask:", e);
        return { success: false };
    }
}

export async function updateAdminData(pixelData: any[], newSize: number, palette: string[]) {
    try {
        await ensureSettingsRow();
        await db.delete(targetPixels);
        if (pixelData.length > 0) {
            await db.insert(targetPixels).values(pixelData);
        }
        const newTargetMap: Record<string, string> = {};
        pixelData.forEach(p => {
            newTargetMap[`${p.x}-${p.y}`] = p.color;
        });
        await db.update(settings)
            .set({
                canvasSize: newSize,
                palette: palette,
                targetMap: newTargetMap
            })
            .where(eq(settings.id, 1));
            await db.insert(logs).values({
            action: `Админ загрузил новый холст: ${newSize}x${newSize}, цветов: ${palette.length}`
        });
        return { success: true };
    } catch (e) {
        console.error("Ошибка updateAdminData:", e);
        return { success: false };
    }
}
export async function getMyPixels(login: string) {
    noStore();
    const user = await db.query.users.findFirst({
        where: eq(users.login, login)
    });
    if (!user || user.isBanned) return [];
    return await db.select({
        x: pixels.x,
        y: pixels.y,
        color: pixels.color
    })
    .from(pixels)
    .where(eq(pixels.userId, user.id));
}

export async function placePixel(x: number, y: number, color: string, login: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.login, login),
        });
        if (!user || user.isBanned) return { success: false };
        await db.insert(pixels)
            .values({ x, y, color, userId: user.id })
            .onConflictDoUpdate({
                target: [pixels.x, pixels.y, pixels.userId],
                set: { color }
            });
        const target = await db.select().from(targetPixels);
        const userPx = await db.select().from(pixels).where(eq(pixels.userId, user.id));
        let matches = 0;
        target.forEach(t => {
            const found = userPx.find(u => 
                u.x === t.x && 
                u.y === t.y && 
                u.color.toLowerCase() === t.color.toLowerCase()
            );
            if (found) matches++;
        });
        const totalTarget = target.length;
        const currentAccuracy = totalTarget > 0 ? Math.round((matches / totalTarget) * 100) : 0;
        await db.update(users)
            .set({ 
                accuracy: currentAccuracy,
                score: matches 
            })
            .where(eq(users.id, user.id));
        if (currentAccuracy === 100) {
            await db.insert(logs).values({
                action: `ИГРОК ${login} СОБРАЛ 100% И ПОБЕДИЛ!!!`
            });
        }
        const leaderboard = await db.select({
            login: users.login,
            score: users.score,
            accuracy: users.accuracy
        })
        .from(users)
        .where(eq(users.role, 'user'))
        .orderBy(desc(users.accuracy))
        .limit(10);
        return { 
            success: true, 
            accuracy: currentAccuracy, 
            leaderboard,
            isWinner: currentAccuracy === 100 
        };
    } catch (e) {
        console.error(e);
        return { success: false };
    }
}

export async function checkAccuracy(login: string) {
    try {
        const target = await db.select().from(targetPixels);
        const user = await db.query.users.findFirst({ where: eq(users.login, login) });  
        if (!user || target.length === 0) return { accuracy: 0 };
        const userPx = await db.select().from(pixels).where(eq(pixels.userId, user.id));
        let matches = 0;
        target.forEach(t => {
            const found = userPx.find(u =>
                u.x === t.x &&
                u.y === t.y &&
                u.color.toLowerCase() === t.color.toLowerCase()
            );
            if (found) matches++;
        });
        const accuracy = Math.round((matches / target.length) * 100);
        return { accuracy, matches, total: target.length };
    } catch (e) {
        console.error("checkAccuracy error:", e);
        return { accuracy: 0 };
    }
}

export async function getSettings() {
    noStore();
    await ensureSettingsRow();
    return await db.query.settings.findFirst({
        where: eq(settings.id, 1),
    });
}

export async function loginUser(login: string, pass: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.login, login)
        });
        if (user) {
            if (user.isBanned) return { success: false, error: "Вы были забанены!" };
            if (user.password !== pass) return { success: false, error: "Неверный пароль!" };
            return { success: true, user: { login: user.login, role: user.role } };
        }
        const testAccounts: Record<string, string> = {
            "root": "root",
            "игрок 1": "1",
            "игрок 2": "2",
            "игрок 3": "3",
            "игрок 4": "4",
            "игрок 5": "5",
        };
        if (testAccounts[login] === pass) {
            const role = login === "root" ? "admin" : "user";
            try {
                const [newUser] = await db.insert(users)
                    .values({ 
                        login, 
                        password: pass, 
                        role, 
                        score: 0,
                        accuracy: 0
                    })
                    .returning();
                return { success: true, user: { login: newUser.login, role: newUser.role } };
            } catch (insertError) {
                console.error("Ошибка при создании тестового юзера:", insertError);
                return { success: false, error: "Ошибка создания профиля" };
            }
        }
        return { success: false, error: "Пользователь не найден!" };
    } catch (e) {
        console.error("Общая ошибка loginUser:", e);
        return { success: false, error: "Ошибка сервера" };
    }
}

export async function clearMyPixels(login: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.login, login)
    });
    if (!user) return { success: false };
    await db.delete(pixels).where(eq(pixels.userId, user.id));
    const leaderboard = await db.select({
        login: users.login,
        score: users.score
    }).from(users).orderBy(desc(users.score)).limit(10);
    return { success: true, userPixels: [], leaderboard };
}
export async function adminGetUsers() {
    return await db.select().from(users);
}
export async function getLogs() {
    return await db.select()
        .from(logs)
        .orderBy(desc(logs.timestamp))
        .limit(50);
}

export async function adminToggleBan(id: number, status: boolean) {
    await db.update(users)
        .set({ isBanned: status })
        .where(eq(users.id, id));
    return { success: true };
}