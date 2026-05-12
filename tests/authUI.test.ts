import { describe, expect, it } from "bun:test";

describe("AuthUI логика", () => {
  it("проверяет валидность логина", () => {
    const isValidLogin = (login: string) => {
      return login.length >= 3 && login.length <= 10;
    };

    expect(isValidLogin("user")).toBe(true);
    expect(isValidLogin("us")).toBe(false); // слишком короткий
    expect(isValidLogin("verylongusername")).toBe(false); // слишком длинный
    expect(isValidLogin("")).toBe(false);
  });

  it("проверяет валидность пароля", () => {
    const isValidPassword = (pass: string) => {
      return pass.length >= 4;
    };

    expect(isValidPassword("1234")).toBe(true);
    expect(isValidPassword("123")).toBe(false);
    expect(isValidPassword("")).toBe(false);
  });

  it("успешный вход только с валидными данными", () => {
    const canLogin = (login: string, pass: string) => {
      return login.length >= 3 && pass.length >= 4;
    };

    expect(canLogin("user", "1234")).toBe(true);
    expect(canLogin("user", "123")).toBe(false);
    expect(canLogin("us", "1234")).toBe(false);
  });
});