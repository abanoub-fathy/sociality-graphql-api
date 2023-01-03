"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPassword = exports.getFirstName = void 0;
const getFirstName = (fullName) => {
    return fullName.split(" ")[0];
};
exports.getFirstName = getFirstName;
const isValidPassword = (password) => {
    return password.length >= 8 && !password.toLowerCase().includes("password");
};
exports.isValidPassword = isValidPassword;
