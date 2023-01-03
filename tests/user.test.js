"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../src/utils/user");
test("should get user firstName when fullName is provided", () => {
    const firstName = (0, user_1.getFirstName)("Abanoub Fathy");
    expect(firstName).toBe("Abanoub");
});
test("should return userName when provide firstName only", () => {
    const firstName = (0, user_1.getFirstName)("Mena");
    expect(firstName).toBe("Mena");
});
test("should retun error when password less than 8 chars", () => {
    const passwordIsOk = (0, user_1.isValidPassword)("1234567");
    expect(passwordIsOk).toBe(false);
});
test("should return false when password contains password", () => {
    const passwordIsOk = (0, user_1.isValidPassword)("121PassWoRd");
    expect(passwordIsOk).toBe(false);
});
test("should return true when passwor is 8 chars and not contain password", () => {
    const passwordIsOk = (0, user_1.isValidPassword)("12345678pop");
    expect(passwordIsOk).toBe(true);
});
