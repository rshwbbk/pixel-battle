import { describe, expect, it } from "bun:test";

describe("Простая игровая логика", () => {
  it("проверяет победу", () => {
    const isWinner = (accuracy: number) => accuracy === 100;
    
    expect(isWinner(100)).toBe(true);
    expect(isWinner(99)).toBe(false);
  });

  it("проверяет кто может рисовать", () => {
    const canDraw = (role: string, blocked: boolean) => {
      return role === "user" && !blocked;
    };
    
    expect(canDraw("user", false)).toBe(true);
    expect(canDraw("user", true)).toBe(false);
    expect(canDraw("admin", false)).toBe(false);
  });
});