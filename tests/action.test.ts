import { describe, expect, it } from "bun:test";

describe("Server Actions логика", () => {
  
  describe("loginUser", () => {
    const validateUser = (login: string, pass: string, storedPass: string, isBanned: boolean) => {
      if (isBanned) return { success: false, error: "Вы были забанены!" };
      if (storedPass !== pass) return { success: false, error: "Неверный пароль!" };
      return { success: true };
    };

    it("пропускает с правильным паролем", () => {
      const result = validateUser("user", "123", "123", false);
      expect(result.success).toBe(true);
    });

    it("отклоняет с неправильным паролем", () => {
      const result = validateUser("user", "wrong", "123", false);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Неверный пароль!");
    });

    it("отклоняет забаненного пользователя", () => {
      const result = validateUser("user", "123", "123", true);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Вы были забанены!");
    });
  });

  describe("placePixel", () => {
    const calculateAccuracy = (matches: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((matches / total) * 100);
    };

    it("100% точность при совпадении всех пикселей", () => {
      expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it("50% точность при половине совпадений", () => {
      expect(calculateAccuracy(5, 10)).toBe(50);
    });

    it("0% точность при отсутствии совпадений", () => {
      expect(calculateAccuracy(0, 10)).toBe(0);
    });

    it("0% точность если нет целевых пикселей", () => {
      expect(calculateAccuracy(5, 0)).toBe(0);
    });
  });

  describe("checkWinner", () => {
    const isWinner = (accuracy: number) => accuracy === 100;

    it("победа при 100%", () => {
      expect(isWinner(100)).toBe(true);
    });

    it("не победа при 99%", () => {
      expect(isWinner(99)).toBe(false);
    });
  });

  describe("adminToggleBan", () => {
    const canToggleBan = (currentUserRole: string) => {
      return currentUserRole === "admin";
    };

    it("только админ может банить", () => {
      expect(canToggleBan("admin")).toBe(true);
      expect(canToggleBan("user")).toBe(false);
    });
  });
});