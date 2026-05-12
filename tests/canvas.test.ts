import { describe, expect, it, mock } from "bun:test";

const calculateAccuracy = (placed: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((placed / total) * 100);
};

describe("Canvas helpers", () => {
  it("считает точность правильно", () => {
    expect(calculateAccuracy(50, 100)).toBe(50);
    expect(calculateAccuracy(100, 100)).toBe(100);
    expect(calculateAccuracy(0, 100)).toBe(0);
    expect(calculateAccuracy(30, 200)).toBe(15);
  });

  it("возвращает 0 если total = 0", () => {
    expect(calculateAccuracy(10, 0)).toBe(0);
  });
});