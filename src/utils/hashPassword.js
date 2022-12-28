"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const bcryptjs_1 = require("bcryptjs");
const hashPassword = (password) => {
    if (password.length < 8) {
        throw new Error("password should be at least 8 chars");
    }
    return (0, bcryptjs_1.hash)(password, 10);
};
exports.hashPassword = hashPassword;
